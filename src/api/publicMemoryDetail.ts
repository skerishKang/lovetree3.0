import { createClient, type ApiClient } from "./client";
import { normalizePublicTree } from "./publicTreeDetail";
import type { PublicTreeDetail, PublicTreeMemory } from "../types/publicTreeDetail";

export type PublicMemoryDetailApiClient = Pick<ApiClient, "get">;

export interface PublicMemoryDetailApi {
  fetchMemory(memoryId: string, signal?: AbortSignal): Promise<PublicTreeMemory>;
  fetchTree(treeId: string, signal?: AbortSignal): Promise<PublicTreeDetail>;
}

export class PublicMemoryResponseError extends Error {
  constructor() {
    super("공개 기억 응답 형식이 올바르지 않습니다.");
    this.name = "PublicMemoryResponseError";
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

export function publicMemoryPath(memoryId: string) {
  return `/memories/${encodeURIComponent(memoryId)}`;
}

export function normalizePublicMemory(value: unknown): PublicTreeMemory {
  if (!isPlainRecord(value)) throw new PublicMemoryResponseError();

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
    throw new PublicMemoryResponseError();
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
    emotionTags: [...(value.emotionTags as string[])],
    timestamp: value.timestamp,
    visibility: value.visibility,
    channelId: value.channelId,
    channelName: value.channelName,
    channelUrl: value.channelUrl,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

export function createPublicMemoryDetailApi(
  client: PublicMemoryDetailApiClient = createClient(),
): PublicMemoryDetailApi {
  return {
    async fetchMemory(memoryId, signal) {
      const response = await client.get<unknown>(publicMemoryPath(memoryId), { signal });
      return normalizePublicMemory(response);
    },
    async fetchTree(treeId, signal) {
      const response = await client.get<unknown>(`/trees/${encodeURIComponent(treeId)}`, { signal });
      return normalizePublicTree(response);
    },
  };
}

export const publicMemoryDetailApi = createPublicMemoryDetailApi();
