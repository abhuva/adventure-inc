import assert from "node:assert/strict";
import test from "node:test";
import { createInitialState } from "../src/app/appState.js";
import { addShardXp, awardDueShards, dueShardAwards, recordShardProgress } from "../src/game/temple/shardProgression.js";

const shards = {
  visitShard: { dungeonId: "rat", dropType: "visit", dropEvery: 2, name: "Visit" },
  bossShard: { dungeonId: "rat", dropType: "boss", dropEvery: 3, name: "Boss" },
  otherShard: { dungeonId: "mine", dropType: "visit", dropEvery: 1, name: "Other" }
};

test("dueShardAwards returns only matching dungeon/drop/counter awards", () => {
  assert.deepEqual(dueShardAwards(shards, "rat", "visit", 1), []);
  assert.deepEqual(dueShardAwards(shards, "rat", "visit", 2).map((award) => award.shardId), ["visitShard"]);
  assert.deepEqual(dueShardAwards(shards, "rat", "boss", 3).map((award) => award.shardId), ["bossShard"]);
});

test("awardDueShards invokes xp callback for due awards", () => {
  const calls = [];
  const awards = awardDueShards(shards, "rat", "visit", 2, (shardId, amount) => calls.push([shardId, amount]));

  assert.deepEqual(awards.map((award) => award.shardId), ["visitShard"]);
  assert.deepEqual(calls, [["visitShard", 1]]);
});

test("recordShardProgress increments visit and successful boss counters", () => {
  const temple = createInitialState().temple;
  const calls = [];

  recordShardProgress(temple, { dungeonId: "rat", success: false }, shards, (shardId) => calls.push(shardId));
  recordShardProgress(temple, { dungeonId: "rat", success: true }, shards, (shardId) => calls.push(shardId));
  recordShardProgress(temple, { dungeonId: "rat", success: true }, shards, (shardId) => calls.push(shardId));
  recordShardProgress(temple, { dungeonId: "rat", success: true }, shards, (shardId) => calls.push(shardId));

  assert.equal(temple.dungeonVisits.rat, 4);
  assert.equal(temple.bossVisits.rat, 3);
  assert.deepEqual(calls, ["visitShard", "visitShard", "bossShard"]);
});

test("addShardXp mutates xp and selects the shard", () => {
  const temple = createInitialState().temple;
  const first = addShardXp(temple, "visitShard", 1);
  const second = addShardXp(temple, "visitShard", 2);

  assert.deepEqual(first, { shardId: "visitShard", previousXp: 0, xp: 1, wasNew: true });
  assert.deepEqual(second, { shardId: "visitShard", previousXp: 1, xp: 3, wasNew: false });
  assert.equal(temple.shardInventory.visitShard.xp, 3);
  assert.equal(temple.selectedShardId, "visitShard");
});
