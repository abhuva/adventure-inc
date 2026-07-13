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
