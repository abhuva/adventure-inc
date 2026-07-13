import assert from "node:assert/strict";
import test from "node:test";
import { createInitialState } from "../src/app/appState.js";
import { completePartyOperation } from "../src/game/dungeon/dungeonCompletion.js";

function operation() {
  return {
    label: "Alpha: Test",
    memberIds: ["ada"],
    estimate: {
      dungeonId: "rat",
      success: true,
      rewards: { coin: 3, xp: 8, blueprint: "ironBlade" }
    }
  };
}

test("completePartyOperation applies rewards, heals members, grants xp, and unlocks blueprint", () => {
  const state = createInitialState();
  state.roster[0].hp = 1;
  const applied = [];
  const xpCalls = [];
  const shardCalls = [];

  const result = completePartyOperation(state, operation(), {
    applyRewards: (rewards) => applied.push(rewards),
    gainXp: (hero, xp) => xpCalls.push([hero.id, xp]),
    templeLootBonus: () => ({}),
    recordShardProgress: (estimate) => shardCalls.push(estimate.dungeonId)
  });

  assert.deepEqual(applied, [{ coin: 3, xp: 8, blueprint: "ironBlade" }]);
  assert.equal(state.roster[0].hp, 42);
  assert.deepEqual(xpCalls, [["ada", 8]]);
  assert.equal(state.blueprints.ironBlade, true);
  assert.deepEqual(shardCalls, ["rat"]);
  assert.equal(result.members[0].id, "ada");
});

test("completePartyOperation applies non-empty temple loot through reward callback", () => {
  const state = createInitialState();
  const applied = [];

  const result = completePartyOperation(state, operation(), {
    applyRewards: (rewards) => applied.push(rewards),
    gainXp: () => {},
    templeLootBonus: () => ({ hide: 2 }),
    recordShardProgress: () => {}
  });

  assert.deepEqual(applied, [{ coin: 3, xp: 8, blueprint: "ironBlade" }, { hide: 2 }]);
  assert.deepEqual(result.templeLoot, { hide: 2 });
});
