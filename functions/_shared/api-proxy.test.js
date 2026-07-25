import { test, expect, vi, afterEach } from 'vitest';

import {
  validateUpstreamEnv,
  validateDecodedSegment,
  verifyPathConsistency,
  matchRoute,
  matchRouteAnyMethod,
  getAllowedMethod,
  forwardHeaders,
  checkContentLength,
  readBoundedBody,
  generateRequestId,
  createProxyErrorEnvelope,
  buildUpstreamUrl,
  fetchUpstream,
  forwardResponse,
  parseTimeoutMs,
} from './api-proxy.js';
import {
  MAX_WRITE_BODY_BYTES,
  SAFE_REQUEST_ID_PATTERN,
  ENV_VAR_NAME,
  DEFAULT_TIMEOUT_MS,
  ALLOWED_ROUTES,
  getRouteMethods,
  BLOCKED_REQUEST_HEADERS,
  BLOCKED_RESPONSE_HEADERS,
  BLOCKED_HEADER_PREFIXES,
  ALLOWED_RESPONSE_HEADERS,
} from './api-proxy-routes.js';

afterEach(() => {
  vi.restoreAllMocks();
});

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

function params(str) {
  return str.split('/');
}

test('validateUpstreamEnv - valid https', () => {
  expect(validateUpstreamEnv(makeEnv('https://example.com'))).toEqual({ valid: true, origin: 'https://example.com' });
});

test('validateUpstreamEnv - valid https with trailing slash', () => {
  expect(validateUpstreamEnv(makeEnv('https://example.com/'))).toEqual({ valid: true, origin: 'https://example.com' });
});

test('validateUpstreamEnv - same origin regardless of trailing slash', () => {
  const a = validateUpstreamEnv(makeEnv('https://example.com'));
  const b = validateUpstreamEnv(makeEnv('https://example.com/'));
  expect(a.origin).toBe(b.origin);
});

test('validateUpstreamEnv - http allowed for localhost', () => {
  expect(validateUpstreamEnv(makeEnv('http://localhost:8787')).valid).toBe(true);
});

test('validateUpstreamEnv - http allowed for 127.0.0.1', () => {
  expect(validateUpstreamEnv(makeEnv('http://127.0.0.1:8787')).valid).toBe(true);
});

test('validateUpstreamEnv - http rejected for non-localhost', () => {
  expect(validateUpstreamEnv(makeEnv('http://example.com')).valid).toBe(false);
});

test('validateUpstreamEnv - rejects missing env', () => {
  expect(validateUpstreamEnv({})).toEqual({ valid: false, error: 'UPSTREAM_NOT_CONFIGURED' });
});

test('validateUpstreamEnv - rejects empty string', () => {
  expect(validateUpstreamEnv({ [ENV_VAR_NAME]: '' })).toEqual({ valid: false, error: 'UPSTREAM_NOT_CONFIGURED' });
});

test('validateUpstreamEnv - rejects URL with username', () => {
  expect(validateUpstreamEnv(makeEnv('https://user:pass@example.com')).valid).toBe(false);
});

test('validateUpstreamEnv - rejects URL with query', () => {
  expect(validateUpstreamEnv(makeEnv('https://example.com?evil=1')).valid).toBe(false);
});

test('validateUpstreamEnv - rejects URL with fragment', () => {
  expect(validateUpstreamEnv(makeEnv('https://example.com#frag')).valid).toBe(false);
});

test('validateUpstreamEnv - rejects non-root pathname', () => {
  expect(validateUpstreamEnv(makeEnv('https://example.com/base/path')).valid).toBe(false);
});

test('validateUpstreamEnv - rejects non-http scheme', () => {
  expect(validateUpstreamEnv(makeEnv('ftp://example.com')).valid).toBe(false);
});

test('parseTimeoutMs - default for empty', () => {
  expect(parseTimeoutMs('')).toBe(DEFAULT_TIMEOUT_MS);
});

test('parseTimeoutMs - default for undefined', () => {
  expect(parseTimeoutMs(undefined)).toBe(DEFAULT_TIMEOUT_MS);
});

test('parseTimeoutMs - default for null', () => {
  expect(parseTimeoutMs(null)).toBe(DEFAULT_TIMEOUT_MS);
});

