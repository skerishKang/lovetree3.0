import { test, expect, vi, afterEach } from 'vitest';
import { onRequest } from './[[path]].js';

afterEach(() => {
  vi.restoreAllMocks();
});

function makeRequest(path, method = 'GET', headers = {}, body = null) {
  const url = `http://localhost/${path}`;
  const init = { method, headers: new Headers(headers) };
  if (body !== null && method !== 'GET' && method !== 'HEAD') {
    init.body = body;
  }
  return new Request(url, init);
}

function makeContext(urlPath, method = 'GET', env = {}, headers = {}, body = null) {
  const pathOnly = urlPath.split('?')[0];
  const pathParams = pathOnly.replace(/^api\//, '').split('/');
  return {
    request: makeRequest(urlPath, method, headers, body),
    env: {
      LOVEBUD_API_BASE_URL: 'https://api.lovebud.dev',
      LOVEBUD_API_TIMEOUT_MS: '',
      ...env,
    },
    params: { path: pathParams },
    functionPath: `/${pathOnly}`,
  };
}

function mockFetch(handler) {
  const fn = vi.fn().mockImplementation(handler);
  globalThis.fetch = fn;
  return fn;
}

function jsonResponse(status, data, extraHeaders = {}) {
  const headers = new Headers({ 'content-type': 'application/json', ...extraHeaders });
  return new Response(JSON.stringify(data), { status, statusText: '', headers });
}

function textResponse(status, text, extraHeaders = {}) {
  const headers = new Headers({ 'content-type': 'text/plain', ...extraHeaders });
  return new Response(text, { status, statusText: 'Custom Status', headers });
}

function emptyResponse(status = 204) {
  return new Response(null, { status, statusText: 'No Content', headers: new Headers() });
}

function binaryResponse() {
  const bytes = new Uint8Array([0x00, 0xFF, 0x89, 0x50, 0x4E, 0x47]);
  return new Response(bytes, { status: 200, headers: new Headers({ 'content-type': 'application/octet-stream' }) });
}

test('onRequest - allowed GET route proxies to upstream', async () => {
  const fetchFn = mockFetch(async (url, opts) => {
    return jsonResponse(200, { trees: [] });
  });

  const ctx = makeContext('api/trees');
  const res = await onRequest(ctx);
  const body = await res.json();

  expect(res.status).toBe(200);
  expect(body).toEqual({ trees: [] });
  expect(fetchFn).toHaveBeenCalledTimes(1);
  expect(fetchFn.mock.calls[0][0]).toBe('https://api.lovebud.dev/api/trees');
});

test('onRequest - forbidden route returns 404 without calling upstream', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, {}));

  const ctx = makeContext('api/private/trees/abc');
  const res = await onRequest(ctx);
  const body = await res.json();

  expect(res.status).toBe(404);
  expect(body.code).toBe('PROXY_ROUTE_NOT_ALLOWED');
  expect(fetchFn).not.toHaveBeenCalled();
});

test('onRequest - forbidden route + missing env still returns 404', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, {}));

  const ctx = makeContext('api/private/trees', 'GET', { LOVEBUD_API_BASE_URL: '' });
  const res = await onRequest(ctx);

  expect(res.status).toBe(404);
  expect(fetchFn).not.toHaveBeenCalled();
});

test('onRequest - wrong method returns 405 with Allow header', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, {}));

  const ctx = makeContext('api/community/trees', 'POST');
  const res = await onRequest(ctx);
  const body = await res.json();

  expect(res.status).toBe(405);
  expect(body.code).toBe('METHOD_NOT_ALLOWED');
  expect(res.headers.get('Allow')).toBe('GET');
  expect(fetchFn).not.toHaveBeenCalled();
});

test('onRequest - wrong method + missing env still returns 405', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, {}));

  const ctx = makeContext('api/community/trees', 'POST', { LOVEBUD_API_BASE_URL: '' });
  const res = await onRequest(ctx);

  expect(res.status).toBe(405);
  expect(fetchFn).not.toHaveBeenCalled();
});

test('onRequest - allowed route + missing env returns 503', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, {}));

  const ctx = makeContext('api/trees', 'GET', { LOVEBUD_API_BASE_URL: '' });
  const res = await onRequest(ctx);
  const body = await res.json();

  expect(res.status).toBe(503);
  expect(body.code).toBe('UPSTREAM_NOT_CONFIGURED');
  expect(fetchFn).not.toHaveBeenCalled();
});

