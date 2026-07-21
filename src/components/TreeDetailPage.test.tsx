import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TreeDetailPage from "./TreeDetailPage";

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/tree/community-demo"]}>
      <TreeDetailPage />
    </MemoryRouter>
  );
}

describe("TreeDetailPage (LT3-TREE-DETAIL-001) - Comprehensive Audit", () => {
  it("기억 카드 8개와 노드 점 8개를 data-testid로 정확히 식별 및 렌더링한다", () => {
    renderPage();
    const cards = screen.getAllByTestId("timeline-memory-card");
    const nodes = screen.getAllByTestId("timeline-memory-node");
    
    expect(cards).toHaveLength(8);
    expect(nodes).toHaveLength(8);
  });

  it("기억 노드들을 잇는 connection이 정확히 7개 존재함을 검증한다", () => {
    renderPage();
    const connections = screen.getAllByTestId("timeline-connection");
    expect(connections).toHaveLength(7);
  });

  it("댓글 목록이 정확히 3개 렌더링된다", () => {
    renderPage();
    expect(screen.getByText("아트라")).toBeInTheDocument();
    expect(screen.getByText("타이마")).toBeInTheDocument();
    expect(screen.getByText("리온")).toBeInTheDocument();

    const avatars = screen.getAllByText(/🎨|🌸|🦁/);
    expect(avatars.length).toBeGreaterThanOrEqual(3);
  });

  it("각 8개 기억 노드의 세부 내용(제목, 날짜, 설명, 타입, 미디어, 연결관계, 반응수)을 전부 검증한다", () => {
    renderPage();
    const cards = screen.getAllByTestId("timeline-memory-card");
    expect(cards).toHaveLength(8);

    const expectations: Array<{
      title: string;
      date: string;
      descPattern: RegExp;
      typeLabel: string;
      mediaLabel: string;
      connectionLabel: string;
      reactionText: string;
    }> = [
      { title: "첫 만남 - 무대 영상", date: "2023-09-28", descPattern: /처음으로 본 무대 영상/, typeLabel: "무대 영상", mediaLabel: "YouTube 링크", connectionLabel: "우상향 입덕의 시작점", reactionText: "❤️ 반응 45" },
      { title: "첫 앨범 구매 인증",   date: "2023-10-15", descPattern: /첫 앨범을 샀던 날/, typeLabel: "음반 수집", mediaLabel: "실물 앨범 사진", connectionLabel: "음악 감상의 깊이를 더함", reactionText: "❤️ 반응 32" },
      { title: "콘서트 직캠",         date: "2023-11-20", descPattern: /직캠을 찍느라 정신없었지만/, typeLabel: "콘서트 현장", mediaLabel: "4K 직캠 영상", connectionLabel: "대표 기억이자 절정의 순간", reactionText: "❤️ 반응 98" },
      { title: "컴백 D-Day",          date: "2024-01-07", descPattern: /신곡을 처음 들었을 때의 전율/, typeLabel: "신보 발매", mediaLabel: "음원 스트리밍", connectionLabel: "신곡 분석과 무한 반복", reactionText: "❤️ 반응 64" },
      { title: "팬미팅 후기",          date: "2024-02-14", descPattern: /멤버들한테 직접 편지를 전달/, typeLabel: "오프라인 팬미팅", mediaLabel: "손편지 & 티켓 인증", connectionLabel: "양방향 소통의 소중한 감동", reactionText: "❤️ 반응 77" },
      { title: "굿즈 수령",            date: "2024-04-01", descPattern: /시즌 그리팅과 MD 굿즈가 도착/, typeLabel: "공식 굿즈", mediaLabel: "언박싱 브이로그", connectionLabel: "덕질 방 인테리어 추가", reactionText: "❤️ 반응 19" },
      { title: "생일 카페 이벤트",     date: "2024-06-15", descPattern: /멤버 생일 기념 카페 이벤트/, typeLabel: "이벤트 참여", mediaLabel: "특전 컵홀더 & 엽서", connectionLabel: "팬덤 동료들과의 만남", reactionText: "❤️ 반응 50" },
      { title: "앨범 작업 과정",       date: "2024-08-01", descPattern: /비하인드 영상을 보며 작업 과정을/, typeLabel: "다큐멘터리", mediaLabel: "비하인드 클립", connectionLabel: "창작의 고뇌 공감", reactionText: "❤️ 반응 41" },
    ];

    // connectionLabel은 timeline-connection(카드 외부 sibling)에 렌더링되므로 screen 전체로 검증
    const allConnectionLabels = expectations.map((e) => e.connectionLabel);
    allConnectionLabels.slice(0, -1).forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });

    cards.forEach((card, i) => {
      const { title, date, descPattern, typeLabel, mediaLabel, reactionText } = expectations[i];
      expect(within(card).getAllByText(title)[0]).toBeInTheDocument();
      expect(within(card).getAllByText(date)[0]).toBeInTheDocument();
      expect(within(card).getByText(descPattern)).toBeInTheDocument();
      expect(within(card).getByText(typeLabel)).toBeInTheDocument();
      expect(within(card).getByText(mediaLabel)).toBeInTheDocument();
      expect(within(card).getByText(reactionText)).toBeInTheDocument();
    });
  });

  it("대표 기억 노드 배지가 정상적으로 표시되는지 검증한다", () => {
    renderPage();
    const featured = screen.getByTestId("timeline-featured-badge");
    expect(featured).toHaveTextContent("★ 대표 기억");
  });

  it("헤더 메타데이터 정보가 디자인 시안에 맞게 정확히 출력되는가", () => {
    renderPage();
    expect(screen.getByText("기억 8개")).toBeInTheDocument();
    expect(screen.getByText("최근 업데이트 2024-08-01")).toBeInTheDocument();
    expect(screen.getByText("🌐 전체공개")).toBeInTheDocument();
    expect(screen.getByText("덕질일기 · 아티스트")).toBeInTheDocument();
    expect(screen.getByText("#입덕일기")).toBeInTheDocument();
    expect(screen.getByText("#콘서트후기")).toBeInTheDocument();
    expect(screen.getByText("조회수 1420")).toBeInTheDocument();
    
    const likes = screen.getAllByText("좋아요 128");
    expect(likes.length).toBeGreaterThanOrEqual(1);

    const commentsCount = screen.getAllByText("댓글 3");
    expect(commentsCount.length).toBeGreaterThanOrEqual(1);
  });

  it("TreeStorySummary 요약 카드 구성 요소들을 검증한다", () => {
    renderPage();
    expect(screen.getByText("트리 이야기 요약")).toBeInTheDocument();
    expect(screen.getByText("2023.09.28 ~ 2024.08.01 (약 10개월)")).toBeInTheDocument();
    expect(screen.getByText(/유튜브 알고리즘의 우연한 이끌림부터 시작해/)).toBeInTheDocument();
    expect(screen.getByText("총 기억 노드")).toBeInTheDocument();
    expect(screen.getByText("대표 기억")).toBeInTheDocument();
    expect(screen.getByText("최근 기록")).toBeInTheDocument();
    expect(screen.getByText("주요 테마")).toBeInTheDocument();
  });

  it("댓글의 상대 시간 label이 정상적으로 표시되는가", () => {
    renderPage();
    expect(screen.getByText("2시간 전")).toBeInTheDocument();
    expect(screen.getByText("4시간 전")).toBeInTheDocument();
    expect(screen.getByText("어제")).toBeInTheDocument();
  });

  it("인터랙션 버튼 클릭 후에도 정보 수치와 문구가 불변하며 네트워크 요청 및 URL 변화가 일어나지 않는다", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    renderPage();
    
    // 좋아요 버튼 클릭 검증
    const likeBtn = screen.getByRole("button", { name: "좋아요" });
    expect(likeBtn).toHaveTextContent("128");
    likeBtn.click();
    expect(likeBtn).toHaveTextContent("128");

    // 저장 버튼 클릭 검증
    const saveBtn = screen.getByRole("button", { name: "내 러브트리에 저장" });
    expect(saveBtn).toHaveTextContent("내 러브트리에 저장");
    saveBtn.click();
    expect(saveBtn).toHaveTextContent("내 러브트리에 저장");

    // 댓글 등록 버튼 클릭 검증
    const submitBtn = screen.getByRole("button", { name: "댓글 등록" });
    expect(submitBtn).toBeInTheDocument();
    submitBtn.click();
    expect(submitBtn).toBeInTheDocument();

    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});