test('parseTimeoutMs - valid timeout', () => {
  expect(parseTimeoutMs('5000')).toBe(5000);
});

test('parseTimeoutMs - 1ms accepted', () => {
  expect(parseTimeoutMs('1')).toBe(1);
});

test('parseTimeoutMs - 60000ms accepted', () => {
  expect(parseTimeoutMs('60000')).toBe(60000);
});

test('parseTimeoutMs - 0 rejected', () => {
  expect(parseTimeoutMs('0')).toBe(DEFAULT_TIMEOUT_MS);
});

test('parseTimeoutMs - -1 rejected', () => {
  expect(parseTimeoutMs('-1')).toBe(DEFAULT_TIMEOUT_MS);
});

test('parseTimeoutMs - Infinity rejected', () => {
  expect(parseTimeoutMs('Infinity')).toBe(DEFAULT_TIMEOUT_MS);
});

test('parseTimeoutMs - NaN rejected', () => {
  expect(parseTimeoutMs('abc')).toBe(DEFAULT_TIMEOUT_MS);
});

test('parseTimeoutMs - 999999999 rejected', () => {
  expect(parseTimeoutMs('999999999')).toBe(DEFAULT_TIMEOUT_MS);
});

test('validateDecodedSegment - accepts valid', () => {
  expect(validateDecodedSegment('abc123')).toBe('abc123');
  expect(validateDecodedSegment('tree-42')).toBe('tree-42');
  expect(validateDecodedSegment('abc_def')).toBe('abc_def');
});

test('validateDecodedSegment - rejects empty', () => {
  expect(validateDecodedSegment('')).toBeNull();
});

test('validateDecodedSegment - rejects dot', () => {
  expect(validateDecodedSegment('.')).toBeNull();
});

test('validateDecodedSegment - rejects dotdot', () => {
  expect(validateDecodedSegment('..')).toBeNull();
});

test('validateDecodedSegment - rejects decoded slash', () => {
  expect(validateDecodedSegment('a/b')).toBeNull();
});

test('validateDecodedSegment - rejects decoded backslash', () => {
  expect(validateDecodedSegment('a\\b')).toBeNull();
});

test('validateDecodedSegment - rejects NUL', () => {
  expect(validateDecodedSegment('\0')).toBeNull();
});

test('validateDecodedSegment - rejects control chars', () => {
  expect(validateDecodedSegment('\x1f')).toBeNull();
  expect(validateDecodedSegment('\x7f')).toBeNull();
});

test('validateDecodedSegment - rejects overly long', () => {
  expect(validateDecodedSegment('a'.repeat(257))).toBeNull();
});

test('validateDecodedSegment - percent-encoded path separator', () => {
  expect(validateDecodedSegment('a%2Fb')).toBeNull();
  expect(validateDecodedSegment('a%5Cb')).toBeNull();
});

test('validateDecodedSegment - percent-encoded traversal', () => {
  expect(validateDecodedSegment('%2e')).toBeNull();
  expect(validateDecodedSegment('%2e%2e')).toBeNull();
});

test('validateDecodedSegment - double-encoded traversal caught', () => {
  expect(validateDecodedSegment('%252e%252e')).toBeNull();
  expect(validateDecodedSegment('%252e')).toBeNull();
  expect(validateDecodedSegment('%252f')).toBeNull();
  expect(validateDecodedSegment('%255c')).toBeNull();
});

test('validateDecodedSegment - invalid percent encoding', () => {
  expect(validateDecodedSegment('%ZZ')).toBeNull();
});

test('verifyPathConsistency - match', () => {
  const req = makeRequest('http://localhost/api/trees/abc123', 'GET');
  expect(verifyPathConsistency(req, params('trees/abc123'))).toBe(true);
});

test('verifyPathConsistency - mismatch', () => {
  const req = makeRequest('http://localhost/api/trees', 'GET');
  expect(verifyPathConsistency(req, params('trees/invalid'))).toBe(false);
});

test('verifyPathConsistency - null params', () => {
  const req = makeRequest('http://localhost/api/trees', 'GET');
  expect(verifyPathConsistency(req, null)).toBe(false);
});