test('onRequest - exact 128KB body accepted', async () => {
  const fetchFn = mockFetch(async (url, opts) => {
    expect(opts.body.byteLength).toBe(131072);
    return jsonResponse(201, { id: '1' });
  });

  const body = new Uint8Array(131072);
  const ctx = makeContext('api/trees', 'POST', {}, { 'Content-Length': '131072' }, body);
  const res = await onRequest(ctx);

  expect(res.status).toBe(201);
  expect(fetchFn).toHaveBeenCalledTimes(1);
});

test('onRequest - 128KB + 1 byte body rejected with 413', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, {}));

  const ctx = makeContext('api/trees', 'POST', {}, { 'Content-Length': '131073' }, new Uint8Array(131073));
  const res = await onRequest(ctx);
  const body = await res.json();

  expect(res.status).toBe(413);
  expect(body.code).toBe('PAYLOAD_TOO_LARGE');
  expect(fetchFn).not.toHaveBeenCalled();
});

test('onRequest - UTF-8 multibyte body passed byte-equivalent', async () => {
  const multibyte = '한국어테스트日本語';
  const encoder = new TextEncoder();
  const expectedBytes = encoder.encode(multibyte);

  const fetchFn = mockFetch(async (url, opts) => {
    const received = new Uint8Array(opts.body);
    expect(received.byteLength).toBe(expectedBytes.byteLength);
    for (let i = 0; i < received.byteLength; i++) {
      expect(received[i]).toBe(expectedBytes[i]);
    }
    return jsonResponse(200, {});
  });

  const ctx = makeContext('api/trees', 'POST', {},
    { 'Content-Length': String(expectedBytes.byteLength) },
    encoder.encode(multibyte)
  );
  await onRequest(ctx);
  expect(fetchFn).toHaveBeenCalledTimes(1);
});

test('onRequest - invalid UTF-8 bytes passed unchanged', async () => {
  const bytes = new Uint8Array([0xC0, 0xAF, 0xE0, 0x80, 0xFF]);

  const fetchFn = mockFetch(async (url, opts) => {
    const received = new Uint8Array(opts.body);
    expect(received.byteLength).toBe(5);
    expect(received[0]).toBe(0xC0);
    expect(received[4]).toBe(0xFF);
    return jsonResponse(200, {});
  });

  const ctx = makeContext('api/trees', 'POST', {},
    { 'Content-Length': '5' },
    bytes
  );
  await onRequest(ctx);
  expect(fetchFn).toHaveBeenCalledTimes(1);
});

test('onRequest - empty body handled correctly', async () => {
  const fetchFn = mockFetch(async (_url, _opts) => {
    expect(opts.body).toBeUndefined();
    return jsonResponse(200, {});
  });

  const ctx = makeContext('api/community/trees', 'GET');
  await onRequest(ctx);
  expect(fetchFn).toHaveBeenCalledTimes(1);
});

test('onRequest - upstream timeout returns 504', async () => {
  mockFetch(async () => {
    return new Promise((_, reject) => {
      const err = new Error('The operation was aborted');
      err.name = 'AbortError';
      setTimeout(() => reject(err), 50);
    });
  });

  const ctx = makeContext('api/trees', 'GET', { LOVEBUD_API_TIMEOUT_MS: '10' });
  const res = await onRequest(ctx);
  const body = await res.json();

  expect(res.status).toBe(504);
  expect(body.code).toBe('UPSTREAM_TIMEOUT');
});

test('onRequest - network failure returns 502', async () => {
  mockFetch(async () => {
    throw new TypeError('fetch failed');
  });

  const ctx = makeContext('api/trees');
  const res = await onRequest(ctx);
  const body = await res.json();

  expect(res.status).toBe(502);
  expect(body.code).toBe('UPSTREAM_UNAVAILABLE');
});

test('onRequest - 204 No Content forwarded correctly', async () => {
  mockFetch(async () => emptyResponse(204));

  const ctx = makeContext('api/trees/abc123', 'DELETE');
  const res = await onRequest(ctx);

  expect(res.status).toBe(204);
  expect(res.statusText).toBe('No Content');
  const body = await res.text();
  expect(body).toBe('');
});

test('onRequest - HEAD-like empty body 200 forwarded', async () => {
  mockFetch(async () => new Response(null, {
    status: 200,
    statusText: 'OK',
    headers: new Headers({ 'content-type': 'application/json' }),
  }));

  const ctx = makeContext('api/trees', 'GET');
  const res = await onRequest(ctx);

  expect(res.status).toBe(200);
  expect(res.headers.get('content-type')).toBe('application/json');
});

