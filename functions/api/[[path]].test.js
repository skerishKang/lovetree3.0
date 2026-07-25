import { test, expect } from 'vitest';

import { matchRouteAnyMethod, getAllowedMethod, validateUpstreamEnv, buildUpstreamUrl, generateRequestId } from '../_shared/api-proxy.js';

function makeRequest(url, method = 'GET', headers = {}) {
  const h = new Headers();
  for (const [k, v] of Object.entries(headers)) {
    h.set(k, v);
  }
  return new Request(url, { method, headers: h });
}

function makeEnv(baseUrl) {
  return { LOVEBUD_API_BASE_URL: baseUrl, LOVEBUD_API_TIMEOUT_MS: '' };
}

test('catch-all - GET /api/community/trees allowed', () => {
  const result = matchRouteAnyMethod(makeRequest('http://localhost/api/community/trees', 'GET'));
  expect(result).not.toBeNull();
});

test('catch-all - GET /api/community/growing-trees allowed', () => {
  const result = matchRouteAnyMethod(makeRequest('http://localhost/api/community/growing-trees', 'GET'));
  expect(result).not.toBeNull();
});

test('catch-all - GET /api/community/memories allowed', () => {
  const result = matchRouteAnyMethod(makeRequest('http://localhost/api/community/memories', 'GET'));
  expect(result).not.toBeNull();
});

test('catch-all - GET /api/trees allowed', () => {
  const result = matchRouteAnyMethod(makeRequest('http://localhost/api/trees', 'GET'));
  expect(result).not.toBeNull();
});

test('catch-all - POST /api/trees allowed', () => {
  const result = matchRouteAnyMethod(makeRequest('http://localhost/api/trees', 'POST'));
  expect(result).not.toBeNull();
});

test('catch-all - GET /api/trees/:treeId allowed', () => {
  const result = matchRouteAnyMethod(makeRequest('http://localhost/api/trees/abc123', 'GET'));
  expect(result).not.toBeNull();
  expect(result.paramValues.treeId).toBe('abc123');
});

test('catch-all - PUT /api/trees/:treeId allowed', () => {
  const result = matchRouteAnyMethod(makeRequest('http://localhost/api/trees/abc123', 'PUT'));
  expect(result).not.toBeNull();
});

test('catch-all - DELETE /api/trees/:treeId allowed', () => {
  const result = matchRouteAnyMethod(makeRequest('http://localhost/api/trees/abc123', 'DELETE'));
  expect(result).not.toBeNull();
});

test('catch-all - PUT /api/trees/:treeId/hub-layout allowed', () => {
  const result = matchRouteAnyMethod(makeRequest('http://localhost/api/trees/abc123/hub-layout', 'PUT'));
  expect(result).not.toBeNull();
});

test('catch-all - POST /api/trees/:treeId/views allowed', () => {
  const result = matchRouteAnyMethod(makeRequest('http://localhost/api/trees/abc123/views', 'POST'));
  expect(result).not.toBeNull();
});

test('catch-all - GET /api/memories allowed', () => {
  const result = matchRouteAnyMethod(makeRequest('http://localhost/api/memories', 'GET'));
  expect(result).not.toBeNull();
});

test('catch-all - POST /api/memories allowed', () => {
  const result = matchRouteAnyMethod(makeRequest('http://localhost/api/memories', 'POST'));
  expect(result).not.toBeNull();
});

test('catch-all - GET /api/memories/:memoryId allowed', () => {
  const result = matchRouteAnyMethod(makeRequest('http://localhost/api/memories/mem123', 'GET'));
  expect(result).not.toBeNull();
});

test('catch-all - PUT /api/memories/:memoryId allowed', () => {
  const result = matchRouteAnyMethod(makeRequest('http://localhost/api/memories/mem123', 'PUT'));
  expect(result).not.toBeNull();
});

test('catch-all - DELETE /api/memories/:memoryId allowed', () => {
  const result = matchRouteAnyMethod(makeRequest('http://localhost/api/memories/mem123', 'DELETE'));
  expect(result).not.toBeNull();
});

