import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, screen, fireEvent, render } from "@testing-library/react";
import {
  createMemoryRouter,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import { AppRoutes } from "../App";

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({
    user:
      window.location.pathname === "/login"
        ? null
        : {
            uid: "presentation-test-user",
            displayName: null,
            email: null,
            photoURL: null,
            emailVerified: true,
          },
    loading: false,
    tier: null,
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
    expireSession: vi.fn(),
  }),
}));

function LocationProbe() {
  const location = useLocation();
  return (
    <div data-testid="location" style={{ display: "none" }}>
      {location.pathname}
    </div>
  );
}

function renderRoute(
  initialEntries: string[],
  initialIndex?: number,
) {
  const currentEntry = initialEntries[initialIndex ?? initialEntries.length - 1];
  window.history.pushState({}, "", currentEntry);
  const router = createMemoryRouter(
    [
      {
        path: "*",
        element: (
          <>
            <AppRoutes />
            <LocationProbe />
          </>
        ),
      },
    ],
    { initialEntries, initialIndex },
  );
  render(<RouterProvider router={router} />);
  return router;
}

function currentLocation() {
  return screen.getByTestId("location").textContent ?? "";
}

describe("MemoryDetailPage — /memory/detail-demo", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("h1 제목이 '기억 상세'여야 한다", () => {
    renderRoute(["/memory/detail-demo"]);
    expect(
      screen.getByRole("heading", { level: 1, name: "기억 상세" })
    ).toBeInTheDocument();
  });

  it("기억 제목이 표시되어야 한다", () => {
    renderRoute(["/memory/detail-demo"]);
    expect(screen.getByText("첫 콘서트 공연 영상")).toBeInTheDocument();
  });

  it("날짜가 표시되어야 한다", () => {
    renderRoute(["/memory/detail-demo"]);
    expect(screen.getByText("2023. 12. 25.")).toBeInTheDocument();
  });

  it("태그가 정확히 3개여야 한다", () => {
    renderRoute(["/memory/detail-demo"]);
    const tags = screen.getAllByText(/#/);
    expect(tags).toHaveLength(3);
    expect(tags[0]).toHaveTextContent("#콘서트");
    expect(tags[1]).toHaveTextContent("#직캠");
    expect(tags[2]).toHaveTextContent("#크리스마스");
  });

  it("메모 본문이 표시되어야 한다", () => {
    renderRoute(["/memory/detail-demo"]);
    expect(
      screen.getByText(/공개 YouTube 영상을 러브트리에 연결해 두니/)
    ).toBeInTheDocument();
  });

  it("실제 title 기반 재생 버튼과 안전한 외부 링크를 제공하며 초기 iframe은 없다", () => {
    renderRoute(["/memory/detail-demo"]);

    expect(screen.queryByTestId("youtube-player")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "첫 콘서트 공연 영상 재생" }),
    ).toBeInTheDocument();

    const link = screen.getByRole("link", { name: "YouTube에서 보기" });
    expect(link).toHaveAttribute(
      "href",
      "https://www.youtube.com/watch?v=c4V0FNZfEv0",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("재생 후 nocookie iframe 하나를 만들고 pathname, metadata, 카드, social, fetch/storage 상태를 보존한다", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const storageGetSpy = vi.spyOn(Storage.prototype, "getItem");
    const storageSetSpy = vi.spyOn(Storage.prototype, "setItem");
    const storageRemoveSpy = vi.spyOn(Storage.prototype, "removeItem");
    const storageClearSpy = vi.spyOn(Storage.prototype, "clear");

    renderRoute(["/memory/detail-demo"]);

    const articlesBefore = screen.getAllByRole("article").length;
    fireEvent.click(
      screen.getByRole("button", { name: "첫 콘서트 공연 영상 재생" }),
    );

    const players = screen.getAllByTestId("youtube-player");
    expect(players).toHaveLength(1);
    const player = players[0];
    expect(player).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/c4V0FNZfEv0",
    );
    expect(player.getAttribute("src")).not.toContain("autoplay");
    expect(player).toHaveAttribute("title", "첫 콘서트 공연 영상 YouTube 영상");
    expect(player).toHaveAttribute("loading", "lazy");
    expect(player).toHaveAttribute(
      "allow",
      "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
    );
    expect(player).toHaveAttribute("allowfullscreen");
    expect(player).toHaveAttribute(
      "referrerpolicy",
      "strict-origin-when-cross-origin",
    );

    expect(currentLocation()).toBe("/memory/detail-demo");
    expect(screen.getByText("첫 콘서트 공연 영상")).toBeInTheDocument();
    expect(screen.getByText("2023. 12. 25.")).toBeInTheDocument();
    expect(screen.getByText(/공개 YouTube 영상을 러브트리에 연결해 두니/)).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(articlesBefore);
    expect(screen.getByRole("button", { name: "좋아요 128" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "댓글 17" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "공유" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "수정" })).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();

    const appGetItemCalls = storageGetSpy.mock.calls.filter(
      ([key]) => key !== "remix-router-transitions",
    );
    expect(appGetItemCalls).toHaveLength(0);
    expect(storageSetSpy).not.toHaveBeenCalled();
    expect(storageRemoveSpy).not.toHaveBeenCalled();
    expect(storageClearSpy).not.toHaveBeenCalled();
  });

  it("관련 기억 섹션 heading이 있어야 한다", () => {
    renderRoute(["/memory/detail-demo"]);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "이 순간과 이어진 기억",
      })
    ).toBeInTheDocument();
  });

  it("관련 기억 카드가 4개여야 한다", () => {
    renderRoute(["/memory/detail-demo"]);
    const articles = screen.getAllByRole("article");
    expect(articles).toHaveLength(4);
  });

  it("관련 기억이 ul > li > article 구조여야 한다", () => {
    renderRoute(["/memory/detail-demo"]);
    const list = screen.getByRole("list", {
      name: "연관 기억 목록",
    });
    expect(list).toBeInTheDocument();
    expect(list.tagName).toBe("UL");
    const items = list.querySelectorAll(":scope > li");
    expect(items).toHaveLength(4);
    items.forEach((li) => {
      const article = li.querySelector(":scope > article");
      expect(article).toBeInTheDocument();
    });
  });

  it("각 article에 accessible name이 있어야 한다", () => {
    renderRoute(["/memory/detail-demo"]);
    expect(
      screen.getByRole("article", { name: "콘서트 준비 과정" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "콘서트 굿즈 언박싱" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "콘서트 후 일기" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "팬미팅 초대장" })
    ).toBeInTheDocument();
  });

  it("관련 카드에 role='button'이 없어야 한다", () => {
    renderRoute(["/memory/detail-demo"]);
    const articles = screen.getAllByRole("article");
    articles.forEach((article) => {
      expect(article).not.toHaveAttribute("role", "button");
    });
  });

  it("관련 카드에 tabIndex가 없어야 한다", () => {
    renderRoute(["/memory/detail-demo"]);
    const articles = screen.getAllByRole("article");
    articles.forEach((article) => {
      expect(article).not.toHaveAttribute("tabindex");
    });
  });

  it("관련 카드에 draggable이 없어야 한다", () => {
    renderRoute(["/memory/detail-demo"]);
    const articles = screen.getAllByRole("article");
    articles.forEach((article) => {
      expect(article).not.toHaveAttribute("draggable");
    });
  });

  it("좋아요 버튼이 있어야 한다", () => {
    renderRoute(["/memory/detail-demo"]);
    expect(
      screen.getByRole("button", { name: "좋아요 128" })
    ).toBeInTheDocument();
  });

  it("댓글 버튼이 있어야 한다", () => {
    renderRoute(["/memory/detail-demo"]);
    expect(
      screen.getByRole("button", { name: "댓글 17" })
    ).toBeInTheDocument();
  });

  it("공유 버튼이 있어야 한다", () => {
    renderRoute(["/memory/detail-demo"]);
    expect(
      screen.getByRole("button", { name: "공유" })
    ).toBeInTheDocument();
  });

  it("수정 버튼이 있어야 한다", () => {
    renderRoute(["/memory/detail-demo"]);
    expect(
      screen.getByRole("button", { name: "수정" })
    ).toBeInTheDocument();
  });

  it("좋아요 숫자에 의미 있는 accessible text가 있어야 한다", () => {
    renderRoute(["/memory/detail-demo"]);
    expect(
      screen.getByRole("button", { name: "좋아요 128" })
    ).toBeInTheDocument();
  });

  it("댓글 숫자에 의미 있는 accessible text가 있어야 한다", () => {
    renderRoute(["/memory/detail-demo"]);
    expect(
      screen.getByRole("button", { name: "댓글 17" })
    ).toBeInTheDocument();
  });

  it("모든 버튼 클릭 후 fetch가 0회여야 한다", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    renderRoute(["/memory/detail-demo"]);

    const buttons = screen.getAllByRole("button").filter((b) => b.getAttribute("aria-label") !== "뒤로 가기" && b.getAttribute("aria-label") !== "기억 연결" && b.getAttribute("aria-label") !== "미디어 검색" && b.getAttribute("aria-label") !== "기억 트리 보기");
    for (const button of buttons) {
      fireEvent.click(button);
    }

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("모든 버튼 클릭 후 카드 수가 불변이어야 한다", () => {
    renderRoute(["/memory/detail-demo"]);

    const articlesBefore = screen.getAllByRole("article").length;

    const buttons = screen.getAllByRole("button").filter((b) => b.getAttribute("aria-label") !== "뒤로 가기" && b.getAttribute("aria-label") !== "기억 연결" && b.getAttribute("aria-label") !== "미디어 검색" && b.getAttribute("aria-label") !== "기억 트리 보기");
    for (const button of buttons) {
      fireEvent.click(button);
    }

    const articlesAfter = screen.getAllByRole("article");
    expect(articlesAfter).toHaveLength(articlesBefore);
    expect(articlesAfter).toHaveLength(4);
  });

  it("모든 버튼 클릭 후 제목·날짜·메모가 불변이어야 한다", () => {
    renderRoute(["/memory/detail-demo"]);

    const titleBefore = screen.getByText("첫 콘서트 공연 영상");
    const dateBefore = screen.getByText("2023. 12. 25.");
    const memoBefore = screen.getByText(/공개 YouTube 영상을 러브트리에 연결해 두니/);

    const buttons = screen.getAllByRole("button").filter((b) => b.getAttribute("aria-label") !== "뒤로 가기" && b.getAttribute("aria-label") !== "기억 연결" && b.getAttribute("aria-label") !== "미디어 검색" && b.getAttribute("aria-label") !== "기억 트리 보기");
    for (const button of buttons) {
      fireEvent.click(button);
    }

    expect(screen.getByText("첫 콘서트 공연 영상")).toBe(titleBefore);
    expect(screen.getByText("2023. 12. 25.")).toBe(dateBefore);
    expect(
      screen.getByText(/공개 YouTube 영상을 러브트리에 연결해 두니/)
    ).toBe(memoBefore);
  });

  it("모든 버튼 클릭 후 카드 수가 불변이어야 한다", () => {
    renderRoute(["/memory/detail-demo"]);

    const articlesBefore = screen.getAllByRole("article").length;

    const buttons = screen.getAllByRole("button").filter((b) => b.getAttribute("aria-label") !== "뒤로 가기" && b.getAttribute("aria-label") !== "기억 연결" && b.getAttribute("aria-label") !== "미디어 검색" && b.getAttribute("aria-label") !== "기억 트리 보기");
    for (const button of buttons) {
      fireEvent.click(button);
    }

    const articlesAfter = screen.getAllByRole("article");
    expect(articlesAfter).toHaveLength(articlesBefore);
    expect(articlesAfter).toHaveLength(4);
  });

  it("모든 버튼 클릭 후 제목·날짜·메모가 불변이어야 한다", () => {
    renderRoute(["/memory/detail-demo"]);

    const titleBefore = screen.getByText("첫 콘서트 공연 영상");
    const dateBefore = screen.getByText("2023. 12. 25.");
    const memoBefore = screen.getByText(/공개 YouTube 영상을 러브트리에 연결해 두니/);

    const buttons = screen.getAllByRole("button").filter((b) => b.getAttribute("aria-label") !== "뒤로 가기" && b.getAttribute("aria-label") !== "기억 연결" && b.getAttribute("aria-label") !== "미디어 검색" && b.getAttribute("aria-label") !== "기억 트리 보기");
    for (const button of buttons) {
      fireEvent.click(button);
    }

    expect(screen.getByText("첫 콘서트 공연 영상")).toBe(titleBefore);
    expect(screen.getByText("2023. 12. 25.")).toBe(dateBefore);
    expect(
      screen.getByText(/공개 YouTube 영상을 러브트리에 연결해 두니/)
    ).toBe(memoBefore);
  });

  it("Storage API가 호출되지 않아야 한다 (React Router 내부 호출은 제외)", () => {
    const storageGetSpy = vi.spyOn(Storage.prototype, "getItem");
    const storageSetSpy = vi.spyOn(Storage.prototype, "setItem");
    const storageRemoveSpy = vi.spyOn(Storage.prototype, "removeItem");
    const storageClearSpy = vi.spyOn(Storage.prototype, "clear");

    renderRoute(["/memory/detail-demo"]);

    const buttons = screen.getAllByRole("button").filter((b) => b.getAttribute("aria-label") !== "뒤로 가기" && b.getAttribute("aria-label") !== "기억 연결" && b.getAttribute("aria-label") !== "미디어 검색" && b.getAttribute("aria-label") !== "기억 트리 보기");
    for (const button of buttons) {
      fireEvent.click(button);
    }

    // React Router v7 internally reads "remix-router-transitions" from localStorage;
    // application-level storage access should be zero.
    const appGetItemCalls = storageGetSpy.mock.calls.filter(
      ([key]) => key !== "remix-router-transitions",
    );
    expect(appGetItemCalls).toHaveLength(0);
    expect(storageSetSpy).not.toHaveBeenCalled();
    expect(storageRemoveSpy).not.toHaveBeenCalled();
    expect(storageClearSpy).not.toHaveBeenCalled();
  });

  it("action 버튼 클릭 후 location이 변하지 않아야 한다", () => {
    renderRoute(["/memory/detail-demo"]);
    expect(currentLocation()).toBe("/memory/detail-demo");

    const buttons = screen.getAllByRole("button").filter((b) => b.getAttribute("aria-label") !== "뒤로 가기" && b.getAttribute("aria-label") !== "기억 연결" && b.getAttribute("aria-label") !== "미디어 검색" && b.getAttribute("aria-label") !== "기억 트리 보기");
    for (const button of buttons) {
      fireEvent.click(button);
    }

    expect(currentLocation()).toBe("/memory/detail-demo");
  });

  it("뒤로 가기 버튼 클릭 시 이전 페이지(/tree/community-demo)로 이동한다", () => {
    renderRoute(
      ["/tree/community-demo", "/memory/detail-demo"],
      1,
    );
    expect(currentLocation()).toBe("/memory/detail-demo");

    const backButton = screen.getByRole("button", { name: "뒤로 가기" });
    fireEvent.click(backButton);

    expect(currentLocation()).toBe("/tree/community-demo");
  });

  it("기억 연결 버튼 클릭 시 /memory/connect-demo로 이동한다", () => {
    renderRoute(["/memory/detail-demo"]);
    const connectBtn = screen.getByRole("button", { name: "기억 연결" });
    fireEvent.click(connectBtn);
    expect(currentLocation()).toBe("/memory/connect-demo");
  });

  it("미디어 검색 버튼 클릭 시 /media/search-demo로 이동한다", () => {
    renderRoute(["/memory/detail-demo"]);
    const mediaBtn = screen.getByRole("button", { name: "미디어 검색" });
    fireEvent.click(mediaBtn);
    expect(currentLocation()).toBe("/media/search-demo");
  });

  it("부모 트리 카드 클릭 시 /tree/community-demo로 이동한다", () => {
    renderRoute(["/memory/detail-demo"]);
    const treeContextCard = screen.getByTestId("tree-context-card");
    fireEvent.click(treeContextCard);
    expect(currentLocation()).toBe("/tree/community-demo");
  });

  /* ── New assertions for enriched content ── */

  it("미디어 출처 정보가 표시되어야 한다", () => {
    renderRoute(["/memory/detail-demo"]);
    expect(screen.getByText("공개 YouTube 공연 영상 예시")).toBeInTheDocument();
  });

  it("미디어 형식 정보가 표시되어야 한다", () => {
    renderRoute(["/memory/detail-demo"]);
    expect(screen.getAllByText("YouTube").length).toBeGreaterThanOrEqual(1);
  });

  it("미디어 길이 정보가 표시되어야 한다", () => {
    renderRoute(["/memory/detail-demo"]);
    expect(screen.getAllByText("YouTube에서 확인").length).toBeGreaterThanOrEqual(1);
  });

  it("기억 유형 배지가 표시되어야 한다", () => {
    renderRoute(["/memory/detail-demo"]);
    expect(screen.getByText("영상")).toBeInTheDocument();
  });

  it("작성자 이름이 표시되어야 한다", () => {
    renderRoute(["/memory/detail-demo"]);
    expect(screen.getByText("민지")).toBeInTheDocument();
  });

  it("트리 이름이 표시되어야 한다", () => {
    renderRoute(["/memory/detail-demo"]);
    expect(screen.getAllByText("민지의 러브트리").length).toBeGreaterThanOrEqual(1);
  });

  it("각 관련 기억에 유형이 표시되어야 한다", () => {
    renderRoute(["/memory/detail-demo"]);
    const typeLabels = screen.getAllByText(/^(사진|텍스트|문서)$/);
    expect(typeLabels.length).toBeGreaterThanOrEqual(3);
  });

  it("각 관련 기억에 관계 문구가 표시되어야 한다", () => {
    renderRoute(["/memory/detail-demo"]);
    expect(screen.getByText("이전 기억")).toBeInTheDocument();
    const relations = screen.getAllByText(/(이어진 기억|관련 기억)/);
    expect(relations.length).toBeGreaterThanOrEqual(2);
  });

  it("좋아요가 눌린 상태여야 한다", () => {
    renderRoute(["/memory/detail-demo"]);
    const likeButton = screen.getByRole("button", { name: "좋아요 128" });
    expect(likeButton).toHaveAttribute("aria-pressed", "true");
  });

  it("더보기 메뉴 버튼이 있어야 한다", () => {
    renderRoute(["/memory/detail-demo"]);
    expect(
      screen.getByRole("button", { name: "더보기 메뉴" })
    ).toBeInTheDocument();
  });

  it("fetch/network 요청이 없어야 한다", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    renderRoute(["/memory/detail-demo"]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("XMLHttpRequest가 없어야 한다", () => {
    const openSpy = vi.fn();
    vi.stubGlobal("XMLHttpRequest", vi.fn(() => ({ open: openSpy })));
    renderRoute(["/memory/detail-demo"]);
    expect(openSpy).not.toHaveBeenCalled();
  });

  it("모든 SVG는 aria-hidden이거나 aria-hidden 조상 안에 있어야 한다", () => {
    renderRoute(["/memory/detail-demo"]);
    const svgs = document.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
    svgs.forEach((svg) => {
      const hidden =
        svg.getAttribute("aria-hidden") === "true" ||
        svg.closest('[aria-hidden="true"]') !== null;
      expect(hidden).toBe(true);
    });
  });

  it("모든 SVG에 focusable='false'가 있어야 한다", () => {
    renderRoute(["/memory/detail-demo"]);
    const svgs = document.querySelectorAll("svg");
    svgs.forEach((svg) => {
      expect(svg).toHaveAttribute("focusable", "false");
    });
  });

  it("안전한 YouTube 외부 링크만 제공한다", () => {
    renderRoute(["/memory/detail-demo"]);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName("YouTube에서 보기");
    expect(links[0]).toHaveAttribute(
      "href",
      "https://www.youtube.com/watch?v=c4V0FNZfEv0",
    );
    expect(links[0]).toHaveAttribute("target", "_blank");
    expect(links[0]).toHaveAttribute("rel", "noopener noreferrer");
  });
});

describe("기존 App 경로 검증", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("/에서 HomePage가 렌더링되어야 한다", () => {
    renderRoute(["/"]);
    expect(
      screen.getByText(/사랑에 빠진 모든 순간을/)
    ).toBeInTheDocument();
  });

  it("/community에서 CommunityPage가 렌더링되어야 한다", () => {
    renderRoute(["/community"]);
    expect(
      screen.getByRole("heading", { name: "다른 팬들의 러브트리 구경하기" })
    ).toBeInTheDocument();
  });

  it("/login에서 AuthLoginPage가 렌더링되어야 한다", () => {
    renderRoute(["/login"]);
    expect(
      screen.getByText("내 러브트리를 계속 이어가려면 로그인하세요")
    ).toBeInTheDocument();
  });

  it("/tree/:treeId에서 TreeDetailPage가 렌더링되어야 한다", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const urlStr = typeof url === "string" ? url : url.toString();
      if (urlStr.includes("/api/trees/")) {
        return Promise.resolve(
          new Response(JSON.stringify({ id: "test-route-id", title: "테스트 러버 A의 러브트리", visibility: "public", createdAt: "2023-09-28T00:00:00.000Z", updatedAt: "2024-08-01T00:00:00.000Z", memoryCount: 8, likeCount: 128, viewCount: 1420 }), { status: 200, headers: { "Content-Type": "application/json" } })
        );
      }
      if (urlStr.includes("/api/community/memories")) {
        return Promise.resolve(
          new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } })
        );
      }
      return Promise.resolve(new Response(null, { status: 404 }));
    });
    renderRoute(["/tree/test-route-id"]);
    expect(
      await screen.findByRole("heading", { name: "테스트 러버 A의 러브트리" })
    ).toBeInTheDocument();
  });

  it("/memory/connect-demo에서 MemoryConnectPage가 렌더링되어야 한다", () => {
    renderRoute(["/memory/connect-demo"]);
    expect(
      screen.getByRole("heading", { name: "어느 순간과 연결할까요?" })
    ).toBeInTheDocument();
  });

  it("/memory/detail-demo에서 MemoryDetailPage가 렌더링되어야 한다", () => {
    renderRoute(["/memory/detail-demo"]);
    expect(
      screen.getByRole("heading", { level: 1, name: "기억 상세" })
    ).toBeInTheDocument();
  });

  it("/my-trees에서 MyTreesPage가 렌더링되어야 한다", () => {
    renderRoute(["/my-trees"]);
    expect(
      screen.getByRole("heading", { level: 1, name: "나의 러브트리" })
    ).toBeInTheDocument();
  });

  it("/tree/edit-demo에서 TreeEditorPage가 렌더링되어야 한다", () => {
    renderRoute(["/tree/edit-demo"]);
    expect(
      screen.getByRole("heading", { level: 1, name: "러브트리 편집" })
    ).toBeInTheDocument();
  });

  it("/nonexistent-route에서 HomePage로 fallback되어야 한다", () => {
    renderRoute(["/nonexistent-route"]);
    expect(
      screen.getByText(/사랑에 빠진 모든 순간을/)
    ).toBeInTheDocument();
  });
});