test('onRequest - statusText preserved from upstream', async () => {
  mockFetch(async () => textResponse(206, 'Partial'));

  const ctx = makeContext('api/trees');
  const res = await onRequest(ctx);

  expect(res.status).toBe(206);
  expect(res.statusText).toBe('Custom Status');
});

test('onRequest - Set-Cookie removed from response', async () => {
  mockFetch(async () => jsonResponse(200, {}, { 'Set-Cookie': 'session=abc' }));

  const ctx = makeContext('api/trees');
  const res = await onRequest(ctx);

  expect(res.headers.get('set-cookie')).toBeNull();
});

test('onRequest - CF-* headers removed from response', async () => {
  mockFetch(async () => jsonResponse(200, {}, { 'CF-Ray': 'abc123' }));

  const ctx = makeContext('api/trees');
  const res = await onRequest(ctx);

  expect(res.headers.get('cf-ray')).toBeNull();
});

test('onRequest - Cache-Control and ETag preserved', async () => {
  mockFetch(async () => jsonResponse(200, {}, {
    'Cache-Control': 'max-age=300',
    'ETag': '"abc123"',
    'Retry-After': '30',
  }));

  const ctx = makeContext('api/trees');
  const res = await onRequest(ctx);

  expect(res.headers.get('cache-control')).toBe('max-age=300');
  expect(res.headers.get('etag')).toBe('"abc123"');
  expect(res.headers.get('retry-after')).toBe('30');
});

test('onRequest - x-lovebud-request-id set on every response', async () => {
  mockFetch(async () => jsonResponse(200, {}));

  const ctx = makeContext('api/trees');
  const res = await onRequest(ctx);

  expect(res.headers.get('x-lovebud-request-id')).toBeTruthy();
});

test('onRequest - incoming request ID forwarded', async () => {
  mockFetch(async () => jsonResponse(200, {}));

  const ctx = makeContext('api/trees', 'GET', {}, { 'x-lovebud-request-id': 'custom-id-123' });
  const res = await onRequest(ctx);

  expect(res.headers.get('x-lovebud-request-id')).toBe('custom-id-123');
});

test('onRequest - query string preserved in upstream URL', async () => {
  const fetchFn = mockFetch(async (url) => {
    expect(url).toContain('page=2&limit=10');
    return jsonResponse(200, {});
  });

  const ctx = makeContext('api/community/trees?page=2&limit=10');
  await onRequest(ctx);

  expect(fetchFn.mock.calls[0][0]).toContain('?page=2&limit=10');
});

test('onRequest - allowed route with :treeId param', async () => {
  const fetchFn = mockFetch(async (url) => {
    expect(url).toBe('https://api.lovebud.dev/api/trees/abc123');
    return jsonResponse(200, { id: 'abc123' });
  });

  const ctx = makeContext('api/trees/abc123');
  const res = await onRequest(ctx);

  expect(res.status).toBe(200);
  expect(fetchFn).toHaveBeenCalledTimes(1);
});

test('onRequest - PUT /api/trees/:treeId/hub-layout allowed', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, {}));

  const ctx = makeContext('api/trees/abc123/hub-layout', 'PUT', {}, { 'Content-Length': '10' }, new Uint8Array(10));
  const res = await onRequest(ctx);

  expect(res.status).toBe(200);
  expect(fetchFn).toHaveBeenCalledTimes(1);
});

test('onRequest - GET /api/trees/:treeId/hub-layout allowed', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, {}));

  const ctx = makeContext('api/trees/abc123/hub-layout', 'GET');
  const res = await onRequest(ctx);

  expect(res.status).toBe(200);
  expect(fetchFn).toHaveBeenCalledTimes(1);
});

test('onRequest - double slash in path returns 404', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, {}));

  const ctx = makeContext('api/trees//abc', 'GET');
  const res = await onRequest(ctx);

  expect(res.status).toBe(404);
  expect(fetchFn).not.toHaveBeenCalled();
});

test('onRequest - encoded slash in segment returns 404', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, {}));

  const ctx = makeContext('api/trees/a%2Fb', 'GET');
  const res = await onRequest(ctx);

  expect(res.status).toBe(404);
  expect(fetchFn).not.toHaveBeenCalled();
});

test('onRequest - encoded backslash in segment returns 404', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, {}));

  const ctx = makeContext('api/trees/a%5Cb', 'GET');
  const res = await onRequest(ctx);

  expect(res.status).toBe(404);
  expect(fetchFn).not.toHaveBeenCalled();
});

