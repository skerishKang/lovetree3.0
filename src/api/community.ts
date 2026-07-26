import { createClient, type ApiClient } from "./client";
import type { CommunityTreeSnapshot } from "../types/community";

export const COMMUNITY_TREES_PATH = "/community/trees";
export const COMMUNITY_GROWING_TREES_PATH = "/community/growing-trees";

export type CommunityApiClient = Pick<ApiClient, "get">;

export interface CommunityApi {
  fetchMain(signal?: AbortSignal): Promise<CommunityTreeSnapshot[]>;
  fetchGrowing(signal?: AbortSignal): Promise<CommunityTreeSnapshot[]>;
}

export class CommunityResponseError extends Error {
  constructor() {
    super("공개 러브트리 응답 형식이 올바르지 않습니다.");
    this.name = "CommunityResponseError";
  }
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNullableTimestamp(value: unknown): value is string | null {
  if (value === null) return true;
  return isNonEmptyString(value) && Number.isFinite(Date.parse(value));
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

function normalizeSnapshot(value: unknown): CommunityTreeSnapshot {
  if (!isPlainRecord(value)) throw new CommunityResponseError();

  if (
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.title) ||
    !isNonEmptyString(value.visibility) ||
    !isNullableTimestamp(value.createdAt) ||
    !isNullableTimestamp(value.updatedAt) ||
    !isString(value.representativeThumbnail) ||
    !isString(value.representativeMemorySourceUrl) ||
    !isNonNegativeInteger(value.memoryCount) ||
    !Array.isArray(value.emotionTags) ||
    !value.emotionTags.every(isString) ||
    !isNonEmptyString(value.stage) ||
    !isString(value.theme) ||
    !isString(value.timeRange)
  ) {
    throw new CommunityResponseError();
  }

  const likeCount = optionalMetric(value, "likeCount");
  const viewCount = optionalMetric(value, "viewCount");

  return {
    id: value.id,
    title: value.title,
    visibility: value.visibility,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    representativeThumbnail: value.representativeThumbnail,
    representativeMemorySourceUrl: value.representativeMemorySourceUrl,
    memoryCount: value.memoryCount,
    emotionTags: [...value.emotionTags],
    stage: value.stage,
    theme: value.theme,
    timeRange: value.timeRange,
    ...(likeCount === undefined ? {} : { likeCount }),
    ...(viewCount === undefined ? {} : { viewCount }),
  };
}

export function normalizeCommunityResponse(value: unknown): CommunityTreeSnapshot[] {
  if (!Array.isArray(value)) throw new CommunityResponseError();
  return value.map(normalizeSnapshot);
}

export function createCommunityApi(
  client: CommunityApiClient = createClient(),
): CommunityApi {
  return {
    async fetchMain(signal) {
      const response = await client.get<unknown>(COMMUNITY_TREES_PATH, {
        query: { view: "summary", sort: "latest", limit: 12 },
        signal,
      });
      return normalizeCommunityResponse(response);
    },
    async fetchGrowing(signal) {
      const response = await client.get<unknown>(COMMUNITY_GROWING_TREES_PATH, {
        query: { limit: 6 },
        signal,
      });
      return normalizeCommunityResponse(response);
    },
  };
}

export const communityApi = createCommunityApi();
