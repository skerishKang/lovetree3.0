import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePublicDemoEditor } from "../context/PublicDemoEditorContext";
import {
  PUBLIC_DEMO_TREE_DESCRIPTION_MAX,
  PUBLIC_DEMO_TREE_TITLE_MAX,
} from "../types/publicDemoEditor";
import PublicDemoDialog from "./PublicDemoDialog";
import styles from "./PublicDemoEditor.module.css";

export default function EmptyTreeEditorPage() {
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

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (!title.trim()) return;
    updateTree({ title: title.trim(), description: description.trim() });
    navigate(continuePath);
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
    <div className={styles.page}>
      <header className={styles.siteHeader}>
        <Link to="/" className={styles.brand}>Relovetree</Link>
        <nav aria-label="공개 데모 메뉴" className={styles.headerNav}>
          <Link to="/">홈</Link>
          <Link to="/community">Community</Link>
        </nav>
      </header>

      <main className={styles.startMain}>
        <section className={styles.startCard} aria-labelledby="public-demo-start-title">
          <span className={styles.eyebrow}>브라우저 체험판 · 서버 저장 없음</span>
          <h1 id="public-demo-start-title">새 러브트리</h1>
          <p className={styles.lead}>
            로그인 없이 최대 12개의 기억을 연결하고 브라우저에 임시 저장해 보세요.
          </p>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
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
              <p id="public-tree-title-help" className={styles.fieldHelp}>
                {title.length} / {PUBLIC_DEMO_TREE_TITLE_MAX}
              </p>
              {titleInvalid && (
                <p id="public-tree-title-error" className={styles.errorText} role="alert">
                  러브트리 제목을 입력하세요.
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="public-tree-description">설명</label>
              <textarea
                id="public-tree-description"
                value={description}
                maxLength={PUBLIC_DEMO_TREE_DESCRIPTION_MAX}
                onChange={(event) => setDescription(event.target.value)}
                aria-describedby="public-tree-description-help"
              />
              <p id="public-tree-description-help" className={styles.fieldHelp}>
                {description.length} / {PUBLIC_DEMO_TREE_DESCRIPTION_MAX}
              </p>
            </div>

            <div className={styles.actionRow}>
              <button type="submit" className={styles.primaryButton}>
                {draft.nodes.length > 0 ? "기존 작업 이어가기" : "첫 기억 추가"}
              </button>
              {hasDraft && (
                <button type="button" className={styles.secondaryButton} onClick={() => setResetOpen(true)}>
                  전체 초기화
                </button>
              )}
            </div>
          </form>

          <div className={styles.draftSummary} aria-label="현재 임시 저장 상태">
            <strong>{draft.nodes.length} / 12 기억</strong>
            <span className={status === "저장 실패" ? styles.statusError : styles.saveStatus} role={status === "저장 실패" ? "alert" : "status"}>
              {status}
            </span>
          </div>
          {resetError && <p className={styles.errorText} role="alert">{resetError}</p>}
        </section>
      </main>

      {resetOpen && (
        <PublicDemoDialog
          title="공개 데모를 초기화할까요?"
          description="이 브라우저에 저장된 공개 데모 draft만 삭제합니다. 다른 저장 데이터는 건드리지 않습니다."
          onCancel={() => setResetOpen(false)}
        >
          <button type="button" className={styles.dangerButton} onClick={handleReset}>
            draft 완전 삭제
          </button>
        </PublicDemoDialog>
      )}
    </div>
  );
}
