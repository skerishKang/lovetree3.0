import {
  PUBLIC_DEMO_MAX_NODES,
  type PublicDemoNode,
} from "../types/publicDemoEditor";

export interface PublicDemoConnector {
  id: string;
  fromId: string;
  toId: string;
}

export interface GraphValidationResult {
  valid: boolean;
  reason?: string;
}

export function getNodeById(nodes: PublicDemoNode[], nodeId: string) {
  return nodes.find((node) => node.id === nodeId) ?? null;
}

export function getChildren(nodes: PublicDemoNode[], parentId: string) {
  return nodes.filter((node) => node.parentId === parentId);
}

export function getDescendantIds(nodes: PublicDemoNode[], nodeId: string) {
  const descendants = new Set<string>();
  const queue = getChildren(nodes, nodeId).map((node) => node.id);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (descendants.has(current)) continue;
    descendants.add(current);
    getChildren(nodes, current).forEach((child) => queue.push(child.id));
  }

  return descendants;
}

export function getParentCandidates(nodes: PublicDemoNode[], nodeId: string) {
  const excluded = getDescendantIds(nodes, nodeId);
  excluded.add(nodeId);
  return nodes.filter((node) => !excluded.has(node.id));
}

export function getConnectors(nodes: PublicDemoNode[]): PublicDemoConnector[] {
  return nodes
    .filter((node): node is PublicDemoNode & { parentId: string } => Boolean(node.parentId))
    .map((node) => ({
      id: `connector-${node.parentId}-${node.id}`,
      fromId: node.parentId,
      toId: node.id,
    }));
}

export function getNodeDepth(nodes: PublicDemoNode[], nodeId: string) {
  let depth = 0;
  let current = getNodeById(nodes, nodeId);
  const visited = new Set<string>();

  while (current?.parentId) {
    if (visited.has(current.id)) return Number.POSITIVE_INFINITY;
    visited.add(current.id);
    current = getNodeById(nodes, current.parentId);
    if (!current) return Number.POSITIVE_INFINITY;
    depth += 1;
  }

  return depth;
}

export function validatePublicDemoGraph(nodes: PublicDemoNode[]): GraphValidationResult {
  if (nodes.length > PUBLIC_DEMO_MAX_NODES) {
    return { valid: false, reason: "노드는 최대 12개까지 만들 수 있습니다." };
  }

  if (nodes.length === 0) return { valid: true };

  const ids = new Set<string>();
  for (const node of nodes) {
    if (!node.id || ids.has(node.id)) {
      return { valid: false, reason: "노드 ID가 비어 있거나 중복되었습니다." };
    }
    ids.add(node.id);
  }

  const roots = nodes.filter((node) => node.parentId === null);
  if (roots.length !== 1) {
    return { valid: false, reason: "기억이 있으면 루트는 정확히 하나여야 합니다." };
  }

  for (const node of nodes) {
    if (node.parentId === node.id) {
      return { valid: false, reason: "기억을 자기 자신에 연결할 수 없습니다." };
    }
    if (node.parentId !== null && !ids.has(node.parentId)) {
      return { valid: false, reason: "부모 기억이 없는 고아 노드는 저장할 수 없습니다." };
    }
  }

  for (const node of nodes) {
    const seen = new Set<string>();
    let current: PublicDemoNode | null = node;
    while (current?.parentId) {
      if (seen.has(current.id)) {
        return { valid: false, reason: "순환 연결은 저장할 수 없습니다." };
      }
      seen.add(current.id);
      current = getNodeById(nodes, current.parentId);
      if (!current) {
        return { valid: false, reason: "부모 기억이 없는 고아 노드는 저장할 수 없습니다." };
      }
    }
  }

  return { valid: true };
}

export function canChangeParent(
  nodes: PublicDemoNode[],
  nodeId: string,
  nextParentId: string | null,
): GraphValidationResult {
  const node = getNodeById(nodes, nodeId);
  if (!node) return { valid: false, reason: "수정할 기억을 찾을 수 없습니다." };
  if (node.parentId === null) {
    return nextParentId === null
      ? { valid: true }
      : { valid: false, reason: "루트 기억은 다른 기억의 자식으로 이동할 수 없습니다." };
  }
  if (!nextParentId || !getNodeById(nodes, nextParentId)) {
    return { valid: false, reason: "유효한 부모 기억을 선택해야 합니다." };
  }
  if (nextParentId === nodeId) {
    return { valid: false, reason: "기억을 자기 자신에 연결할 수 없습니다." };
  }
  if (getDescendantIds(nodes, nodeId).has(nextParentId)) {
    return { valid: false, reason: "하위 기억을 부모로 선택하면 순환 연결이 생깁니다." };
  }
  return { valid: true };
}

export function deleteSubtree(nodes: PublicDemoNode[], nodeId: string) {
  const idsToDelete = getDescendantIds(nodes, nodeId);
  idsToDelete.add(nodeId);
  return nodes.filter((node) => !idsToDelete.has(node.id));
}

export function deleteNodeAndReattachChildren(nodes: PublicDemoNode[], nodeId: string) {
  const node = getNodeById(nodes, nodeId);
  if (!node || node.parentId === null) return nodes;
  return nodes
    .filter((candidate) => candidate.id !== nodeId)
    .map((candidate) =>
      candidate.parentId === nodeId
        ? { ...candidate, parentId: node.parentId }
        : candidate,
    );
}
