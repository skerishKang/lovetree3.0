import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { useMyTrees } from "../hooks/useMyTrees";
import type { OwnerTreeSummary } from "../types/myTrees";
import styles from "./MyTreesPage.module.css";

function TreeCard({ tree }: { tree: OwnerTreeSummary }) {
  const date = tree.updatedAt && Number.isFinite(Date.parse(tree.updatedAt))
    ? new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "short", day: "numeric" }).format(new Date(tree.updatedAt))
    : tree.createdAt && Number.isFinite(Date.parse(tree.createdAt))
      ? new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "short", day: "numeric" }).format(new Date(tree.createdAt))
      : null;

  return (
    <li className={styles.treeListItem}>
      <article className={styles.treeCard} aria-labelledby={`my-tree-title-${tree.id}`}>
        <div className={styles.cardBody}>
          <div className={styles.cardHeader}>
            <h3 id={`my-tree-title-${tree.id}`} className={styles.treeTitle}>{tree.title}</h3>
            <span className={`${styles.visibilityBadge} ${tree.visibility === "public" ? styles.visibilityPublic : styles.visibilityPrivate}`}>
              {tree.visibility === "public" ? "공개" : "비공개"}
            </span>
          </div>

          <dl className={styles.cardMeta}>
            {tree.memoryCount !== undefined ? (
              <div className={styles.metaItem}>
                <dt className={styles.metaLabel}>기억</dt>
                <dd className={styles.metaValue}>{tree.memoryCount}개</dd>
              </div>
            ) : null}
            {tree.groupName ? (
              <div className={styles.metaItem}>
                <dt className={styles.metaLabel}>그룹</dt>
                <dd className={styles.metaValue}>{tree.groupName}</dd>
              </div>
            ) : null}
            {date ? (
              <div className={styles.metaItem}>
                <dt className={styles.metaLabel}>업데이트</dt>
                <dd className={styles.metaValue}>{date}</dd>
              </div>
            ) : null}
          </dl>

          {tree.keywords && tree.keywords.length > 0 ? (
            <div className={styles.keywords}>
              {tree.keywords.map((kw) => <span key={kw} className={styles.keyword}>{kw}</span>)}
            </div>
          ) : null}

          <div className={styles.cardStats}>
            {tree.likeCount !== undefined ? (
              <span className={styles.statItem}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                  <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 000-7.8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                </svg>
                <span>{tree.likeCount}</span>
              </span>
            ) : null}
            {tree.viewCount !== undefined ? (
              <span className={styles.statItem}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                </svg>
                <span>{tree.viewCount}</span>
              </span>
            ) : null}
          </div>

          <div className={styles.cardActions}>
            {tree.visibility === "public" ? (
              <Link to={`/tree/${encodeURIComponent(tree.id)}`} className={styles.cardActionButton}>
                공개 화면 보기
              </Link>
            ) : null}
            <button type="button" className={styles.cardActionButton} disabled aria-label={`${tree.title} 편집 연결 준비 중`}>
              편집 연결 준비 중
            </button>
          </div>
        </div>
      </article>
    </li>
  );
}

