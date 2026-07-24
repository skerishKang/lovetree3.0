import { Link, useNavigate } from "react-router-dom";
import { MOCK_TREE_EDITOR } from "../data/treeEditorMockData";
import type { TreeConnector } from "../data/treeEditorMockData";
import styles from "./TreeEditorPage.module.css";

function StraightConnector({ connector }: { connector: TreeConnector }) {
  return (
    <div
      className={styles.connectorBlock}
      aria-hidden="true"
      data-testid="connector"
      data-connector-id={connector.id}
      data-from-id={connector.fromId}
      data-to-id={connector.toId}
      data-highlighted={connector.highlighted ? "true" : "false"}
    >
      <svg viewBox="0 0 40 48" className={styles.connectorSvg} aria-hidden="true" focusable="false">
        <path
          d="M 20 0 C 20 16, 20 32, 20 48"
          fill="none"
          stroke={connector.highlighted ? "#5c4a3a" : "#c4b8a8"}
          strokeWidth={connector.highlighted ? 2.5 : 1.5}
          strokeDasharray={connector.highlighted ? "none" : "5 4"}
          strokeLinecap="round"
        />
        <circle
          cx="20" cy="0"
          r="3"
          fill={connector.highlighted ? "#5c4a3a" : "#fff"}
          stroke={connector.highlighted ? "#5c4a3a" : "#c4b8a8"}
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}

function BranchConnectorGroup({ leftConnector, rightConnector }: { leftConnector: TreeConnector; rightConnector: TreeConnector }) {
  return (
    <div className={styles.branchConnector} aria-hidden="true" data-testid="branch-connector">
      <div
        data-testid="connector"
        data-connector-id={leftConnector.id}
        data-from-id={leftConnector.fromId}
        data-to-id={leftConnector.toId}
        data-highlighted={leftConnector.highlighted ? "true" : "false"}
      >
        <svg viewBox="0 0 80 48" className={styles.branchSvg} aria-hidden="true" focusable="false">
          <path
            d="M 40 0 L 40 20 C 40 28, 20 28, 20 48"
            fill="none"
            stroke={leftConnector.highlighted ? "#5c4a3a" : "#c4b8a8"}
            strokeWidth={leftConnector.highlighted ? 2.5 : 1.5}
            strokeDasharray={leftConnector.highlighted ? "none" : "5 4"}
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div
        data-testid="connector"
        data-connector-id={rightConnector.id}
        data-from-id={rightConnector.fromId}
        data-to-id={rightConnector.toId}
        data-highlighted={rightConnector.highlighted ? "true" : "false"}
      >
        <svg viewBox="0 0 80 48" className={styles.branchSvg} aria-hidden="true" focusable="false">
          <path
            d="M 40 0 C 40 28, 60 28, 60 48"
            fill="none"
            stroke={rightConnector.highlighted ? "#5c4a3a" : "#c4b8a8"}
            strokeWidth={rightConnector.highlighted ? 2.5 : 1.5}
            strokeDasharray={rightConnector.highlighted ? "none" : "5 4"}
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}

export default function TreeEditorPage() {
  const navigate = useNavigate();
  const data = MOCK_TREE_EDITOR;
  const selectedMemory = data.memories.find(
    (m) => m.id === data.selectedMemoryId,
  )!;

  const memById = Object.fromEntries(data.memories.map((m) => [m.id, m]));
  const rootMem = data.memories.find((m) => m.parentId === null)!;

  const conn1 = data.connectors.find((c) => c.id === "conn-1")!;
  const conn2 = data.connectors.find((c) => c.id === "conn-2")!;
  const conn3 = data.connectors.find((c) => c.id === "conn-3")!;
  const conn4 = data.connectors.find((c) => c.id === "conn-4")!;

  const grandchildren = selectedMemory.childIds.flatMap((cid) => {
    const child = memById[cid];
    return child?.childIds.map((gcid) => memById[gcid]).filter(Boolean) ?? [];
  });

  return (
    <div className={styles.page}>
      {/* Left workspace navigation */}
      <nav className={styles.workspaceNav} aria-label="작업 공간 내비게이션">
        <div className={styles.brandArea}>
          <span className={styles.brandIcon} aria-hidden="true">🌿</span>
          <span className={styles.brandName}>Relovetree</span>
        </div>
        <div className={styles.navSearch}>
          <input
            type="text"
            className={styles.navSearchInput}
            placeholder="검색"
            readOnly
            aria-label="검색"
          />
        </div>
        <ul className={styles.navMenu}>
          <li className={styles.navItem}>
            <Link to="/" className={styles.navLink}>
              <span className={styles.navIcon} aria-hidden="true">🏠</span>
              <span>홈</span>
            </Link>
          </li>
          <li className={`${styles.navItem} ${styles.navItemActive}`}>
            <Link to="/my-trees" className={styles.navLink}>
              <span className={styles.navIcon} aria-hidden="true">🌳</span>
              <span>내 러브트리</span>
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link to="/settings/visibility-demo" className={styles.navLink}>
              <span className={styles.navIcon} aria-hidden="true">⚙️</span>
              <span>설정</span>
            </Link>
          </li>
        </ul>
        <button type="button" className={styles.newTreeButton} onClick={() => navigate("/tree/new-demo")}>
          새 러브트리 만들기
        </button>
      </nav>

      {/* Main editor area */}
      <div className={styles.editorMain}>
        {/* Top toolbar */}
        <header className={styles.toolbar}>
          <button type="button" className={styles.iconButton} aria-label="뒤로 가기">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className={styles.toolbarTitle}>{data.screenTitle}</h1>
          <span className={styles.toolbarTreeName}>{data.treeTitle}</span>
          <span className={`${styles.visibilityBadge} ${
            data.visibility === "public" ? styles.visPublic : styles.visPrivate
          }`}>
            {data.visibility === "public" ? "공개" : "비공개"}
          </span>
          <span className={styles.saveStatus}>자동 저장됨</span>
          <div className={styles.toolbarActions}>
            <button type="button" className={styles.secBtn} disabled>미리보기</button>
            <button type="button" className={styles.secBtn} disabled>저장</button>
            <button type="button" className={styles.priBtn} disabled>게시하기</button>
          </div>
        </header>

        <div className={styles.editorBody}>
          {/* Canvas area */}
          <section className={styles.canvas} aria-label="트리 캔버스">
            <div className={styles.canvasSearchBar}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                <circle cx="11" cy="11" r="8" stroke="#8a7a6a" strokeWidth="2" />
                <path d="M21 21l-4.35-4.35" stroke="#8a7a6a" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input type="text" placeholder="메모리 검색..." readOnly className={styles.canvasSearchInput} aria-label="메모리 검색" />
              <button type="button" className={styles.addMemBtn} onClick={() => navigate("/memory/connect-demo")}>
                <span aria-hidden="true">+</span> 메모리 추가
              </button>
              <button type="button" className={styles.mediaSearchBtn} aria-label="미디어 찾기" onClick={() => navigate("/media/search-demo")}>
                <span aria-hidden="true">🔍</span> 미디어 찾기
              </button>
            </div>

            {/* Tree structure */}
            <div className={styles.treeArea}>
              {/* Row 1: Root */}
              <div className={styles.treeRow}>
                <MemoryNodeCard memory={rootMem} isSelected={false} />
              </div>

              {/* conn-1: mem-1 → mem-2 */}
              <StraightConnector connector={conn1} />

              {/* Row 2: Selected node */}
              <div className={styles.treeRow}>
                <MemoryNodeCard memory={selectedMemory} isSelected={true} />
              </div>

              {/* Insert marker after selected */}
              <div className={styles.insertMarker} data-testid="insert-marker">
                <span className={styles.insertLine} />
                <span className={styles.insertLabel}>여기에 연결</span>
                <span className={styles.insertLine} />
              </div>

              {/* Branch connectors: conn-2 (mem-2→mem-3) highlighted + conn-3 (mem-2→mem-4) */}
              <BranchConnectorGroup leftConnector={conn2} rightConnector={conn3} />

              {/* Row 3: Children of selected */}
              <div className={styles.treeRowBranch}>
                <div className={styles.branchGroup} data-testid="branch-group">
                  {selectedMemory.childIds.map((cid) => {
                    const child = memById[cid];
                    if (!child) return null;
                    return                 <MemoryNodeCard key={child.id} memory={child} isSelected={false} to="/memory/detail-demo" />;
                  })}
                </div>
              </div>

              {/* conn-4: mem-4 → mem-5 */}
              {grandchildren.length > 0 && (
                <StraightConnector connector={conn4} />
              )}

              {/* Row 4: Grandchildren */}
              {grandchildren.length > 0 && (
                <div className={styles.treeRowBranch}>
                  <div className={styles.branchGroup}>
                      {grandchildren.map((gc) => (
                         <MemoryNodeCard key={gc!.id} memory={gc!} isSelected={false} to="/memory/detail-demo" />
                      ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Inspector panel */}
          <aside className={styles.inspector} aria-label="선택한 기억 상세">
            <div className={styles.inspectorHeader}>
              <button type="button" className={styles.iconButton} aria-label="뒤로 가기">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                  <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <h2 className={styles.inspectorTitle}>{selectedMemory.title}</h2>
            </div>

            {/* Media preview placeholder */}
            <div
              className={`${styles.mediaPreview} ${styles[`thumb_${selectedMemory.thumbnailColorKey}`]}`}
              aria-label={`${selectedMemory.mediaFormat} 미디어 미리보기`}
            >
              <div className={styles.playIcon} aria-hidden="true">▶</div>
              <div className={styles.mediaControls}>
                <span className={styles.mediaControlIcon}>▶</span>
                <span className={styles.mediaControlIcon}>🔊</span>
                <span className={styles.mediaControlIcon}>⚙️</span>
              </div>
            </div>

            <div className={styles.inspectorFields}>
              {/* Read-only fields */}
              <div className={styles.detailField}>
                <label htmlFor="editor-title-input" className={styles.fieldLabel}>러브트리 제목</label>
                <input
                  id="editor-title-input"
                  className={styles.detailInput}
                  defaultValue={data.treeTitle}
                  readOnly
                />
              </div>
              <div className={styles.detailField}>
                <label htmlFor="editor-desc-input" className={styles.fieldLabel}>설명</label>
                <input
                  id="editor-desc-input"
                  className={styles.detailInput}
                  defaultValue={data.treeDescription}
                  readOnly
                />
              </div>
              <div className={styles.detailField}>
                <label htmlFor="editor-date-input" className={styles.fieldLabel}>날짜</label>
                <input
                  id="editor-date-input"
                  className={styles.detailInput}
                  defaultValue={selectedMemory.date}
                  readOnly
                />
              </div>
              <div className={styles.detailField}>
                <label htmlFor="editor-memo-input" className={styles.fieldLabel}>메모</label>
                <textarea
                  id="editor-memo-input"
                  className={styles.detailTextarea}
                  defaultValue={selectedMemory.description}
                  readOnly
                />
              </div>

              {/* Metadata display */}
              <div className={styles.fieldRow}>
                <span className={styles.fieldLabel}>유형:</span>
                <span className={styles.fieldValue}>{selectedMemory.typeLabel}</span>
              </div>
              <div className={styles.fieldRow}>
                <span className={styles.fieldLabel}>미디어:</span>
                <span className={styles.fieldValue}>{selectedMemory.mediaFormat}</span>
              </div>
              <div className={styles.fieldRow}>
                <span className={styles.fieldLabel}>출처:</span>
                <span className={styles.fieldValue}>{selectedMemory.source}</span>
              </div>
              <div className={styles.fieldRow}>
                <span className={styles.fieldLabel}>길이:</span>
                <span className={styles.fieldValue}>{selectedMemory.duration}</span>
              </div>
              <div className={styles.fieldRow}>
                <span className={styles.fieldLabel}>태그:</span>
                <div className={styles.tagList}>
                  {selectedMemory.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              </div>

              {/* Connection context */}
              <div className={styles.connectionContext}>
                <h3 className={styles.connTitle}>연결 설정</h3>
                <p className={styles.connDesc} data-testid="connection-position">
                  {selectedMemory.parentId
                    ? `"${data.memories.find((m) => m.id === selectedMemory.parentId)?.title}"에서 이어지는 기억입니다.`
                    : "최상위 기억입니다."}
                </p>
                {selectedMemory.childIds.length > 0 && (
                  <p className={styles.connChild}>
                    이어지는 기억: {selectedMemory.childIds.map((cid) => {
                      const child = data.memories.find((m) => m.id === cid);
                      return child?.title;
                    }).filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
            </div>

            <div className={styles.inspectorActions}>
              <button type="button" className={styles.actionBtn} aria-label={`${selectedMemory.title} 편집`}>
                편집
              </button>
              <button type="button" className={styles.actionBtn} aria-label={`${selectedMemory.title} 삭제`}>
                삭제
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function MemoryNodeCard({ memory, isSelected, to }: { memory: { id: string; title: string; date: string; description: string; thumbnailColorKey: string; tags: string[]; typeLabel: string }; isSelected: boolean; to?: string }) {
  const content = (
    <>
      <div className={`${styles.memThumb} ${styles[`thumb_${memory.thumbnailColorKey}`]}`} aria-hidden="true">
        <span className={styles.memTypeBadge}>{memory.typeLabel}</span>
      </div>
      <div className={styles.memBody}>
        <h3 id={`editor-mem-title-${memory.id}`} className={styles.memTitle}>{memory.title}</h3>
        <time className={styles.memDate}>{memory.date}</time>
        <p className={styles.memDesc}>{memory.description}</p>
        <div className={styles.memTags}>
          {memory.tags.slice(0, 2).map((tag) => (
            <span key={tag} className={styles.memTag}>{tag}</span>
          ))}
        </div>
      </div>
      {isSelected && <span className={styles.selectedBadge} aria-hidden="true">선택됨</span>}
    </>
  );

  return (
    <article
      className={`${styles.memCard} ${isSelected ? styles.memCardSelected : ""}`}
      aria-labelledby={`editor-mem-title-${memory.id}`}
      data-selected={isSelected ? "true" : "false"}
      aria-current={isSelected ? "location" : undefined}
    >
      {to ? <Link to={to} className={styles.memCardLink}>{content}</Link> : content}
    </article>
  );
}
