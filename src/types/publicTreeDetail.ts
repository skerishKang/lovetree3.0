export interface PublicTreeDetail {
  id: string;
  title: string;
  visibility: string;
  createdAt: string | null;
  updatedAt: string | null;
  memoryCount: number;
  likeCount?: number;
  viewCount?: number;
}

export interface PublicTreeMemory {
  id: string;
  treeId: string | null;
  parentId: string | null;
  title: string;
  memo: string;
  artist: string;
  source: string;
  sourceUrl: string;
  sourceType: string;
  thumbnail: string;
  emotionTags: string[];
  timestamp: string;
  visibility: string;
  channelId: string | null;
  channelName: string | null;
  channelUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export type PublicTreeStatus =
  | "loading"
  | "success"
  | "not-found"
  | "malformed"
  | "error";

export type PublicTreeMemoriesStatus =
  | "loading"
  | "success"
  | "empty"
  | "malformed"
  | "error";

export interface PublicTreeState {
  data: PublicTreeDetail | null;
  status: PublicTreeStatus;
  error: string | null;
}

export interface PublicTreeMemoriesState {
  items: PublicTreeMemory[];
  status: PublicTreeMemoriesStatus;
  error: string | null;
}
