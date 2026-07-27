export type PublicMemoryStatus =
  | "loading"
  | "success"
  | "not-found"
  | "malformed"
  | "membership-mismatch"
  | "error";

export type PublicMemoryTreeStatus =
  | "loading"
  | "success"
  | "not-found"
  | "malformed"
  | "error";

export interface PublicMemoryState {
  data: import("../types/publicTreeDetail").PublicTreeMemory | null;
  status: PublicMemoryStatus;
  error: string | null;
}

export interface PublicMemoryTreeState {
  data: import("../types/publicTreeDetail").PublicTreeDetail | null;
  status: PublicMemoryTreeStatus;
  error: string | null;
}
