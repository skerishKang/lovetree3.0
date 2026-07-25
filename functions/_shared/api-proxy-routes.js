export const ALLOWED_ROUTES = [
  { method: 'GET', path: '/api/community/trees', paramNames: [] },
  { method: 'GET', path: '/api/community/growing-trees', paramNames: [] },
  { method: 'GET', path: '/api/community/memories', paramNames: [] },
  { method: 'GET', path: '/api/trees', paramNames: [] },
  { method: 'POST', path: '/api/trees', paramNames: [] },
  { method: 'PUT', path: '/api/trees/:treeId/hub-layout', paramNames: ['treeId'] },
  { method: 'POST', path: '/api/trees/:treeId/views', paramNames: ['treeId'] },
  { method: 'GET', path: '/api/trees/:treeId', paramNames: ['treeId'] },
  { method: 'PUT', path: '/api/trees/:treeId', paramNames: ['treeId'] },
  { method: 'DELETE', path: '/api/trees/:treeId', paramNames: ['treeId'] },
  { method: 'GET', path: '/api/memories', paramNames: [] },
  { method: 'POST', path: '/api/memories', paramNames: [] },
  { method: 'GET', path: '/api/memories/:memoryId', paramNames: ['memoryId'] },
  { method: 'PUT', path: '/api/memories/:memoryId', paramNames: ['memoryId'] },
  { method: 'DELETE', path: '/api/memories/:memoryId', paramNames: ['memoryId'] },
  { method: 'GET', path: '/api/youtube/oembed', paramNames: [] },
];

export const ALLOWED_METHODS_PER_PATH = new Map();
for (const route of ALLOWED_ROUTES) {
  const key = route.path;
  const set = ALLOWED_METHODS_PER_PATH.get(key) || new Set();
  set.add(route.method);
  ALLOWED_METHODS_PER_PATH.set(key, set);
}

export const ALLOWED_HEADERS = new Set([
  'authorization',
  'idempotency-key',
  'content-type',
  'accept',
  'x-lovebud-request-id',
]);

export const BLOCKED_HEADERS = new Set([
  'host',
  'cookie',
  'set-cookie',
  'content-length',
]);

export const CF_OR_X_FORWARDED_PREFIXES = ['cf-', 'x-forwarded-'];

export const MAX_WRITE_BODY_BYTES = 128 * 1024;

export const DEFAULT_TIMEOUT_MS = 25000;

export const MAX_PATH_SEGMENT_LENGTH = 256;

export const PATH_PARAMETER_PATTERN = /^[^./\\:]+$/;

export const REQUEST_ID_HEADER = 'x-lovebud-request-id';
export const MAX_REQUEST_ID_LENGTH = 80;
export const SAFE_REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]+$/;

export const ENV_VAR_NAME = 'LOVEBUD_API_BASE_URL';
export const TIMEOUT_ENV_VAR_NAME = 'LOVEBUD_API_TIMEOUT_MS';