test('catch-all - GET /api/youtube/oembed allowed', () => {
  const result = matchRouteAnyMethod(makeRequest('http://localhost/api/youtube/oembed', 'GET'));
  expect(result).not.toBeNull();
});

test('catch-all - GET /modal/browse returns null', () => {
  expect(matchRouteAnyMethod(makeRequest('http://localhost/modal/browse', 'GET'))).toBeNull();
});

test('catch-all - GET /api/private/trees/abc/capability returns null', () => {
  expect(matchRouteAnyMethod(makeRequest('http://localhost/api/private/trees/abc/capability', 'GET'))).toBeNull();
});

test('catch-all - GET /api/nonexistent returns null', () => {
  expect(matchRouteAnyMethod(makeRequest('http://localhost/api/nonexistent', 'GET'))).toBeNull();
});

test('catch-all - POST /api/community/trees path matches (POST not allowed for method)', () => {
  const pathMatch = matchRouteAnyMethod(makeRequest('http://localhost/api/community/trees', 'POST'));
  expect(pathMatch).not.toBeNull();
  const methods = getAllowedMethod(makeRequest('http://localhost/api/community/trees', 'GET'));
  expect(methods).toContain('GET');
  expect(methods).not.toContain('POST');
});

test('catch-all - POST /api/community/trees rejected via getAllowedMethod', () => {
  const methods = getAllowedMethod(makeRequest('http://localhost/api/community/trees', 'GET'));
  expect(methods).toBeTruthy();
  expect(methods).not.toContain('POST');
  expect(methods).toContain('GET');
});

test('catch-all - DELETE /api/trees not in allowed methods', () => {
  const methods = getAllowedMethod(makeRequest('http://localhost/api/trees', 'GET'));
  expect(methods).toContain('GET');
  expect(methods).toContain('POST');
  expect(methods).not.toContain('DELETE');
});

test('catch-all - double slash rejected', () => {
  expect(matchRouteAnyMethod(makeRequest('http://localhost/api/trees//abc', 'GET'))).toBeNull();
});

test('catch-all - dot segment resolves via URL parser, matches resolved path', () => {
  const result = matchRouteAnyMethod(makeRequest('http://localhost/api/trees/./abc', 'GET'));
  expect(result).not.toBeNull();
  expect(result.paramValues.treeId).toBe('abc');
});

test('catch-all - parent dot segment rejected', () => {
  expect(matchRouteAnyMethod(makeRequest('http://localhost/api/trees/../abc', 'GET'))).toBeNull();
});

test('catch-all - upstream env missing returns UPSTREAM_NOT_CONFIGURED', () => {
  const validation = validateUpstreamEnv({});
  expect(validation.valid).toBe(false);
  expect(validation.error).toBe('UPSTREAM_NOT_CONFIGURED');
});

test('catch-all - upstream URL not exposed in response', () => {
  const validation = validateUpstreamEnv(makeEnv('https://api.lovebud.dev'));
  expect(validation.valid).toBe(true);
  expect(validation.origin).toBe('https://api.lovebud.dev');
});

test('catch-all - upstream origin does not appear in error response', () => {
  const url = buildUpstreamUrl(makeRequest('http://localhost/api/trees?url=https://evil.com', 'GET'), makeEnv(''));
  expect(url).toBeNull();
});

test('catch-all - request ID echoed in response headers', () => {
  const id = generateRequestId(makeRequest('http://localhost/api/trees', 'GET', {
    'x-lovebud-request-id': 'my-req-1',
  }));
  expect(id).toBe('my-req-1');
});

test('catch-all - request ID generated for missing incoming', () => {
  const id = generateRequestId(makeRequest('http://localhost/api/trees', 'GET'));
  expect(id.startsWith('req-')).toBe(true);
  expect(id.length).toBeGreaterThan(0);
});

test('catch-all - GET /api/community/trees allows GET, not POST', () => {
  const methods = getAllowedMethod(makeRequest('http://localhost/api/community/trees', 'GET'));
  expect(methods).toBeTruthy();
  expect(methods).toContain('GET');
  expect(methods).not.toContain('POST');
});
