import { useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export const HASH_SCROLL_ACTIVATION_EVENT = "lovetree:hash-scroll-activation";
export const HASH_SCROLL_HEADER_OFFSET = 72;
export const HASH_SCROLL_HIGHLIGHT_ATTRIBUTE = "data-hash-scroll-active";
export const HASH_SCROLL_HIGHLIGHT_DURATION_MS = 900;

interface HashScrollActivationDetail {
  hash: string;
}

export function requestHashScrollActivation(hash: string) {
  window.dispatchEvent(
    new CustomEvent<HashScrollActivationDetail>(HASH_SCROLL_ACTIVATION_EVENT, {
      detail: { hash },
    }),
  );
}

function getHashTargetId(hash: string) {
  const encodedId = hash.replace(/^#/, "");
  if (!encodedId) {
    return "";
  }

  try {
    return decodeURIComponent(encodedId);
  } catch {
    return encodedId;
  }
}

export function HashScrollRestoration() {
  const location = useLocation();
  const activeTargetRef = useRef<HTMLElement | null>(null);
  const highlightTimerRef = useRef<number | null>(null);

  const clearHighlight = useCallback(() => {
    if (highlightTimerRef.current !== null) {
      window.clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = null;
    }

    activeTargetRef.current?.removeAttribute(HASH_SCROLL_HIGHLIGHT_ATTRIBUTE);
    activeTargetRef.current = null;
  }, []);

  const activateHash = useCallback(
    (hash: string) => {
      clearHighlight();

      const id = getHashTargetId(hash);
      if (!id) {
        return;
      }

      const target = document.getElementById(id);
      if (!target) {
        return;
      }

      const reducedMotion =
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
      const top = Math.max(
        0,
        target.getBoundingClientRect().top + window.scrollY - HASH_SCROLL_HEADER_OFFSET,
      );

      window.scrollTo({
        top,
        behavior: reducedMotion ? "auto" : "smooth",
      });

      target.setAttribute(HASH_SCROLL_HIGHLIGHT_ATTRIBUTE, "true");
      activeTargetRef.current = target;
      highlightTimerRef.current = window.setTimeout(() => {
        if (activeTargetRef.current === target) {
          target.removeAttribute(HASH_SCROLL_HIGHLIGHT_ATTRIBUTE);
          activeTargetRef.current = null;
        }
        highlightTimerRef.current = null;
      }, HASH_SCROLL_HIGHLIGHT_DURATION_MS);
    },
    [clearHighlight],
  );

  useEffect(() => {
    activateHash(location.hash);
  }, [activateHash, location.hash, location.pathname]);

  useEffect(() => {
    const handleActivation = (event: Event) => {
      const customEvent = event as CustomEvent<HashScrollActivationDetail>;
      activateHash(customEvent.detail?.hash ?? "");
    };

    window.addEventListener(HASH_SCROLL_ACTIVATION_EVENT, handleActivation);
    return () => {
      window.removeEventListener(HASH_SCROLL_ACTIVATION_EVENT, handleActivation);
      clearHighlight();
    };
  }, [activateHash, clearHighlight]);

  return null;
}