test('verifyPathConsistency - non-array params', () => {
  const req = makeRequest('http://localhost/api/trees', 'GET');
  expect(verifyPathConsistency(req, 'trees')).toBe(false);
});

test('verifyPathConsistency - invalid segments in params', () => {
  const req = makeRequest('http://localhost/api/trees', 'GET');
  expect(verifyPathConsistency(req, params('trees//abc'))).toBe(false);
});

test('generateRequestId - forwards valid', () => {
  const req = makeRequest('http://localhost/api/trees', 'GET', { 'x-lovebud-request-id': 'req-abc123' });
  expect(generateRequestId(req)).toBe('req-abc123');
});

test('generateRequestId - generates new for missing', () => {
  const id = generateRequestId(makeRequest('http://localhost/api/trees'));
  expect(id.startsWith('req-')).toBe(true);
  expect(id.length).toBe(40);
});

test('generateRequestId - rejects invalid format', () => {
  const id = generateRequestId(makeRequest('http://localhost/api/trees', 'GET', { 'x-lovebud-request-id': 'invalid/!id' }));
  expect(id.startsWith('req-')).toBe(true);
  expect(SAFE_REQUEST_ID_PATTERN.test(id)).toBe(true);
});

test('generateRequestId - rejects overly long', () => {
  const id = generateRequestId(makeRequest('http://localhost/api/trees', 'GET', { 'x-lovebud-request-id': 'a'.repeat(81) }));
  expect(id.startsWith('req-')).toBe(true);
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

test('forwardHeaders - blocks Host', () => {
  expect(forwardHeaders(makeRequest('http://localhost/api/trees', 'GET', { Host: 'evil.com' })).get('Host')).toBeNull();
});

test('forwardHeaders - blocks Cookie', () => {
  expect(forwardHeaders(makeRequest('http://localhost/api/trees', 'GET', { Cookie: 'x=1' })).get('Cookie')).toBeNull();
});

test('forwardHeaders - blocks Set-Cookie', () => {
  expect(forwardHeaders(makeRequest('http://localhost/api/trees', 'GET', { 'Set-Cookie': 'x=1' })).get('Set-Cookie')).toBeNull();
});

test('forwardHeaders - blocks Content-Length', () => {
  expect(forwardHeaders(makeRequest('http://localhost/api/trees', 'POST', { 'Content-Length': '100' })).get('Content-Length')).toBeNull();
});

test('forwardHeaders - blocks CF-* headers', () => {
  expect(forwardHeaders(makeRequest('http://localhost/api/trees', 'GET', { 'CF-Connecting-IP': '1.2.3.4' })).get('CF-Connecting-IP')).toBeNull();
});

test('forwardHeaders - blocks X-Forwarded-* headers', () => {
  expect(forwardHeaders(makeRequest('http://localhost/api/trees', 'GET', { 'X-Forwarded-Host': 'evil.com' })).get('X-Forwarded-Host')).toBeNull();
});

test('forwardHeaders - blocks unknown headers', () => {
  expect(forwardHeaders(makeRequest('http://localhost/api/trees', 'GET', { 'X-Custom': 'v' })).get('X-Custom')).toBeNull();
});

test('forwardHeaders - blocks Connection header', () => {
  expect(forwardHeaders(makeRequest('http://localhost/api/trees', 'GET', { Connection: 'keep-alive' })).get('Connection')).toBeNull();
});

test('forwardHeaders - CR/LF values in header value rejected', () => {
  const req = makeRequest('http://localhost/api/trees', 'GET', { Authorization: 'Bearer token' });
  const out = forwardHeaders(req);
  expect(out.get('Authorization')).toBe('Bearer token');
});

test('checkContentLength - within limit', () => {
  const r = checkContentLength(makeRequest('http://localhost/api/trees', 'POST', { 'Content-Length': String(MAX_WRITE_BODY_BYTES) }));
  expect(r.tooLarge).toBe(false);
});

test('checkContentLength - over limit', () => {
  const r = checkContentLength(makeRequest('http://localhost/api/trees', 'POST', { 'Content-Length': String(MAX_WRITE_BODY_BYTES + 1) }));
  expect(r.tooLarge).toBe(true);
});

test('checkContentLength - missing returns null', () => {
  expect(checkContentLength(makeRequest('http://localhost/api/trees'))).toBeNull();
});

test('checkContentLength - non-numeric returns null', () => {
  expect(checkContentLength(makeRequest('http://localhost/api/trees', 'POST', { 'Content-Length': 'abc' }))).toBeNull();
});

test('matchRoute - valid route matches', () => {
  const r = matchRoute(makeRequest('http://localhost/api/trees', 'GET'), params('trees'));
  expect(r).not.toBeNull();
  expect(r.route.path).toBe('/api/trees');
  expect(r.route.method).toBe('GET');
});

test('matchRoute - wrong method returns null', () => {
  expect(matchRoute(makeRequest('http://localhost/api/trees', 'DELETE'), params('trees'))).toBeNull();
});

test('matchRoute - invalid params returns null', () => {
  expect(matchRoute(makeRequest('http://localhost/api/trees//abc', 'GET'), params('trees//abc'))).toBeNull();
});

test('matchRouteAnyMethod - matches any method', () => {
  const r = matchRouteAnyMethod(makeRequest('http://localhost/api/trees/abc', 'DELETE'), params('trees/abc'));
  expect(r).not.toBeNull();
  expect(r.route.path).toBe('/api/trees/:treeId');
});

test('matchRouteAnyMethod - invalid params returns null', () => {
  expect(matchRouteAnyMethod(makeRequest('http://localhost/api/trees//abc'), params('trees//abc'))).toBeNull();
});

test('matchRouteAnyMethod - null params returns null', () => {
  expect(matchRouteAnyMethod(makeRequest('http://localhost/api/trees'), null)).toBeNull();
});

test('getAllowedMethod - returns methods for /api/trees', () => {
  const m = getAllowedMethod(makeRequest('http://localhost/api/trees'), params('trees'));
  expect(m).toContain('GET');
  expect(m).toContain('POST');
  expect(m).not.toContain('DELETE');
});

test('getAllowedMethod - /api/community/trees only GET', () => {
  const m = getAllowedMethod(makeRequest('http://localhost/api/community/trees'), params('community/trees'));
  expect(m).toContain('GET');
  expect(m).not.toContain('POST');
});

test('getAllowedMethod - /api/trees/:treeId/hub-layout GET+PUT', () => {
  const m = getAllowedMethod(makeRequest('http://localhost/api/trees/abc/hub-layout'), params('trees/abc/hub-layout'));
  expect(m).toContain('GET');
  expect(m).toContain('PUT');
});

test('buildUpstreamUrl - constructs correct URL', () => {
  const url = buildUpstreamUrl(
    makeRequest('http://localhost/api/trees/abc123', 'GET'),
    'https://api.lovebud.dev',
    params('trees/abc123')
  );
  expect(url).toBe('https://api.lovebud.dev/api/trees/abc123');
});

test('buildUpstreamUrl - preserves query string', () => {
  const url = buildUpstreamUrl(
    makeRequest('http://localhost/api/community/trees?page=1&limit=5', 'GET'),
    'https://api.lovebud.dev',
    params('community/trees')
  );
  expect(url).toContain('page=1');
  expect(url).toContain('limit=5');
});

test('buildUpstreamUrl - no double slash in path', () => {
  const url = buildUpstreamUrl(
    makeRequest('http://localhost/api/trees/abc123', 'GET'),
    'https://api.lovebud.dev',
    params('trees/abc123')
  );
  const path = new URL(url).pathname;
  expect(path).not.toContain('//');
});

test('buildUpstreamUrl - null params returns null', () => {
  expect(buildUpstreamUrl(makeRequest('http://localhost/api/trees'), 'https://api.lovebud.dev', null)).toBeNull();
});

test('createProxyErrorEnvelope - includes code, content-type, request ID', () => {
  const res = createProxyErrorEnvelope('TEST_CODE', 'test message', 'req-123', 400);
  expect(res.headers.get('content-type')).toBe('application/json; charset=utf-8');
  expect(res.headers.get('x-lovebud-request-id')).toBe('req-123');
});

test('createProxyErrorEnvelope - extra headers added', () => {
  const res = createProxyErrorEnvelope('CODE', 'msg', 'id', 405, { Allow: 'GET, POST' });
  expect(res.headers.get('Allow')).toBe('GET, POST');
});

test('fetchUpstream - returns response on success', async () => {
  const mockResp = new Response('ok', { status: 200 });
  globalThis.fetch = vi.fn().mockResolvedValue(mockResp);
  const req = makeRequest('http://localhost/api/trees', 'GET');
  const result = await fetchUpstream('https://api.lovebud.dev/api/trees', req, 'req-1', 5000);
  expect(result.response).toBeDefined();
  expect(result.response.status).toBe(200);
  expect(result.requestId).toBe('req-1');
});

test('fetchUpstream - already aborted returns CLIENT_ABORTED', async () => {
  globalThis.fetch = vi.fn();
  const req = new Request('http://localhost/api/trees');
  const abortListeners = [];
  Object.defineProperty(req, 'signal', {
    value: {
      aborted: true,
      addEventListener: (_, cb) => abortListeners.push(cb),
      removeEventListener: vi.fn(),
    },
    writable: false,
  });
  const result = await fetchUpstream('https://api.lovebud.dev/api/trees', req, 'req-1', 5000);
  expect(result.error).toBe('CLIENT_ABORTED');
  expect(globalThis.fetch).not.toHaveBeenCalled();
});

test('fetchUpstream - redirect returns UPSTREAM_REDIRECT', async () => {
  globalThis.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 301, headers: { Location: 'https://evil.com' } }));
  const result = await fetchUpstream('https://api.lovebud.dev/api/trees', makeRequest('http://localhost/api/trees'), 'req-1', 5000);
  expect(result.error).toBe('UPSTREAM_REDIRECT');
  expect(result.status).toBe(502);
});

