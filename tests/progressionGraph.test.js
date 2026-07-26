import assert from "node:assert/strict";
import test from "node:test";

import { spendProgressionPoint, refundProgressionPoint } from "../src/game/progression/progressionGraphCommands.js";
import { progressionEffects } from "../src/game/progression/progressionGraphEffects.js";
import { graphFromLinearTree, normalizeProgressionGraph, progressionGraphBounds } from "../src/game/progression/progressionGraphModel.js";
import { canSpendProgressionPoint, isProgressionNodeUnlocked, progressionSpentPoints } from "../src/game/progression/progressionGraphRules.js";

const graph = normalizeProgressionGraph({
  id: "test",
  nodes: {
    root: {
      name: "Root",
      maxRank: 2,
      requires: [],
      effects: [{ type: "atk_add", valuePerRank: 2 }],
      x: 0,
      y: 0
    },
    child: {
      name: "Child",
      maxRank: 1,
      requires: ["root"],
      effects: [{ type: "def_add", valuePerRank: 1 }],
      costPerRank: 2,
      x: 0,
      y: 1
    }
  }
});

test("progression graph rules unlock roots and connected children", () => {
  assert.equal(isProgressionNodeUnlocked(graph, { points: {} }, "root"), true);
  assert.equal(isProgressionNodeUnlocked(graph, { points: {} }, "child"), false);
  assert.equal(isProgressionNodeUnlocked(graph, { points: { root: 1 } }, "child"), true);
});

test("progression graph spending blocks missing points and max ranks", () => {
  assert.deepEqual(canSpendProgressionPoint(graph, { points: {}, availablePoints: 0 }, "root"), { ok: false, reason: "no points" });
  assert.deepEqual(canSpendProgressionPoint(graph, { points: { root: 2 }, availablePoints: 1 }, "root"), { ok: false, reason: "max rank" });
  assert.deepEqual(canSpendProgressionPoint(graph, { points: {}, availablePoints: 1 }, "child"), { ok: false, reason: "requires connected node" });
  assert.deepEqual(canSpendProgressionPoint(graph, { points: { root: 1 }, availablePoints: 1 }, "child"), { ok: false, reason: "no points" });
});

test("progression graph commands spend and refund points", () => {
  const state = { points: {}, availablePoints: 3 };

  assert.equal(spendProgressionPoint(graph, state, "root").ok, true);
  assert.deepEqual(state.points, { root: 1 });
  assert.equal(state.availablePoints, 2);
  assert.equal(spendProgressionPoint(graph, state, "child").ok, true);
  assert.deepEqual(state.points, { root: 1, child: 1 });
  assert.equal(state.availablePoints, 0);
  assert.equal(progressionSpentPoints(state, graph), 3);
  assert.equal(refundProgressionPoint(graph, state, "root").ok, true);
  assert.deepEqual(state.points, { child: 1 });
  assert.equal(state.availablePoints, 1);
});

test("progression graph effects aggregate by rank", () => {
  assert.deepEqual(progressionEffects(graph, { points: { root: 2, child: 1 } }), {
    atk_add: 4,
    def_add: 1
  });
});

test("graphFromLinearTree derives nodes, links, and layout", () => {
  const derived = graphFromLinearTree({
    id: "tree",
    name: "Tree",
    skillIds: ["root", "child"],
    skills: {
      root: { name: "Root", category: "fight", maxRank: 1, requires: [], effects: [] },
      child: { name: "Child", category: "fight", maxRank: 1, requires: ["root"], effects: [] }
    }
  });

  assert.equal(derived.nodes.root.y, 0);
  assert.equal(derived.nodes.child.y, 1);
  assert.deepEqual(derived.links, [{ from: "root", to: "child" }]);
  assert.deepEqual(progressionGraphBounds(derived), { maxX: 0, maxY: 1 });
});
