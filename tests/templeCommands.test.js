import assert from "node:assert/strict";
import test from "node:test";
import { createInitialState } from "../src/app/appState.js";
import { SHARDS, TEMPLE_STONES } from "../src/game/temple/templeData.js";
import {
  equipShard,
  firstFreeInventorySlot,
  moveShardToInventorySlot,
  normalizedInventorySlots,
  selectShard,
  selectTempleStone,
  toggleTempleLine
} from "../src/game/temple/templeCommands.js";
import { activeTempleStoneState } from "../src/game/temple/templeState.js";

function templeWithShards() {
  const temple = createInitialState({ templeInventorySlots: 20 }).temple;
  temple.shardInventory.broodCrown = { xp: 1 };
  temple.shardInventory.copperSplinter = { xp: 1 };
  temple.shardInventory.wardPrism = { xp: 1 };
  return temple;
}

test("normalizedInventorySlots removes equipped/duplicate shards and backfills owned shards", () => {
  const temple = templeWithShards();
  const stoneState = activeTempleStoneState(temple);
  stoneState.inventorySlots = ["cellarFang", "cellarFang", "copperSplinter"];

  const slots = normalizedInventorySlots(temple, { inventorySlots: 4, shards: SHARDS, stones: TEMPLE_STONES });

  assert.equal(slots.length, 4);
  assert.equal(slots.includes("cellarFang"), false);
  assert.equal(slots.includes("copperSplinter"), true);
  assert.equal(slots.includes("wardPrism"), true);
  assert.equal(firstFreeInventorySlot(temple, { inventorySlots: 4, shards: SHARDS, stones: TEMPLE_STONES }) >= 0, true);
});

test("selectTempleStone and selectShard mutate active selection", () => {
  const temple = templeWithShards();

  assert.equal(selectTempleStone(temple, "square", TEMPLE_STONES).ok, true);
  assert.equal(temple.activeStoneId, "square");
  selectShard(temple, "wardPrism");
  assert.equal(temple.selectedShardId, "wardPrism");
});

test("moveShardToInventorySlot swaps inventory shards and unequips socketed shards", () => {
  const temple = templeWithShards();
  const options = { inventorySlots: 5, shards: SHARDS, stones: TEMPLE_STONES };
  normalizedInventorySlots(temple, options);

  const moved = moveShardToInventorySlot(temple, "copperSplinter", 0, options);
  assert.equal(moved.ok, true);
  assert.equal(activeTempleStoneState(temple, options).inventorySlots[0], "copperSplinter");

  const unequipped = moveShardToInventorySlot(temple, "cellarFang", 3, options);
  assert.equal(unequipped.ok, true);
  assert.equal(unequipped.action, "unequipped");
  assert.equal(activeTempleStoneState(temple, options).slots.ember, null);
});

test("equipShard blocks invalid sockets and equips valid shards", () => {
  const temple = templeWithShards();
  const options = { inventorySlots: 5, shards: SHARDS, stones: TEMPLE_STONES };

  const invalid = equipShard(temple, "azure", "cellarFang", options);
  assert.equal(invalid.ok, false);
  assert.equal(invalid.reason, "invalid socket");

  const equipped = equipShard(temple, "azure", "wardPrism", options);
  assert.equal(equipped.ok, true);
  assert.equal(activeTempleStoneState(temple, options).slots.azure, "wardPrism");
  assert.equal(temple.selectedShardId, "wardPrism");
});

test("equipShard replaces existing shard and returns replaced shard to inventory", () => {
  const temple = templeWithShards();
  const options = { inventorySlots: 5, shards: SHARDS, stones: TEMPLE_STONES };

  equipShard(temple, "ember", "broodCrown", options);
  const result = equipShard(temple, "ember", "cellarFang", options);

  assert.equal(result.ok, true);
  assert.equal(result.replacedShardId, "broodCrown");
  assert.equal(activeTempleStoneState(temple, options).slots.ember, "cellarFang");
  assert.equal(activeTempleStoneState(temple, options).inventorySlots.includes("broodCrown"), true);
});

test("toggleTempleLine toggles and enforces active-line capacity", () => {
  const temple = createInitialState({ templeInventorySlots: 20 }).temple;

  const disabled = toggleTempleLine(temple, "ember", "verdant", TEMPLE_STONES);
  assert.equal(disabled.action, "disabled");
  assert.deepEqual(activeTempleStoneState(temple).activeLines, []);

  const enabled = toggleTempleLine(temple, "verdant", "azure", TEMPLE_STONES);
  assert.equal(enabled.action, "enabled");
  toggleTempleLine(temple, "azure", "ember", TEMPLE_STONES);
  assert.deepEqual(activeTempleStoneState(temple).activeLines, [{ a: "azure", b: "ember" }]);
});
