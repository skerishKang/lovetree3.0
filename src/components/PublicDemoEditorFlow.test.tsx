import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import type { PublicDemoDraft, PublicDemoNode } from "../types/publicDemoEditor";
import { PUBLIC_DEMO_STORAGE_KEY } from "../utils/publicDemoStorage";

interface TestUser {
  uid: string;
  displayName: null;
  email: null;
  photoURL: null;
  emailVerified: boolean;
}

const flowAuth = vi.hoisted(() => ({
  user: null as TestUser | null,
}));

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({
    user: flowAuth.user,
    loading: false,
    tier: null,
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
    expireSession: vi.fn(),
  }),
}));

const VALID_YOUTUBE = "https://www.youtube.com/watch?v=c4V0FNZfEv0";
const VIDEO_ID = "c4V0FNZfEv0";

function makeNode(id: string, parentId: string | null, title: string): PublicDemoNode {
  return {
    id,
    parentId,
    title,
    date: "2026-07-26",
    emotion: "행복",
    memo: `${title} 메모`,
    youtubeUrl: VALID_YOUTUBE,
    videoId: VIDEO_ID,
  };
}

function seedDraft(nodes: PublicDemoNode[], selectedNodeId = nodes[0]?.id ?? null) {
  const draft: PublicDemoDraft = {
    schemaVersion: 1,
    tree: { title: "테스트 러브트리", description: "공개 데모 설명" },
    nodes,
    selectedNodeId,
  };
  localStorage.setItem(PUBLIC_DEMO_STORAGE_KEY, JSON.stringify(draft));
  return draft;
}

function renderAppAt(path: string) {
  window.history.pushState({}, "", path);
  return render(<App />);
}

function readDraft() {
  const raw = localStorage.getItem(PUBLIC_DEMO_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as PublicDemoDraft) : null;
}

async function fillMemoryForm(title: string, parentTitle?: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("기억 제목"), title);
  fireEvent.change(screen.getByLabelText("날짜"), {
    target: { value: "2026-07-26" },
  });
  await user.selectOptions(screen.getByLabelText("감정"), "행복");
  await user.type(screen.getByLabelText("메모"), `${title}의 소중한 메모`);
  fireEvent.change(screen.getByLabelText("YouTube URL"), {
    target: { value: VALID_YOUTUBE },
  });
  if (parentTitle) {
    await user.selectOptions(screen.getByLabelText("부모 기억"), parentTitle);
  }
  return user;
}

async function waitForNodeCount(count: number) {
  await waitFor(() => expect(readDraft()?.nodes).toHaveLength(count));
}

