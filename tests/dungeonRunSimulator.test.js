import assert from "node:assert/strict";
import test from "node:test";
import { adjustedFoodCost, adjustedTravelHours, mergeRewards, simulateDungeonRun } from "../src/game/dungeon/dungeonRunSimulator.js";

const party = { id: "party-1", name: "Alpha", memberIds: ["ada"] };
const members = [{
  id: "ada",
  name: "Ada",
  role: "Founder",
  level: 1,
  base: { hp: 42, atk: 7, def: 2, utility: 1 },
  hp: 42,
  spriteIndex: 0,
  gear: []
}];
const stats = {
  hpMax: 42,
  hpCurrent: 42,
  atk: 7,
  def: 2,
  utility: 1,
  travelSpeed: 0,
  recoveryReduce: 0,
  foodCostReduce: 0
};
const dungeon = {
  id: "test-cave",
  name: "Test Cave",
  travelHours: 2,
  foodCost: 3,
  nodes: [
    { type: "hazard", name: "Loose Stones", damage: 1, reward: { ore: 1 } }
  ]
};

test("simulateDungeonRun blocks before departure when food is insufficient", () => {
  const estimate = simulateDungeonRun({ dungeon, strategy: "balanced", stopNode: "all", party, stats, members, availableFood: 0 });

  assert.equal(estimate.success, false);
  assert.equal(estimate.reached, 0);
  assert.equal(estimate.foodCost, 3);
  assert.equal(estimate.timeline[0].type, "blocked");
});

test("simulateDungeonRun resolves deterministic nodes and timeline without mutating members", () => {
  const estimate = simulateDungeonRun({ dungeon, strategy: "balanced", stopNode: "all", party, stats, members, availableFood: 10 });

  assert.equal(estimate.success, true);
  assert.equal(estimate.reached, 1);
  assert.equal(estimate.hpEnd, 42);
  assert.deepEqual(estimate.rewards, { ore: 1 });
  assert.equal(estimate.timeline[0].type, "start");
  assert.equal(estimate.timeline.at(-1).type, "end");
  assert.equal(members[0].hp, 42);
});

test("simulateDungeonRun follows named routes and stops when resolve is gone", () => {
  const routedDungeon = {
    id: "nested-cave",
    name: "Nested Cave",
    travelHours: 1,
    foodCost: 0,
    routes: [
      { id: "short", name: "Short Route", nodeIds: ["one"] },
      { id: "deep", name: "Deep Route", default: true, nodeIds: ["one", "two"] }
    ],
    nodes: [
      { id: "one", type: "hazard", name: "First Nerve", resolveCost: 3, damage: 0, reward: { coin: 1 } },
      { id: "two", type: "hazard", name: "Second Nerve", resolveCost: 1, damage: 0, reward: { coin: 9 } }
    ]
  };
  const lowResolveMembers = [{
    id: "ada",
    name: "Ada",
    role: "Founder",
    level: 1,
    base: { hp: 42, atk: 7, def: 2, utility: 1, resolve: 3 },
    hp: 42,
    spriteIndex: 0,
    gear: []
  }];

  const estimate = simulateDungeonRun({
    dungeon: routedDungeon,
    strategy: "balanced",
    stopNode: "all",
    party,
    stats: { ...stats, resolve: 3 },
    members: lowResolveMembers,
    availableFood: 10
  });

  assert.equal(estimate.routeName, "Deep Route");
  assert.equal(estimate.reached, 1);
  assert.equal(estimate.success, false);
  assert.deepEqual(estimate.withdrawnMemberIds, ["ada"]);
  assert.deepEqual(estimate.rewards, { coin: 1 });
  assert.match(estimate.transcript.join("\n"), /withdrew after node: Ada/);

  const shortEstimate = simulateDungeonRun({
    dungeon: routedDungeon,
    strategy: "balanced",
    stopNode: "route:short",
    party,
    stats: { ...stats, resolve: 3 },
    members: lowResolveMembers,
    availableFood: 10
  });

  assert.equal(shortEstimate.routeName, "Short Route");
  assert.equal(shortEstimate.success, true);
  assert.deepEqual(shortEstimate.rewards, { coin: 1 });
});

test("simulateDungeonRun can target a specific dungeon graph node", () => {
  const branchedDungeon = {
    id: "branch-cave",
    name: "Branch Cave",
    travelHours: 1,
    foodCost: 0,
    routes: [
      { id: "main", name: "Main", default: true, nodeIds: ["entry", "pack", "boss"] },
      { id: "side", name: "Side Crawl", nodeIds: ["entry", "crawl", "cache"] }
    ],
    nodes: [
      { id: "entry", type: "hazard", name: "Entry", resolveCost: 1, damage: 0, reward: { coin: 1 } },
      { id: "pack", type: "hazard", name: "Pack", resolveCost: 1, damage: 0, reward: { coin: 10 } },
      { id: "boss", type: "hazard", name: "Boss", resolveCost: 1, damage: 0, reward: { coin: 100 } },
      { id: "crawl", type: "hazard", name: "Smuggler Crawl", resolveCost: 1, damage: 0, reward: { hide: 2 } },
      { id: "cache", type: "hazard", name: "Cache", resolveCost: 1, damage: 0, reward: { hide: 5 } }
    ]
  };

  const estimate = simulateDungeonRun({
    dungeon: branchedDungeon,
    strategy: "balanced",
    stopNode: "node:crawl",
    party,
    stats: { ...stats, resolve: 12 },
    members,
    availableFood: 10
  });

  assert.equal(estimate.routeName, "Side Crawl to Smuggler Crawl");
  assert.deepEqual(estimate.routeNodeIds, ["entry", "crawl"]);
  assert.deepEqual(estimate.rewards, { coin: 1, hide: 2 });
});

