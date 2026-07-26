import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { usePublicDemoEditor } from "../context/PublicDemoEditorContext";
import {
  PUBLIC_DEMO_EMOTIONS,
  PUBLIC_DEMO_MEMORY_MEMO_MAX,
  PUBLIC_DEMO_MEMORY_TITLE_MAX,
  PUBLIC_DEMO_MAX_NODES,
  type PublicDemoEmotion,
} from "../types/publicDemoEditor";
import { getParentCandidates } from "../utils/publicDemoGraph";
import { normalizeYouTubeUrl } from "../utils/youtube";
import YouTubeMedia from "./YouTubeMedia";
import styles from "./PublicDemoEditor.module.css";

interface FormErrors {
  tree?: string;
  title?: string;
  date?: string;
  emotion?: string;
  memo?: string;
  youtubeUrl?: string;
  parentId?: string;
  form?: string;
}

export default function PublicDemoMemoryFormPage() {
  const navigate = useNavigate();
  const { nodeId } = useParams();
  const { draft, addNode, updateNode } = usePublicDemoEditor();
  const editingNode = nodeId
    ? draft.nodes.find((node) => node.id === nodeId) ?? null
    : null;
  const isEdit = Boolean(nodeId);

  const [title, setTitle] = useState(editingNode?.title ?? "");
  const [date, setDate] = useState(editingNode?.date ?? "");
  const [emotion, setEmotion] = useState<PublicDemoEmotion | "">(editingNode?.emotion ?? "");
  const [memo, setMemo] = useState(editingNode?.memo ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(editingNode?.youtubeUrl ?? "");
  const [parentId, setParentId] = useState(editingNode?.parentId ?? draft.selectedNodeId ?? "");
  const [urlTouched, setUrlTouched] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!editingNode) return;
    setTitle(editingNode.title);
    setDate(editingNode.date);
    setEmotion(editingNode.emotion);
    setMemo(editingNode.memo);
    setYoutubeUrl(editingNode.youtubeUrl);
    setParentId(editingNode.parentId ?? "");
  }, [editingNode]);

  const normalized = useMemo(() => normalizeYouTubeUrl(youtubeUrl), [youtubeUrl]);
  const needsParent = draft.nodes.length > 0 && !(isEdit && editingNode?.parentId === null);
  const parentCandidates = isEdit && editingNode
    ? getParentCandidates(draft.nodes, editingNode.id)
    : draft.nodes;

  if (isEdit && !editingNode) {
    return (
      <main className={styles.notFoundPage}>
        <h1>기억을 찾을 수 없습니다</h1>
        <p role="alert">요청한 기억이 현재 공개 데모 draft에 없습니다.</p>
        <Link to="/tree/new-demo/edit" className={styles.primaryButton}>에디터로 돌아가기</Link>
      </main>
    );
  }

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!draft.tree.title.trim()) nextErrors.tree = "러브트리 제목을 먼저 입력하세요.";
    if (!title.trim()) nextErrors.title = "기억 제목을 입력하세요.";
    if (!date) nextErrors.date = "날짜를 입력하세요.";
    if (!emotion) nextErrors.emotion = "감정을 선택하세요.";
    if (!memo.trim()) nextErrors.memo = "메모를 입력하세요.";
    if (!youtubeUrl.trim()) nextErrors.youtubeUrl = "YouTube URL을 입력하세요.";
    else if (!normalized) nextErrors.youtubeUrl = "지원되는 공개 YouTube 영상 URL을 입력하세요.";
    if (needsParent && !parentId) nextErrors.parentId = "부모 기억을 선택하세요.";
    if (!isEdit && draft.nodes.length >= PUBLIC_DEMO_MAX_NODES) {
      nextErrors.form = "기억은 최대 12개까지 추가할 수 있습니다.";
    }
    setErrors(nextErrors);
    setUrlTouched(true);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!validate() || !normalized || !emotion) return;

    const input = {
      parentId: isEdit && editingNode?.parentId === null
        ? null
        : draft.nodes.length === 0
          ? null
          : parentId || null,
      title: title.trim(),
      date,
      emotion,
      memo: memo.trim(),
      youtubeUrl: normalized.watchUrl,
      videoId: normalized.videoId,
    };

    const result = isEdit && editingNode
      ? updateNode(editingNode.id, input)
      : addNode(input);

    if (!result.ok) {
      setErrors((current) => ({ ...current, form: result.reason ?? "기억을 저장하지 못했습니다." }));
      return;
    }
    navigate("/tree/new-demo/edit");
  };

  return (
    <div className={styles.page}>
      <header className={styles.simpleHeader}>
        <Link to="/tree/new-demo/edit" className={styles.brand}>Relovetree</Link>
        <span>공개 데모 · 브라우저 임시 저장</span>
      </header>
      <main className={styles.formPage}>
        <section className={styles.formCard}>
          <h1>{isEdit ? "기억 편집" : draft.nodes.length === 0 ? "첫 기억 추가" : "새 기억 추가"}</h1>
          <p className={styles.lead}>
            실제 공개 YouTube URL을 입력하면 저장 전에 썸네일을 확인할 수 있습니다.
          </p>

          {errors.tree && <p className={styles.errorText} role="alert">{errors.tree}</p>}
          {errors.form && <p className={styles.errorText} role="alert">{errors.form}</p>}

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <label htmlFor="memory-title">기억 제목</label>
              <input
                id="memory-title"
                value={title}
                maxLength={PUBLIC_DEMO_MEMORY_TITLE_MAX}
                required
                onChange={(event) => setTitle(event.target.value)}
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? "memory-title-error" : "memory-title-help"}
              />
              <p id="memory-title-help" className={styles.fieldHelp}>{title.length} / {PUBLIC_DEMO_MEMORY_TITLE_MAX}</p>
              {errors.title && <p id="memory-title-error" className={styles.errorText} role="alert">{errors.title}</p>}
            </div>

            <div className={styles.twoColumnFields}>
              <div className={styles.field}>
                <label htmlFor="memory-date">날짜</label>
                <input
                  id="memory-date"
                  type="date"
                  value={date}
                  required
                  onChange={(event) => setDate(event.target.value)}
                  aria-invalid={Boolean(errors.date)}
                  aria-describedby={errors.date ? "memory-date-error" : undefined}
                />
                {errors.date && <p id="memory-date-error" className={styles.errorText} role="alert">{errors.date}</p>}
              </div>
              <div className={styles.field}>
                <label htmlFor="memory-emotion">감정</label>
                <select
                  id="memory-emotion"
                  value={emotion}
                  required
                  onChange={(event) => setEmotion(event.target.value as PublicDemoEmotion | "")}
                  aria-invalid={Boolean(errors.emotion)}
                  aria-describedby={errors.emotion ? "memory-emotion-error" : undefined}
                >
                  <option value="">감정 선택</option>
                  {PUBLIC_DEMO_EMOTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                {errors.emotion && <p id="memory-emotion-error" className={styles.errorText} role="alert">{errors.emotion}</p>}
              </div>
            </div>

            {needsParent ? (
              <div className={styles.field}>
                <label htmlFor="memory-parent">부모 기억</label>
                <select
                  id="memory-parent"
                  value={parentId}
                  required
                  onChange={(event) => setParentId(event.target.value)}
                  aria-invalid={Boolean(errors.parentId)}
                  aria-describedby={errors.parentId ? "memory-parent-error" : "memory-parent-help"}
                >
                  <option value="">부모 기억 선택</option>
                  {parentCandidates.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>{candidate.title}</option>
                  ))}
                </select>
                <p id="memory-parent-help" className={styles.fieldHelp}>자기 자신과 모든 하위 기억은 후보에서 제외됩니다.</p>
                {errors.parentId && <p id="memory-parent-error" className={styles.errorText} role="alert">{errors.parentId}</p>}
              </div>
            ) : (
              <p className={styles.rootNotice}>이 기억은 러브트리의 유일한 루트로 유지됩니다.</p>
            )}

            <div className={styles.field}>
              <label htmlFor="memory-memo">메모</label>
              <textarea
                id="memory-memo"
                value={memo}
                maxLength={PUBLIC_DEMO_MEMORY_MEMO_MAX}
                required
                onChange={(event) => setMemo(event.target.value)}
                aria-invalid={Boolean(errors.memo)}
                aria-describedby={errors.memo ? "memory-memo-error" : "memory-memo-help"}
              />
              <p id="memory-memo-help" className={styles.fieldHelp}>{memo.length} / {PUBLIC_DEMO_MEMORY_MEMO_MAX}</p>
              {errors.memo && <p id="memory-memo-error" className={styles.errorText} role="alert">{errors.memo}</p>}
            </div>

            <div className={styles.field}>
              <label htmlFor="memory-youtube-url">YouTube URL</label>
              <input
                id="memory-youtube-url"
                type="url"
                value={youtubeUrl}
                required
                placeholder="https://www.youtube.com/watch?v=..."
                onBlur={() => setUrlTouched(true)}
                onChange={(event) => {
                  setYoutubeUrl(event.target.value);
                  setErrors((current) => ({ ...current, youtubeUrl: undefined }));
                }}
                aria-invalid={Boolean(errors.youtubeUrl || (urlTouched && youtubeUrl && !normalized))}
                aria-describedby="memory-youtube-help memory-youtube-error"
              />
              <p id="memory-youtube-help" className={styles.fieldHelp}>YouTube watch, youtu.be, shorts, embed, nocookie embed URL만 허용합니다.</p>
              {(errors.youtubeUrl || (urlTouched && youtubeUrl && !normalized)) && (
                <p id="memory-youtube-error" className={styles.errorText} role="alert">
                  {errors.youtubeUrl ?? "지원되는 공개 YouTube 영상 URL이 아닙니다."}
                </p>
              )}
            </div>

            {normalized && (
              <section className={styles.mediaValidation} aria-label="YouTube 미리보기">
                <h2>저장 전 미디어 확인</h2>
                <YouTubeMedia youtubeUrl={normalized.watchUrl} title={title.trim() || "새 기억"} />
              </section>
            )}

            <div className={styles.actionRow}>
              <button type="submit" className={styles.primaryButton}>{isEdit ? "변경 저장" : "기억 저장"}</button>
              <Link to="/tree/new-demo/edit" className={styles.secondaryButton}>취소</Link>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
