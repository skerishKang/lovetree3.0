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

const DRAFT_KEYS = new Set(["schemaVersion", "tree", "nodes", "selectedNodeId"]);
const TREE_KEYS = new Set(["title", "description"]);
const NODE_KEYS = new Set([
  "id",
  "parentId",
  "title",
  "date",
  "emotion",
  "memo",
  "youtubeUrl",
  "videoId",
]);

function isExactRecord(value: unknown, allowedKeys: ReadonlySet<string>): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return false;
  if (Object.getOwnPropertySymbols(value).length > 0) return false;
  const keys = Object.getOwnPropertyNames(value);
  return keys.length === allowedKeys.size && keys.every((key) => allowedKeys.has(key));
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
  if (!isExactRecord(value, NODE_KEYS)) return false;
  const parentValid = value.parentId === null || typeof value.parentId === "string";
  const normalized = normalizeYouTubeUrl(value.youtubeUrl);

  return (
    typeof value.id === "string" && value.id.length > 0 &&
    parentValid &&
    boundedString(value.title, PUBLIC_DEMO_MEMORY_TITLE_MAX, true) &&
    boundedString(value.date, 20, true) &&
    isEmotion(value.emotion) &&
    boundedString(value.memo, PUBLIC_DEMO_MEMORY_MEMO_MAX, true) &&
    Boolean(normalized) &&
    value.videoId === normalized?.videoId &&
    value.youtubeUrl === normalized?.watchUrl
  );
}

export function isValidPublicDemoDraft(value: unknown): value is PublicDemoDraft {
  if (!isExactRecord(value, DRAFT_KEYS)) return false;
  if (value.schemaVersion !== PUBLIC_DEMO_SCHEMA_VERSION) return false;
  if (!isExactRecord(value.tree, TREE_KEYS)) return false;
  if (!boundedString(value.tree.title, PUBLIC_DEMO_TREE_TITLE_MAX)) return false;
  if (!boundedString(value.tree.description, PUBLIC_DEMO_TREE_DESCRIPTION_MAX)) return false;
  if (!Array.isArray(value.nodes) || !value.nodes.every(isValidNode)) return false;
  if (value.selectedNodeId !== null && typeof value.selectedNodeId !== "string") return false;

  const nodes = value.nodes as PublicDemoNode[];
  const isExactEmptyDraft = (
    value.tree.title === "" &&
    value.tree.description === "" &&
    nodes.length === 0 &&
    value.selectedNodeId === null
  );
  if (!isExactEmptyDraft && !boundedString(value.tree.title, PUBLIC_DEMO_TREE_TITLE_MAX, true)) {
    return false;
  }

  if (!validatePublicDemoGraph(nodes).valid) return false;
  if (
    value.selectedNodeId !== null &&
    !nodes.some((node) => node.id === value.selectedNodeId)
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
