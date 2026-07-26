import { describe, expect, it } from "vitest";
import type { PublicDemoNode } from "../types/publicDemoEditor";
import {
  canChangeParent,
  deleteNodeAndReattachChildren,
  deleteSubtree,
  getConnectors,
  getDescendantIds,
  getParentCandidates,
  validatePublicDemoGraph,
} from "./publicDemoGraph";

function node(id: string, parentId: string | null): PublicDemoNode {
  return {
    id,
    parentId,
    title: id,
    date: "2026-07-26",
    emotion: "행복",
    memo: `${id} memo`,
    youtubeUrl: "https://www.youtube.com/watch?v=c4V0FNZfEv0",
    videoId: "c4V0FNZfEv0",
  };
}

describe("public demo graph", () => {
  it("accepts one root with child and grandchild and derives connectors", () => {
    const nodes = [node("root", null), node("child", "root"), node("grandchild", "child")];
    expect(validatePublicDemoGraph(nodes)).toEqual({ valid: true });
    expect(getConnectors(nodes)).toEqual([
      { id: "connector-root-child", fromId: "root", toId: "child" },
      { id: "connector-child-grandchild", fromId: "child", toId: "grandchild" },
    ]);
  });

  it("rejects multiple roots, missing parents, self links, cycles, and more than 12 nodes", () => {
    expect(validatePublicDemoGraph([node("a", null), node("b", null)]).valid).toBe(false);
    expect(validatePublicDemoGraph([node("root", null), node("orphan", "missing")]).valid).toBe(false);
    expect(validatePublicDemoGraph([node("root", null), node("self", "self")]).valid).toBe(false);
    expect(validatePublicDemoGraph([
      node("root", null),
      node("a", "b"),
      node("b", "a"),
    ]).valid).toBe(false);
    expect(validatePublicDemoGraph(Array.from({ length: 13 }, (_, index) => node(`n${index}`, index === 0 ? null : "n0"))).valid).toBe(false);
  });

  it("excludes self and descendants from parent candidates and rejects cycle changes", () => {
    const nodes = [node("root", null), node("child", "root"), node("grandchild", "child")];
    expect([...getDescendantIds(nodes, "child")]).toEqual(["grandchild"]);
    expect(getParentCandidates(nodes, "child").map((candidate) => candidate.id)).toEqual(["root"]);
    expect(canChangeParent(nodes, "child", "child").valid).toBe(false);
    expect(canChangeParent(nodes, "child", "grandchild").valid).toBe(false);
    expect(canChangeParent(nodes, "grandchild", "root")).toEqual({ valid: true });
    expect(canChangeParent(nodes, "grandchild", "missing").valid).toBe(false);
  });

  it("deletes a subtree without orphans", () => {
    const nodes = [node("root", null), node("child", "root"), node("grandchild", "child"), node("sibling", "root")];
    expect(deleteSubtree(nodes, "child").map((candidate) => candidate.id)).toEqual(["root", "sibling"]);
  });

  it("reattaches direct children to the deleted non-root parent", () => {
    const nodes = [node("root", null), node("child", "root"), node("grandchild", "child"), node("great", "grandchild")];
    const next = deleteNodeAndReattachChildren(nodes, "child");
    expect(next.find((candidate) => candidate.id === "grandchild")?.parentId).toBe("root");
    expect(next.find((candidate) => candidate.id === "great")?.parentId).toBe("grandchild");
    expect(validatePublicDemoGraph(next)).toEqual({ valid: true });
  });
});
