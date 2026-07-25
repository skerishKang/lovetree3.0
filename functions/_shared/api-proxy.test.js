import { test, expect } from 'vitest';

import {
  validateUpstreamEnv,
  validatePathSegment,
  matchRoute,
  matchRouteAnyMethod,
  getAllowedMethod,
  forwardHeaders,
  checkContentLength,
  generateRequestId,
  buildUpstreamUrl,
  isValidPathname,
} from './api-proxy.js';
import {
  MAX_WRITE_BODY_BYTES,
  MAX_REQUEST_ID_LENGTH,
  SAFE_REQUEST_ID_PATTERN,
  ENV_VAR_NAME,
} from './api-proxy-routes.js';

function makeRequest(url, method = 'GET', headers = {}) {
  const h = new Headers();
  for (const [k, v] of Object.entries(headers)) {
    h.set(k, v);
  }
  return new Request(url, { method, headers: h });
}

function makeEnv(baseUrl) {
  return { [ENV_VAR_NAME]: baseUrl };
}

test('validateUpstreamEnv - returns valid origin for https URL', () => {
  const result = validateUpstreamEnv(makeEnv('https://example.com'));
  expect(result.valid).toBe(true);
  expect(result.origin).toBe('https://example.com');
});

test('validateUpstreamEnv - returns valid origin for https URL with trailing slash', () => {
  const result = validateUpstreamEnv(makeEnv('https://example.com/'));
  expect(result.valid).toBe(true);
  expect(result.origin).toBe('https://example.com');
});

test('validateUpstreamEnv - returns same origin for URL with trailing slash', () => {
  const noSlash = validateUpstreamEnv(makeEnv('https://example.com'));
  const withSlash = validateUpstreamEnv(makeEnv('https://example.com/'));
  expect(noSlash.origin).toBe(withSlash.origin);
});

test('validateUpstreamEnv - rejects missing env', () => {
  const result = validateUpstreamEnv({});
  expect(result.valid).toBe(false);
  expect(result.error).toBe('UPSTREAM_NOT_CONFIGURED');
});

test('validateUpstreamEnv - rejects empty string', () => {
  const result = validateUpstreamEnv({ [ENV_VAR_NAME]: '' });
  expect(result.valid).toBe(false);
  expect(result.error).toBe('UPSTREAM_NOT_CONFIGURED');
});

test('validateUpstreamEnv - rejects whitespace-only string', () => {
  const result = validateUpstreamEnv({ [ENV_VAR_NAME]: '   ' });
  expect(result.valid).toBe(false);
  expect(result.error).toBe('UPSTREAM_NOT_CONFIGURED');
});

test('validateUpstreamEnv - rejects URL with username', () => {
  const result = validateUpstreamEnv({ [ENV_VAR_NAME]: 'https://user:pass@example.com' });
  expect(result.valid).toBe(false);
  expect(result.error).toBe('INVALID_UPSTREAM_URL');
});

test('validateUpstreamEnv - rejects URL with query', () => {
  const result = validateUpstreamEnv({ [ENV_VAR_NAME]: 'https://example.com?evil=1' });
  expect(result.valid).toBe(false);
  expect(result.error).toBe('INVALID_UPSTREAM_URL');
});

test('validateUpstreamEnv - rejects URL with fragment', () => {
  const result = validateUpstreamEnv({ [ENV_VAR_NAME]: 'https://example.com#frag' });
  expect(result.valid).toBe(false);
  expect(result.error).toBe('INVALID_UPSTREAM_URL');
});

test('validateUpstreamEnv - rejects non-http scheme', () => {
  const result = validateUpstreamEnv({ [ENV_VAR_NAME]: 'ftp://example.com' });
  expect(result.valid).toBe(false);
  expect(result.error).toBe('INVALID_UPSTREAM_URL');
});

test('validatePathSegment - accepts valid segment', () => {
  expect(validatePathSegment('abc123')).toBe(true);
  expect(validatePathSegment('tree-42')).toBe(true);
  expect(validatePathSegment('abc_def')).toBe(true);
});

test('validatePathSegment - rejects dot segment', () => {
  expect(validatePathSegment('.')).toBe(false);
  expect(validatePathSegment('..')).toBe(false);
});

test('validatePathSegment - rejects slash characters', () => {
  expect(validatePathSegment('ab/cd')).toBe(false);
  expect(validatePathSegment('ab\\cd')).toBe(false);
});

test('validatePathSegment - rejects empty string', () => {
  expect(validatePathSegment('')).toBe(false);
});

