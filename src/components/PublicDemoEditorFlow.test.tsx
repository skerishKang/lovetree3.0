import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import type { PublicDemoDraft, PublicDemoNode } from "../types/publicDemoEditor";
import { PUBLIC_DEMO_STORAGE_KEY } from "../utils/publicDemoStorage";

const authState = vi.hoisted(() => ({
  user: null as null | {
    uid: string;
    displayName: null;
    email: null;
    photoURL: null;
    emailVerified: boolean;
  },
  loading: false,
}));

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({
    user: authState.user,
    loading: authState.loading,
    tier: null,
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
    expireSession: vi.fn(),
  }),
}));

function renderAppAt(path: string) {
  window.history.pushState({}, "", path);
  return render(<App />);
}

function makeNode(id: string, parentId: string | null, title: string): PublicDemoNode {
  return {
    id,
    parentId,
    title,
    date: "2026-07-26",
    emotion: "행복",
    memo: `${title} 메모`,
    youtubeUrl: "https://www.youtube.com/watch?v=c4V0FNZfEv0",
    videoId: "c4V0FNZfEv0",
  };
}

function seedDraft(nodes: PublicDemoNode[], selectedNodeId = nodes[0]?.id ?? null) {
  const draft: PublicDemoDraft = {
    schemaVersion: 1,
    tree: { title: "테스트 러브트리", description: "브라우저 draft 설명" },
    nodes,
    selectedNodeId,
  };
  localStorage.setItem(PUBLIC_DEMO_STORAGE_KEY, JSON.stringify(draft));
  return draft;
}

async function fillMemoryForm(title: string, parentTitle?: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("기억 제목"), title);
  fireEvent.change(screen.getByLabelText("날짜"), { target: { value: "2026-07-26" } });
  await user.selectOptions(screen.getByLabelText("감정"), "행복");
  await user.type(screen.getByLabelText("메모"), `${title}의 소중한 메모`);
  await user.type(
    screen.getByLabelText("YouTube URL"),
    "https://www.youtube.com/watch?v=c4V0FNZfEv0",
  );
  if (parentTitle) {
    await user.selectOptions(screen.getByLabelText("부모 기억"), parentTitle);
  }
  return user;
}

function readSavedDraft() {
  return JSON.parse(localStorage.getItem(PUBLIC_DEMO_STORAGE_KEY) ?? "null") as PublicDemoDraft;
}

