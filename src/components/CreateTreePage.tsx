import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateTree } from "../hooks/useCreateTree";
import styles from "./CreateTreePage.module.css";

const MAX_TITLE_LENGTH = 80;

export default function CreateTreePage() {
  const { status, error, created, submit } = useCreateTree();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [localError, setLocalError] = useState<string | null>(null);
  const submitting = status === "submitting";
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "idle" && created) {
      navigate("/my-trees", {
        replace: true,
        state: { createSuccess: true, treeTitle: created.title },
      });
    }
  }, [status, created, navigate]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);
    const trimmed = title.trim();
    if (!trimmed) {
      setLocalError("러브트리 제목을 입력해 주세요.");
      inputRef.current?.focus();
      return;
    }
    if (trimmed.length > MAX_TITLE_LENGTH) {
      setLocalError(`제목은 최대 ${MAX_TITLE_LENGTH}자까지 입력할 수 있습니다.`);
      inputRef.current?.focus();
      return;
    }
    submit({ title: trimmed, visibility });
  }

  const fieldError = localError || (status === "validation-error" ? error : null);
  const showForm = status !== "unauthorized" && status !== "ambiguous" && status !== "malformed";
  const showUnauthorized = status === "unauthorized";
  const showAmbiguous = status === "ambiguous" || status === "malformed";

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <div className={styles.brandArea}>
          <span className={styles.logo}>LoveTree</span>
        </div>
        <button type="button" className={styles.cancelButton} onClick={() => navigate("/my-trees")}>
          취소
        </button>
      </header>

      <main className={styles.layout}>
        <h1 className={styles.pageTitle}>새 러브트리 만들기</h1>
        <p className={styles.pageDescription}>계정에 실제 러브트리를 만듭니다.</p>

        {showUnauthorized ? (
          <div className={styles.stateMessage} role="status">
            <p>세션을 다시 확인하고 있어요. 로그인 화면으로 이동합니다.</p>
          </div>
        ) : showAmbiguous ? (
          <div className={styles.stateMessage} role="alert">
            <p>{error}</p>
            <button type="button" className={styles.actionButton} onClick={() => navigate("/my-trees")}>
              내 러브트리에서 확인
            </button>
          </div>
        ) : null}

        {showForm ? (
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.fieldGroup}>
              <label htmlFor="tree-title" className={styles.label}>러브트리 제목</label>
              <input
                id="tree-title"
                ref={inputRef}
                type="text"
                className={`${styles.textInput} ${fieldError ? styles.inputError : ""}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="러브트리 이름을 입력해 주세요"
                maxLength={MAX_TITLE_LENGTH + 1}
                disabled={submitting}
                autoFocus
              />
              <div className={styles.charCount}>{title.length}/{MAX_TITLE_LENGTH}</div>
              {fieldError ? <p className={styles.fieldError} role="alert">{fieldError}</p> : null}
            </div>

            <fieldset className={styles.fieldGroup} disabled={submitting}>
              <legend className={styles.label}>공개 범위</legend>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={visibility === "public"}
                    onChange={() => setVisibility("public")}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioText}>공개</span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={visibility === "private"}
                    onChange={() => setVisibility("private")}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioText}>비공개</span>
                </label>
              </div>
              {visibility === "private" ? (
                <p className={styles.visibilityNote}>비공개 저장은 계정 등급에 따라 제한될 수 있습니다.</p>
              ) : null}
            </fieldset>

            {status === "forbidden" ? (
              <div className={styles.inlineError} role="alert">
                <p>{error}</p>
              </div>
            ) : status === "conflict" ? (
              <div className={styles.inlineError} role="alert">
                <p>{error}</p>
              </div>
            ) : status === "too-large" ? (
              <div className={styles.inlineError} role="alert">
                <p>{error}</p>
              </div>
            ) : null}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting}
            >
              {submitting ? "저장 중..." : "러브트리 만들기"}
            </button>
          </form>
        ) : null}
      </main>
    </div>
  );
}