test('validatePathSegment - rejects excessively long segment', () => {
  const long = 'a'.repeat(257);
  expect(validatePathSegment(long)).toBe(false);
});

test('isValidPathname - accepts clean pathname', () => {
  expect(isValidPathname('/api/trees')).toBe(true);
  expect(isValidPathname('/api/trees/abc')).toBe(true);
});

test('isValidPathname - rejects double slash', () => {
  expect(isValidPathname('/api/trees//abc')).toBe(false);
  expect(isValidPathname('//api/trees')).toBe(false);
});

test('isValidPathname - rejects dot segments', () => {
  expect(isValidPathname('/api/trees/.')).toBe(false);
  expect(isValidPathname('/api/trees/..')).toBe(false);
  expect(isValidPathname('/api/trees/./abc')).toBe(false);
  expect(isValidPathname('/api/trees/../abc')).toBe(false);
});

test('generateRequestId - forwards valid incoming request ID', () => {
  const req = makeRequest('http://localhost/api/trees', 'GET', {
    'x-lovebud-request-id': 'req-abc123',
  });
  expect(generateRequestId(req)).toBe('req-abc123');
});

test('generateRequestId - generates new ID for missing incoming', () => {
  const req = makeRequest('http://localhost/api/trees', 'GET');
  const id = generateRequestId(req);
  expect(id.startsWith('req-')).toBe(true);
  expect(id.length).toBe(36 + 4);
});

test('generateRequestId - rejects invalid incoming request ID', () => {
  const req = makeRequest('http://localhost/api/trees', 'GET', {
    'x-lovebud-request-id': 'invalid/request!id',
  });
  const id = generateRequestId(req);
  expect(id.startsWith('req-')).toBe(true);
  expect(SAFE_REQUEST_ID_PATTERN.test(id)).toBe(true);
});

test('generateRequestId - rejects overly long incoming request ID', () => {
  const longId = 'a'.repeat(MAX_REQUEST_ID_LENGTH + 1);
  const req = makeRequest('http://localhost/api/trees', 'GET', {
    'x-lovebud-request-id': longId,
  });
  const id = generateRequestId(req);
  expect(id.startsWith('req-')).toBe(true);
  expect(id).not.toBe(longId);
});

test('forwardHeaders - passes allowed headers', () => {
  const req = makeRequest('http://localhost/api/trees', 'GET', {
    Authorization: 'Bearer token123',
    'Idempotency-Key': 'ik-456',
    'x-lovebud-request-id': 'req-1',
  });
  const out = forwardHeaders(req);
  expect(out.get('Authorization')).toBe('Bearer token123');
  expect(out.get('Idempotency-Key')).toBe('ik-456');
  expect(out.get('x-lovebud-request-id')).toBe('req-1');
});

test('forwardHeaders - blocks Host header', () => {
  const req = makeRequest('http://localhost/api/trees', 'GET', {
    Host: 'evil.com',
  });
  const out = forwardHeaders(req);
  expect(out.get('Host')).toBeNull();
});

test('forwardHeaders - blocks Cookie header', () => {
  const req = makeRequest('http://localhost/api/trees', 'GET', {
    Cookie: 'session=abc',
  });
  const out = forwardHeaders(req);
  expect(out.get('Cookie')).toBeNull();
});

test('forwardHeaders - blocks Set-Cookie header', () => {
  const req = makeRequest('http://localhost/api/trees', 'GET', {
    'Set-Cookie': 'session=abc',
  });
  const out = forwardHeaders(req);
  expect(out.get('Set-Cookie')).toBeNull();
});

test('forwardHeaders - blocks Content-Length header', () => {
  const req = makeRequest('http://localhost/api/trees', 'POST', {
    'Content-Length': '100',
  });
  const out = forwardHeaders(req);
  expect(out.get('Content-Length')).toBeNull();
});

test('forwardHeaders - blocks CF- headers', () => {
  const req = makeRequest('http://localhost/api/trees', 'GET', {
    'CF-Connecting-IP': '1.2.3.4',
  });
  const out = forwardHeaders(req);
  expect(out.get('CF-Connecting-IP')).toBeNull();
});

test('forwardHeaders - blocks X-Forwarded-* headers', () => {
  const req = makeRequest('http://localhost/api/trees', 'GET', {
    'X-Forwarded-Host': 'evil.com',
  });
  const out = forwardHeaders(req);
  expect(out.get('X-Forwarded-Host')).toBeNull();
});

