export const PUBLIC_DEMO_SCHEMA_VERSION = 1 as const;
export const PUBLIC_DEMO_MAX_NODES = 12;
export const PUBLIC_DEMO_TREE_TITLE_MAX = 80;
export const PUBLIC_DEMO_TREE_DESCRIPTION_MAX = 240;
export const PUBLIC_DEMO_MEMORY_TITLE_MAX = 100;
export const PUBLIC_DEMO_MEMORY_MEMO_MAX = 1000;

export const PUBLIC_DEMO_EMOTIONS = [
  "설렘",
  "행복",
  "감동",
  "그리움",
  "응원",
] as const;

export type PublicDemoEmotion = (typeof PUBLIC_DEMO_EMOTIONS)[number];

export interface PublicDemoTree {
  title: string;
  description: string;
}

export interface PublicDemoNode {
  id: string;
  parentId: string | null;
  title: string;
  date: string;
  emotion: PublicDemoEmotion;
  memo: string;
  youtubeUrl: string;
  videoId: string;
}

export interface PublicDemoDraft {
  schemaVersion: typeof PUBLIC_DEMO_SCHEMA_VERSION;
  tree: PublicDemoTree;
  nodes: PublicDemoNode[];
  selectedNodeId: string | null;
}

export type PublicDemoSaveStatus = "저장 중" | "저장됨" | "저장 실패";

export function createEmptyPublicDemoDraft(): PublicDemoDraft {
  return {
    schemaVersion: PUBLIC_DEMO_SCHEMA_VERSION,
    tree: { title: "", description: "" },
    nodes: [],
    selectedNodeId: null,
  };
}
