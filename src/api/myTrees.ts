import { createClient, type ApiClient } from "./client";
import { firebaseAccessTokenProvider } from "./auth";
import type { OwnerTreeSummary } from "../types/myTrees";

export type MyTreesApiClient = Pick<ApiClient, "get">;

export interface MyTreesApi {
  fetchTrees(signal?: AbortSignal): Promise<OwnerTreeSummary[]>;
}

export class MyTreesResponseError extends Error {
  constructor() {
    super("내 트리 응답 형식이 올바르지 않습니다.");
    this.name = "MyTreesResponseError";
  }
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}

function isNullableTimestamp(value: unknown): value is string | null {
  return value === null || (isNonEmptyString(value) && Number.isFinite(Date.parse(value)));
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function optionalStringArray(value: unknown): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || !value.every(isString)) throw new MyTreesResponseError();
  return [...value];
}

function optionalNonNegativeInteger(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  return isNonNegativeInteger(value) ? value : undefined;
}

export function normalizeTreeItem(value: unknown): OwnerTreeSummary {
  if (!isPlainRecord(value)) throw new MyTreesResponseError();
  if (
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.title) ||
    !isString(value.visibility) || (value.visibility !== "public" && value.visibility !== "private") ||
    (value.groupName !== undefined && !isString(value.groupName)) ||
    (value.memoryCount !== undefined && !isNonNegativeInteger(value.memoryCount)) ||
    !isNullableTimestamp(value.createdAt) ||
    !isNullableTimestamp(value.updatedAt)
  ) {
    throw new MyTreesResponseError();
  }
  const visibility = value.visibility as "public" | "private";
  return {
    id: value.id,
    title: value.title,
    visibility,
    groupName: isString(value.groupName) ? value.groupName : undefined,
    keywords: optionalStringArray(value.keywords),
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    memoryCount: optionalNonNegativeInteger(value.memoryCount),
    likeCount: optionalNonNegativeInteger(value.likeCount),
    viewCount: optionalNonNegativeInteger(value.viewCount),
  };
}

export function createMyTreesApi(
  client: MyTreesApiClient = createClient({ accessTokenProvider: firebaseAccessTokenProvider }),
): MyTreesApi {
  return {
    async fetchTrees(signal) {
      const response = await client.get<unknown[]>("/trees", {
        query: { limit: "100" },
        signal,
      });
      if (!Array.isArray(response)) throw new MyTreesResponseError();
      return response.map(normalizeTreeItem);
    },
  };
}

export const myTreesApi = createMyTreesApi();