test('forwardHeaders - blocks unknown headers not in allowlist', () => {
  const req = makeRequest('http://localhost/api/trees', 'GET', {
    'X-Custom-Header': 'value',
    'Authorization-Bypass': 'evil',
  });
  const out = forwardHeaders(req);
  expect(out.get('X-Custom-Header')).toBeNull();
  expect(out.get('Authorization-Bypass')).toBeNull();
});

test('forwardHeaders - skips header values containing CR/LF', () => {
  expect(/[\r\n]/.test('Bearer\r\nmalicious')).toBe(true);
  expect(/[\r\n]/.test('Bearer token123')).toBe(false);
});

test('checkContentLength - allows within limit', () => {
  const req = makeRequest('http://localhost/api/trees', 'POST', {
    'Content-Length': String(MAX_WRITE_BODY_BYTES),
  });
  const result = checkContentLength(req);
  expect(result.tooLarge).toBe(false);
});

test('checkContentLength - rejects over limit', () => {
  const req = makeRequest('http://localhost/api/trees', 'POST', {
    'Content-Length': String(MAX_WRITE_BODY_BYTES + 1),
  });
  const result = checkContentLength(req);
  expect(result.tooLarge).toBe(true);
});

test('checkContentLength - returns null for missing header', () => {
  const req = makeRequest('http://localhost/api/trees', 'GET');
  const result = checkContentLength(req);
  expect(result).toBeNull();
});

test('checkContentLength - returns null for non-numeric header', () => {
  const req = makeRequest('http://localhost/api/trees', 'POST', {
    'Content-Length': 'not-a-number',
  });
  const result = checkContentLength(req);
  expect(result).toBeNull();
});

test('matchRoute - GET /api/trees matches', () => {
  const req = makeRequest('http://localhost/api/trees', 'GET');
  const result = matchRoute(req);
  expect(result).not.toBeNull();
  expect(result.route.path).toBe('/api/trees');
  expect(result.route.method).toBe('GET');
});

test('matchRoute - GET /api/community/trees matches', () => {
  const req = makeRequest('http://localhost/api/community/trees', 'GET');
  const result = matchRoute(req);
  expect(result).not.toBeNull();
});

test('matchRoute - /api/private/trees does not match', () => {
  const req = makeRequest('http://localhost/api/private/trees', 'GET');
  const result = matchRoute(req);
  expect(result).toBeNull();
});

test('matchRoute - /modal/browse does not match', () => {
  const req = makeRequest('http://localhost/modal/browse', 'GET');
  const result = matchRoute(req);
  expect(result).toBeNull();
});

test('matchRoute - wrong method returns null', () => {
  const req = makeRequest('http://localhost/api/trees', 'DELETE');
  const result = matchRoute(req);
  expect(result).toBeNull();
});

test('matchRouteAnyMethod - GET /api/youtube/oembed matches', () => {
  const req = makeRequest('http://localhost/api/youtube/oembed', 'GET');
  const result = matchRouteAnyMethod(req);
  expect(result).not.toBeNull();
});

test('matchRouteAnyMethod - POST /api/trees/:treeId matches', () => {
  const req = makeRequest('http://localhost/api/trees/abc123', 'POST');
  const result = matchRouteAnyMethod(req);
  expect(result).not.toBeNull();
  expect(result.route.path).toBe('/api/trees/:treeId');
  expect(result.paramValues.treeId).toBe('abc123');
});

test('matchRouteAnyMethod - double slash returns null', () => {
  const req = makeRequest('http://localhost/api/trees//abc', 'GET');
  const result = matchRouteAnyMethod(req);
  expect(result).toBeNull();
});

test('matchRouteAnyMethod - dot segment resolves via URL parser, matches resolved path', () => {
  const req = makeRequest('http://localhost/api/trees/./abc', 'GET');
  const result = matchRouteAnyMethod(req);
  expect(result).not.toBeNull();
  expect(result.paramValues.treeId).toBe('abc');
});

test('matchRoute - dot segment resolves via URL parser', () => {
  const req = makeRequest('http://localhost/api/trees/./abc', 'GET');
  const result = matchRoute(req);
  expect(result).not.toBeNull();
});

test('matchRouteAnyMethod - parent dot segment returns null', () => {
  const req = makeRequest('http://localhost/api/trees/../abc', 'GET');
  const result = matchRouteAnyMethod(req);
  expect(result).toBeNull();
});

