import { normalizeYouTubeUrl } from "./youtube";
import {
  PUBLIC_DEMO_EMOTIONS,
  PUBLIC_DEMO_MEMORY_MEMO_MAX,
  PUBLIC_DEMO_MEMORY_TITLE_MAX,
  PUBLIC_DEMO_SCHEMA_VERSION,
  PUBLIC_DEMO_TREE_DESCRIPTION_MAX,
  PUBLIC_DEMO_TREE_TITLE_MAX,
  createEmptyPublicDemoDraft,
  type PublicDemoDraft,
  type PublicDemoEmotion,
  type PublicDemoNode,
} from "../types/publicDemoEditor";
import { validatePublicDemoGraph } from "./publicDemoGraph";

export const PUBLIC_DEMO_STORAGE_KEY = "lovetree.public-demo-draft.v1";

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function boundedString(value: unknown, max: number, required = false) {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (required && trimmed.length === 0) return false;
  return value.length <= max;
}

function isEmotion(value: unknown): value is PublicDemoEmotion {
  return typeof value === "string" && PUBLIC_DEMO_EMOTIONS.includes(value as PublicDemoEmotion);
}

function isValidNode(value: unknown): value is PublicDemoNode {
  if (!value || typeof value !== "object") return false;
  const node = value as Record<string, unknown>;
  const parentValid = node.parentId === null || typeof node.parentId === "string";
  const normalized = normalizeYouTubeUrl(node.youtubeUrl);

  return (
    typeof node.id === "string" && node.id.length > 0 &&
    parentValid &&
    boundedString(node.title, PUBLIC_DEMO_MEMORY_TITLE_MAX, true) &&
    boundedString(node.date, 20, true) &&
    isEmotion(node.emotion) &&
    boundedString(node.memo, PUBLIC_DEMO_MEMORY_MEMO_MAX, true) &&
    Boolean(normalized) &&
    node.videoId === normalized?.videoId &&
    node.youtubeUrl === normalized?.watchUrl
  );
}

export function isValidPublicDemoDraft(value: unknown): value is PublicDemoDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Record<string, unknown>;
  if (draft.schemaVersion !== PUBLIC_DEMO_SCHEMA_VERSION) return false;
  if (!draft.tree || typeof draft.tree !== "object") return false;
  const tree = draft.tree as Record<string, unknown>;
  if (!boundedString(tree.title, PUBLIC_DEMO_TREE_TITLE_MAX)) return false;
  if (!boundedString(tree.description, PUBLIC_DEMO_TREE_DESCRIPTION_MAX)) return false;
  if (!Array.isArray(draft.nodes) || !draft.nodes.every(isValidNode)) return false;
  if (draft.selectedNodeId !== null && typeof draft.selectedNodeId !== "string") return false;

  const nodes = draft.nodes as PublicDemoNode[];
  if (!validatePublicDemoGraph(nodes).valid) return false;
  if (
    draft.selectedNodeId !== null &&
    !nodes.some((node) => node.id === draft.selectedNodeId)
  ) {
    return false;
  }
  return true;
}

function safeRemove(storage: StorageLike) {
  try {
    storage.removeItem(PUBLIC_DEMO_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function readPublicDemoDraft(storage: StorageLike = window.localStorage) {
  try {
    const raw = storage.getItem(PUBLIC_DEMO_STORAGE_KEY);
    if (raw === null) return createEmptyPublicDemoDraft();
    const parsed: unknown = JSON.parse(raw);
    if (!isValidPublicDemoDraft(parsed)) {
      safeRemove(storage);
      return createEmptyPublicDemoDraft();
    }
    return parsed;
  } catch {
    safeRemove(storage);
    return createEmptyPublicDemoDraft();
  }
}

export function writePublicDemoDraft(
  draft: PublicDemoDraft,
  storage: StorageLike = window.localStorage,
) {
  if (!isValidPublicDemoDraft(draft)) return false;
  try {
    storage.setItem(PUBLIC_DEMO_STORAGE_KEY, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export function removePublicDemoDraft(storage: StorageLike = window.localStorage) {
  return safeRemove(storage);
}
