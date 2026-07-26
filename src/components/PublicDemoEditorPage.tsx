import { useState, type MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePublicDemoEditor } from "../context/PublicDemoEditorContext";
import {
  PUBLIC_DEMO_MAX_NODES,
  PUBLIC_DEMO_TREE_DESCRIPTION_MAX,
  PUBLIC_DEMO_TREE_TITLE_MAX,
  type PublicDemoNode,
} from "../types/publicDemoEditor";
import {
  getChildren,
  getConnectors,
  getNodeDepth,
} from "../utils/publicDemoGraph";
import PublicDemoDialog from "./PublicDemoDialog";
import YouTubeMedia from "./YouTubeMedia";
import styles from "./PublicDemoEditor.module.css";

type DeleteMode = "leaf" | "children" | null;

export default function PublicDemoEditorPage() {
  const navigate = useNavigate();
  const {
    draft,
    status,
    selectedNode,
    updateTree,
    selectNode,
    deleteLeaf,
    deleteSubtree,
    deleteAndReattachChildren,
    resetDraft,
  } = usePublicDemoEditor();
  const [deleteMode, setDeleteMode] = useState<DeleteMode>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [activeError, setActiveError] = useState("");
  const connectors = getConnectors(draft.nodes);
  const titleInvalid = draft.tree.title.trim().length === 0;

  const handleDeleteRequest = () => {
    if (!selectedNode) return;
    const children = getChildren(draft.nodes, selectedNode.id);
    if (selectedNode.parentId === null && children.length > 0) {
      setActiveError("루트 기억의 하위 기억을 먼저 이동하거나 삭제해야 합니다.");
      return;
    }
    setActiveError("");
    setDeleteMode(children.length > 0 ? "children" : "leaf");
  };

  const finishDelete = (result: { ok: boolean; reason?: string }) => {
    setDeleteMode(null);
    if (!result.ok) {
      setActiveError(result.reason ?? "기억을 삭제하지 못했습니다.");
      return;
    }
    if (draft.nodes.length === 1) navigate("/tree/new-demo");
  };

  const handlePreview = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!titleInvalid) return;
    event.preventDefault();
    document.getElementById("editor-tree-title")?.focus();
  };

  const handleReset = () => {
    const result = resetDraft();
    if (!result.ok) {
      setActiveError(result.reason ?? "초기화하지 못했습니다.");
      return;
    }
    setResetOpen(false);
    setActiveError("");
    navigate("/tree/new-demo");
  };

  return (
    <div className={styles.page}>
      <header className={styles.editorHeader}>
        <Link to="/tree/new-demo" className={styles.brand}>Relovetree</Link>
        <div>
          <h1>공개 데모 러브트리 편집</h1>
          <p>브라우저 임시 저장 · 서버 게시 없음</p>
        </div>
        <div className={styles.headerActions}>
          <span className={status === "저장 실패" ? styles.statusError : styles.saveStatus} role={status === "저장 실패" ? "alert" : "status"}>
            {status}
          </span>
          <Link
            to="/tree/new-demo/preview"
            className={styles.secondaryButton}
            aria-disabled={titleInvalid}
            onClick={handlePreview}
          >
            미리보기
          </Link>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => {
              setActiveError("");
              setResetOpen(true);
            }}
          >
            전체 초기화
          </button>
          <button type="button" className={styles.disabledButton} disabled>게시하기 · 데모에서는 지원 안 함</button>
        </div>
      </header>

      <main className={styles.editorLayout}>
        <section className={styles.treePanel} aria-labelledby="public-demo-tree-panel-title">
          <div className={styles.panelHeading}>
            <div>
              <h2 id="public-demo-tree-panel-title">기억 연결 구조</h2>
              <p data-testid="node-count">{draft.nodes.length} / {PUBLIC_DEMO_MAX_NODES}</p>
            </div>
            <button
              type="button"
              className={styles.primaryButton}
              disabled={draft.nodes.length >= PUBLIC_DEMO_MAX_NODES}
              onClick={() => navigate("/tree/new-demo/memory/new")}
            >
              기억 추가
            </button>
          </div>

          {draft.nodes.length === 0 ? (
            <div className={styles.emptyState}>
              <p>아직 기억이 없습니다. 첫 기억이 자동으로 루트가 됩니다.</p>
              <button type="button" className={styles.primaryButton} onClick={() => navigate("/tree/new-demo/memory/new")}>첫 기억 추가</button>
            </div>
          ) : (
            <div className={styles.graph} aria-label="현재 러브트리 노드">
              {draft.nodes
                .slice()
                .sort((left, right) => {
                  const depthDifference = getNodeDepth(draft.nodes, left.id) - getNodeDepth(draft.nodes, right.id);
                  return depthDifference || left.date.localeCompare(right.date) || left.id.localeCompare(right.id);
                })
                .map((node) => {
                  const connector = connectors.find((item) => item.toId === node.id);
                  const depth = getNodeDepth(draft.nodes, node.id);
                  return (
                    <div key={node.id} className={styles.graphRow} style={{ paddingInlineStart: `${Math.min(depth, 6) * 28}px` }}>
                      {connector && (
                        <span
                          className={styles.connector}
                          data-testid="connector"
                          data-from-id={connector.fromId}
                          data-to-id={connector.toId}
                          aria-hidden="true"
                        />
                      )}
                      <NodeButton node={node} selected={selectedNode?.id === node.id} onSelect={() => selectNode(node.id)} />
                    </div>
                  );
                })}
            </div>
          )}
        </section>

        <aside className={styles.inspectorPanel} aria-label="선택한 기억과 트리 정보">
          <section className={styles.treeFields} aria-labelledby="tree-info-title">
            <h2 id="tree-info-title">트리 정보</h2>
            <div className={styles.field}>
              <label htmlFor="editor-tree-title">러브트리 제목</label>
              <input
                id="editor-tree-title"
                value={draft.tree.title}
                maxLength={PUBLIC_DEMO_TREE_TITLE_MAX}
                required
                aria-invalid={titleInvalid}
                aria-describedby={titleInvalid
                  ? "editor-tree-title-help editor-tree-title-error"
                  : "editor-tree-title-help"}
                onChange={(event) => updateTree({ ...draft.tree, title: event.target.value })}
              />
              <span id="editor-tree-title-help" className={styles.fieldHelp}>{draft.tree.title.length} / {PUBLIC_DEMO_TREE_TITLE_MAX}</span>
              {titleInvalid && (
                <p id="editor-tree-title-error" className={styles.errorText} role="alert">
                  러브트리 제목을 입력해야 저장하고 미리볼 수 있습니다.
                </p>
              )}
            </div>
            <div className={styles.field}>
              <label htmlFor="editor-tree-description">설명</label>
              <textarea
                id="editor-tree-description"
                value={draft.tree.description}
                maxLength={PUBLIC_DEMO_TREE_DESCRIPTION_MAX}
                onChange={(event) => updateTree({ ...draft.tree, description: event.target.value })}
              />
              <span className={styles.fieldHelp}>{draft.tree.description.length} / {PUBLIC_DEMO_TREE_DESCRIPTION_MAX}</span>
            </div>
          </section>

          {selectedNode ? (
            <section className={styles.selectedSection} aria-labelledby="selected-memory-title">
              <h2 id="selected-memory-title">{selectedNode.title}</h2>
              <p><time>{selectedNode.date}</time> · {selectedNode.emotion}</p>
              <p className={styles.memo}>{selectedNode.memo}</p>
              <YouTubeMedia youtubeUrl={selectedNode.youtubeUrl} title={selectedNode.title} />
              <div className={styles.actionRow}>
                <button type="button" className={styles.primaryButton} onClick={() => navigate(`/tree/new-demo/memory/${selectedNode.id}/edit`)}>기억 편집</button>
                <button type="button" className={styles.dangerButton} onClick={handleDeleteRequest}>기억 삭제</button>
              </div>
            </section>
          ) : (
            <p className={styles.emptyState}>노드를 선택하면 세부 내용이 표시됩니다.</p>
          )}
          {activeError && <p className={styles.errorText} role="alert">{activeError}</p>}
        </aside>
      </main>

      {deleteMode === "leaf" && selectedNode && (
        <PublicDemoDialog
          title="이 기억을 삭제할까요?"
          description="선택한 leaf 기억만 브라우저 draft에서 삭제합니다."
          onCancel={() => setDeleteMode(null)}
        >
          <button type="button" className={styles.dangerButton} onClick={() => finishDelete(deleteLeaf(selectedNode.id))}>기억 삭제</button>
        </PublicDemoDialog>
      )}

      {deleteMode === "children" && selectedNode && (
        <PublicDemoDialog
          title="하위 기억이 있습니다"
          description="하위 기억 전체를 삭제하거나 직접 자식을 현재 기억의 부모에 재연결할 수 있습니다."
          onCancel={() => setDeleteMode(null)}
        >
          <button type="button" className={styles.dangerButton} onClick={() => finishDelete(deleteSubtree(selectedNode.id))}>하위 기억 전체 삭제</button>
          <button type="button" className={styles.primaryButton} onClick={() => finishDelete(deleteAndReattachChildren(selectedNode.id))}>직접 자식 재연결 후 대상만 삭제</button>
        </PublicDemoDialog>
      )}

      {resetOpen && (
        <PublicDemoDialog
          title="전체 공개 데모를 초기화할까요?"
          description="lovetree.public-demo-draft.v1 키만 삭제하고 빈 시작 화면으로 돌아갑니다."
          onCancel={() => setResetOpen(false)}
        >
          <button type="button" className={styles.dangerButton} onClick={handleReset}>draft 완전 삭제</button>
        </PublicDemoDialog>
      )}
    </div>
  );
}

function NodeButton({ node, selected, onSelect }: { node: PublicDemoNode; selected: boolean; onSelect(): void }) {
  return (
    <button
      type="button"
      className={`${styles.nodeButton} ${selected ? styles.nodeButtonSelected : ""}`}
      data-selected={selected ? "true" : "false"}
      aria-current={selected ? "true" : undefined}
      onClick={onSelect}
    >
      <strong>{node.title}</strong>
      <span>{node.date} · {node.emotion}</span>
      <small>{node.parentId === null ? "루트 기억" : "연결된 기억"}</small>
    </button>
  );
}
