import { test, expect, vi, afterEach, beforeEach } from 'vitest';
import { onRequest } from './[[path]].js';

const originalFetch = globalThis.fetch;

beforeEach(() => {
  globalThis.fetch = undefined;
});

afterEach(() => {
  vi.restoreAllMocks();
  globalThis.fetch = originalFetch;
});

function makeRequest(urlPath, method = 'GET', headers = {}, body = null) {
  const url = `http://localhost/${urlPath}`;
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

test('onRequest - allowed GET route proxies to upstream', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, { trees: [] }));
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

test('onRequest - allowed route + missing env returns 503', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, {}));
  const ctx = makeContext('api/trees', 'GET', { LOVEBUD_API_BASE_URL: '' });
  const res = await onRequest(ctx);
  const body = await res.json();

  expect(res.status).toBe(503);
  expect(body.code).toBe('UPSTREAM_NOT_CONFIGURED');
  expect(fetchFn).not.toHaveBeenCalled();
});

test('onRequest - POST empty body without body parameter', async () => {
  const fetchFn = mockFetch(async (_url, opts) => {
    const hasBody = Object.prototype.hasOwnProperty.call(opts || {}, 'body');
    expect(hasBody).toBe(false);
    return jsonResponse(201, { id: '1' });
  });

  const ctx = makeContext('api/trees', 'POST');
  await onRequest(ctx);
  expect(fetchFn).toHaveBeenCalledTimes(1);
});

test('onRequest - POST zero-byte body no body in fetch options', async () => {
  const fetchFn = mockFetch(async (_url, opts) => {
    const hasBody = Object.prototype.hasOwnProperty.call(opts, 'body');
    expect(hasBody).toBe(false);
    return jsonResponse(201, { id: '1' });
  });

  const ctx = makeContext('api/trees', 'POST', {},
    { 'content-type': 'text/plain' },
    new Uint8Array(0)
  );
  await onRequest(ctx);
  expect(fetchFn).toHaveBeenCalledTimes(1);
});

test('onRequest - POST explicit empty string body', async () => {
  const fetchFn = mockFetch(async (_url, opts) => {
    const hasBody = Object.prototype.hasOwnProperty.call(opts, 'body');
    expect(hasBody).toBe(false);
    return jsonResponse(201, { id: '1' });
  });

  const ctx = makeContext('api/trees', 'POST', {},
    { 'content-type': 'text/plain' },
    ''
  );
  await onRequest(ctx);
  expect(fetchFn).toHaveBeenCalledTimes(1);
});