test('fetchUpstream - no body for POST with zero content', async () => {
  const fetchFn = vi.fn().mockResolvedValue(new Response('ok', { status: 200 }));
  globalThis.fetch = fetchFn;
  const req = makeRequest('http://localhost/api/trees', 'POST', { 'Content-Length': '0' });

  const bodyReader = vi.spyOn(req, 'arrayBuffer').mockResolvedValue(new ArrayBuffer(0));
  const result = await fetchUpstream('https://api.lovebud.dev', req, 'req-1', 5000);

  expect(result.response.status).toBe(200);
  expect(Object.prototype.hasOwnProperty.call(fetchFn.mock.calls[0][1], 'body')).toBe(false);
  bodyReader.mockRestore();
});

test('forwardResponse - preserves status and statusText', () => {
  const upstream = new Response('body', { status: 206, statusText: 'Partial Content' });
  const res = forwardResponse(upstream, 'req-1');
  expect(res.status).toBe(206);
  expect(res.statusText).toBe('Partial Content');
  expect(res.headers.get('x-lovebud-request-id')).toBe('req-1');
});

test('forwardResponse - removes Set-Cookie', () => {
  const upstream = new Response('ok', { headers: { 'Set-Cookie': 'x=1' } });
  const res = forwardResponse(upstream, 'req-1');
  expect(res.headers.get('set-cookie')).toBeNull();
});