export default function MyTreesPage() {
  const { items, status, error, retry } = useMyTrees();
  const auth = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as Record<string, unknown> | null;
  const successTitle = state?.createSuccess === true && typeof state?.treeTitle === "string"
    ? state.treeTitle
    : undefined;
  const clearedRef = useRef(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const logoutPendingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (successTitle && !clearedRef.current) {
      clearedRef.current = true;
      const id = setTimeout(() => {
        navigate(location.pathname, { replace: true, state: {} });
      }, 0);
      return () => clearTimeout(id);
    }
  }, [successTitle, navigate, location.pathname]);

  const handleLogout = async () => {
    if (!auth?.user || logoutPendingRef.current) {
      return;
    }

    logoutPendingRef.current = true;
    setLogoutPending(true);
    setLogoutError(null);

    try {
      await auth.signOut();
      if (!mountedRef.current) return;
      navigate("/login", { replace: true });
    } catch {
      if (!mountedRef.current) return;
      setLogoutError("로그아웃에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      logoutPendingRef.current = false;
      if (mountedRef.current) {
        setLogoutPending(false);
      }
    }
  };

  return (
    <div className={styles.page}>
      {successTitle ? (
        <div className={styles.successBanner} role="status">
          <p>{successTitle} 러브트리를 만들었습니다.</p>
        </div>
      ) : null}
      <header className={styles.topBar}>
        <div className={styles.brandArea}>
          <span className={styles.logo}>LoveTree</span>
        </div>
        <div className={styles.topBarRight}>
          <button
            type="button"
            className={styles.profileButton}
            aria-label="로그아웃"
            title="로그아웃"
            onClick={handleLogout}
            disabled={logoutPending}
            aria-busy={logoutPending || undefined}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
              <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          {logoutError ? (
            <span role="status" aria-live="polite" className={styles.logoutError}>
              {logoutError}
            </span>
          ) : null}
        </div>
      </header>

      <section className={styles.intro}>
        <div className={styles.introMain}>
          <h1 className={styles.pageTitle}>나의 러브트리</h1>
          <p className={styles.pageDescription}>지금까지 이어온 기억의 흐름을 한 곳에서 돌아보세요.</p>
        </div>
        <button type="button" className={styles.newTreeButton} onClick={() => navigate("/tree/new")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>새 러브트리 만들기</span>
        </button>
      </section>

      {status === "loading" ? (
        <div className={styles.stateMessage} role="status">
          <p>내 러브트리를 불러오고 있어요</p>
        </div>
      ) : status === "retrying" ? (
        <div className={styles.stateMessage} role="status">
          <p>내 러브트리를 다시 불러오고 있어요</p>
        </div>
      ) : status === "unauthorized" ? (
        <div className={styles.stateMessage} role="status">
          <p>세션을 다시 확인하고 있어요. 로그인 화면으로 이동합니다.</p>
        </div>
      ) : status === "server-error" ? (
        <div className={styles.stateMessage} role="alert">
          <p>서버에서 트리 목록을 불러오지 못했습니다.</p>
          <button type="button" className={styles.retryButton} onClick={retry}>다시 시도</button>
        </div>
      ) : status === "network-error" ? (
        <div className={styles.stateMessage} role="alert">
          <p>네트워크 오류로 트리 목록을 불러오지 못했습니다.</p>
          <button type="button" className={styles.retryButton} onClick={retry}>다시 시도</button>
        </div>
      ) : status === "malformed" ? (
        <div className={styles.stateMessage} role="alert">
          <p>{error}</p>
          <button type="button" className={styles.retryButton} onClick={retry}>다시 시도</button>
        </div>
      ) : status === "forbidden" ? (
        <div className={styles.stateMessage} role="alert">
          <p>접근 권한이 없습니다.</p>
          <button type="button" className={styles.retryButton} onClick={retry}>다시 시도</button>
        </div>
      ) : status === "empty" ? (
        <div className={styles.emptyState}>
          <p>아직 만든 러브트리가 없습니다.</p>
          <div className={styles.emptyActions}>
            <button type="button" className={styles.primaryCta} onClick={() => navigate("/tree/new")}>
              새 러브트리 만들기
            </button>
            <Link to="/community" className={styles.secondaryCta}>
              다른 팬들 트리 구경하기
            </Link>
          </div>
        </div>
      ) : (
        <div className={styles.contentGrid}>
          <section className={styles.treeListSection} aria-label="나의 러브트리">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>나의 러브트리</h2>
              <span className={styles.treeCountBadge}>총 {items.length}개</span>
            </div>
            <ul className={styles.treeList}>
              {items.map((tree) => <TreeCard key={tree.id} tree={tree} />)}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
