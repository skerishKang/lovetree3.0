import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  PublicDemoEditorProvider,
  usePublicDemoEditor,
} from "../context/PublicDemoEditorContext";
import { SIDEBAR_MENU_ITEMS } from "../data/emptyTreeEditorMockData";
import {
  PUBLIC_DEMO_TREE_DESCRIPTION_MAX,
  PUBLIC_DEMO_TREE_TITLE_MAX,
} from "../types/publicDemoEditor";
import PublicDemoDialog from "./PublicDemoDialog";
import editorStyles from "./EmptyTreeEditorPage.module.css";
import formStyles from "./PublicDemoEditor.module.css";

interface EmptyTreeEditorPageProps {
  sharedProvider?: boolean;
}

function EmptyTreeEditorContent() {
  const navigate = useNavigate();
  const { draft, status, updateTree, resetDraft } = usePublicDemoEditor();
  const [title, setTitle] = useState(draft.tree.title);
  const [description, setDescription] = useState(draft.tree.description);
  const [submitted, setSubmitted] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetError, setResetError] = useState("");

  useEffect(() => {
    setTitle(draft.tree.title);
    setDescription(draft.tree.description);
  }, [draft.tree.description, draft.tree.title]);

  const hasDraft = Boolean(draft.tree.title.trim() || draft.nodes.length > 0);
  const titleInvalid = submitted && title.trim().length === 0;
  const continuePath = draft.nodes.length > 0
    ? "/tree/new-demo/edit"
    : "/tree/new-demo/memory/new";

  const continueDraft = () => {
    setSubmitted(true);
    if (!title.trim()) return;
    updateTree({ title: title.trim(), description: description.trim() });
    navigate(continuePath);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    continueDraft();
  };

  const handleReset = () => {
    const result = resetDraft();
    setResetOpen(false);
    if (!result.ok) {
      setResetError(result.reason ?? "초기화하지 못했습니다.");
      return;
    }
    setTitle("");
    setDescription("");
    setSubmitted(false);
    setResetError("");
  };

  return (
    <div className={editorStyles.page}>
      <aside className={editorStyles.sidebar}>
        <div className={editorStyles.brandArea}>
          <span className={editorStyles.brandIcon} aria-hidden="true">🌿</span>
          <span className={editorStyles.brandName}>LoveTree</span>
        </div>

        <nav className={editorStyles.menuNav} aria-label="에디터 메뉴">
          <ul className={editorStyles.menuList}>
            {SIDEBAR_MENU_ITEMS.map((item) => {
              const handleClick = () => {
                if (item.id === "my-trees") navigate("/my-trees");
                else if (item.id === "explore") navigate("/");
                else if (item.id === "settings") navigate("/settings/visibility-demo");
              };
              return (
                <li key={item.id} className={editorStyles.menuItem}>
                  <button
                    type="button"
                    className={`${editorStyles.menuButton} ${
                      item.active ? editorStyles.menuButtonActive : ""
                    }`}
                    aria-current={item.active ? "page" : undefined}
                    onClick={handleClick}
                  >
                    <span className={editorStyles.menuIcon} aria-hidden="true">{item.icon}</span>
                    <span className={editorStyles.menuLabel}>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={editorStyles.profileSection} aria-label="사용자 프로필">
          <div className={editorStyles.avatar} aria-hidden="true">
            <span className={editorStyles.avatarInitial}>U</span>
          </div>
          <div className={editorStyles.profileMeta}>
            <span className={editorStyles.profileName}>공개 데모</span>
            <span className={editorStyles.profileBadge}>브라우저 저장</span>
          </div>
        </div>
      </aside>

      <main className={editorStyles.mainArea}>
        <header className={editorStyles.contextHeader}>
          <div className={editorStyles.contextInfo}>
            <span className={editorStyles.contextIcon} aria-hidden="true">📝</span>
            <span className={editorStyles.contextLabel}>새 러브트리 작업공간</span>
          </div>
          <span className={editorStyles.contextStatus}>{status}</span>
        </header>

        <div className={editorStyles.canvasSurface}>
          <section className={editorStyles.onboardingCard} aria-labelledby="new-tree-heading">
            <div className={editorStyles.decorativeRootAnchor} aria-hidden="true">
              <svg width="220" height="130" viewBox="0 0 220 130" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                <line x1="20" y1="110" x2="200" y2="110" stroke="#e8dfd5" strokeWidth="1.5" strokeDasharray="4 4" />
                <circle cx="110" cy="110" r="10" fill="#ffffff" stroke="#8a7a6a" strokeWidth="2.5" />
                <circle cx="110" cy="110" r="4" fill="#8a7a6a" />
                <path d="M110 100 Q80 80 65 50" stroke="#b8a99a" strokeWidth="2" strokeLinecap="round" fill="none" />
                <path d="M110 100 Q140 80 155 45" stroke="#b8a99a" strokeWidth="2" strokeLinecap="round" fill="none" />
                <path d="M110 100 L110 32" stroke="#8a7a6a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <circle cx="65" cy="50" r="5" fill="#d4c9bd" stroke="#8a7a6a" strokeWidth="1.5" />
                <circle cx="110" cy="32" r="7" fill="#b8a99a" stroke="#8a7a6a" strokeWidth="1.5" />
                <circle cx="155" cy="45" r="5" fill="#d4c9bd" stroke="#8a7a6a" strokeWidth="1.5" />
              </svg>
            </div>

            <span className={formStyles.eyebrow}>브라우저 체험판 · 서버 저장 없음</span>
            <h1 id="new-tree-heading" className={editorStyles.heading}>새 러브트리</h1>
            <p className={editorStyles.description}>첫 순간을 추가해 러브트리를 시작하세요</p>

            <div className={editorStyles.onboardingGuide}>
              <span className={editorStyles.guideTag}>온보딩 팁</span>
              <p className={editorStyles.guideText}>
                로그인 없이 최대 12개의 기억을 연결하고 이 브라우저에 임시 저장합니다.
              </p>
            </div>

            <form className={formStyles.form} onSubmit={handleSubmit} noValidate>
              <div className={formStyles.field}>
                <label htmlFor="public-tree-title">러브트리 제목</label>
                <input
                  id="public-tree-title"
                  value={title}
                  maxLength={PUBLIC_DEMO_TREE_TITLE_MAX}
                  onChange={(event) => setTitle(event.target.value)}
                  aria-invalid={titleInvalid}
                  aria-describedby={titleInvalid ? "public-tree-title-error" : "public-tree-title-help"}
                  required
                />
                <p id="public-tree-title-help" className={formStyles.fieldHelp}>
                  {title.length} / {PUBLIC_DEMO_TREE_TITLE_MAX}
                </p>
                {titleInvalid && (
                  <p id="public-tree-title-error" className={formStyles.errorText} role="alert">
                    러브트리 제목을 입력하세요.
                  </p>
                )}
              </div>

              <div className={formStyles.field}>
                <label htmlFor="public-tree-description">설명</label>
                <textarea
                  id="public-tree-description"
                  value={description}
                  maxLength={PUBLIC_DEMO_TREE_DESCRIPTION_MAX}
                  onChange={(event) => setDescription(event.target.value)}
                  aria-describedby="public-tree-description-help"
                />
                <p id="public-tree-description-help" className={formStyles.fieldHelp}>
                  {description.length} / {PUBLIC_DEMO_TREE_DESCRIPTION_MAX}
                </p>
              </div>

              <button type="submit" className={editorStyles.primaryCta}>
                {draft.nodes.length > 0 ? "기존 작업 이어가기" : "첫 순간 추가"}
              </button>
              <button type="button" className={editorStyles.mediaSearchBtn} aria-label="미디어 찾기" onClick={continueDraft}>
                미디어 찾기
              </button>
              {hasDraft && (
                <button type="button" className={formStyles.secondaryButton} onClick={() => setResetOpen(true)}>
                  전체 초기화
                </button>
              )}
            </form>

            <div className={formStyles.draftSummary} aria-label="현재 임시 저장 상태">
              <strong>{draft.nodes.length} / 12 기억</strong>
              <span role={status === "저장 실패" ? "alert" : "status"}>{status}</span>
            </div>
            {resetError && <p className={formStyles.errorText} role="alert">{resetError}</p>}
          </section>
        </div>
      </main>

      {resetOpen && (
        <PublicDemoDialog
          title="공개 데모를 초기화할까요?"
          description="이 브라우저의 공개 데모 draft만 삭제하며 다른 localStorage key는 보존합니다."
          onCancel={() => setResetOpen(false)}
        >
          <button type="button" className={formStyles.dangerButton} onClick={handleReset}>
            draft 완전 삭제
          </button>
        </PublicDemoDialog>
      )}
    </div>
  );
}

export default function EmptyTreeEditorPage({ sharedProvider = false }: EmptyTreeEditorPageProps) {
  if (sharedProvider) return <EmptyTreeEditorContent />;
  return (
    <PublicDemoEditorProvider>
      <EmptyTreeEditorContent />
    </PublicDemoEditorProvider>
  );
}
