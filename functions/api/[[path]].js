import {
  validateUpstreamEnv,
  buildUpstreamUrl,
  fetchUpstream,
  forwardResponse,
  generateRequestId,
  createProxyErrorEnvelope,
  matchRouteAnyMethod,
  getAllowedMethod,
  checkContentLength,
} from '../_shared/api-proxy.js';

import {
  DEFAULT_TIMEOUT_MS,
  REQUEST_ID_HEADER,
} from '../_shared/api-proxy-routes.js';

async function handleApiProxy(request, env) {
  const upstreamEnv = {
    LOVEBUD_API_BASE_URL: env.LOVEBUD_API_BASE_URL || '',
    LOVEBUD_API_TIMEOUT_MS: env.LOVEBUD_API_TIMEOUT_MS || '',
  };

  const validation = validateUpstreamEnv(upstreamEnv);
  if (!validation.valid) {
    return createProxyErrorEnvelope(
      'UPSTREAM_NOT_CONFIGURED',
      'LoveBud API upstream is not configured',
      generateRequestId(request),
      503
    );
  }

  const timeoutMs = Number(upstreamEnv.LOVEBUD_API_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;

  const pathMatch = matchRouteAnyMethod(request);
  if (!pathMatch) {
    return createProxyErrorEnvelope(
      'PROXY_ROUTE_NOT_ALLOWED',
      'Route not allowed',
      generateRequestId(request),
      404
    );
  }

  const allowedMethods = getAllowedMethod(request);
  if (allowedMethods && !allowedMethods.includes(request.method.toUpperCase())) {
    const allowHeader = allowedMethods.join(', ');
    const headers = new Headers();
    headers.set('allow', allowHeader);
    headers.set(REQUEST_ID_HEADER, generateRequestId(request));
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers,
    });
  }

  const bodyCheck = checkContentLength(request);
  if (bodyCheck && bodyCheck.tooLarge) {
    return createProxyErrorEnvelope(
      'PAYLOAD_TOO_LARGE',
      'Request body too large',
      generateRequestId(request),
      413
    );
  }

  const requestId = generateRequestId(request);
  const upstreamUrl = buildUpstreamUrl(request, upstreamEnv);

  if (!upstreamUrl) {
    return createProxyErrorEnvelope(
      'INVALID_PROXY_REQUEST',
      'Invalid proxy request',
      requestId,
      400
    );
  }

  const result = await fetchUpstream(upstreamUrl, request, requestId, timeoutMs);

  if (result.error === 'UPSTREAM_TIMEOUT') {
    return createProxyErrorEnvelope(
      'UPSTREAM_TIMEOUT',
      'LoveBud API upstream timed out',
      requestId,
      504
    );
  }

  if (result.error === 'UPSTREAM_UNAVAILABLE') {
    return createProxyErrorEnvelope(
      'UPSTREAM_UNAVAILABLE',
      'LoveBud API upstream unavailable',
      requestId,
      502
    );
  }

  if (result.status === 413) {
    return createProxyErrorEnvelope(
      'PAYLOAD_TOO_LARGE',
      'Request body too large',
      requestId,
      413
    );
  }

  if (!result.body) {
    return createProxyErrorEnvelope(
      'UPSTREAM_UNAVAILABLE',
      'LoveBud API upstream unavailable',
      requestId,
      result.status || 502
    );
  }

  return forwardResponse(
    new Response(result.body, { status: result.status, headers: result.headers || new Headers() }),
    requestId
  );
}

export async function onRequest(context) {
  return handleApiProxy(context.request, context.env || {});
}