test('onRequest - exact 128KB body accepted', async () => {
  const fetchFn = mockFetch(async (_url, opts) => {
    expect(opts.body.byteLength).toBe(131072);
    return jsonResponse(201, { id: '1' });
  });

  const body = new Uint8Array(131072);
  const ctx = makeContext('api/trees', 'POST', {}, { 'Content-Length': '131072' }, body);
  await onRequest(ctx);
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

test('onRequest - invalid UTF-8 bytes passed unchanged', async () => {
  const bytes = new Uint8Array([0xC0, 0xAF, 0xE0, 0x80, 0xFF]);
  const fetchFn = mockFetch(async (_url, opts) => {
    const received = new Uint8Array(opts.body);
    expect(received.byteLength).toBe(5);
    expect(received[0]).toBe(0xC0);
    expect(received[4]).toBe(0xFF);
    return jsonResponse(200, {});
  });

  const ctx = makeContext('api/trees', 'POST', {}, { 'Content-Length': '5' }, bytes);
  await onRequest(ctx);
  expect(fetchFn).toHaveBeenCalledTimes(1);
});

test('onRequest - arbitrary binary body passed byte-equivalent', async () => {
  const bytes = new Uint8Array([0x00, 0x01, 0xFE, 0xFF, 0x80, 0x7F]);
  const fetchFn = mockFetch(async (_url, opts) => {
    const received = new Uint8Array(opts.body);
    expect(received.byteLength).toBe(6);
    for (let i = 0; i < bytes.length; i++) {
      expect(received[i]).toBe(bytes[i]);
    }
    return jsonResponse(200, {});
  });

  const ctx = makeContext('api/trees', 'POST', {}, { 'Content-Length': '6' }, bytes);
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
  mockFetch(async () => { throw new TypeError('fetch failed'); });
  const ctx = makeContext('api/trees');
  const res = await onRequest(ctx);
  const body = await res.json();

  expect(res.status).toBe(502);
  expect(body.code).toBe('UPSTREAM_UNAVAILABLE');
});

test('onRequest - upstream redirect returns 502 envelope', async () => {
  mockFetch(async () => new Response(null, {
    status: 301,
    headers: new Headers({ 'Location': 'https://evil.com' }),
  }));

  const ctx = makeContext('api/trees');
  const res = await onRequest(ctx);
  const body = await res.json();

  expect(res.status).toBe(502);
  expect(body.code).toBe('UPSTREAM_REDIRECT');
  expect(body).not.toHaveProperty('Location');
});

test('onRequest - 204 No Content forwarded correctly', async () => {
  mockFetch(async () => new Response(null, { status: 204, statusText: 'No Content' }));
  const ctx = makeContext('api/trees/abc123', 'DELETE');
  const res = await onRequest(ctx);

  expect(res.status).toBe(204);
  expect(res.statusText).toBe('No Content');
  const text = await res.text();
  expect(text).toBe('');
});

test('onRequest - statusText preserved from upstream', async () => {
  mockFetch(async () => new Response('Partial', {
    status: 206,
    statusText: 'Custom Status',
    headers: new Headers({ 'content-type': 'text/plain' }),
  }));

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

test('onRequest - Server header removed from response', async () => {
  mockFetch(async () => jsonResponse(200, {}, { 'Server': 'nginx/1.18.0' }));
  const ctx = makeContext('api/trees');
  const res = await onRequest(ctx);
  expect(res.headers.get('server')).toBeNull();
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

test('onRequest - x-lovebud-request-id on every response', async () => {
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

test('onRequest - encoded slash in segment returns 400', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, {}));
  const ctx = makeContext('api/trees/a%2Fb', 'GET');
  const res = await onRequest(ctx);
  expect(res.status).toBe(400);
  expect(fetchFn).not.toHaveBeenCalled();
});

test('onRequest - encoded dot traversal returns 400', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, {}));
  const ctx = makeContext('api/trees/%2e', 'GET');
  const res = await onRequest(ctx);
  expect(res.status).toBe(400);
  expect(fetchFn).not.toHaveBeenCalled();
});

test('onRequest - double encoded traversal returns 400', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, {}));
  const ctx = makeContext('api/trees/%252e%252e', 'GET');
  const res = await onRequest(ctx);
  expect(res.status).toBe(400);
  expect(fetchFn).not.toHaveBeenCalled();
});

test('onRequest - double slash param returns 400', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, {}));
  const ctx = makeContext('api/trees//abc', 'GET');
  const res = await onRequest(ctx);
  expect(res.status).toBe(400);
  expect(fetchFn).not.toHaveBeenCalled();
});

test('onRequest - params mismatch with URL returns 400', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, {}));
  const pathParams = ['trees', 'abc'];
  const ctx = {
    request: makeRequest('api/trees/xyz'),
    env: { LOVEBUD_API_BASE_URL: 'https://api.lovebud.dev', LOVEBUD_API_TIMEOUT_MS: '' },
    params: { path: pathParams },
    functionPath: '/api/trees/abc',
  };
  const res = await onRequest(ctx);
  expect(res.status).toBe(400);
  expect(fetchFn).not.toHaveBeenCalled();
});

test('onRequest - POST with body forwarded to upstream', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(201, { id: '1' }));
  const ctx = makeContext('api/trees', 'POST', {}, { 'Content-Length': '5' }, new Uint8Array([1,2,3,4,5]));
  await onRequest(ctx);
  expect(fetchFn).toHaveBeenCalledTimes(1);
});

