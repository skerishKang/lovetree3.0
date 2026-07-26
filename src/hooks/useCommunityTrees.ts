import { useCallback, useEffect, useRef, useState } from "react";
import { communityApi, type CommunityApi } from "../api/community";
import type { CommunityListState } from "../types/community";

const MAIN_ERROR_MESSAGE = "공개 러브트리를 불러오지 못했습니다.";
const GROWING_ERROR_MESSAGE = "새로 자라는 러브트리를 불러오지 못했습니다.";

function initialState(): CommunityListState {
  return { items: [], status: "loading", error: null };
}

function completedState(items: CommunityListState["items"]): CommunityListState {
  return {
    items,
    status: items.length === 0 ? "empty" : "success",
    error: null,
  };
}

export interface UseCommunityTreesResult {
  main: CommunityListState;
  growing: CommunityListState;
  retryMain(): void;
  retryGrowing(): void;
}

export function useCommunityTrees(api: CommunityApi = communityApi): UseCommunityTreesResult {
  const [main, setMain] = useState<CommunityListState>(initialState);
  const [growing, setGrowing] = useState<CommunityListState>(initialState);
  const mountedRef = useRef(false);
  const mainRequestRef = useRef(0);
  const growingRequestRef = useRef(0);
  const mainControllerRef = useRef<AbortController | null>(null);
  const growingControllerRef = useRef<AbortController | null>(null);

  const retryMain = useCallback(() => {
    if (!mountedRef.current) return;

    const requestId = mainRequestRef.current + 1;
    mainRequestRef.current = requestId;
    mainControllerRef.current?.abort();
    const controller = new AbortController();
    mainControllerRef.current = controller;
    setMain((current) => ({ ...current, status: "loading", error: null }));

    void api.fetchMain(controller.signal).then(
      (items) => {
        if (
          !mountedRef.current ||
          controller.signal.aborted ||
          mainRequestRef.current !== requestId
        ) {
          return;
        }
        setMain(completedState(items));
      },
      () => {
        if (
          !mountedRef.current ||
          controller.signal.aborted ||
          mainRequestRef.current !== requestId
        ) {
          return;
        }
        setMain((current) => ({
          items: current.items,
          status: "error",
          error: MAIN_ERROR_MESSAGE,
        }));
      },
    );
  }, [api]);

  const retryGrowing = useCallback(() => {
    if (!mountedRef.current) return;

    const requestId = growingRequestRef.current + 1;
    growingRequestRef.current = requestId;
    growingControllerRef.current?.abort();
    const controller = new AbortController();
    growingControllerRef.current = controller;
    setGrowing((current) => ({ ...current, status: "loading", error: null }));

    void api.fetchGrowing(controller.signal).then(
      (items) => {
        if (
          !mountedRef.current ||
          controller.signal.aborted ||
          growingRequestRef.current !== requestId
        ) {
          return;
        }
        setGrowing(completedState(items));
      },
      () => {
        if (
          !mountedRef.current ||
          controller.signal.aborted ||
          growingRequestRef.current !== requestId
        ) {
          return;
        }
        setGrowing((current) => ({
          items: current.items,
          status: "error",
          error: GROWING_ERROR_MESSAGE,
        }));
      },
    );
  }, [api]);

  useEffect(() => {
    mountedRef.current = true;
    retryMain();
    retryGrowing();

    return () => {
      mountedRef.current = false;
      mainRequestRef.current += 1;
      growingRequestRef.current += 1;
      mainControllerRef.current?.abort();
      growingControllerRef.current?.abort();
    };
  }, [retryGrowing, retryMain]);

  return { main, growing, retryMain, retryGrowing };
}
