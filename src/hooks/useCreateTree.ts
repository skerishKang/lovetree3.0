import { useCallback, useEffect, useRef, useState } from "react";
import { createTreeApi, CreateTreeResponseError, type CreateTreeApi } from "../api/createTree";
import { isApiError } from "../types/api";
import type { CreateTreeInput, CreatedTree, CreateTreeStatus } from "../types/createTree";
import { emitSessionExpired } from "../context/authSession";

export interface UseCreateTreeResult {
  status: CreateTreeStatus;
  error: string | null;
  created: CreatedTree | null;
  submit(input: CreateTreeInput): void;
}

export function useCreateTree(api: CreateTreeApi = createTreeApi): UseCreateTreeResult {
  const [status, setStatus] = useState<CreateTreeStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedTree | null>(null);
  const mountedRef = useRef(false);
  const requestRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);
  const expiredEventFired = useRef(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
    };
  }, []);

  const submit = useCallback((input: CreateTreeInput) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    expiredEventFired.current = false;
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setStatus("submitting");
    setError(null);
    setCreated(null);

    void api.createTree(input, controller.signal).then(
      (data) => {
        if (!mountedRef.current || controller.signal.aborted || requestRef.current !== requestId) return;
        submittingRef.current = false;
        setCreated(data);
        setStatus("idle");
      },
      (cause: unknown) => {
        if (!mountedRef.current || controller.signal.aborted || requestRef.current !== requestId) {
          submittingRef.current = false;
          return;
        }
        submittingRef.current = false;
        if (cause instanceof CreateTreeResponseError) {
          setStatus("malformed");
          setError("트리 생성 응답 형식이 올바르지 않습니다.");
          return;
        }
        if (isApiError(cause)) {
          if (cause.status === 400 || cause.status === 422) {
            setStatus("validation-error");
            setError(cause.message || "입력 값을 확인해 주세요.");
            return;
          }
          if (cause.status === 401) {
            setStatus("unauthorized");
            setError(cause.message || "인증 세션이 만료되었습니다. 다시 로그인해 주세요.");
            if (!expiredEventFired.current) {
              expiredEventFired.current = true;
              emitSessionExpired({ source: "persistent-401", returnTo: "/tree/new" });
            }
            return;
          }
          if (cause.status === 403) {
            setStatus("forbidden");
            setError(cause.message || "비공개 저장은 계정 등급에 따라 제한될 수 있습니다.");
            return;
          }
          if (cause.status === 409) {
            setStatus("conflict");
            setError(cause.message || "이미 동일한 트리가 존재합니다.");
            return;
          }
          if (cause.status === 413) {
            setStatus("too-large");
            setError("입력 크기가 너무 큽니다. 제목을 줄여 주세요.");
            return;
          }
          if (cause.status >= 500) {
            setStatus("ambiguous");
            setError("저장 결과를 확인할 수 없습니다. 내 러브트리에서 생성 여부를 확인해 주세요.");
            return;
          }
        }
        setStatus("ambiguous");
        setError("저장 결과를 확인할 수 없습니다. 내 러브트리에서 생성 여부를 확인해 주세요.");
      },
    );
  }, [api]);

  return { status, error, created, submit };
}
