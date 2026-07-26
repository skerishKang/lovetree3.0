import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import CommunityPage from "./CommunityPage";

function snapshot(id: string, title: string, stage = "mature") {
  return {
    id,
    title,
    visibility: "public",
    createdAt: "2026-07-20T10:00:00.000Z",
    updatedAt: "2026-07-26T10:00:00.000Z",
    representativeThumbnail: "",
    representativeMemorySourceUrl: "",
    memoryCount: stage === "growing" ? 1 : 3,
    emotionTags: ["행복"],
    stage,
    theme: "",
    timeRange: "",
  };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function requestUrl(input: RequestInfo | URL) {
  return typeof input === "string" ? input : input instanceof Request ? input.url : input.toString();
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("CommunityPage public browse integration", () => {
  it("loads both public APIs without auth and renders no static mock or demo link", async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = requestUrl(input);
      if (url === "/api/community/trees?view=summary&sort=latest&limit=12") {
        return Promise.resolve(jsonResponse([snapshot("main-1", "메인 API 러브트리")]));
      }
      if (url === "/api/community/growing-trees?limit=6") {
        return Promise.resolve(jsonResponse([snapshot("grow-1", "성장 API 러브트리", "growing")]));
      }
      return Promise.resolve(jsonResponse({ error: "unexpected path" }, 404));
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<MemoryRouter><CommunityPage /></MemoryRouter>);

    expect(screen.getAllByTestId("community-card-skeleton")).toHaveLength(4);
    expect(await screen.findByText("메인 API 러브트리")).toBeInTheDocument();
    expect(await screen.findByText("성장 API 러브트리")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "다른 팬들의 러브트리 구경하기" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "새로 자라는 러브트리" })).toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls.map(([input]) => requestUrl(input))).toEqual([
      "/api/community/trees?view=summary&sort=latest&limit=12",
      "/api/community/growing-trees?limit=6",
    ]);
    for (const [, init] of fetchMock.mock.calls) {
      const headers = new Headers(init?.headers);
      expect(headers.has("Authorization")).toBe(false);
    }

    expect(screen.queryByText("BTS - Map of the Soul 7 Memories")).not.toBeInTheDocument();
    expect(screen.queryByText(/Featured 러브트리|이주의 추천 트리/)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /러브트리 보기/ })).not.toBeInTheDocument();
    expect(document.querySelector('a[href="/tree/community-demo"]')).toBeNull();
  });

  it("keeps main results visible when growing fails and retries only growing", async () => {
    let growingAttempts = 0;
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = requestUrl(input);
      if (url.startsWith("/api/community/trees?")) {
        return Promise.resolve(jsonResponse([snapshot("main-1", "계속 보이는 메인 트리")]));
      }
      if (url === "/api/community/growing-trees?limit=6") {
        growingAttempts += 1;
        return growingAttempts === 1
          ? Promise.resolve(jsonResponse({ error: "temporary" }, 503))
          : Promise.resolve(jsonResponse([snapshot("grow-2", "재시도된 성장 트리", "growing")]));
      }
      return Promise.resolve(jsonResponse({ error: "unexpected" }, 404));
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<MemoryRouter><CommunityPage /></MemoryRouter>);

    expect(await screen.findByText("계속 보이는 메인 트리")).toBeInTheDocument();
    const growingSection = screen.getByRole("heading", { name: "새로 자라는 러브트리" }).closest("section");
    expect(growingSection).not.toBeNull();
    expect(within(growingSection as HTMLElement).getByRole("alert")).toHaveTextContent(
      "새로 자라는 러브트리를 불러오지 못했습니다.",
    );

    await user.click(
      within(growingSection as HTMLElement).getByRole("button", { name: "새 트리 다시 불러오기" }),
    );

    expect(await screen.findByText("재시도된 성장 트리")).toBeInTheDocument();
    expect(screen.getByText("계속 보이는 메인 트리")).toBeInTheDocument();
    expect(fetchMock.mock.calls.filter(([input]) => requestUrl(input).includes("growing-trees"))).toHaveLength(2);
    expect(fetchMock.mock.calls.filter(([input]) => requestUrl(input).includes("community/trees?"))).toHaveLength(1);
  });

  it("keeps search and categories as local visual controls without extra requests", async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = requestUrl(input);
      return Promise.resolve(jsonResponse(url.includes("growing-trees") ? [] : [snapshot("main", "검색과 무관한 API 트리")]));
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<MemoryRouter><CommunityPage /></MemoryRouter>);
    await screen.findByText("검색과 무관한 API 트리");

    const search = screen.getByRole("searchbox", { name: "러브트리 검색" });
    await user.type(search, "로컬 검색어");
    await user.click(within(screen.getByRole("navigation", { name: "커뮤니티 카테고리" })).getByRole("button", { name: "콘서트" }));

    expect(search).toHaveValue("로컬 검색어");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("새로 자라는 공개 러브트리가 없습니다."));
  });
});
