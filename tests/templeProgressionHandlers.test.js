import assert from "node:assert/strict";
import test from "node:test";

import { createTempleProgressionHandlers } from "../src/app/templeProgressionHandlers.js";

const SHARDS = {
  visitShard: {
    id: "visitShard",
    name: "Visit Shard",
    dungeonId: "rat_cellar",
    dropType: "visit",
    dropEvery: 2
  },
  bossShard: {
    id: "bossShard",
    name: "Boss Shard",
    dungeonId: "rat_cellar",
    dropType: "boss",
    dropEvery: 1
  }
};

function createHarness() {
  const xpCalls = [];
  const templeState = {
    dungeonVisits: {},
    bossVisits: {},
    shardInventory: {}
  };
  const handlers = createTempleProgressionHandlers({
    templeState,
    shards: SHARDS,
    addShardXp: (shardId, amount) => xpCalls.push({ shardId, amount })
  });
  return { handlers, templeState, xpCalls };
}

test("Temple progression handlers record visit and boss shard progress", () => {
  const { handlers, templeState, xpCalls } = createHarness();

  let awards = handlers.recordShardProgress({ dungeonId: "rat_cellar", success: true });
  assert.deepEqual(awards.map((award) => award.shardId), ["bossShard"]);
  assert.deepEqual(xpCalls, [{ shardId: "bossShard", amount: 1 }]);
  assert.equal(templeState.dungeonVisits.rat_cellar, 1);
  assert.equal(templeState.bossVisits.rat_cellar, 1);

  awards = handlers.recordShardProgress({ dungeonId: "rat_cellar", success: false });
  assert.deepEqual(awards.map((award) => award.shardId), ["visitShard"]);
  assert.deepEqual(xpCalls, [
    { shardId: "bossShard", amount: 1 },
    { shardId: "visitShard", amount: 1 }
  ]);
  assert.equal(templeState.dungeonVisits.rat_cellar, 2);
  assert.equal(templeState.bossVisits.rat_cellar, 1);
});

test("Temple progression handlers award direct due shard drops", () => {
  const { handlers, xpCalls } = createHarness();

  const awards = handlers.awardDueShards("rat_cellar", "visit", 2);

  assert.deepEqual(awards.map((award) => award.shardId), ["visitShard"]);
  assert.deepEqual(xpCalls, [{ shardId: "visitShard", amount: 1 }]);
});
