import { useCallback, useEffect, useRef, useState } from "react";
import { myTreesApi, MyTreesResponseError, type MyTreesApi } from "../api/myTrees";
import { isApiError } from "../types/api";
import type { OwnerTreeSummary } from "../types/myTrees";
import { emitSessionExpired } from "../context/authSession";

function initialItems(): OwnerTreeSummary[] {
  return [];
}

type MyTreesStatus = "loading" | "success" | "empty" | "malformed" | "unauthorized" | "forbidden" | "server-error" | "network-error" | "retrying";

export interface UseMyTreesResult {
  items: OwnerTreeSummary[];
  status: MyTreesStatus;
  error: string | null;
  retry(): void;
}

export function useMyTrees(api: MyTreesApi = myTreesApi): UseMyTreesResult {
  const [items, setItems] = useState<OwnerTreeSummary[]>(initialItems);
  const [status, setStatus] = useState<MyTreesStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(false);
  const requestRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);
  const expiredEventFired = useRef(false);

  const load = useCallback((isRetry: boolean) => {
    if (!mountedRef.current) return;
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setStatus(isRetry ? "retrying" : "loading");
    if (!isRetry) setItems(initialItems());
    setError(null);

    void api.fetchTrees(controller.signal).then(
      (data) => {
        if (!mountedRef.current || controller.signal.aborted || requestRef.current !== requestId) return;
        if (data.length === 0) {
          setItems([]);
          setStatus("empty");
        } else {
          setItems(data);
          setStatus("success");
        }
      },
      (cause: unknown) => {
        if (!mountedRef.current || controller.signal.aborted || requestRef.current !== requestId) return;
        if (cause instanceof MyTreesResponseError) {
          setItems([]);
          setStatus("malformed");
          setError("내 트리 응답 형식이 올바르지 않습니다.");
          return;
        }
        if (isApiError(cause)) {
          if (cause.status === 401) {
            setItems([]);
            setStatus("unauthorized");
            setError(cause.message || "인증 세션이 만료되었습니다. 다시 로그인해 주세요.");
            if (!expiredEventFired.current) {
              expiredEventFired.current = true;
              emitSessionExpired({ source: "persistent-401", returnTo: "/my-trees" });
            }
            return;
          }
          if (cause.status === 403) {
            setItems([]);
            setStatus("forbidden");
            setError("접근 권한이 없습니다.");
            return;
          }
          if (cause.status >= 500) {
            setItems([]);
            setStatus("server-error");
            setError("서버에서 트리 목록을 불러오지 못했습니다.");
            return;
          }
        }
        setItems([]);
        setStatus("network-error");
        setError("네트워크 오류로 트리 목록을 불러오지 못했습니다.");
      },
    );
  }, [api]);

  const retry = useCallback(() => {
    expiredEventFired.current = false;
    load(true);
  }, [load]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      requestRef.current += 1;
      controllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    load(false);
    return () => {
      requestRef.current += 1;
      controllerRef.current?.abort();
    };
  }, [load]);

  return { items, status, error, retry };
}