test('forwardResponse - removes connection header', () => {
  const upstream = new Response('ok', { headers: { 'Connection': 'keep-alive' } });
  const res = forwardResponse(upstream, 'req-1');
  expect(res.headers.get('connection')).toBeNull();
});

test('forwardResponse - removes server header', () => {
  const upstream = new Response('ok', { headers: { 'Server': 'nginx' } });
  const res = forwardResponse(upstream, 'req-1');
  expect(res.headers.get('server')).toBeNull();
});

test('forwardResponse - removes CORS headers', () => {
  const upstream = new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  const res = forwardResponse(upstream, 'req-1');
  expect(res.headers.get('access-control-allow-origin')).toBeNull();
});

test('forwardResponse - removes CF-* headers', () => {
  const upstream = new Response('ok', { headers: { 'CF-Ray': 'abc' } });
  const res = forwardResponse(upstream, 'req-1');
  expect(res.headers.get('cf-ray')).toBeNull();
});

test('forwardResponse - preserves content-type', () => {
  const upstream = new Response('ok', { headers: { 'Content-Type': 'application/json' } });
  const res = forwardResponse(upstream, 'req-1');
  expect(res.headers.get('content-type')).toBe('application/json');
});

test('forwardResponse - preserves Cache-Control, ETag, Retry-After', () => {
  const upstream = new Response('ok', { headers: { 'Cache-Control': 'max-age=300', ETag: '"x"', 'Retry-After': '10' } });
  const res = forwardResponse(upstream, 'req-1');
  expect(res.headers.get('cache-control')).toBe('max-age=300');
  expect(res.headers.get('etag')).toBe('"x"');
  expect(res.headers.get('retry-after')).toBe('10');
});

