import assert from "node:assert/strict";
import test from "node:test";

import { renderTemplePanel } from "../src/ui/templePanel.js";

function fakeElement(queryResults = {}) {
  return {
    innerHTML: "",
    textContent: "",
    querySelectorAll(selector) {
      return queryResults[selector] || [];
    }
  };
}

function fakeButton(dataset = {}) {
  return {
    dataset,
    listeners: {},
    addEventListener(type, callback) {
      this.listeners[type] = callback;
    }
  };
}

test("renderTemplePanel renders board, inventory, buffs, detail, and stone binding", () => {
  const selectedStones = [];
  const stoneButton = fakeButton({ templeStone: "square" });
  const el = {
    templeStatus: fakeElement(),
    templeStoneButtons: fakeElement({ "[data-temple-stone]": [stoneButton] }),
    templeMatrix: fakeElement(),
    shardInventoryRows: fakeElement(),
    templeBuffRows: fakeElement(),
    shardDetailBox: fakeElement()
  };
  const colors = [
    { id: "red", name: "Ember", hex: "#f00" },
    { id: "blue", name: "Azure", hex: "#00f" }
  ];
  const stone = {
    name: "Triangle",
    maxActiveLines: 1,
    modifierText: "fight +10%",
    sockets: [
      { id: "ember", label: "Ember", colorId: "red", x: 20, y: 20 },
      { id: "azure", label: "Azure", colorId: "blue", x: 70, y: 70 }
    ],
    links: [["red", "blue"]]
  };
  const shards = {
    fang: {
      name: "Fang",
      source: "Rat Cellar",
      xpToMax: 5,
      equipColors: ["red"],
      affectedBy: ["red", "blue"],
      colorEffects: {
        red: [{ type: "party_atk", min: 1, max: 3 }]
      },
      dungeonId: "rat_cellar"
    }
  };
  const temple = {
    selectedShardId: "fang",
    shardInventory: {
      fang: { xp: 2 }
    },
    dungeonVisits: {
      rat_cellar: 4
    },
    bossVisits: {
      rat_cellar: 1
    }
  };
  const stoneState = {
    slots: {
      red: "fang"
    },
    activeLines: [
      { a: "red", b: "blue" }
    ]
  };

  renderTemplePanel({
    el,
    temple,
    colors,
    stones: {
      triangle: { name: "Triangle", unlocked: true },
      square: { name: "Square", unlocked: true }
    },
    shards,
    stone,
    stoneState,
    activeStoneId: "triangle",
    normalizedInventorySlots: ["fang", null],
    bonuses: {
      party_atk: 2
    },
    hasShard: (shardId) => shardId === "fang",
    shardEffectValue: () => 2,
    templeColor: (colorId) => colors.find((color) => color.id === colorId),
    colorName: (colorId) => colors.find((color) => color.id === colorId).name,
    socketById: (socketId) => stone.sockets.find((socket) => socket.colorId === socketId),
    isLineActive: () => true,
    onSelectStone: (stoneId) => selectedStones.push(stoneId),
    onToggleLine: () => {},
    onEquipShard: () => {},
    onSelectShard: () => {},
    onMoveShardToInventorySlot: () => {}
  });

  assert.match(el.templeStatus.textContent, /Triangle \/ links active: 1\/1/);
  assert.match(el.templeMatrix.innerHTML, /Fang/);
  assert.match(el.shardInventoryRows.innerHTML, /data-shard-token="fang"/);
  assert.match(el.templeBuffRows.innerHTML, /party atk \+2/);
  assert.match(el.shardDetailBox.innerHTML, /visits 4, boss 1/);

  stoneButton.listeners.click();
  assert.deepEqual(selectedStones, ["square"]);
});
