export const AUTH_SESSION_EXPIRED_EVENT = "lovetree:auth-session-expired";
export const AUTH_SESSION_EXPIRED_NOTICE = "session-expired";
export const DEFAULT_AUTH_RETURN_TARGET = "/my-trees";

export interface AuthNavigationState {
  returnTo?: unknown;
  authNotice?: unknown;
}

export interface SessionExpiredDetail {
  returnTo?: unknown;
  source?: "persistent-401";
}

interface LocationLike {
  pathname: string;
  search?: string;
  hash?: string;
}

function decodeForInspection(value: string): string | null {
  let decoded = value;

  for (let index = 0; index < 2; index += 1) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) {
        break;
      }
      decoded = next;
    } catch {
      return null;
    }
  }

  return decoded;
}

function hasUnsafeScheme(value: string): boolean {
  const withoutLeadingSlashes = value.replace(/^\/+/, "").toLowerCase();
  return /^(?:https?:|javascript:|data:)/.test(withoutLeadingSlashes);
}

export function isSafeInternalReturnTarget(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0 || value.trim() !== value) {
    return false;
  }

  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return false;
  }

  if (/[\u0000-\u001f\u007f]/.test(value)) {
    return false;
  }

  const decoded = decodeForInspection(value);
  if (
    decoded === null ||
    !decoded.startsWith("/") ||
    decoded.startsWith("//") ||
    decoded.includes("\\") ||
    hasUnsafeScheme(decoded)
  ) {
    return false;
  }

  let parsed: URL;
  try {
    parsed = new URL(value, "https://lovetree.invalid");
  } catch {
    return false;
  }

  if (parsed.origin !== "https://lovetree.invalid") {
    return false;
  }

  if (parsed.pathname === "/login" || parsed.pathname.startsWith("/login/")) {
    return false;
  }

  return true;
}

export function resolveSafeReturnTarget(
  value: unknown,
  fallback = DEFAULT_AUTH_RETURN_TARGET
): string {
  return isSafeInternalReturnTarget(value) ? value : fallback;
}

export function buildSafeReturnTarget(location: LocationLike): string | null {
  const candidate = `${location.pathname}${location.search ?? ""}${location.hash ?? ""}`;
  return isSafeInternalReturnTarget(candidate) ? candidate : null;
}

export function emitSessionExpired(detail: SessionExpiredDetail = {}): void {
  window.dispatchEvent(
    new CustomEvent<SessionExpiredDetail>(AUTH_SESSION_EXPIRED_EVENT, {
      detail: Object.freeze({ ...detail }),
    })
  );
}

export function isSessionExpiredEvent(
  event: Event
): event is CustomEvent<SessionExpiredDetail> {
  return event.type === AUTH_SESSION_EXPIRED_EVENT && event instanceof CustomEvent;
}
