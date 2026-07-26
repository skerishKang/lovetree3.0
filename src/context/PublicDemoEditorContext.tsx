import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import {
  PUBLIC_DEMO_MAX_NODES,
  createEmptyPublicDemoDraft,
  type PublicDemoDraft,
  type PublicDemoNode,
  type PublicDemoSaveStatus,
  type PublicDemoTree,
} from "../types/publicDemoEditor";
import {
  canChangeParent,
  deleteNodeAndReattachChildren,
  deleteSubtree as removeSubtree,
  getChildren,
  getNodeById,
  validatePublicDemoGraph,
} from "../utils/publicDemoGraph";
import {
  readPublicDemoDraft,
  removePublicDemoDraft,
  writePublicDemoDraft,
} from "../utils/publicDemoStorage";

interface EditorState {
  draft: PublicDemoDraft;
  status: PublicDemoSaveStatus;
  revision: number;
}

type EditorAction =
  | { type: "replace"; draft: PublicDemoDraft }
  | { type: "tree"; tree: PublicDemoTree }
  | { type: "nodes"; nodes: PublicDemoNode[]; selectedNodeId: string | null }
  | { type: "select"; nodeId: string | null }
  | { type: "status"; status: PublicDemoSaveStatus }
  | { type: "reset" };

function reducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "replace":
      return { draft: action.draft, status: "저장됨", revision: 0 };
    case "tree":
      return {
        ...state,
        draft: { ...state.draft, tree: action.tree },
        revision: state.revision + 1,
      };
    case "nodes":
      return {
        ...state,
        draft: {
          ...state.draft,
          nodes: action.nodes,
          selectedNodeId: action.selectedNodeId,
        },
        revision: state.revision + 1,
      };
    case "select":
      return {
        ...state,
        draft: { ...state.draft, selectedNodeId: action.nodeId },
        revision: state.revision + 1,
      };
    case "status":
      return { ...state, status: action.status };
    case "reset":
      return {
        draft: createEmptyPublicDemoDraft(),
        status: "저장됨",
        revision: state.revision + 1,
      };
  }
}

export interface PublicDemoNodeInput {
  parentId: string | null;
  title: string;
  date: string;
  emotion: PublicDemoNode["emotion"];
  memo: string;
  youtubeUrl: string;
  videoId: string;
}

interface MutationResult {
  ok: boolean;
  reason?: string;
  nodeId?: string;
}

interface PublicDemoEditorValue {
  draft: PublicDemoDraft;
  status: PublicDemoSaveStatus;
  selectedNode: PublicDemoNode | null;
  updateTree(tree: PublicDemoTree): void;
  addNode(input: PublicDemoNodeInput): MutationResult;
  updateNode(nodeId: string, input: PublicDemoNodeInput): MutationResult;
  selectNode(nodeId: string): MutationResult;
  deleteLeaf(nodeId: string): MutationResult;
  deleteSubtree(nodeId: string): MutationResult;
  deleteAndReattachChildren(nodeId: string): MutationResult;
  resetDraft(): MutationResult;
}

const PublicDemoEditorContext = createContext<PublicDemoEditorValue | null>(null);

function createStableNodeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `memory-${crypto.randomUUID()}`;
  }
  return `memory-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createInitialEditorState(): EditorState {
  return {
    draft: readPublicDemoDraft(),
    status: "저장됨",
    revision: 0,
  };
}

export function PublicDemoEditorProvider({ children }: { children: ReactNode }) {
  const initialStateRef = useRef<EditorState | null>(null);
  if (initialStateRef.current === null) {
    initialStateRef.current = createInitialEditorState();
  }
  const [state, dispatch] = useReducer(reducer, initialStateRef.current);
  const suppressNextWrite = useRef(false);

  useEffect(() => {
    if (state.revision === 0) return;
    if (suppressNextWrite.current) {
      suppressNextWrite.current = false;
      return;
    }

    dispatch({ type: "status", status: "저장 중" });
    const timeoutId = window.setTimeout(() => {
      const saved = writePublicDemoDraft(state.draft);
      dispatch({ type: "status", status: saved ? "저장됨" : "저장 실패" });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [state.draft, state.revision]);

  const updateTree = useCallback((tree: PublicDemoTree) => {
    dispatch({ type: "tree", tree });
  }, []);

  const addNode = useCallback((input: PublicDemoNodeInput): MutationResult => {
    const nodes = state.draft.nodes;
    if (nodes.length >= PUBLIC_DEMO_MAX_NODES) {
      return { ok: false, reason: "기억은 최대 12개까지 추가할 수 있습니다." };
    }
    if (nodes.length === 0 && input.parentId !== null) {
      return { ok: false, reason: "첫 기억은 루트로 저장해야 합니다." };
    }
    if (
      nodes.length > 0 &&
      (!input.parentId || !getNodeById(nodes, input.parentId))
    ) {
      return { ok: false, reason: "두 번째 기억부터는 유효한 부모 기억이 필요합니다." };
    }

    const node: PublicDemoNode = { ...input, id: createStableNodeId() };
    const nextNodes = [...nodes, node];
    const graph = validatePublicDemoGraph(nextNodes);
    if (!graph.valid) return { ok: false, reason: graph.reason };

    dispatch({ type: "nodes", nodes: nextNodes, selectedNodeId: node.id });
    return { ok: true, nodeId: node.id };
  }, [state.draft.nodes]);

  const updateNode = useCallback((nodeId: string, input: PublicDemoNodeInput): MutationResult => {
    if (!getNodeById(state.draft.nodes, nodeId)) {
      return { ok: false, reason: "수정할 기억을 찾을 수 없습니다." };
    }
    const parentCheck = canChangeParent(state.draft.nodes, nodeId, input.parentId);
    if (!parentCheck.valid) return { ok: false, reason: parentCheck.reason };

    const nextNodes = state.draft.nodes.map((node) =>
      node.id === nodeId ? { ...node, ...input } : node,
    );
    const graph = validatePublicDemoGraph(nextNodes);
    if (!graph.valid) return { ok: false, reason: graph.reason };

    dispatch({ type: "nodes", nodes: nextNodes, selectedNodeId: nodeId });
    return { ok: true, nodeId };
  }, [state.draft.nodes]);

  const selectNode = useCallback((nodeId: string): MutationResult => {
    if (!getNodeById(state.draft.nodes, nodeId)) {
      return { ok: false, reason: "선택할 기억을 찾을 수 없습니다." };
    }
    dispatch({ type: "select", nodeId });
    return { ok: true, nodeId };
  }, [state.draft.nodes]);

  const deleteLeaf = useCallback((nodeId: string): MutationResult => {
    const node = getNodeById(state.draft.nodes, nodeId);
    if (!node) return { ok: false, reason: "삭제할 기억을 찾을 수 없습니다." };
    if (getChildren(state.draft.nodes, nodeId).length > 0) {
      return { ok: false, reason: "하위 기억이 있는 노드는 삭제 방식을 선택해야 합니다." };
    }
    const nextNodes = state.draft.nodes.filter((candidate) => candidate.id !== nodeId);
    const selectedNodeId = nextNodes[0]?.id ?? null;
    dispatch({ type: "nodes", nodes: nextNodes, selectedNodeId });
    return { ok: true };
  }, [state.draft.nodes]);

  const deleteSubtree = useCallback((nodeId: string): MutationResult => {
    const node = getNodeById(state.draft.nodes, nodeId);
    if (!node) return { ok: false, reason: "삭제할 기억을 찾을 수 없습니다." };
    if (node.parentId === null && getChildren(state.draft.nodes, nodeId).length > 0) {
      return {
        ok: false,
        reason: "루트 기억의 하위 기억을 먼저 이동하거나 삭제해야 합니다.",
      };
    }
    const nextNodes = removeSubtree(state.draft.nodes, nodeId);
    const selectedNodeId = nextNodes[0]?.id ?? null;
    dispatch({ type: "nodes", nodes: nextNodes, selectedNodeId });
    return { ok: true };
  }, [state.draft.nodes]);

  const deleteAndReattachChildren = useCallback((nodeId: string): MutationResult => {
    const node = getNodeById(state.draft.nodes, nodeId);
    if (!node) return { ok: false, reason: "삭제할 기억을 찾을 수 없습니다." };
    if (node.parentId === null) {
      return {
        ok: false,
        reason: "루트 기억은 하위 기억을 재연결하는 방식으로 삭제할 수 없습니다.",
      };
    }
    const nextNodes = deleteNodeAndReattachChildren(state.draft.nodes, nodeId);
    const graph = validatePublicDemoGraph(nextNodes);
    if (!graph.valid) return { ok: false, reason: graph.reason };
    dispatch({ type: "nodes", nodes: nextNodes, selectedNodeId: node.parentId });
    return { ok: true };
  }, [state.draft.nodes]);

  const resetDraft = useCallback((): MutationResult => {
    const removed = removePublicDemoDraft();
    if (!removed) {
      return { ok: false, reason: "브라우저 임시 저장을 제거하지 못했습니다." };
    }
    suppressNextWrite.current = true;
    dispatch({ type: "reset" });
    return { ok: true };
  }, []);

  const value = useMemo<PublicDemoEditorValue>(() => ({
    draft: state.draft,
    status: state.status,
    selectedNode: state.draft.selectedNodeId
      ? getNodeById(state.draft.nodes, state.draft.selectedNodeId)
      : null,
    updateTree,
    addNode,
    updateNode,
    selectNode,
    deleteLeaf,
    deleteSubtree,
    deleteAndReattachChildren,
    resetDraft,
  }), [
    state.draft,
    state.status,
    updateTree,
    addNode,
    updateNode,
    selectNode,
    deleteLeaf,
    deleteSubtree,
    deleteAndReattachChildren,
    resetDraft,
  ]);

  return (
    <PublicDemoEditorContext.Provider value={value}>
      {children}
    </PublicDemoEditorContext.Provider>
  );
}

export function usePublicDemoEditor() {
  const value = useContext(PublicDemoEditorContext);
  if (!value) {
    throw new Error("usePublicDemoEditor must be used inside PublicDemoEditorProvider");
  }
  return value;
}