test('onRequest - fetch called exactly once', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, {}));
  const ctx = makeContext('api/trees');
  await onRequest(ctx);
  expect(fetchFn).toHaveBeenCalledTimes(1);
});

test('onRequest - nested memory comment GET allowed (public)', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, { comments: [] }));
  const ctx = makeContext('api/trees/abc123/memories/mem456/comments', 'GET');
  const res = await onRequest(ctx);
  expect(res.status).toBe(200);
  expect(fetchFn).toHaveBeenCalledTimes(1);
});

test('onRequest - nested memory reaction GET allowed (public)', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, { reactions: [] }));
  const ctx = makeContext('api/trees/abc123/memories/mem456/reactions', 'GET');
  const res = await onRequest(ctx);
  expect(res.status).toBe(200);
  expect(fetchFn).toHaveBeenCalledTimes(1);
});

test('onRequest - nested memory comment POST rejected (405)', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, {}));
  const ctx = makeContext('api/trees/abc123/memories/mem456/comments', 'POST',
    {}, { 'Content-Length': '0' }, '');
  const res = await onRequest(ctx);
  expect(res.status).toBe(405);
  expect(fetchFn).not.toHaveBeenCalled();
});

test('onRequest - nested memory reaction POST rejected (405)', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, {}));
  const ctx = makeContext('api/trees/abc123/memories/mem456/reactions', 'POST',
    {}, { 'Content-Length': '0' }, '');
  const res = await onRequest(ctx);
  expect(res.status).toBe(405);
  expect(fetchFn).not.toHaveBeenCalled();
});

test('onRequest - private memory comment GET allowed', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, { comments: [] }));
  const ctx = makeContext('api/memories/mem456/comments', 'GET');
  const res = await onRequest(ctx);
  expect(res.status).toBe(200);
  expect(fetchFn).toHaveBeenCalledTimes(1);
});

test('onRequest - private memory comment POST allowed', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(201, { id: 'c1' }));
  const ctx = makeContext('api/memories/mem456/comments', 'POST',
    {}, { 'Content-Length': '5' }, new Uint8Array(5));
  const res = await onRequest(ctx);
  expect(res.status).toBe(201);
  expect(fetchFn).toHaveBeenCalledTimes(1);
});

test('onRequest - private memory reaction GET allowed', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(200, { reactions: [] }));
  const ctx = makeContext('api/memories/mem456/reactions', 'GET');
  const res = await onRequest(ctx);
  expect(res.status).toBe(200);
  expect(fetchFn).toHaveBeenCalledTimes(1);
});

test('onRequest - private memory reaction POST allowed', async () => {
  const fetchFn = mockFetch(async () => jsonResponse(201, { id: 'r1' }));
  const ctx = makeContext('api/memories/mem456/reactions', 'POST',
    {}, { 'Content-Length': '5' }, new Uint8Array(5));
  const res = await onRequest(ctx);
  expect(res.status).toBe(201);
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

test('onRequest - content-length removed from response', async () => {
  mockFetch(async () => jsonResponse(200, {}, { 'Content-Length': '100' }));
  const ctx = makeContext('api/trees');
  const res = await onRequest(ctx);
  expect(res.headers.get('content-length')).toBeNull();
});

test('onRequest - binary response preserved', async () => {
  const bytes = new Uint8Array([0x00, 0xFF, 0x89, 0x50, 0x4E, 0x47]);
  mockFetch(async () => new Response(bytes, {
    status: 200,
    headers: new Headers({ 'content-type': 'application/octet-stream' }),
  }));
  const ctx = makeContext('api/trees');
  const res = await onRequest(ctx);
  const received = new Uint8Array(await res.arrayBuffer());
  expect(received.byteLength).toBe(6);
  expect(received[0]).toBe(0x00);
  expect(received[1]).toBe(0xFF);
});
