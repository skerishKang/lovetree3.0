const _routes = [
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
  { method: 'POST', path: '/api/trees/:treeId/memories/:memoryId/comments' },
  { method: 'DELETE', path: '/api/comments/:commentId' },
  { method: 'GET', path: '/api/trees/:treeId/memories/:memoryId/reactions' },
  { method: 'POST', path: '/api/trees/:treeId/memories/:memoryId/reactions' },
  { method: 'GET', path: '/api/memories' },
  { method: 'POST', path: '/api/memories' },
  { method: 'GET', path: '/api/memories/:memoryId' },
  { method: 'PUT', path: '/api/memories/:memoryId' },
  { method: 'DELETE', path: '/api/memories/:memoryId' },
  { method: 'GET', path: '/api/youtube/oembed' },
];

for (const route of _routes) {
  Object.freeze(route);
}
Object.freeze(_routes);

export const ALLOWED_ROUTES = _routes;

const _methodsMap = new Map();
for (const route of _routes) {
  const set = _methodsMap.get(route.path) || new Set();
  set.add(route.method);
  _methodsMap.set(route.path, set);
}

export const ALLOWED_METHODS_PER_PATH = Object.freeze({
  get(path) { return _methodsMap.get(path); },
  has(path) { return _methodsMap.has(path); },
  [Symbol.iterator]() { return _methodsMap[Symbol.iterator](); },
});

export const ALLOWED_HEADERS = Object.freeze(new Set([
  'authorization',
  'idempotency-key',
  'content-type',
  'accept',
  'x-lovebud-request-id',
]));

export const BLOCKED_HEADERS = Object.freeze(new Set([
  'host',
  'cookie',
  'set-cookie',
  'content-length',
  'transfer-encoding',
]));

export const CF_OR_X_FORWARDED_PREFIXES = Object.freeze(['cf-', 'x-forwarded-']);

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
