import assert from "node:assert/strict";
import test from "node:test";

import {
  bindInventoryDrop,
  bindShardTokenInteractions,
  bindTempleBoardInteractions
} from "../src/app/templeInteractions.js";

function fakeNode(dataset = {}) {
  const listeners = {};
  const classes = new Set();
  return {
    dataset,
    listeners,
    classList: {
      add(name) {
        classes.add(name);
      },
      contains(name) {
        return classes.has(name);
      },
      remove(name) {
        classes.delete(name);
      }
    },
    addEventListener(type, callback) {
      listeners[type] = callback;
    }
  };
}

function fakeRoot(selectors) {
  return {
    querySelectorAll(selector) {
      return selectors[selector] || [];
    }
  };
}

function dragEvent(shardId = "fang") {
  const data = new Map([["text/plain", shardId]]);
  return {
    defaultPrevented: false,
    dataTransfer: {
      effectAllowed: "",
      getData(type) {
        return data.get(type) || "";
      },
      setData(type, value) {
        data.set(type, value);
      }
    },
    preventDefault() {
      this.defaultPrevented = true;
    }
  };
}

test("bindTempleBoardInteractions wires link clicks and socket drops", () => {
  const calls = [];
  const link = fakeNode({ lineA: "ember", lineB: "azure" });
  const slot = fakeNode({ templeSlot: "ember" });
  const token = fakeNode({ selectShard: "fang", shardToken: "fang", tokenSource: "inventory", inventoryIndex: "2" });
  const matrix = fakeRoot({
    ".temple-link-hit": [link],
    "[data-temple-slot]": [slot],
    "[data-select-shard]": [token],
    "[data-shard-token]": [token]
  });

  bindTempleBoardInteractions({
    matrixElement: matrix,
    onToggleLine: (a, b) => calls.push(["line", a, b]),
    onEquipShard: (socketId, shardId) => calls.push(["equip", socketId, shardId]),
    onSelectShard: (shardId) => calls.push(["select", shardId]),
    hasShard: () => true
  });

  link.listeners.click();
  token.listeners.click();
  const over = dragEvent();
  slot.listeners.dragover(over);
  assert.equal(over.defaultPrevented, true);
  assert.equal(slot.classList.contains("drop-target"), true);
  slot.listeners.drop(dragEvent("fang"));

  assert.deepEqual(calls, [
    ["line", "ember", "azure"],
    ["select", "fang"],
    ["equip", "ember", "fang"]
  ]);
  assert.equal(slot.classList.contains("drop-target"), false);
});

test("bindShardTokenInteractions blocks dragging unknown shards and marks known shards", () => {
  const unknown = fakeNode({ selectShard: "unknown", shardToken: "unknown" });
  const known = fakeNode({ selectShard: "fang", shardToken: "fang", tokenSource: "socket", inventoryIndex: "1" });
  const root = fakeRoot({
    "[data-select-shard]": [unknown, known],
    "[data-shard-token]": [unknown, known]
  });
  const selected = [];

  bindShardTokenInteractions({
    root,
    onSelectShard: (shardId) => selected.push(shardId),
    hasShard: (shardId) => shardId === "fang"
  });

  unknown.listeners.click();
  known.listeners.click();
  const blocked = dragEvent("unknown");
  unknown.listeners.dragstart(blocked);
  assert.equal(blocked.defaultPrevented, true);

  const allowed = dragEvent();
  known.listeners.dragstart(allowed);
  assert.equal(allowed.defaultPrevented, false);
  assert.equal(allowed.dataTransfer.getData("text/plain"), "fang");
  assert.equal(allowed.dataTransfer.getData("source"), "socket");
  assert.equal(allowed.dataTransfer.getData("inventoryIndex"), "1");
  assert.equal(allowed.dataTransfer.effectAllowed, "move");
  assert.equal(known.classList.contains("dragging"), true);
  known.listeners.dragend();
  assert.equal(known.classList.contains("dragging"), false);
  assert.deepEqual(selected, ["unknown", "fang"]);
});

test("bindInventoryDrop wires inventory cell drag/drop", () => {
  const calls = [];
  const cell = fakeNode({ inventorySlot: "4" });
  const inventoryElement = fakeRoot({
    "[data-inventory-slot]": [cell]
  });

  bindInventoryDrop({
    inventoryElement,
    onMoveShardToInventorySlot: (shardId, slotIndex) => calls.push([shardId, slotIndex])
  });

  const over = dragEvent();
  cell.listeners.dragover(over);
  assert.equal(over.defaultPrevented, true);
  assert.equal(cell.classList.contains("drop-target"), true);
  cell.listeners.dragleave();
  assert.equal(cell.classList.contains("drop-target"), false);

  cell.listeners.drop(dragEvent("fang"));
  assert.deepEqual(calls, [["fang", 4]]);
  assert.equal(cell.classList.contains("drop-target"), false);
});
