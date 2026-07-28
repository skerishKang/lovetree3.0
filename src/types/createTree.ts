export interface CreateTreeInput {
  title: string;
  visibility: "public" | "private";
}

export interface CreatedTree {
  id: string;
  title: string;
  visibility: "public" | "private";
  groupName: string | null;
  keywords: string[];
  createdAt: string | null;
  updatedAt: string | null;
  memoryCount: number;
}

export type CreateTreeStatus =
  | "idle"
  | "submitting"
  | "malformed"
  | "unauthorized"
  | "forbidden"
  | "conflict"
  | "too-large"
  | "validation-error"
  | "server-error"
  | "network-error"
  | "ambiguous";

export interface CreateTreeState {
  status: CreateTreeStatus;
  error: string | null;
}
