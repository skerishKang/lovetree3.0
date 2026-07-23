import styles from "./CommunityTreePreview.module.css";

interface Node {
  cx: number;
  cy: number;
  r: number;
  isSpecial?: boolean;
}

interface Connection {
  fromIdx: number;
  toIdx: number;
}

interface TreeLayout {
  nodes: Node[];
  connections: Connection[];
}

const LAYOUTS: Record<string, TreeLayout> = {
  "variant-a": {
    nodes: [
      { cx: 30, cy: 30, r: 8 },
      { cx: 50, cy: 50, r: 12, isSpecial: true },
      { cx: 70, cy: 40, r: 6 },
      { cx: 40, cy: 75, r: 9 },
    ],
    connections: [
      { fromIdx: 0, toIdx: 1 },
      { fromIdx: 1, toIdx: 2 },
      { fromIdx: 1, toIdx: 3 },
    ],
  },
  "variant-b": {
    nodes: [
      { cx: 25, cy: 50, r: 10, isSpecial: true },
      { cx: 55, cy: 30, r: 7 },
      { cx: 75, cy: 55, r: 9 },
      { cx: 45, cy: 75, r: 6 },
      { cx: 70, cy: 75, r: 8 },
    ],
    connections: [
      { fromIdx: 0, toIdx: 1 },
      { fromIdx: 0, toIdx: 3 },
      { fromIdx: 1, toIdx: 2 },
      { fromIdx: 3, toIdx: 4 },
    ],
  },
  "variant-c": {
    nodes: [
      { cx: 50, cy: 25, r: 7 },
      { cx: 50, cy: 50, r: 14, isSpecial: true },
      { cx: 25, cy: 70, r: 8 },
      { cx: 75, cy: 70, r: 8 },
    ],
    connections: [
      { fromIdx: 0, toIdx: 1 },
      { fromIdx: 1, toIdx: 2 },
      { fromIdx: 1, toIdx: 3 },
    ],
  },
  "variant-d": {
    nodes: [
      { cx: 35, cy: 35, r: 6 },
      { cx: 65, cy: 35, r: 8 },
      { cx: 50, cy: 60, r: 11, isSpecial: true },
    ],
    connections: [
      { fromIdx: 0, toIdx: 2 },
      { fromIdx: 1, toIdx: 2 },
    ],
  },
  "variant-e": {
    nodes: [
      { cx: 20, cy: 30, r: 7 },
      { cx: 45, cy: 35, r: 9 },
      { cx: 70, cy: 30, r: 6 },
      { cx: 30, cy: 65, r: 11, isSpecial: true },
      { cx: 60, cy: 70, r: 8 },
    ],
    connections: [
      { fromIdx: 0, toIdx: 1 },
      { fromIdx: 1, toIdx: 2 },
      { fromIdx: 1, toIdx: 3 },
      { fromIdx: 3, toIdx: 4 },
    ],
  },
  // Large Featured tree preview layout
  "featured": {
    nodes: [
      { cx: 50, cy: 20, r: 10 },
      { cx: 30, cy: 45, r: 14 },
      { cx: 70, cy: 45, r: 12 },
      { cx: 50, cy: 60, r: 22, isSpecial: true },
      { cx: 25, cy: 80, r: 11 },
      { cx: 75, cy: 80, r: 13 },
      { cx: 50, cy: 90, r: 9 },
    ],
    connections: [
      { fromIdx: 0, toIdx: 3 },
      { fromIdx: 1, toIdx: 3 },
      { fromIdx: 2, toIdx: 3 },
      { fromIdx: 3, toIdx: 4 },
      { fromIdx: 3, toIdx: 5 },
      { fromIdx: 3, toIdx: 6 },
    ],
  },
};

interface Props {
  variant: string;
}

export default function CommunityTreePreview({ variant }: Props) {
  const layout = LAYOUTS[variant] || LAYOUTS["variant-a"];

  return (
    <svg
      className={styles.svg}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
      data-testid="community-tree-preview"
    >
      {/* Connections (Lines) */}
      {layout.connections.map((conn, idx) => {
        const fromNode = layout.nodes[conn.fromIdx];
        const toNode = layout.nodes[conn.toIdx];
        return (
          <line
            key={`line-${idx}`}
            x1={fromNode.cx}
            y1={fromNode.cy}
            x2={toNode.cx}
            y2={toNode.cy}
            className={styles.connectionLine}
          />
        );
      })}

      {/* Nodes (Circles) */}
      {layout.nodes.map((node, idx) => (
        <circle
          key={`node-${idx}`}
          cx={node.cx}
          cy={node.cy}
          r={node.r}
          className={`${styles.nodeCircle} ${
            node.isSpecial ? styles.specialNode : ""
          }`}
        />
      ))}
    </svg>
  );
}
