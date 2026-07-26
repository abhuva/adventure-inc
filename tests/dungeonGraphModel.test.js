import assert from "node:assert/strict";
import test from "node:test";

import {
  effectiveNodeResolveCost,
  plannedPathAfterNodeClick,
  shortestPathToNode
} from "../src/game/dungeon/dungeonGraphModel.js";

test("plannedPathAfterNodeClick adds reachable nodes and truncates existing planned nodes", () => {
  const dungeon = {
    startNodeIds: ["entry"],
    edges: [
      { from: "entry", to: "a" },
      { from: "a", to: "b" },
      { from: "a", to: "c" }
    ],
    nodes: [
      { id: "entry", name: "Entry" },
      { id: "a", name: "A" },
      { id: "b", name: "B" },
      { id: "c", name: "C" }
    ]
  };

  const conquest = { clearedNodes: {}, unlockedNodes: {}, disabledModifiers: {}, nodeCostAdjustments: {} };

  assert.deepEqual(plannedPathAfterNodeClick(dungeon, [], "b", conquest), ["entry", "a", "b"]);
  assert.deepEqual(plannedPathAfterNodeClick(dungeon, ["entry", "a", "b"], "a", conquest), ["entry"]);
  assert.deepEqual(shortestPathToNode(dungeon, "c", conquest), ["entry", "a", "c"]);
});

test("effectiveNodeResolveCost combines persistent reductions and active modifier costs", () => {
  const cost = effectiveNodeResolveCost(
    { id: "boss", resolveCost: 5 },
    { nodeCostAdjustments: { boss: -2 } },
    [{ effects: [{ type: "resolve_cost_add", value: 1 }] }]
  );

  assert.equal(cost, 4);
});