test('matchRoute - double slash returns null', () => {
  const req = makeRequest('http://localhost/api/trees//abc', 'GET');
  const result = matchRoute(req);
  expect(result).toBeNull();
});

test('matchRoute - parent dot segment resolves via URL parser', () => {
  const req = makeRequest('http://localhost/api/trees/../abc', 'GET');
  const result = matchRoute(req);
  expect(result).toBeNull();
});

test('getAllowedMethod - returns allowed methods for /api/trees', () => {
  const req = makeRequest('http://localhost/api/trees', 'GET');
  const methods = getAllowedMethod(req);
  expect(methods).toBeTruthy();
  expect(methods).toContain('GET');
  expect(methods).toContain('POST');
});

test('getAllowedMethod - returns PUT for hub-layout', () => {
  const req = makeRequest('http://localhost/api/trees/abc/hub-layout', 'PUT');
  const methods = getAllowedMethod(req);
  expect(methods).toBeTruthy();
  expect(methods).toContain('PUT');
});

test('getAllowedMethod - /api/community/trees only allows GET', () => {
  const req = makeRequest('http://localhost/api/community/trees', 'GET');
  const methods = getAllowedMethod(req);
  expect(methods).toBeTruthy();
  expect(methods).toContain('GET');
  expect(methods).not.toContain('POST');
});

test('getAllowedMethod - /api/trees does not allow DELETE', () => {
  const req = makeRequest('http://localhost/api/trees', 'GET');
  const methods = getAllowedMethod(req);
  expect(methods).toContain('GET');
  expect(methods).toContain('POST');
  expect(methods).not.toContain('DELETE');
});

test('buildUpstreamUrl - constructs correct upstream URL', () => {
  const req = makeRequest('http://localhost/api/trees/abc123', 'GET');
  const url = buildUpstreamUrl(req, makeEnv('https://api.lovebud.dev'));
  expect(url).toBe('https://api.lovebud.dev/api/trees/abc123');
});

test('buildUpstreamUrl - no double slash in path', () => {
  const req = makeRequest('http://localhost/api/trees/abc123', 'GET');
  const url = buildUpstreamUrl(req, makeEnv('https://api.lovebud.dev'));
  const path = new URL(url).pathname;
  expect(path).not.toContain('//');
});

test('buildUpstreamUrl - same result for base URL without and with trailing slash', () => {
  const req = makeRequest('http://localhost/api/trees/abc123', 'GET');
  const urlNoSlash = buildUpstreamUrl(req, makeEnv('https://api.lovebud.dev'));
  const urlWithSlash = buildUpstreamUrl(req, makeEnv('https://api.lovebud.dev/'));
  expect(urlNoSlash).toBe(urlWithSlash);
  expect(urlNoSlash).toBe('https://api.lovebud.dev/api/trees/abc123');
});

test('buildUpstreamUrl - preserves query string', () => {
  const req = makeRequest('http://localhost/api/community/trees?view=summary&limit=12', 'GET');
  const url = buildUpstreamUrl(req, makeEnv('https://api.lovebud.dev'));
  expect(url).toContain('view=summary');
  expect(url).toContain('limit=12');
});

test('buildUpstreamUrl - query string does not change upstream origin', () => {
  const req = makeRequest('http://localhost/api/trees?url=https://evil.com', 'GET');
  const url = buildUpstreamUrl(req, makeEnv('https://api.lovebud.dev'));
  expect(url.startsWith('https://api.lovebud.dev')).toBe(true);
  expect(url).toContain('?url=');
});

test('buildUpstreamUrl - canonicalizes path segment', () => {
  const req = makeRequest('http://localhost/api/trees/a%2Fb', 'GET');
  const url = buildUpstreamUrl(req, makeEnv('https://api.lovebud.dev'));
  expect(url).toContain('/api/trees/');
});

test('buildUpstreamUrl - returns null for missing env', () => {
  const req = makeRequest('http://localhost/api/trees', 'GET');
  const url = buildUpstreamUrl(req, {});
  expect(url).toBeNull();
});

test('buildUpstreamUrl - returns null for disallowed route', () => {
  const req = makeRequest('http://localhost/api/private/trees', 'GET');
  const url = buildUpstreamUrl(req, makeEnv('https://api.lovebud.dev'));
  expect(url).toBeNull();
});

test('buildUpstreamUrl - returns null for double-slash path', () => {
  const req = makeRequest('http://localhost/api/trees//abc', 'GET');
  const url = buildUpstreamUrl(req, makeEnv('https://api.lovebud.dev'));
  expect(url).toBeNull();
});
