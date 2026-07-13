import assert from "node:assert/strict";
import test from "node:test";

import { createInitialState } from "../src/app/appState.js";
import { createTempleCommandHandlers } from "../src/app/templeCommandHandlers.js";
import { SHARDS, TEMPLE_COLORS, TEMPLE_STONES } from "../src/game/temple/templeData.js";
import {
  activeTempleStoneDefinition,
  activeTempleStoneState
} from "../src/game/temple/templeState.js";
import { normalizedInventorySlots } from "../src/game/temple/templeCommands.js";

function createHarness() {
  const logs = [];
  const calls = [];
  const state = createInitialState({ templeInventorySlots: 20 });
  const handlers = createTempleCommandHandlers({
    state,
    stones: TEMPLE_STONES,
    shards: SHARDS,
    inventorySlots: 20,
    activeStoneDefinition: () => activeTempleStoneDefinition(state.temple, TEMPLE_STONES),
    colorName: (colorId) => TEMPLE_COLORS.find((color) => color.id === colorId)?.name || colorId,
    addLog: (text, type) => logs.push({ text, type }),
    render: () => calls.push("render")
  });
  return { state, logs, calls, handlers };
}

test("Temple handlers select stones and shards with render/log behavior", () => {
  const { state, logs, calls, handlers } = createHarness();

  handlers.selectTempleStone("square");
  assert.equal(state.temple.activeStoneId, "square");
  assert.match(logs[0].text, /temple stone selected: Square Stone/);

  handlers.selectShard("cellarFang");
  assert.equal(state.temple.selectedShardId, "cellarFang");
  assert.deepEqual(calls, ["render", "render"]);
});

test("Temple handlers move shards and report blocked socket returns", () => {
  const { state, logs, calls, handlers } = createHarness();
  state.temple.shardInventory.broodCrown = { xp: 1 };
  normalizedInventorySlots(state.temple, { inventorySlots: 20, shards: SHARDS, stones: TEMPLE_STONES });

  handlers.moveShardToInventorySlot("cellarFang", 0);

  assert.match(logs[0].text, /inventory move blocked: slot 1 is occupied/);
  assert.deepEqual(calls, ["render"]);
});

test("Temple handlers equip, clear, and reject shards with feedback", () => {
  const { state, logs, calls, handlers } = createHarness();
  state.temple.shardInventory.wardPrism = { xp: 1 };

  handlers.equipShard("azure", "cellarFang");
  assert.match(logs[0].text, /cannot slot into Azure/);

  handlers.equipShard("azure", "wardPrism");
  assert.equal(activeTempleStoneState(state.temple).slots.azure, "wardPrism");
  assert.match(logs[1].text, /temple socket Azure equipped Ward Prism/);

  handlers.equipShard("azure", null);
  assert.equal(activeTempleStoneState(state.temple).slots.azure, null);
  assert.match(logs[2].text, /Azure socket cleared/);
  assert.deepEqual(calls, ["render", "render", "render"]);
});

test("Temple handlers toggle lines and add newly found shard XP", () => {
  const { state, logs, handlers } = createHarness();

  handlers.toggleTempleLine("verdant", "azure");
  assert.deepEqual(activeTempleStoneState(state.temple).activeLines, [{ a: "verdant", b: "azure" }]);
  assert.match(logs[0].text, /temple line enabled: Verdant \/ Azure/);

  handlers.addShardXp("broodCrown", 1);
  assert.equal(state.temple.shardInventory.broodCrown.xp, 1);
  assert.equal(activeTempleStoneState(state.temple).inventorySlots.includes("broodCrown"), true);
  assert.match(logs[1].text, /new shard found: Brood Crown xp 1\/6/);
});