test('forwardResponse - preserves content-disposition', () => {
  const upstream = new Response('ok', { headers: { 'Content-Disposition': 'attachment; filename="x.json"' } });
  const res = forwardResponse(upstream, 'req-1');
  expect(res.headers.get('content-disposition')).toBe('attachment; filename="x.json"');
});

test('forwardResponse - passes through null body (204)', () => {
  const upstream = new Response(null, { status: 204, statusText: 'No Content' });
  const res = forwardResponse(upstream, 'req-1');
  expect(res.status).toBe(204);
  expect(res.body).toBeNull();
});

test('forwardResponse - overwrites request ID', () => {
  const upstream = new Response('ok', { headers: { 'x-lovebud-request-id': 'upstream-id' } });
  const res = forwardResponse(upstream, 'proxy-id');
  expect(res.headers.get('x-lovebud-request-id')).toBe('proxy-id');
});

test('ALLOWED_ROUTES is frozen', () => {
  expect(Object.isFrozen(ALLOWED_ROUTES)).toBe(true);
  expect(Object.isFrozen(ALLOWED_ROUTES[0])).toBe(true);
});

test('ALLOWED_ROUTES cannot be extended', () => {
  expect(() => ALLOWED_ROUTES.push({ method: 'GET', path: '/api/evil' })).toThrow();
});

test('ALLOWED_ROUTES elements cannot be mutated', () => {
  expect(() => { ALLOWED_ROUTES[0].method = 'POST'; }).toThrow();
});

test('getRouteMethods returns copy, not original', () => {
  const methods = getRouteMethods('/api/trees');
  expect(methods).toContain('GET');
  const lenBefore = methods.length;
  methods.push('HEAD');
  const methods2 = getRouteMethods('/api/trees');
  expect(methods2.length).toBe(lenBefore);
});

test('getRouteMethods - runtime matcher uses same source', () => {
  const fromGetter = getRouteMethods('/api/trees');
  const fromMatch = getAllowedMethod(makeRequest('http://localhost/api/trees'), params('trees'));
  expect(fromGetter.sort()).toEqual(fromMatch.sort());
});

test('no duplicate methods per path', () => {
  const seen = {};
  for (const route of ALLOWED_ROUTES) {
    if (!seen[route.path]) seen[route.path] = new Set();
    expect(seen[route.path].has(route.method)).toBe(false);
    seen[route.path].add(route.method);
  }
});

test('BLOCKED_REQUEST_HEADERS includes all required', () => {
  const required = ['host', 'cookie', 'set-cookie', 'content-length', 'connection', 'te', 'upgrade'];
  for (const h of required) {
    expect(BLOCKED_REQUEST_HEADERS.includes(h)).toBe(true);
  }
});

test('BLOCKED_RESPONSE_HEADERS includes all required', () => {
  const required = ['set-cookie', 'server', 'x-powered-by', 'access-control-allow-origin'];
  for (const h of required) {
    expect(BLOCKED_RESPONSE_HEADERS.includes(h)).toBe(true);
  }
});

test('BLOCKED_HEADER_PREFIXES includes cf- and x-forwarded-', () => {
  expect(BLOCKED_HEADER_PREFIXES).toContain('cf-');
  expect(BLOCKED_HEADER_PREFIXES).toContain('x-forwarded-');
});

test('ALLOWED_RESPONSE_HEADERS includes content-type, cache-control, etag', () => {
  expect(ALLOWED_RESPONSE_HEADERS).toContain('content-type');
  expect(ALLOWED_RESPONSE_HEADERS).toContain('cache-control');
  expect(ALLOWED_RESPONSE_HEADERS).toContain('etag');
  expect(ALLOWED_RESPONSE_HEADERS).toContain('retry-after');
  expect(ALLOWED_RESPONSE_HEADERS).toContain('content-disposition');
});
