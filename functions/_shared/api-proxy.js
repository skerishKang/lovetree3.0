import {
  ALLOWED_ROUTES,
  ALLOWED_METHODS_PER_PATH,
  ALLOWED_HEADERS,
  BLOCKED_HEADERS,
  CF_OR_X_FORWARDED_PREFIXES,
  MAX_WRITE_BODY_BYTES,
  MAX_PATH_SEGMENT_LENGTH,
  PATH_PARAMETER_PATTERN,
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
  if (parsed.username) return false;
  if (parsed.password) return false;
  if (parsed.search) return false;
  if (parsed.hash) return false;
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

function parseRequestPath(request) {
  try {
    const url = new URL(request.url);
    return url.pathname;
  } catch (_) {
    return null;
  }
}

function splitPath(pathname) {
  if (!pathname || pathname === '/') return [];
  return pathname.split('/').filter(Boolean);
}

function extractRawPath(requestUrl) {
  try {
    const originEnd = requestUrl.indexOf('/', requestUrl.indexOf('//') + 2);
    if (originEnd === -1) return '/';
    let end = requestUrl.indexOf('?', originEnd);
    if (end === -1) end = requestUrl.indexOf('#', originEnd);
    if (end === -1) end = requestUrl.length;
    return requestUrl.slice(originEnd, end) || '/';
  } catch (_) {
    return null;
  }
}

export function isValidPathname(pathname) {
  if (typeof pathname !== 'string') return false;
  if (pathname.includes('//')) return false;
  const segments = splitPath(pathname);
  for (const seg of segments) {
    if (seg === '.' || seg === '..') return false;
  }
  return true;
}

function isPathSafe(request) {
  const pathname = parseRequestPath(request);
  if (!pathname) return false;
  if (!isValidPathname(pathname)) return false;
  const rawPath = extractRawPath(request.url);
  if (!rawPath) return false;
  const rawSegments = rawPath.split('/');
  for (const seg of rawSegments) {
    if (seg === '.' || seg === '..') return false;
  }
  return true;
}

export function validatePathSegment(value) {
  if (typeof value !== 'string') return false;
  if (!value) return false;
  if (value.length > MAX_PATH_SEGMENT_LENGTH) return false;
  if (value === '.') return false;
  if (value === '..') return false;
  if (value.includes('/')) return false;
  if (value.includes('\\')) return false;
  if (!PATH_PARAMETER_PATTERN.test(value)) return false;
  return true;
}

export function canonicalizePathSegment(value) {
  return encodeURIComponent(value);
}

export function matchRoute(request) {
  if (!isPathSafe(request)) return null;
  const pathname = parseRequestPath(request);
  if (!pathname) return null;

  const normalized = pathname.replace(/\/+$/, '') || '/';
  const segments = splitPath(normalized);

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
        if (!validatePathSegment(seg)) {
          matched = false;
          break;
        }
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

export function matchRouteAnyMethod(request) {
  if (!isPathSafe(request)) return null;
  const pathname = parseRequestPath(request);
  if (!pathname) return null;

  const normalized = pathname.replace(/\/+$/, '') || '/';
  const segments = splitPath(normalized);

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
        if (!validatePathSegment(seg)) {
          matched = false;
          break;
        }
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

export function getAllowedMethod(request) {
  if (!isPathSafe(request)) return null;
  const pathname = parseRequestPath(request);
  if (!pathname) return null;

  const normalized = pathname.replace(/\/+$/, '') || '/';
  const segments = splitPath(normalized);

  for (const route of ALLOWED_ROUTES) {
    const routeSegments = splitPath(route.path);
    if (routeSegments.length !== segments.length) continue;

    let matched = true;
    for (let i = 0; i < routeSegments.length; i++) {
      const rs = routeSegments[i];
      const seg = segments[i];
      if (rs.startsWith(':')) {
        if (!validatePathSegment(seg)) { matched = false; break; }
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

  let bodyText;
  try {
    bodyText = await request.text();
  } catch (_) {
    return { tooLarge: true, body: null };
  }

  if (!bodyText) {
    return { tooLarge: false, body: null };
  }

  const encoder = new TextEncoder();
  const encoded = encoder.encode(bodyText);
  if (encoded.byteLength > MAX_WRITE_BODY_BYTES) {
    return { tooLarge: true, body: null };
  }

  return { tooLarge: false, body: encoded };
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

export function createProxyErrorEnvelope(code, message, requestId, status) {
  const body = JSON.stringify({ error: message, code });
  const headers = new Headers();
  headers.set('content-type', 'application/json; charset=utf-8');
  if (requestId) headers.set(REQUEST_ID_HEADER, requestId);
  return new Response(body, { status: status || 500, headers });
}

export async function fetchUpstream(upstreamUrl, request, requestId, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

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
    if (bodyCheck.tooLarge) {
      clearTimeout(timeoutId);
      return { status: 413, body: null, requestId };
    }
    if (bodyCheck.body) {
      fetchOptions.body = bodyCheck.body;
    }
  }

  try {
    const response = await fetch(upstreamUrl, fetchOptions);
    clearTimeout(timeoutId);

    if (response.status >= 300 && response.status < 400) {
      return { status: 502, body: null, requestId };
    }

    return { status: response.status, body: response.body, headers: response.headers, requestId };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      return { error: 'UPSTREAM_TIMEOUT', status: 504, body: null, requestId };
    }
    return { error: 'UPSTREAM_UNAVAILABLE', status: 502, body: null, requestId };
  }
}

export function forwardResponse(response, requestId) {
  const headers = new Headers(response.headers);
  headers.set(REQUEST_ID_HEADER, requestId);

  headers.delete('set-cookie');
  headers.delete('content-length');

  for (const prefix of CF_OR_X_FORWARDED_PREFIXES) {
    for (const name of [...headers.keys()]) {
      if (name.toLowerCase().startsWith(prefix)) {
        headers.delete(name);
      }
    }
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function buildUpstreamUrl(request, env) {
  const validation = validateUpstreamEnv(env);
  if (!validation.valid) return null;

  const pathname = parseRequestPath(request);
  if (!pathname) return null;

  const match = matchRoute(request);
  if (!match) return null;

  const canonicalParts = match.canonicalPath.split('/').map((segment) => {
    if (segment.startsWith(':') && match.paramValues[segment.slice(1)]) {
      return canonicalizePathSegment(match.paramValues[segment.slice(1)]);
    }
    return segment;
  });

  const canonicalPath = '/' + canonicalParts.filter(Boolean).join('/');
  const url = new URL(validation.origin);
  url.pathname = canonicalPath;

  const sourceUrl = new URL(request.url);
  url.search = sourceUrl.search;

  return url.toString();
}
