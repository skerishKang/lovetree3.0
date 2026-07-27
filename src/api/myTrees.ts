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

function optionalMetric(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : undefined;
}

export function normalizeTreeItem(value: unknown): OwnerTreeSummary {
  if (!isPlainRecord(value)) throw new MyTreesResponseError();
  if (
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.title) ||
    !isNonEmptyString(value.visibility) ||
    !isString(value.groupName) ||
    !Array.isArray(value.keywords) ||
    !value.keywords.every(isString) ||
    !isNullableTimestamp(value.createdAt) ||
    !isNullableTimestamp(value.updatedAt) ||
    !isNonNegativeInteger(value.memoryCount)
  ) {
    throw new MyTreesResponseError();
  }
  return {
    id: value.id,
    title: value.title,
    visibility: value.visibility,
    groupName: value.groupName,
    keywords: [...value.keywords],
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    memoryCount: value.memoryCount,
    likeCount: optionalMetric(value.likeCount),
    viewCount: optionalMetric(value.viewCount),
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
