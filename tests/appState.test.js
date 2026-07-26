import assert from "node:assert/strict";
import test from "node:test";
import { createInitialState } from "../src/app/appState.js";

test("createInitialState creates independent mutable state objects", () => {
  const first = createInitialState({ templeInventorySlots: 3, replayDefaultMs: 123 });
  const second = createInitialState({ templeInventorySlots: 3, replayDefaultMs: 123 });

  first.resources.coin = 0;
  first.temple.stones.triangle.inventorySlots[0] = "cellarFang";

  assert.equal(second.resources.coin, 10);
  assert.equal(second.temple.stones.triangle.inventorySlots[0], null);
  assert.equal(first.dungeonReplay.playbackMs, 123);
  assert.equal(first.temple.stones.square.inventorySlots.length, 3);
  assert.equal(first.events.activeId, null);
  assert.notEqual(first.events.seen, second.events.seen);
});