test('onRequest - encoded dot traversal returns 404', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, {}));

  const ctx = makeContext('api/trees/%2e', 'GET');
  const res = await onRequest(ctx);

  expect(res.status).toBe(404);
  expect(fetchFn).not.toHaveBeenCalled();
});

test('onRequest - double encoded dotdot returns 404', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, {}));

  const ctx = makeContext('api/trees/%252e%252e', 'GET');
  const res = await onRequest(ctx);

  expect(res.status).toBe(404);
  expect(fetchFn).not.toHaveBeenCalled();
});

test('onRequest - binary response forwarded byte-equivalent', async () => {
  mockFetch(async () => binaryResponse());

  const ctx = makeContext('api/trees');
  const res = await onRequest(ctx);
  const received = new Uint8Array(await res.arrayBuffer());

  expect(received.byteLength).toBe(6);
  expect(received[0]).toBe(0x00);
  expect(received[1]).toBe(0xFF);
});

test('onRequest - fetch called exactly once', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, {}));

  const ctx = makeContext('api/trees');
  await onRequest(ctx);

  expect(fetchFn).toHaveBeenCalledTimes(1);
});

test('onRequest - comment routes allowed', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, { comments: [] }));

  const ctx = makeContext('api/trees/abc123/comments', 'GET');
  const res = await onRequest(ctx);

  expect(res.status).toBe(200);
  expect(fetchFn).toHaveBeenCalledTimes(1);
});

test('onRequest - likes routes allowed', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, { likes: [] }));

  const ctx = makeContext('api/trees/abc123/likes', 'GET');
  const res = await onRequest(ctx);

  expect(res.status).toBe(200);
  expect(fetchFn).toHaveBeenCalledTimes(1);
});

test('onRequest - reactions routes allowed', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, { reactions: [] }));

  const ctx = makeContext('api/trees/abc123/memories/mem456/reactions', 'GET');
  const res = await onRequest(ctx);

  expect(res.status).toBe(200);
  expect(fetchFn).toHaveBeenCalledTimes(1);
});

test('onRequest - memory comment routes allowed', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, { comments: [] }));

  const ctx = makeContext('api/trees/abc123/memories/mem456/comments', 'GET');
  const res = await onRequest(ctx);

  expect(res.status).toBe(200);
  expect(fetchFn).toHaveBeenCalledTimes(1);
});

test('onRequest - DELETE /api/comments/:commentId allowed', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(204));

  const ctx = makeContext('api/comments/comment123', 'DELETE');
  const res = await onRequest(ctx);

  expect(res.status).toBe(204);
  expect(fetchFn).toHaveBeenCalledTimes(1);
});

test('onRequest - fork route allowed', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(201, { id: 'forked' }));

  const ctx = makeContext('api/trees/abc123/fork', 'POST',
    {}, { 'Content-Length': '0' }, new Uint8Array(0));
  const res = await onRequest(ctx);

  expect(res.status).toBe(201);
  expect(fetchFn).toHaveBeenCalledTimes(1);
});

test('onRequest - invalid timeout falls back to default', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, {}));

  const ctx = makeContext('api/trees', 'GET', { LOVEBUD_API_TIMEOUT_MS: 'abc' });
  await onRequest(ctx);

  expect(fetchFn).toHaveBeenCalledTimes(1);
});

test('onRequest - timeout of 0 falls back to default', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, {}));

  const ctx = makeContext('api/trees', 'GET', { LOVEBUD_API_TIMEOUT_MS: '0' });
  await onRequest(ctx);

  expect(fetchFn).toHaveBeenCalledTimes(1);
});

test('onRequest - timeout exceeding max falls back to default', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, {}));

  const ctx = makeContext('api/trees', 'GET', { LOVEBUD_API_TIMEOUT_MS: '999999' });
  await onRequest(ctx);

  expect(fetchFn).toHaveBeenCalledTimes(1);
});

test('onRequest - 405 uses unified error envelope', async () => {
  mockFetch(async () => jsonResponse(200, {}));

  const ctx = makeContext('api/trees', 'DELETE');
  const res = await onRequest(ctx);
  const body = await res.json();

  expect(body).toHaveProperty('error');
  expect(body).toHaveProperty('code', 'METHOD_NOT_ALLOWED');
  expect(res.headers.get('content-type')).toBe('application/json; charset=utf-8');
  expect(res.headers.get('x-lovebud-request-id')).toBeTruthy();
  expect(res.headers.get('Allow')).toBeTruthy();
});