test("simulateDungeonRun checks resolve before starting the next node", () => {
  const resolveDungeon = {
    id: "resolve-cave",
    name: "Resolve Cave",
    travelHours: 1,
    foodCost: 0,
    routes: [
      { id: "deep", name: "Deep Route", default: true, nodeIds: ["a", "b", "c", "d", "e"] }
    ],
    nodes: [
      { id: "a", type: "hazard", name: "Step A", resolveCost: 2, damage: 0, reward: { coin: 1 } },
      { id: "b", type: "hazard", name: "Step B", resolveCost: 3, damage: 0, reward: { coin: 1 } },
      { id: "c", type: "hazard", name: "Step C", resolveCost: 2, damage: 0, reward: { coin: 1 } },
      { id: "d", type: "hazard", name: "Step D", resolveCost: 3, damage: 0, reward: { coin: 1 } },
      { id: "e", type: "hazard", name: "Step E", resolveCost: 4, damage: 0, reward: { coin: 99 } }
    ]
  };
  const estimate = simulateDungeonRun({
    dungeon: resolveDungeon,
    strategy: "balanced",
    stopNode: "all",
    party,
    stats: { ...stats, resolve: 12 },
    members: [{
      id: "ada",
      name: "Ada",
      role: "Founder",
      level: 1,
      base: { hp: 42, atk: 7, def: 2, utility: 1, resolve: 12 },
      hp: 42,
      spriteIndex: 0,
      gear: []
    }],
    availableFood: 10
  });

  assert.equal(estimate.reached, 4);
  assert.equal(estimate.success, false);
  assert.equal(estimate.resolveEnd, 2);
  assert.deepEqual(estimate.rewards, { coin: 4 });
  assert.match(estimate.transcript.join("\n"), /Step E: requires 4 resolve; withdrew before node: Ada/);
});

test("simulateDungeonRun applies conquest modifiers and explicit planned paths", () => {
  const conquestDungeon = {
    id: "conquest-cave",
    name: "Conquest Cave",
    travelHours: 1,
    foodCost: 0,
    startNodeIds: ["entry"],
    edges: [
      { from: "entry", to: "guard" },
      { from: "guard", to: "boss" }
    ],
    modifiers: [
      {
        id: "guard_frenzy",
        sourceNodeId: "switch",
        targetNodeIds: ["guard"],
        effects: [
          { type: "resolve_cost_add", value: 2 },
          { type: "hazard_damage_add", value: 3 }
        ]
      }
    ],
    nodes: [
      { id: "entry", type: "hazard", name: "Entry", resolveCost: 1, damage: 0, reward: { coin: 1 } },
      { id: "guard", type: "hazard", name: "Guard", resolveCost: 1, damage: 0, reward: { coin: 2 } },
      { id: "boss", type: "hazard", name: "Boss", resolveCost: 1, damage: 0, reward: { coin: 3 } }
    ]
  };

  const estimate = simulateDungeonRun({
    dungeon: conquestDungeon,
    strategy: "balanced",
    stopNode: "path:entry,guard",
    party,
    stats: { ...stats, resolve: 12 },
    members,
    availableFood: 10,
    conquestState: { clearedNodes: {}, unlockedNodes: {}, disabledModifiers: {}, nodeCostAdjustments: {} }
  });

  assert.deepEqual(estimate.routeNodeIds, ["entry", "guard"]);
  assert.equal(estimate.hpEnd, 40);
  assert.equal(estimate.resolveEnd, 6);
  assert.match(estimate.transcript.join("\n"), /active modifiers guard_frenzy/);
});

test("adjusted travel and food costs clamp to deterministic minimums", () => {
  assert.equal(adjustedTravelHours(5, { travelSpeed: 4 }), 3);
  assert.equal(adjustedTravelHours(1, { travelSpeed: 99 }), 1);
  assert.equal(adjustedFoodCost(5, { foodCostReduce: 2 }), 3);
  assert.equal(adjustedFoodCost(1, { foodCostReduce: 99 }), 0);
});

test("mergeRewards combines numeric rewards and preserves blueprint ids", () => {
  const target = { ore: 1 };
  mergeRewards(target, { ore: 2, blueprint: "ironBlade" });
  mergeRewards(target, { wood: 3 });

  assert.deepEqual(target, { ore: 3, blueprint: "ironBlade", wood: 3 });
});
