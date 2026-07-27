import { useCallback, useEffect, useRef, useState } from "react";
import {
  PublicTreeMemoriesResponseError,
  PublicTreeResponseError,
  publicTreeDetailApi,
  type PublicTreeDetailApi,
} from "../api/publicTreeDetail";
import { isApiError } from "../types/api";
import type {
  PublicTreeMemoriesState,
  PublicTreeState,
} from "../types/publicTreeDetail";

const TREE_ERROR_MESSAGE = "공개 러브트리를 불러오지 못했습니다.";
const TREE_MALFORMED_MESSAGE = "공개 러브트리 응답을 확인할 수 없습니다.";
const MEMORIES_ERROR_MESSAGE = "공개 기억을 불러오지 못했습니다.";
const MEMORIES_MALFORMED_MESSAGE = "공개 기억 응답을 확인할 수 없습니다.";

function initialTreeState(): PublicTreeState {
  return { data: null, status: "loading", error: null };
}

function initialMemoriesState(): PublicTreeMemoriesState {
  return { items: [], status: "loading", error: null };
}

export interface UsePublicTreeDetailResult {
  tree: PublicTreeState;
  memories: PublicTreeMemoriesState;
  retryTree(): void;
  retryMemories(): void;
}

export function usePublicTreeDetail(
  treeId: string,
  api: PublicTreeDetailApi = publicTreeDetailApi,
): UsePublicTreeDetailResult {
  const [tree, setTree] = useState<PublicTreeState>(initialTreeState);
  const [memories, setMemories] = useState<PublicTreeMemoriesState>(initialMemoriesState);
  const mountedRef = useRef(false);
  const activeTreeIdRef = useRef("");
  const treeRequestRef = useRef(0);
  const memoriesRequestRef = useRef(0);
  const treeControllerRef = useRef<AbortController | null>(null);
  const memoriesControllerRef = useRef<AbortController | null>(null);

  const loadTree = useCallback((requestedTreeId: string, reset: boolean) => {
    if (!mountedRef.current || activeTreeIdRef.current !== requestedTreeId) return;

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

    void api.fetchTree(requestedTreeId, controller.signal).then(
      (data) => {
        if (
          !mountedRef.current ||
          controller.signal.aborted ||
          activeTreeIdRef.current !== requestedTreeId ||
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
          activeTreeIdRef.current !== requestedTreeId ||
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

  const loadMemories = useCallback((requestedTreeId: string, reset: boolean) => {
    if (!mountedRef.current || activeTreeIdRef.current !== requestedTreeId) return;

    const requestId = memoriesRequestRef.current + 1;
    memoriesRequestRef.current = requestId;
    memoriesControllerRef.current?.abort();
    const controller = new AbortController();
    memoriesControllerRef.current = controller;
    setMemories((current) => ({
      items: reset ? [] : current.items,
      status: "loading",
      error: null,
    }));

    void api.fetchMemories(requestedTreeId, controller.signal).then(
      (items) => {
        if (
          !mountedRef.current ||
          controller.signal.aborted ||
          activeTreeIdRef.current !== requestedTreeId ||
          memoriesRequestRef.current !== requestId
        ) {
          return;
        }
        setMemories({
          items,
          status: items.length === 0 ? "empty" : "success",
          error: null,
        });
      },
      (cause: unknown) => {
        if (
          !mountedRef.current ||
          controller.signal.aborted ||
          activeTreeIdRef.current !== requestedTreeId ||
          memoriesRequestRef.current !== requestId
        ) {
          return;
        }

        if (cause instanceof PublicTreeMemoriesResponseError) {
          setMemories({
            items: [],
            status: "malformed",
            error: MEMORIES_MALFORMED_MESSAGE,
          });
          return;
        }
        setMemories({ items: [], status: "error", error: MEMORIES_ERROR_MESSAGE });
      },
    );
  }, [api]);

  const retryTree = useCallback(() => {
    const activeTreeId = activeTreeIdRef.current;
    if (activeTreeId) loadTree(activeTreeId, false);
  }, [loadTree]);

  const retryMemories = useCallback(() => {
    const activeTreeId = activeTreeIdRef.current;
    if (activeTreeId) loadMemories(activeTreeId, false);
  }, [loadMemories]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      activeTreeIdRef.current = "";
      treeRequestRef.current += 1;
      memoriesRequestRef.current += 1;
      treeControllerRef.current?.abort();
      memoriesControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const normalizedTreeId = treeId.trim();
    activeTreeIdRef.current = normalizedTreeId;

    treeControllerRef.current?.abort();
    memoriesControllerRef.current?.abort();
    treeRequestRef.current += 1;
    memoriesRequestRef.current += 1;

    if (!normalizedTreeId) {
      setTree({ data: null, status: "not-found", error: null });
      setMemories({ items: [], status: "empty", error: null });
      return;
    }

    loadTree(normalizedTreeId, true);
    loadMemories(normalizedTreeId, true);

    return () => {
      if (activeTreeIdRef.current === normalizedTreeId) {
        activeTreeIdRef.current = "";
      }
      treeRequestRef.current += 1;
      memoriesRequestRef.current += 1;
      treeControllerRef.current?.abort();
      memoriesControllerRef.current?.abort();
    };
  }, [loadMemories, loadTree, treeId]);

  return { tree, memories, retryTree, retryMemories };
}
