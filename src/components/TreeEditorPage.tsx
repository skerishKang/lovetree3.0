import { MOCK_TREE_EDITOR } from "../data/treeEditorMockData";
import styles from "./TreeEditorPage.module.css";

export default function TreeEditorPage() {
  const data = MOCK_TREE_EDITOR;
  const selectedMemory = data.memories.find(
    (m) => m.id === data.selectedMemoryId,
  )!;

  return (
    <div className={styles.page}>
      {/* 상단 헤더 */}
      <header className={styles.topBar}>
        <button type="button" className={styles.iconButton} aria-label="뒤로 가기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className={styles.pageTitle}>{data.screenTitle}</h1>
        <div className={styles.topBarRight}>
          <button type="button" className={styles.secondaryButton}>미리보기</button>
          <button type="button" className={styles.secondaryButton}>저장</button>
          <button type="button" className={styles.primaryButton}>게시하기</button>
        </div>
      </header>

      {/* 편집기 본문 */}
      <div className={styles.editorContent}>
        {/* 왼쪽: 캔버스 영역 */}
        <section className={styles.canvasSection} aria-label="기억 캔버스">
          {/* 트리 제목 */}
          <div className={styles.treeTitleArea}>
            <div className={styles.treeTitleInputWrapper}>
              <label htmlFor="tree-title-input" className={styles.inputLabel}>러브트리 제목</label>
              <input
                id="tree-title-input"
                className={styles.treeTitleInput}
                defaultValue={data.treeTitle}
                readOnly
              />
            </div>
            <div className={styles.treeTitleInputWrapper}>
              <label htmlFor="tree-desc-input" className={styles.inputLabel}>설명</label>
              <input
                id="tree-desc-input"
                className={styles.treeDescInput}
                defaultValue={data.treeDescription}
                readOnly
              />
            </div>
            <span className={`${styles.visibilityBadge} ${
              data.visibility === "public" ? styles.visibilityPublic : styles.visibilityPrivate
            }`}>
              {data.visibility === "public" ? "공개" : "비공개"}
            </span>
          </div>

          {/* 기억 카드 목록 */}
          <div className={styles.canvasWrapper}>
            <ul className={styles.canvasCardList}>
              {data.memories.map((mem) => {
                const isSelected = mem.id === data.selectedMemoryId;
                return (
                  <li key={mem.id} className={styles.canvasCardItem}>
                    <article
                      className={`${styles.memoryCard} ${isSelected ? styles.memoryCardSelected : ""}`}
                      aria-labelledby={`editor-mem-title-${mem.id}`}
                      data-selected={isSelected ? "true" : "false"}
                      aria-current={isSelected ? "true" : undefined}
                    >
                      <div
                        className={`${styles.memThumb} ${styles[`thumb_${mem.thumbnailColorKey}`]}`}
                        aria-hidden="true"
                      />
                      <div className={styles.memBody}>
                        <h3
                          id={`editor-mem-title-${mem.id}`}
                          className={styles.memTitle}
                        >
                          {mem.title}
                        </h3>
                        <span className={styles.memDate}>{mem.date}</span>
                        <p className={styles.memDescription}>{mem.description}</p>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
            <button type="button" className={styles.addMemoryButton}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>기억 추가</span>
            </button>
          </div>
        </section>

        {/* 오른쪽: 상세 패널 */}
        <aside className={styles.detailPanel} aria-label="선택한 기억 상세">
          <div className={styles.detailHeader}>
            <h2 className={styles.detailTitle}>{selectedMemory.title}</h2>
          </div>
          <div
            className={`${styles.detailThumb} ${styles[`thumb_${selectedMemory.thumbnailColorKey}`]}`}
            aria-hidden="true"
          />
          <div className={styles.detailInfo}>
            <div className={styles.detailField}>
              <label htmlFor="mem-date-input" className={styles.detailLabel}>날짜</label>
              <input
                id="mem-date-input"
                className={styles.detailInput}
                defaultValue={selectedMemory.date}
                readOnly
              />
            </div>
            <div className={styles.detailField}>
              <label htmlFor="mem-memo-input" className={styles.detailLabel}>메모</label>
              <textarea
                id="mem-memo-input"
                className={styles.detailTextarea}
                defaultValue={selectedMemory.description}
                readOnly
              />
            </div>
            <div className={styles.detailTags}>
              {selectedMemory.tags.map((tag, i) => (
                <span key={i} className={styles.tag}>{tag}</span>
              ))}
            </div>
          </div>
          <div className={styles.detailActions}>
            <button
              type="button"
              className={styles.detailActionButton}
              aria-label={`${selectedMemory.title} 편집`}
            >
              편집
            </button>
            <button
              type="button"
              className={styles.detailActionButton}
              aria-label={`${selectedMemory.title} 삭제`}
            >
              삭제
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
