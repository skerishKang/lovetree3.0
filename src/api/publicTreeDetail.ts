import { createClient, type ApiClient } from "./client";
import type { PublicTreeDetail, PublicTreeMemory } from "../types/publicTreeDetail";

export const PUBLIC_TREE_MEMORIES_PATH = "/community/memories";
export const PUBLIC_TREE_MEMORY_LIMIT = 200;

export type PublicTreeDetailApiClient = Pick<ApiClient, "get">;

export interface PublicTreeDetailApi {
  fetchTree(treeId: string, signal?: AbortSignal): Promise<PublicTreeDetail>;
  fetchMemories(treeId: string, signal?: AbortSignal): Promise<PublicTreeMemory[]>;
}

export class PublicTreeResponseError extends Error {
  constructor() {
    super("공개 러브트리 응답 형식이 올바르지 않습니다.");
    this.name = "PublicTreeResponseError";
  }
}

export class PublicTreeMemoriesResponseError extends Error {
  constructor() {
    super("공개 기억 응답 형식이 올바르지 않습니다.");
    this.name = "PublicTreeMemoriesResponseError";
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

function isNullableString(value: unknown): value is string | null {
  return value === null || isString(value);
}

function isNullableTimestamp(value: unknown): value is string | null {
  return value === null || (isNonEmptyString(value) && Number.isFinite(Date.parse(value)));
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function optionalMetric(record: Record<string, unknown>, key: "likeCount" | "viewCount") {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : undefined;
}

export function publicTreePath(treeId: string) {
  return `/trees/${encodeURIComponent(treeId)}`;
}

export function normalizePublicTree(value: unknown): PublicTreeDetail {
  if (!isPlainRecord(value)) throw new PublicTreeResponseError();

  if (
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.title) ||
    !isNonEmptyString(value.visibility) ||
    !isNullableTimestamp(value.createdAt) ||
    !isNullableTimestamp(value.updatedAt) ||
    !isNonNegativeInteger(value.memoryCount)
  ) {
    throw new PublicTreeResponseError();
  }

  const likeCount = optionalMetric(value, "likeCount");
  const viewCount = optionalMetric(value, "viewCount");

  return {
    id: value.id,
    title: value.title,
    visibility: value.visibility,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    memoryCount: value.memoryCount,
    ...(likeCount === undefined ? {} : { likeCount }),
    ...(viewCount === undefined ? {} : { viewCount }),
  };
}

function normalizeMemory(value: unknown): PublicTreeMemory {
  if (!isPlainRecord(value)) throw new PublicTreeMemoriesResponseError();

  if (
    !isNonEmptyString(value.id) ||
    !isNullableString(value.treeId) ||
    !isNullableString(value.parentId) ||
    !isNonEmptyString(value.title) ||
    !isString(value.memo) ||
    !isString(value.artist) ||
    !isString(value.source) ||
    !isString(value.sourceUrl) ||
    !isString(value.sourceType) ||
    !isString(value.thumbnail) ||
    !Array.isArray(value.emotionTags) ||
    !value.emotionTags.every(isString) ||
    !isString(value.timestamp) ||
    !isNonEmptyString(value.visibility) ||
    !isNullableString(value.channelId) ||
    !isNullableString(value.channelName) ||
    !isNullableString(value.channelUrl) ||
    !isNullableTimestamp(value.createdAt) ||
    !isNullableTimestamp(value.updatedAt)
  ) {
    throw new PublicTreeMemoriesResponseError();
  }

  return {
    id: value.id,
    treeId: value.treeId,
    parentId: value.parentId,
    title: value.title,
    memo: value.memo,
    artist: value.artist,
    source: value.source,
    sourceUrl: value.sourceUrl,
    sourceType: value.sourceType,
    thumbnail: value.thumbnail,
    emotionTags: [...value.emotionTags],
    timestamp: value.timestamp,
    visibility: value.visibility,
    channelId: value.channelId,
    channelName: value.channelName,
    channelUrl: value.channelUrl,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

export function normalizePublicTreeMemories(value: unknown): PublicTreeMemory[] {
  if (!Array.isArray(value)) throw new PublicTreeMemoriesResponseError();
  return value.map(normalizeMemory);
}

export function createPublicTreeDetailApi(
  client: PublicTreeDetailApiClient = createClient(),
): PublicTreeDetailApi {
  return {
    async fetchTree(treeId, signal) {
      const response = await client.get<unknown>(publicTreePath(treeId), { signal });
      return normalizePublicTree(response);
    },
    async fetchMemories(treeId, signal) {
      const response = await client.get<unknown>(PUBLIC_TREE_MEMORIES_PATH, {
        query: { treeId, limit: PUBLIC_TREE_MEMORY_LIMIT },
        signal,
      });
      return normalizePublicTreeMemories(response);
    },
  };
}

export const publicTreeDetailApi = createPublicTreeDetailApi();