describe("PublicDemoEditorFlow — typed final contract", () => {
  afterEach(() => {
    cleanup();
    flowAuth.user = null;
    localStorage.removeItem(PUBLIC_DEMO_STORAGE_KEY);
    localStorage.removeItem("unrelated-key");
    window.history.pushState({}, "", "/");
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("creates a root, child, and grandchild with current-state connectors and zero backend writes", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const xhrSendSpy = vi.spyOn(XMLHttpRequest.prototype, "send");
    const user = userEvent.setup();
    renderAppAt("/tree/new-demo");

    await user.type(screen.getByLabelText("러브트리 제목"), "3단계 러브트리");
    await user.type(screen.getByLabelText("설명"), "root child grandchild");
    await user.click(screen.getByRole("button", { name: "첫 순간 추가" }));
    expect(window.location.pathname).toBe("/tree/new-demo/memory/new");

    await fillMemoryForm("루트 기억");
    expect(screen.getByRole("img", { name: "루트 기억 YouTube 썸네일" })).toBeInTheDocument();
    expect(screen.queryByTestId("youtube-player")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "루트 기억 재생" }));
    const player = screen.getByTestId("youtube-player");
    expect(player).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/c4V0FNZfEv0",
    );
    expect(player.getAttribute("src")).not.toContain("autoplay");
    expect(screen.getAllByTestId("youtube-player")).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "기억 저장" }));
    await waitFor(() => expect(window.location.pathname).toBe("/tree/new-demo/edit"));
    expect(screen.getByTestId("node-count")).toHaveTextContent("1 / 12");

    await user.click(screen.getByRole("button", { name: "기억 추가" }));
    await fillMemoryForm("자식 기억", "루트 기억");
    await user.click(screen.getByRole("button", { name: "기억 저장" }));
    await waitFor(() => expect(screen.getByTestId("node-count")).toHaveTextContent("2 / 12"));

    await user.click(screen.getByRole("button", { name: "기억 추가" }));
    await fillMemoryForm("손자 기억", "자식 기억");
    await user.click(screen.getByRole("button", { name: "기억 저장" }));
    await waitFor(() => expect(screen.getByTestId("node-count")).toHaveTextContent("3 / 12"));
    expect(screen.getAllByTestId("connector")).toHaveLength(2);

    await waitForNodeCount(3);
    const saved = readDraft();
    const root = saved?.nodes.find((node) => node.title === "루트 기억");
    const child = saved?.nodes.find((node) => node.title === "자식 기억");
    const grandchild = saved?.nodes.find((node) => node.title === "손자 기억");
    expect(child?.parentId).toBe(root?.id);
    expect(grandchild?.parentId).toBe(child?.id);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(xhrSendSpy).not.toHaveBeenCalled();
  });

  it("enforces the 12-node limit", () => {
    const nodes = [
      makeNode("root", null, "루트"),
      ...Array.from({ length: 11 }, (_, index) =>
        makeNode(`child-${index + 1}`, "root", `기억 ${index + 1}`),
      ),
    ];
    seedDraft(nodes, "root");
    renderAppAt("/tree/new-demo/edit");

    expect(screen.getByTestId("node-count")).toHaveTextContent("12 / 12");
    expect(screen.getByRole("button", { name: "기억 추가" })).toBeDisabled();
  });

  it("reassigns a parent, updates the connector, and excludes self or descendants from candidates", async () => {
    seedDraft([
      makeNode("root", null, "루트"),
      makeNode("child", "root", "자식"),
      makeNode("grand", "child", "손자"),
    ], "child");
    const user = userEvent.setup();
    renderAppAt("/tree/new-demo/edit");

    await user.click(screen.getByRole("button", { name: "기억 편집" }));
    const parentSelect = screen.getByLabelText("부모 기억");
    expect(within(parentSelect).queryByRole("option", { name: "자식" })).not.toBeInTheDocument();
    expect(within(parentSelect).queryByRole("option", { name: "손자" })).not.toBeInTheDocument();
    await user.selectOptions(parentSelect, "루트");
    await user.click(screen.getByRole("button", { name: "변경 저장" }));

    await waitFor(() => expect(window.location.pathname).toBe("/tree/new-demo/edit"));
    await waitFor(() => expect(readDraft()?.nodes.find((node) => node.id === "child")?.parentId).toBe("root"));
    expect(
      screen.getAllByTestId("connector").some((connector) =>
        connector.getAttribute("data-from-id") === "root" &&
        connector.getAttribute("data-to-id") === "child",
      ),
    ).toBe(true);
  });

  it("rejects invalid hosts and malformed YouTube URLs without storing them", async () => {
    seedDraft([], null);
    const user = userEvent.setup();
    renderAppAt("/tree/new-demo/memory/new");

    await user.type(screen.getByLabelText("기억 제목"), "잘못된 미디어");
    fireEvent.change(screen.getByLabelText("날짜"), { target: { value: "2026-07-26" } });
    await user.selectOptions(screen.getByLabelText("감정"), "행복");
    await user.type(screen.getByLabelText("메모"), "저장되면 안 되는 URL");

    for (const invalidUrl of [
      "https://youtube.example.com/watch?v=c4V0FNZfEv0",
      "not a url",
    ]) {
      const input = screen.getByLabelText("YouTube URL");
      await user.clear(input);
      await user.type(input, invalidUrl);
      fireEvent.blur(input);
      expect(screen.getByRole("alert")).toHaveTextContent("지원되는 공개 YouTube 영상 URL");
      expect(screen.queryByRole("img", { name: /YouTube 썸네일/ })).not.toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "기억 저장" }));
      expect(readDraft()?.nodes).toHaveLength(0);
      expect(localStorage.getItem(PUBLIC_DEMO_STORAGE_KEY)).not.toContain(invalidUrl);
    }
  });

  it("blocks deleting a root with descendants and deletes a leaf", async () => {
    seedDraft([
      makeNode("root", null, "루트"),
      makeNode("leaf", "root", "leaf"),
    ], "root");
    const user = userEvent.setup();
    renderAppAt("/tree/new-demo/edit");

    await user.click(screen.getByRole("button", { name: "기억 삭제" }));
    expect(screen.getByRole("alert")).toHaveTextContent("하위 기억을 먼저");

    await user.click(screen.getByRole("button", { name: /leaf/ }));
    await user.click(screen.getByRole("button", { name: "기억 삭제" }));
    const dialog = screen.getByRole("dialog", { name: "이 기억을 삭제할까요?" });
    await user.click(within(dialog).getByRole("button", { name: "기억 삭제" }));
    await waitFor(() => expect(screen.getByTestId("node-count")).toHaveTextContent("1 / 12"));
    await waitForNodeCount(1);
  });

  it("supports subtree deletion and child reattachment deletion", async () => {
    const user = userEvent.setup();
    seedDraft([
      makeNode("root", null, "루트"),
      makeNode("child", "root", "자식"),
      makeNode("grand", "child", "손자"),
    ], "child");
    renderAppAt("/tree/new-demo/edit");

    await user.click(screen.getByRole("button", { name: "기억 삭제" }));
    let dialog = screen.getByRole("dialog", { name: "하위 기억이 있습니다" });
    await user.click(within(dialog).getByRole("button", { name: "하위 기억 전체 삭제" }));
    await waitForNodeCount(1);
    expect(readDraft()?.nodes.map((node) => node.id)).toEqual(["root"]);

    cleanup();
    seedDraft([
      makeNode("root", null, "루트"),
      makeNode("child", "root", "자식"),
      makeNode("grand", "child", "손자"),
    ], "child");
    renderAppAt("/tree/new-demo/edit");
    await user.click(screen.getByRole("button", { name: "기억 삭제" }));
    dialog = screen.getByRole("dialog", { name: "하위 기억이 있습니다" });
    await user.click(
      within(dialog).getByRole("button", { name: "직접 자식 재연결 후 대상만 삭제" }),
    );
    await waitFor(() => {
      const saved = readDraft();
      expect(saved?.nodes.some((node) => node.id === "child")).toBe(false);
      expect(saved?.nodes.find((node) => node.id === "grand")?.parentId).toBe("root");
    });
  });

  it("deleting the only root returns to the empty start", async () => {
    seedDraft([makeNode("root", null, "유일한 루트")], "root");
    const user = userEvent.setup();
    renderAppAt("/tree/new-demo/edit");

    await user.click(screen.getByRole("button", { name: "기억 삭제" }));
    const dialog = screen.getByRole("dialog", { name: "이 기억을 삭제할까요?" });
    await user.click(within(dialog).getByRole("button", { name: "기억 삭제" }));

    await waitFor(() => expect(window.location.pathname).toBe("/tree/new-demo"));
    expect(screen.getByText("0 / 12 기억")).toBeInTheDocument();
    await waitForNodeCount(0);
  });

  it("restores after reload and safely recovers malformed, unknown-schema, and invalid-graph storage", () => {
    seedDraft([makeNode("root", null, "복원 기억")], "root");
    const firstView = renderAppAt("/tree/new-demo/edit");
    expect(screen.getByRole("button", { name: /복원 기억/ })).toBeInTheDocument();
    firstView.unmount();

    renderAppAt("/tree/new-demo/preview");
    expect(screen.getByRole("heading", { level: 1, name: "테스트 러브트리" })).toBeInTheDocument();
    cleanup();

    const invalidValues = [
      "{bad json",
      JSON.stringify({
        schemaVersion: 2,
        tree: { title: "unknown", description: "" },
        nodes: [],
        selectedNodeId: null,
      }),
      JSON.stringify({
        schemaVersion: 1,
        tree: { title: "invalid graph", description: "" },
        nodes: [makeNode("orphan", "missing", "고아")],
        selectedNodeId: "orphan",
      }),
    ];

    for (const raw of invalidValues) {
      localStorage.setItem(PUBLIC_DEMO_STORAGE_KEY, raw);
      localStorage.setItem("unrelated-key", "keep");
      renderAppAt("/tree/new-demo");
      expect(screen.getByText("0 / 12 기억")).toBeInTheDocument();
      expect(localStorage.getItem(PUBLIC_DEMO_STORAGE_KEY)).toBeNull();
      expect(localStorage.getItem("unrelated-key")).toBe("keep");
      cleanup();
    }
  });

  it("exact-key reset supports Escape cancellation and focus return", async () => {
    seedDraft([makeNode("root", null, "초기화 기억")], "root");
    localStorage.setItem("unrelated-key", "keep");
    const clearSpy = vi.spyOn(Storage.prototype, "clear");
    const user = userEvent.setup();
    renderAppAt("/tree/new-demo/edit");

    const resetButton = screen.getByRole("button", { name: "전체 초기화" });
    resetButton.focus();
    await user.click(resetButton);
    await waitFor(() => expect(screen.getByRole("button", { name: "취소" })).toHaveFocus());
    await user.keyboard("{Escape}");
    await waitFor(() => expect(resetButton).toHaveFocus());

    await user.click(resetButton);
    await user.click(screen.getByRole("button", { name: "draft 완전 삭제" }));
    await waitFor(() => expect(window.location.pathname).toBe("/tree/new-demo"));
    expect(localStorage.getItem(PUBLIC_DEMO_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem("unrelated-key")).toBe("keep");
    expect(clearSpy).not.toHaveBeenCalled();
  });

  it("keeps preview title, description, graph, selection, and YouTube lifecycle consistent", async () => {
    seedDraft([
      makeNode("root", null, "미리보기 루트"),
      makeNode("child", "root", "미리보기 자식"),
    ], "child");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const xhrSendSpy = vi.spyOn(XMLHttpRequest.prototype, "send");
    const user = userEvent.setup();
    renderAppAt("/tree/new-demo/edit");

    fireEvent.change(screen.getByLabelText("러브트리 제목"), {
      target: { value: "편집된 미리보기" },
    });
    fireEvent.change(screen.getByLabelText("설명"), {
      target: { value: "편집된 설명" },
    });
    await user.click(screen.getByRole("link", { name: "미리보기" }));

    expect(window.location.pathname).toBe("/tree/new-demo/preview");
    expect(screen.getByRole("heading", { level: 1, name: "편집된 미리보기" })).toBeInTheDocument();
    expect(screen.getByText("편집된 설명")).toBeInTheDocument();
    expect(screen.getAllByTestId("preview-connector")).toHaveLength(1);
    expect(screen.getByRole("button", { name: /미리보기 자식/ })).toHaveAttribute(
      "data-selected",
      "true",
    );
    expect(screen.getByRole("button", { name: "미리보기 자식 재생" })).toBeInTheDocument();
    expect(screen.queryByTestId("youtube-player")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "미리보기 자식 재생" }));
    expect(screen.getAllByTestId("youtube-player")).toHaveLength(1);
    expect(screen.getByTestId("youtube-player").getAttribute("src")).not.toContain("autoplay");
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(xhrSendSpy).not.toHaveBeenCalled();
  });
});