describe("public demo editor flow", () => {
  afterEach(() => {
    cleanup();
    authState.user = null;
    authState.loading = false;
    localStorage.removeItem(PUBLIC_DEMO_STORAGE_KEY);
    localStorage.removeItem("unrelated-key");
    window.history.pushState({}, "", "/");
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("allows every /tree/new-demo route while logged out", () => {
    const routes = [
      ["/tree/new-demo", "새 러브트리"],
      ["/tree/new-demo/edit", "공개 데모 러브트리 편집"],
      ["/tree/new-demo/memory/new", "첫 기억 추가"],
      ["/tree/new-demo/memory/missing/edit", "기억을 찾을 수 없습니다"],
      ["/tree/new-demo/preview", "제목 없는 러브트리"],
    ] as const;

    for (const [route, heading] of routes) {
      renderAppAt(route);
      expect(window.location.pathname).toBe(route);
      expect(screen.getByRole("heading", { level: 1, name: heading })).toBeInTheDocument();
      cleanup();
    }
  });

  it("keeps all existing protected routes redirected to login", async () => {
    for (const route of [
      "/tree/edit-demo",
      "/memory/connect-demo",
      "/my-trees",
      "/media/search-demo",
      "/settings/visibility-demo",
      "/my-trees/empty-demo",
    ]) {
      renderAppAt(route);
      await waitFor(() => expect(window.location.pathname).toBe("/login"));
      expect(screen.getByRole("heading", { name: "내 러브트리를 계속 이어가려면 로그인하세요" })).toBeInTheDocument();
      cleanup();
    }
  });

  it("creates a root, child, and grandchild, updates a parent and connector, and performs zero network writes", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const xhrSendSpy = vi.spyOn(XMLHttpRequest.prototype, "send");
    const user = userEvent.setup();
    renderAppAt("/tree/new-demo");

    await user.type(screen.getByLabelText("러브트리 제목"), "나의 공연 러브트리");
    await user.type(screen.getByLabelText("설명"), "세 단계 기억 연결");
    await user.click(screen.getByRole("button", { name: "첫 기억 추가" }));
    expect(window.location.pathname).toBe("/tree/new-demo/memory/new");

    await fillMemoryForm("첫 공연");
    expect(screen.getByRole("img", { name: "첫 공연 YouTube 썸네일" })).toBeInTheDocument();
    expect(screen.queryByTestId("youtube-player")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "첫 공연 재생" }));
    const firstPlayer = screen.getByTestId("youtube-player");
    expect(firstPlayer).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/c4V0FNZfEv0");
    expect(firstPlayer.getAttribute("src")).not.toContain("autoplay");
    expect(screen.getAllByTestId("youtube-player")).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "기억 저장" }));
    await waitFor(() => expect(window.location.pathname).toBe("/tree/new-demo/edit"));
    expect(screen.getByTestId("node-count")).toHaveTextContent("1 / 12");

    await user.click(screen.getByRole("button", { name: "기억 추가" }));
    await fillMemoryForm("두 번째 기억", "첫 공연");
    await user.click(screen.getByRole("button", { name: "기억 저장" }));
    await waitFor(() => expect(screen.getByTestId("node-count")).toHaveTextContent("2 / 12"));

    await user.click(screen.getByRole("button", { name: "기억 추가" }));
    await fillMemoryForm("세 번째 기억", "두 번째 기억");
    await user.click(screen.getByRole("button", { name: "기억 저장" }));
    await waitFor(() => expect(screen.getByTestId("node-count")).toHaveTextContent("3 / 12"));
    expect(screen.getAllByTestId("connector")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "기억 편집" }));
    await user.selectOptions(screen.getByLabelText("부모 기억"), "첫 공연");
    await user.click(screen.getByRole("button", { name: "변경 저장" }));
    await waitFor(() => expect(window.location.pathname).toBe("/tree/new-demo/edit"));

    await waitFor(() => {
      const saved = readSavedDraft();
      const root = saved.nodes.find((node) => node.title === "첫 공연");
      const third = saved.nodes.find((node) => node.title === "세 번째 기억");
      expect(root).toBeDefined();
      expect(third?.parentId).toBe(root?.id);
      expect(
        screen.getAllByTestId("connector").some((connector) =>
          connector.getAttribute("data-from-id") === root?.id &&
          connector.getAttribute("data-to-id") === third?.id,
        ),
      ).toBe(true);
    });

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(xhrSendSpy).not.toHaveBeenCalled();
  });

  it("enforces the 12-node limit", () => {
    const root = makeNode("root", null, "루트");
    const nodes = [
      root,
      ...Array.from({ length: 11 }, (_, index) => makeNode(`child-${index}`, "root", `기억 ${index + 1}`)),
    ];
    seedDraft(nodes, "root");
    renderAppAt("/tree/new-demo/edit");
    expect(screen.getByTestId("node-count")).toHaveTextContent("12 / 12");
    expect(screen.getByRole("button", { name: "기억 추가" })).toBeDisabled();
  });

  it("rejects invalid YouTube hosts and malformed URLs without committing them", async () => {
    seedDraft([], null);
    const user = userEvent.setup();
    renderAppAt("/tree/new-demo/memory/new");
    await user.type(screen.getByLabelText("기억 제목"), "잘못된 영상");
    fireEvent.change(screen.getByLabelText("날짜"), { target: { value: "2026-07-26" } });
    await user.selectOptions(screen.getByLabelText("감정"), "행복");
    await user.type(screen.getByLabelText("메모"), "메모");

    for (const invalid of [
      "https://youtube.example.com/watch?v=c4V0FNZfEv0",
      "javascript:alert(1)",
      "data:text/html,test",
      "https://www.youtube.com/playlist?list=PL123",
      "https://www.youtube.com/watch?v=bad",
    ]) {
      const input = screen.getByLabelText("YouTube URL");
      await user.clear(input);
      await user.type(input, invalid);
      fireEvent.blur(input);
      expect(screen.getByRole("alert")).toHaveTextContent(/YouTube/);
      expect(screen.queryByRole("img", { name: /YouTube 썸네일/ })).not.toBeInTheDocument();
      expect(readSavedDraft().nodes).toHaveLength(0);
      expect(localStorage.getItem(PUBLIC_DEMO_STORAGE_KEY)).not.toContain(invalid);
    }
  });

  it("offers subtree deletion for a non-root node with children", async () => {
    const user = userEvent.setup();
    seedDraft([
      makeNode("root", null, "루트"),
      makeNode("child", "root", "자식"),
      makeNode("grand", "child", "손자"),
    ], "child");
    renderAppAt("/tree/new-demo/edit");

    await user.click(screen.getByRole("button", { name: "기억 삭제" }));
    const dialog = screen.getByRole("dialog", { name: "하위 기억이 있습니다" });
    await user.click(within(dialog).getByRole("button", { name: "하위 기억 전체 삭제" }));
    await waitFor(() => expect(screen.getByTestId("node-count")).toHaveTextContent("1 / 12"));
    await waitFor(() => expect(readSavedDraft().nodes.map((node) => node.id)).toEqual(["root"]));
  });

  it("supports leaf and child-reattach deletion while protecting a root with descendants", async () => {
    const user = userEvent.setup();
    seedDraft([
      makeNode("root", null, "루트"),
      makeNode("child", "root", "자식"),
      makeNode("grand", "child", "손자"),
      makeNode("leaf", "root", "leaf"),
    ], "root");
    renderAppAt("/tree/new-demo/edit");

    await user.click(screen.getByRole("button", { name: /루트/ }));
    await user.click(screen.getByRole("button", { name: "기억 삭제" }));
    expect(screen.getByRole("alert")).toHaveTextContent("하위 기억을 먼저");

    await user.click(screen.getByRole("button", { name: /leaf/ }));
    await user.click(screen.getByRole("button", { name: "기억 삭제" }));
    const leafDialog = screen.getByRole("dialog", { name: "이 기억을 삭제할까요?" });
    await user.click(within(leafDialog).getByRole("button", { name: "기억 삭제" }));
    await waitFor(() => expect(screen.getByTestId("node-count")).toHaveTextContent("3 / 12"));

    await user.click(screen.getByRole("button", { name: /자식/ }));
    await user.click(screen.getByRole("button", { name: "기억 삭제" }));
    const childrenDialog = screen.getByRole("dialog", { name: "하위 기억이 있습니다" });
    await user.click(within(childrenDialog).getByRole("button", { name: "직접 자식 재연결 후 대상만 삭제" }));
    await waitFor(() => {
      const saved = readSavedDraft();
      expect(saved.nodes.find((node) => node.id === "grand")?.parentId).toBe("root");
      expect(saved.nodes.some((node) => node.id === "child")).toBe(false);
    });
  });

  it("deleting the only root returns to the empty start", async () => {
    const user = userEvent.setup();
    seedDraft([makeNode("root", null, "유일한 루트")], "root");
    renderAppAt("/tree/new-demo/edit");
    await user.click(screen.getByRole("button", { name: "기억 삭제" }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "기억 삭제" }));
    await waitFor(() => expect(window.location.pathname).toBe("/tree/new-demo"));
    expect(screen.getByText("0 / 12 기억")).toBeInTheDocument();
    await waitFor(() => expect(readSavedDraft().nodes).toHaveLength(0));
  });

  it("restores after remount and exact-key reset supports Escape and focus return", async () => {
    const user = userEvent.setup();
    seedDraft([makeNode("root", null, "복원된 기억")], "root");
    localStorage.setItem("unrelated-key", "keep");
    const view = renderAppAt("/tree/new-demo");
    expect(screen.getByRole("button", { name: "기존 작업 이어가기" })).toBeInTheDocument();
    view.unmount();

    renderAppAt("/tree/new-demo/edit");
    expect(screen.getByRole("button", { name: /복원된 기억/ })).toBeInTheDocument();
    const resetButton = screen.getByRole("button", { name: "전체 초기화" });
    resetButton.focus();
    await user.click(resetButton);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "취소" })).toHaveFocus();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(resetButton).toHaveFocus());

    await user.click(resetButton);
    await user.click(screen.getByRole("button", { name: "draft 완전 삭제" }));
    await waitFor(() => expect(window.location.pathname).toBe("/tree/new-demo"));
    expect(localStorage.getItem(PUBLIC_DEMO_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem("unrelated-key")).toBe("keep");
  });

  it("recovers malformed JSON, unknown schema, and invalid graphs by removing only the exact key", () => {
    const invalidDrafts = [
      "{bad json",
      JSON.stringify({
        schemaVersion: 2,
        tree: { title: "버전 오류", description: "" },
        nodes: [],
        selectedNodeId: null,
      }),
      JSON.stringify({
        schemaVersion: 1,
        tree: { title: "그래프 오류", description: "" },
        nodes: [makeNode("orphan", "missing", "고아")],
        selectedNodeId: "orphan",
      }),
    ];

    for (const raw of invalidDrafts) {
      localStorage.setItem(PUBLIC_DEMO_STORAGE_KEY, raw);
      localStorage.setItem("unrelated-key", "keep");
      renderAppAt("/tree/new-demo");
      expect(screen.getByText("0 / 12 기억")).toBeInTheDocument();
      expect(localStorage.getItem(PUBLIC_DEMO_STORAGE_KEY)).toBeNull();
      expect(localStorage.getItem("unrelated-key")).toBe("keep");
      cleanup();
    }
  });

  it("preview reflects edited title, description, graph, and YouTube media with zero fetch/XHR calls", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const xhrSendSpy = vi.spyOn(XMLHttpRequest.prototype, "send");
    const user = userEvent.setup();
    seedDraft([makeNode("root", null, "미리보기 기억")], "root");
    renderAppAt("/tree/new-demo/edit");

    fireEvent.change(screen.getByLabelText("러브트리 제목"), { target: { value: "편집된 러브트리" } });
    fireEvent.change(screen.getByLabelText("설명"), { target: { value: "편집된 설명" } });
    await user.click(screen.getByRole("link", { name: "미리보기" }));

    expect(window.location.pathname).toBe("/tree/new-demo/preview");
    expect(screen.getByRole("heading", { level: 1, name: "편집된 러브트리" })).toBeInTheDocument();
    expect(screen.getByText("편집된 설명")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /미리보기 기억/ })).toHaveAttribute("data-selected", "true");
    expect(screen.getByRole("button", { name: "미리보기 기억 재생" })).toBeInTheDocument();
    expect(screen.queryByTestId("youtube-player")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "미리보기 기억 재생" }));
    expect(screen.getAllByTestId("youtube-player")).toHaveLength(1);
    expect(screen.getByTestId("youtube-player").getAttribute("src")).not.toContain("autoplay");
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(xhrSendSpy).not.toHaveBeenCalled();
  });
});
