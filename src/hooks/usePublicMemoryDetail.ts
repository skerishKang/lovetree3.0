import { useCallback, useEffect, useRef, useState } from "react";
import {
  PublicMemoryResponseError,
  publicMemoryDetailApi,
  type PublicMemoryDetailApi,
} from "../api/publicMemoryDetail";
import { PublicTreeResponseError } from "../api/publicTreeDetail";
import { isApiError } from "../types/api";
import type {
  PublicMemoryState,
  PublicMemoryTreeState,
} from "../types/publicMemoryDetail";

const MEMORY_ERROR_MESSAGE = "공개 기억을 불러오지 못했습니다.";
const MEMORY_MALFORMED_MESSAGE = "공개 기억 응답을 확인할 수 없습니다.";
const TREE_ERROR_MESSAGE = "트리 정보를 불러오지 못했습니다.";
const TREE_MALFORMED_MESSAGE = "트리 정보 응답을 확인할 수 없습니다.";

function initialMemoryState(): PublicMemoryState {
  return { data: null, status: "loading", error: null };
}

function initialTreeState(): PublicMemoryTreeState {
  return { data: null, status: "loading", error: null };
}

export interface UsePublicMemoryDetailResult {
  memory: PublicMemoryState;
  tree: PublicMemoryTreeState;
  retryMemory(): void;
  retryTree(): void;
}

export function usePublicMemoryDetail(
  treeId: string,
  memoryId: string,
  api: PublicMemoryDetailApi = publicMemoryDetailApi,
): UsePublicMemoryDetailResult {
  const [memory, setMemory] = useState<PublicMemoryState>(initialMemoryState);
  const [tree, setTree] = useState<PublicMemoryTreeState>(initialTreeState);
  const mountedRef = useRef(false);
  const activeKeyRef = useRef("");
  const memoryRequestRef = useRef(0);
  const treeRequestRef = useRef(0);
  const memoryControllerRef = useRef<AbortController | null>(null);
  const treeControllerRef = useRef<AbortController | null>(null);

  const requestKey = `${treeId}::${memoryId}`;

  const loadMemory = useCallback((reqKey: string, tId: string, mId: string, reset: boolean) => {
    if (!mountedRef.current || activeKeyRef.current !== reqKey) return;

    const requestId = memoryRequestRef.current + 1;
    memoryRequestRef.current = requestId;
    memoryControllerRef.current?.abort();
    const controller = new AbortController();
    memoryControllerRef.current = controller;
    setMemory((current) => ({
      data: reset ? null : current.data,
      status: "loading",
      error: null,
    }));

    void api.fetchMemory(mId, controller.signal).then(
      (data) => {
        if (
          !mountedRef.current ||
          controller.signal.aborted ||
          activeKeyRef.current !== reqKey ||
          memoryRequestRef.current !== requestId
        ) {
          return;
        }
        if (data.treeId !== tId) {
          setMemory({ data, status: "membership-mismatch", error: "이 기억은 이 트리에 속하지 않습니다." });
          return;
        }
        setMemory({ data, status: "success", error: null });
      },
      (cause: unknown) => {
        if (
          !mountedRef.current ||
          controller.signal.aborted ||
          activeKeyRef.current !== reqKey ||
          memoryRequestRef.current !== requestId
        ) {
          return;
        }
        if (cause instanceof PublicMemoryResponseError) {
          setMemory({ data: null, status: "malformed", error: MEMORY_MALFORMED_MESSAGE });
          return;
        }
        if (isApiError(cause) && cause.status === 404) {
          setMemory({ data: null, status: "not-found", error: null });
          return;
        }
        setMemory({ data: null, status: "error", error: MEMORY_ERROR_MESSAGE });
      },
    );
  }, [api]);

  const loadTree = useCallback((reqKey: string, tId: string, reset: boolean) => {
    if (!mountedRef.current || activeKeyRef.current !== reqKey) return;

    const requestId = treeRequestRef.current + 1;
    treeRequestRef.current = requestId;
    treeControllerRef.current?.abort();
    const controller = new AbortController();
    treeControllerRef.current = controller;
    setTree((current) => ({
      data: reset ? null : current.data,
      status: "loading",
      error: null,
    }));

    void api.fetchTree(tId, controller.signal).then(
      (data) => {
        if (
          !mountedRef.current ||
          controller.signal.aborted ||
          activeKeyRef.current !== reqKey ||
          treeRequestRef.current !== requestId
        ) {
          return;
        }
        setTree({ data, status: "success", error: null });
      },
      (cause: unknown) => {
        if (
          !mountedRef.current ||
          controller.signal.aborted ||
          activeKeyRef.current !== reqKey ||
          treeRequestRef.current !== requestId
        ) {
          return;
        }
        if (cause instanceof PublicTreeResponseError) {
          setTree({ data: null, status: "malformed", error: TREE_MALFORMED_MESSAGE });
          return;
        }
        if (isApiError(cause) && cause.status === 404) {
          setTree({ data: null, status: "not-found", error: null });
          return;
        }
        setTree({ data: null, status: "error", error: TREE_ERROR_MESSAGE });
      },
    );
  }, [api]);

  const retryMemory = useCallback(() => {
    const currentKey = activeKeyRef.current;
    if (currentKey) {
      const parts = currentKey.split("::");
      loadMemory(currentKey, parts[0], parts[1], false);
    }
  }, [loadMemory]);

  const retryTree = useCallback(() => {
    const currentKey = activeKeyRef.current;
    if (currentKey) {
      const parts = currentKey.split("::");
      loadTree(currentKey, parts[0], false);
    }
  }, [loadTree]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      activeKeyRef.current = "";
      memoryRequestRef.current += 1;
      treeRequestRef.current += 1;
      memoryControllerRef.current?.abort();
      treeControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const trimmedTreeId = treeId.trim();
    const trimmedMemoryId = memoryId.trim();
    const key = `${trimmedTreeId}::${trimmedMemoryId}`;
    activeKeyRef.current = key;

    memoryControllerRef.current?.abort();
    treeControllerRef.current?.abort();
    memoryRequestRef.current += 1;
    treeRequestRef.current += 1;

    if (!trimmedTreeId || !trimmedMemoryId) {
      setMemory({ data: null, status: "not-found", error: null });
      setTree({ data: null, status: "not-found", error: null });
      return;
    }

    loadMemory(key, trimmedTreeId, trimmedMemoryId, true);
    loadTree(key, trimmedTreeId, true);

    return () => {
      if (activeKeyRef.current === key) {
        activeKeyRef.current = "";
      }
      memoryRequestRef.current += 1;
      treeRequestRef.current += 1;
      memoryControllerRef.current?.abort();
      treeControllerRef.current?.abort();
    };
  }, [loadMemory, loadTree, requestKey, treeId, memoryId]);

  return { memory, tree, retryMemory, retryTree };
}
