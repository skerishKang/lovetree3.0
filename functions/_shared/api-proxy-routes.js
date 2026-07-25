const _routeEntries = [
  { method: 'GET', path: '/api/community/trees' },
  { method: 'GET', path: '/api/community/growing-trees' },
  { method: 'GET', path: '/api/community/memories' },
  { method: 'GET', path: '/api/trees' },
  { method: 'POST', path: '/api/trees' },
  { method: 'GET', path: '/api/trees/:treeId' },
  { method: 'PUT', path: '/api/trees/:treeId' },
  { method: 'DELETE', path: '/api/trees/:treeId' },
  { method: 'GET', path: '/api/trees/:treeId/hub-layout' },
  { method: 'PUT', path: '/api/trees/:treeId/hub-layout' },
  { method: 'POST', path: '/api/trees/:treeId/views' },
  { method: 'POST', path: '/api/trees/:treeId/fork' },
  { method: 'GET', path: '/api/trees/:treeId/comments' },
  { method: 'POST', path: '/api/trees/:treeId/comments' },
  { method: 'GET', path: '/api/trees/:treeId/likes' },
  { method: 'POST', path: '/api/trees/:treeId/likes' },
  { method: 'GET', path: '/api/trees/:treeId/memories/:memoryId/comments' },
  { method: 'GET', path: '/api/trees/:treeId/memories/:memoryId/reactions' },
  { method: 'DELETE', path: '/api/comments/:commentId' },
  { method: 'GET', path: '/api/memories' },
  { method: 'POST', path: '/api/memories' },
  { method: 'GET', path: '/api/memories/:memoryId' },
  { method: 'PUT', path: '/api/memories/:memoryId' },
  { method: 'DELETE', path: '/api/memories/:memoryId' },
  { method: 'GET', path: '/api/memories/:memoryId/comments' },
  { method: 'POST', path: '/api/memories/:memoryId/comments' },
  { method: 'GET', path: '/api/memories/:memoryId/reactions' },
  { method: 'POST', path: '/api/memories/:memoryId/reactions' },
  { method: 'GET', path: '/api/youtube/oembed' },
];

const _routes = Object.freeze(_routeEntries.map(r => Object.freeze({ ...r })));

export const ALLOWED_ROUTES = _routes;

const _temp = {};
for (const route of _routes) {
  if (!_temp[route.path]) _temp[route.path] = [];
  _temp[route.path].push(route.method);
}
const _frozenMethods = Object.freeze(
  Object.fromEntries(
    Object.entries(_temp).map(([path, methods]) => [path, Object.freeze(methods)])
  )
);

export function getRouteMethods(path) {
  const m = _frozenMethods[path];
  return m ? m.slice() : null;
}

export const ALLOWED_METHODS_PER_PATH = { get: getRouteMethods };

export const ALLOWED_FORWARD_HEADERS = Object.freeze([
  'authorization',
  'idempotency-key',
  'content-type',
  'accept',
  'x-lovebud-request-id',
]);

export const BLOCKED_REQUEST_HEADERS = Object.freeze([
  'host',
  'cookie',
  'set-cookie',
  'content-length',
  'transfer-encoding',
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'upgrade',
]);

export const BLOCKED_RESPONSE_HEADERS = Object.freeze([
  'set-cookie',
  'content-length',
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'server',
  'via',
  'x-powered-by',
  'access-control-allow-origin',
  'access-control-allow-credentials',
  'access-control-allow-headers',
  'access-control-allow-methods',
  'access-control-expose-headers',
]);

export const BLOCKED_HEADER_PREFIXES = Object.freeze(['cf-', 'x-forwarded-']);

export const ALLOWED_RESPONSE_HEADERS = Object.freeze([
  'content-type',
  'cache-control',
  'etag',
  'retry-after',
  'content-disposition',
  'last-modified',
]);

export const MAX_WRITE_BODY_BYTES = 128 * 1024;

export const DEFAULT_TIMEOUT_MS = 25000;
export const MIN_TIMEOUT_MS = 1;
export const MAX_TIMEOUT_MS = 60000;

export const MAX_PATH_SEGMENT_LENGTH = 256;

export const PATH_PARAMETER_PATTERN = /^[^./\\:]+$/;

export const REQUEST_ID_HEADER = 'x-lovebud-request-id';
export const MAX_REQUEST_ID_LENGTH = 80;
export const SAFE_REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]+$/;

export const ENV_VAR_NAME = 'LOVEBUD_API_BASE_URL';
export const TIMEOUT_ENV_VAR_NAME = 'LOVEBUD_API_TIMEOUT_MS';
