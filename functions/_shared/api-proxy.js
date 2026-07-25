import {
  ALLOWED_ROUTES,
  ALLOWED_METHODS_PER_PATH,
  ALLOWED_HEADERS,
  BLOCKED_HEADERS,
  CF_OR_X_FORWARDED_PREFIXES,
  MAX_WRITE_BODY_BYTES,
  DEFAULT_TIMEOUT_MS,
  MIN_TIMEOUT_MS,
  MAX_TIMEOUT_MS,
  MAX_PATH_SEGMENT_LENGTH,
  REQUEST_ID_HEADER,
  MAX_REQUEST_ID_LENGTH,
  SAFE_REQUEST_ID_PATTERN,
  ENV_VAR_NAME,
} from './api-proxy-routes.js';

function assertValidUrlString(value) {
  if (typeof value !== 'string') return false;
  let parsed;
  try {
    parsed = new URL(value);
  } catch (_) {
    return false;
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
  if (parsed.protocol === 'http:' && parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1') return false;
  if (parsed.username) return false;
  if (parsed.password) return false;
  if (parsed.search) return false;
  if (parsed.hash) return false;
  const pathWithoutSlash = parsed.pathname.replace(/\/$/, '');
  if (pathWithoutSlash !== '') return false;
  return true;
}

export function validateUpstreamEnv(env) {
  const raw = env && env[ENV_VAR_NAME];
  if (typeof raw !== 'string' || !raw.trim()) {
    return { valid: false, error: 'UPSTREAM_NOT_CONFIGURED' };
  }
  if (!assertValidUrlString(raw)) {
    return { valid: false, error: 'INVALID_UPSTREAM_URL' };
  }
  const url = new URL(raw);
  if (!url.hostname) {
    return { valid: false, error: 'INVALID_UPSTREAM_URL' };
  }
  return { valid: true, origin: url.origin };
}

export function parseTimeoutMs(value) {
  if (value === undefined || value === null || value === '') return DEFAULT_TIMEOUT_MS;
  const n = Number(value);
  if (!Number.isFinite(n)) return DEFAULT_TIMEOUT_MS;
  if (!Number.isInteger(n)) return DEFAULT_TIMEOUT_MS;
  if (n < MIN_TIMEOUT_MS || n > MAX_TIMEOUT_MS) return DEFAULT_TIMEOUT_MS;
  return n;
}

export function validateDecodedSegment(segment) {
  if (typeof segment !== 'string') return null;
  if (!segment) return null;
  if (segment.length > MAX_PATH_SEGMENT_LENGTH) return null;

  let decoded;
  try {
    decoded = decodeURIComponent(segment);
  } catch (_) {
    return null;
  }

  if (decoded.includes('/') || decoded.includes('\\')) return null;
  if (decoded === '.' || decoded === '..') return null;
  if (/[\0-\x1f\x7f]/.test(decoded)) return null;
  if (/%2[eEfF]/i.test(decoded)) return null;
  if (/%5[cC]/i.test(decoded)) return null;
  if (!decoded) return null;

  return decoded;
}

function splitPath(pathname) {
  if (!pathname || pathname === '/') return [];
  return pathname.split('/').filter(Boolean);
}

export function matchRoute(request, pathParams) {
  if (!Array.isArray(pathParams)) return null;

  const decodedSegments = [];
  for (const seg of pathParams) {
    const d = validateDecodedSegment(seg);
    if (d === null) return null;
    decodedSegments.push(d);
  }

  const canonicalPath = '/api/' + decodedSegments.map(s => encodeURIComponent(s)).join('/');
  const segments = splitPath(canonicalPath);

  for (const route of ALLOWED_ROUTES) {
    const routeSegments = splitPath(route.path);
    if (routeSegments.length !== segments.length) continue;

    const paramValues = {};
    let matched = true;

    for (let i = 0; i < routeSegments.length; i++) {
      const rs = routeSegments[i];
      const seg = segments[i];

      if (rs.startsWith(':')) {
        const paramName = rs.slice(1);
        paramValues[paramName] = seg;
      } else if (rs !== seg) {
        matched = false;
        break;
      }
    }

    if (matched && route.method === request.method.toUpperCase()) {
      return { route, paramValues, canonicalPath: route.path };
    }
  }

  return null;
}

export function matchRouteAnyMethod(request, pathParams) {
  if (!Array.isArray(pathParams)) return null;

  const decodedSegments = [];
  for (const seg of pathParams) {
    const d = validateDecodedSegment(seg);
    if (d === null) return null;
    decodedSegments.push(d);
  }

  const canonicalPath = '/api/' + decodedSegments.map(s => encodeURIComponent(s)).join('/');
  const segments = splitPath(canonicalPath);

  for (const route of ALLOWED_ROUTES) {
    const routeSegments = splitPath(route.path);
    if (routeSegments.length !== segments.length) continue;

    const paramValues = {};
    let matched = true;

    for (let i = 0; i < routeSegments.length; i++) {
      const rs = routeSegments[i];
      const seg = segments[i];

      if (rs.startsWith(':')) {
        const paramName = rs.slice(1);
        paramValues[paramName] = seg;
      } else if (rs !== seg) {
        matched = false;
        break;
      }
    }

    if (matched) {
      return { route, paramValues, canonicalPath: route.path };
    }
  }

  return null;
}

export function getAllowedMethod(request, pathParams) {
  if (!Array.isArray(pathParams)) return null;

  const decodedSegments = [];
  for (const seg of pathParams) {
    const d = validateDecodedSegment(seg);
    if (d === null) return null;
    decodedSegments.push(d);
  }

  const canonicalPath = '/api/' + decodedSegments.map(s => encodeURIComponent(s)).join('/');
  const segments = splitPath(canonicalPath);

  for (const route of ALLOWED_ROUTES) {
    const routeSegments = splitPath(route.path);
    if (routeSegments.length !== segments.length) continue;

    let matched = true;
    for (let i = 0; i < routeSegments.length; i++) {
      const rs = routeSegments[i];
      const seg = segments[i];
      if (rs.startsWith(':')) {
        continue;
      } else if (rs !== seg) {
        matched = false;
        break;
      }
    }

    if (matched) {
      const methods = ALLOWED_METHODS_PER_PATH.get(route.path);
      if (methods) return Array.from(methods);
    }
  }

  return null;
}

export function forwardHeaders(request) {
  const outgoing = new Headers();
  for (const [name, value] of request.headers) {
    const lower = name.toLowerCase();
    if (BLOCKED_HEADERS.has(lower)) continue;
    if (CF_OR_X_FORWARDED_PREFIXES.some((p) => lower.startsWith(p))) continue;
    if (ALLOWED_HEADERS.has(lower)) {
      if (value && typeof value === 'string') {
        if (/[\r\n]/.test(value)) continue;
        outgoing.set(name, value);
      }
    }
  }
  return outgoing;
}

export function checkContentLength(request) {
  const raw = request.headers.get('content-length');
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  if (parsed > MAX_WRITE_BODY_BYTES) return { tooLarge: true, contentLength: parsed };
  return { tooLarge: false, contentLength: parsed };
}

export async function readBoundedBody(request) {
  const contentLengthCheck = checkContentLength(request);
  if (contentLengthCheck && contentLengthCheck.tooLarge) {
    return { tooLarge: true, body: null };
  }

  let buffer;
  try {
    buffer = await request.arrayBuffer();
  } catch (_) {
    return { error: 'BODY_READ_FAILED', body: null };
  }

  const bytes = new Uint8Array(buffer);
  if (bytes.byteLength > MAX_WRITE_BODY_BYTES) {
    return { tooLarge: true, body: null };
  }

  return { tooLarge: false, body: bytes };
}

export function generateRequestId(request) {
  const incoming = request.headers.get(REQUEST_ID_HEADER);
  if (typeof incoming === 'string' && incoming.trim()) {
    const trimmed = incoming.trim();
    if (trimmed.length <= MAX_REQUEST_ID_LENGTH && SAFE_REQUEST_ID_PATTERN.test(trimmed)) {
      return trimmed;
    }
  }
  return 'req-' + crypto.randomUUID();
}

export function createProxyErrorEnvelope(code, message, requestId, status, extraHeaders) {
  const body = JSON.stringify({ error: message, code });
  const headers = new Headers();
  headers.set('content-type', 'application/json; charset=utf-8');
  if (requestId) headers.set(REQUEST_ID_HEADER, requestId);
  if (extraHeaders) {
    for (const [k, v] of Object.entries(extraHeaders)) {
      headers.set(k, v);
    }
  }
  return new Response(body, { status: status || 500, headers });
}

export async function fetchUpstream(upstreamUrl, request, requestId, timeoutMs) {
  if (request.signal && request.signal.aborted) {
    return { error: 'CLIENT_ABORTED', body: null, requestId };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let onAbort;
  if (request.signal) {
    onAbort = () => controller.abort();
    request.signal.addEventListener('abort', onAbort, { once: true });
  }

  const cleanup = () => {
    clearTimeout(timeoutId);
    if (request.signal && onAbort) {
      request.signal.removeEventListener('abort', onAbort);
    }
  };

  const headers = forwardHeaders(request);
  headers.set(REQUEST_ID_HEADER, requestId);

  const fetchOptions = {
    method: request.method,
    headers,
    redirect: 'manual',
    signal: controller.signal,
  };

  const method = request.method.toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') {
    const bodyCheck = await readBoundedBody(request);
    if (bodyCheck.error) {
      cleanup();
      return { error: bodyCheck.error, body: null, requestId };
    }
    if (bodyCheck.tooLarge) {
      cleanup();
      return { status: 413, body: null, requestId };
    }
    if (bodyCheck.body) {
      fetchOptions.body = bodyCheck.body;
    }
  }

  try {
    const response = await fetch(upstreamUrl, fetchOptions);
    cleanup();

    if (response.status >= 300 && response.status < 400) {
      return { status: 502, body: null, requestId };
    }

    return { response, requestId };
  } catch (error) {
    cleanup();
    if (controller.signal.aborted && request.signal && request.signal.aborted) {
      return { error: 'CLIENT_ABORTED', body: null, requestId };
    }
    if (error.name === 'AbortError') {
      return { error: 'UPSTREAM_TIMEOUT', body: null, requestId };
    }
    return { error: 'UPSTREAM_UNAVAILABLE', body: null, requestId };
  }
}

export function forwardResponse(upstreamResponse, requestId) {
  const headers = new Headers();
  for (const [name, value] of upstreamResponse.headers) {
    const lower = name.toLowerCase();
    if (BLOCKED_HEADERS.has(lower)) continue;
    if (CF_OR_X_FORWARDED_PREFIXES.some((p) => lower.startsWith(p))) continue;
    if (lower === 'transfer-encoding') continue;
    headers.set(name, value);
  }
  headers.set(REQUEST_ID_HEADER, requestId);

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers,
  });
}

export function buildUpstreamUrl(request, origin, pathParams) {
  if (!Array.isArray(pathParams)) return null;

  const decodedSegments = [];
  for (const seg of pathParams) {
    const d = validateDecodedSegment(seg);
    if (d === null) return null;
    decodedSegments.push(d);
  }

  const canonicalPath = '/api/' + decodedSegments.map(s => encodeURIComponent(s)).join('/');
  const match = matchRoute(request, pathParams);
  if (!match) return null;

  const url = new URL(origin);
  url.pathname = canonicalPath;

  const sourceUrl = new URL(request.url);
  url.search = sourceUrl.search;

  return url.toString();
}
