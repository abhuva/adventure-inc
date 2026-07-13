import assert from "node:assert/strict";
import test from "node:test";
import { createInitialState } from "../src/app/appState.js";
import { TEMPLE_STONES } from "../src/game/temple/templeData.js";
import { activeTempleStoneState, createTempleStoneState, normalizeTempleStoneState } from "../src/game/temple/templeState.js";
import { templeBonuses } from "../src/game/temple/templeBonuses.js";

test("templeBonuses applies only effects whose color influences the equipped shard", () => {
  const state = createInitialState({ templeInventorySlots: 20 }).temple;

  let bonuses = templeBonuses(state);
  assert.equal(bonuses.party_atk, 1);
  assert.equal(bonuses.loot_hide, 1);
  assert.equal(bonuses.party_def, 0);

  state.stones.triangle.activeLines = [];
  bonuses = templeBonuses(state);
  assert.equal(bonuses.party_atk, 1);
  assert.equal(bonuses.loot_hide, 0);
});

test("templeBonuses ignores shards equipped into invalid socket colors", () => {
  const state = createInitialState({ templeInventorySlots: 20 }).temple;
  state.stones.triangle.slots = { ember: null, verdant: null, azure: "cellarFang" };
  state.stones.triangle.activeLines = [{ a: "verdant", b: "azure" }];

  const bonuses = templeBonuses(state);
  assert.equal(bonuses.party_atk, 0);
  assert.equal(bonuses.loot_hide, 0);
});

test("activeTempleStoneState creates and normalizes missing stone state", () => {
  const state = { activeStoneId: "square", shardInventory: {}, stones: {} };
  const stoneState = activeTempleStoneState(state, { inventorySlots: 4 });

  assert.deepEqual(Object.keys(stoneState.slots), ["ember", "verdant", "azure", "ember2"]);
  assert.equal(stoneState.inventorySlots.length, 4);
});

test("normalizeTempleStoneState removes invalid lines and extra slots", () => {
  const stoneState = createTempleStoneState("triangle", { inventorySlots: 2 });
  stoneState.slots = { ember: "cellarFang", bogus: "wardPrism" };
  stoneState.activeLines = [
    { a: "ember", b: "verdant" },
    { a: "ember", b: "bogus" }
  ];

  normalizeTempleStoneState("triangle", stoneState, { stones: TEMPLE_STONES });

  assert.deepEqual(Object.keys(stoneState.slots), ["ember", "verdant", "azure"]);
  assert.deepEqual(stoneState.activeLines, [{ a: "ember", b: "verdant" }]);
});
