import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  AUTH_SESSION_EXPIRED_EVENT,
  AUTH_SESSION_EXPIRED_NOTICE,
  buildSafeReturnTarget,
  isSafeInternalReturnTarget,
  isSessionExpiredEvent,
  type AuthNavigationState,
} from "../context/authSession";

const DUPLICATE_WINDOW_MS = 1_000;

export default function AuthSessionController() {
  const { expireSession } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const handlingRef = useRef(false);
  const lastHandledAtRef = useRef(0);

  useEffect(() => {
    const handleSessionExpired = async (event: Event) => {
      if (!isSessionExpiredEvent(event)) {
        return;
      }

      const now = Date.now();
      if (
        handlingRef.current ||
        now - lastHandledAtRef.current < DUPLICATE_WINDOW_MS
      ) {
        return;
      }

      handlingRef.current = true;
      lastHandledAtRef.current = now;

      const currentTarget = buildSafeReturnTarget(location);
      const requestedTarget = isSafeInternalReturnTarget(event.detail.returnTo)
        ? event.detail.returnTo
        : null;
      const returnTo = requestedTarget ?? currentTarget;

      try {
        await expireSession();
      } finally {
        const state: AuthNavigationState = {
          authNotice: AUTH_SESSION_EXPIRED_NOTICE,
          ...(returnTo ? { returnTo } : {}),
        };

        navigate("/login", { replace: true, state });
        handlingRef.current = false;
      }
    };

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);

    return () => {
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, [
    expireSession,
    location.hash,
    location.pathname,
    location.search,
    navigate,
  ]);

  return null;
}
