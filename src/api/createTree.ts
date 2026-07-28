import { createClient, type ApiClient } from "./client";
import { firebaseAccessTokenProvider } from "./auth";
import type { CreateTreeInput, CreatedTree } from "../types/createTree";

export type CreateTreeApiClient = Pick<ApiClient, "post">;

export class CreateTreeResponseError extends Error {
  constructor() {
    super("트리 생성 응답 형식이 올바르지 않습니다.");
    this.name = "CreateTreeResponseError";
  }
}

export class CreateTreeInputError extends Error {
  readonly field: "title" | "visibility";
  constructor(field: "title" | "visibility", message: string) {
    super(message);
    this.name = "CreateTreeInputError";
    this.field = field;
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

export function normalizeCreatedTree(value: unknown): CreatedTree {
  if (!isPlainRecord(value)) throw new CreateTreeResponseError();
  if (
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.title) ||
    !isString(value.visibility) || (value.visibility !== "public" && value.visibility !== "private") ||
    !isString(value.groupName) ||
    !Array.isArray(value.keywords) ||
    !value.keywords.every(isString) ||
    !isNullableTimestamp(value.createdAt) ||
    !isNullableTimestamp(value.updatedAt) ||
    !isNonNegativeInteger(value.memoryCount)
  ) {
    throw new CreateTreeResponseError();
  }
  return {
    id: value.id,
    title: value.title,
    visibility: value.visibility as "public" | "private",
    groupName: value.groupName,
    keywords: [...value.keywords],
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    memoryCount: value.memoryCount,
  };
}

export interface CreateTreeApi {
  createTree(input: CreateTreeInput, signal?: AbortSignal): Promise<CreatedTree>;
}

export function createCreateTreeApi(
  client: CreateTreeApiClient = createClient({ accessTokenProvider: firebaseAccessTokenProvider }),
): CreateTreeApi {
  return {
    async createTree(input, signal) {
      if (typeof input.title !== "string") {
        throw new CreateTreeInputError("title", "러브트리 제목을 입력해 주세요.");
      }
      const trimmed = input.title.trim();
      if (trimmed.length === 0) {
        throw new CreateTreeInputError("title", "러브트리 제목을 입력해 주세요.");
      }
      if (trimmed.length > 80) {
        throw new CreateTreeInputError("title", "제목은 최대 80자까지 입력할 수 있습니다.");
      }
      if (input.visibility !== "public" && input.visibility !== "private") {
        throw new CreateTreeInputError("visibility", "공개 범위는 공개 또는 비공개만 선택할 수 있습니다.");
      }
      const response = await client.post<unknown>("/trees", {
        title: trimmed,
        visibility: input.visibility,
      }, { signal });
      if (response === undefined) throw new CreateTreeResponseError();
      return normalizeCreatedTree(response);
    },
  };
}

export const createTreeApi = createCreateTreeApi();
