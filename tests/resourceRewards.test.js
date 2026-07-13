import assert from "node:assert/strict";
import test from "node:test";
import { applyRewards, canPay, payCost, templeLootFromBonuses } from "../src/game/resources/resourceRewards.js";

test("canPay and payCost operate on explicit resource objects", () => {
  const resources = { coin: 5, wood: 2 };

  assert.equal(canPay(resources, { coin: 4, wood: 2 }), true);
  assert.equal(canPay(resources, { coin: 6 }), false);
  payCost(resources, { coin: 3, ore: 1 });
  assert.deepEqual(resources, { coin: 2, wood: 2, ore: -1 });
});

test("applyRewards routes fame to tavern and ignores progression-only keys", () => {
  const state = { tavern: { fame: 1 }, resources: { coin: 2 } };

  applyRewards(state, { coin: 3, fame: 2, xp: 99, blueprint: "ironBlade" });

  assert.equal(state.tavern.fame, 3);
  assert.deepEqual(state.resources, { coin: 5 });
});

test("templeLootFromBonuses converts only positive loot bonuses", () => {
  assert.deepEqual(templeLootFromBonuses({ loot_hide: 2, loot_ore: 0, loot_coin: 3, party_atk: 9 }), { hide: 2, coin: 3 });
});
