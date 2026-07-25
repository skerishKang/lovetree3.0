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
  parseTimeoutMs,
  verifyPathConsistency,
} from '../_shared/api-proxy.js';

export async function handleApiProxy(request, context) {
  const requestId = generateRequestId(request);
  const pathParams = context.params && context.params.path;

  if (!verifyPathConsistency(request, pathParams)) {
    return createProxyErrorEnvelope(
      'INVALID_PROXY_REQUEST',
      'Invalid proxy request',
      requestId,
      400
    );
  }

  const pathMatch = matchRouteAnyMethod(request, pathParams);
  if (!pathMatch) {
    return createProxyErrorEnvelope(
      'PROXY_ROUTE_NOT_ALLOWED',
      'Route not allowed',
      requestId,
      404
    );
  }

  const allowedMethods = getAllowedMethod(request, pathParams);
  if (allowedMethods && !allowedMethods.includes(request.method.toUpperCase())) {
    return createProxyErrorEnvelope(
      'METHOD_NOT_ALLOWED',
      'Method not allowed',
      requestId,
      405,
      { Allow: allowedMethods.join(', ') }
    );
  }

  const method = request.method.toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') {
    const bodyCheck = checkContentLength(request);
    if (bodyCheck && bodyCheck.tooLarge) {
      return createProxyErrorEnvelope(
        'PAYLOAD_TOO_LARGE',
        'Request body too large',
        requestId,
        413
      );
    }
  }

  const env = context.env || {};
  const upstreamEnv = {
    LOVEBUD_API_BASE_URL: env.LOVEBUD_API_BASE_URL || '',
    LOVEBUD_API_TIMEOUT_MS: env.LOVEBUD_API_TIMEOUT_MS || '',
  };
  const validation = validateUpstreamEnv(upstreamEnv);
  if (!validation.valid) {
    return createProxyErrorEnvelope(
      validation.error,
      validation.error === 'UPSTREAM_NOT_CONFIGURED'
        ? 'LoveBud API upstream is not configured'
        : 'Invalid upstream configuration',
      requestId,
      503
    );
  }

  const timeoutMs = parseTimeoutMs(upstreamEnv.LOVEBUD_API_TIMEOUT_MS);
  const upstreamUrl = buildUpstreamUrl(request, validation.origin, pathParams);

  if (!upstreamUrl) {
    return createProxyErrorEnvelope(
      'INVALID_PROXY_REQUEST',
      'Invalid proxy request',
      requestId,
      400
    );
  }

  const result = await fetchUpstream(upstreamUrl, request, requestId, timeoutMs);

  if (result.error) {
    const statusMap = {
      UPSTREAM_TIMEOUT: 504,
      UPSTREAM_UNAVAILABLE: 502,
      CLIENT_ABORTED: 400,
      BODY_READ_FAILED: 400,
      UPSTREAM_REDIRECT: 502,
    };
    const status = statusMap[result.error] || 502;
    const messageMap = {
      UPSTREAM_TIMEOUT: 'Upstream request timed out',
      UPSTREAM_UNAVAILABLE: 'Upstream service unavailable',
      CLIENT_ABORTED: 'Client disconnected',
      BODY_READ_FAILED: 'Failed to read request body',
      UPSTREAM_REDIRECT: 'Unexpected upstream redirect',
    };
    return createProxyErrorEnvelope(
      result.error,
      messageMap[result.error] || 'Proxy error',
      requestId,
      status
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

  return forwardResponse(result.response, requestId);
}

export async function onRequest(context) {
  return handleApiProxy(context.request, context);
}
