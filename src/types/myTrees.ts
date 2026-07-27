export interface OwnerTreeSummary {
  id: string;
  title: string;
  visibility: "public" | "private";
  groupName?: string;
  keywords?: string[];
  createdAt: string | null;
  updatedAt: string | null;
  memoryCount?: number;
  likeCount?: number;
  viewCount?: number;
}

export type MyTreesStatus =
  | "loading"
  | "success"
  | "empty"
  | "malformed"
  | "unauthorized"
  | "forbidden"
  | "server-error"
  | "network-error";

export interface MyTreesState {
  items: OwnerTreeSummary[];
  status: MyTreesStatus;
  error: string | null;
}
