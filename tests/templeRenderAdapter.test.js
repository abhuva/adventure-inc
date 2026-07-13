import assert from "node:assert/strict";
import test from "node:test";

import { createTempleRenderAdapter } from "../src/app/templeRenderAdapter.js";

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

test("temple render adapter derives active stone render state from app state", () => {
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
  const stones = {
    triangle: {
      id: "triangle",
      name: "Triangle",
      unlocked: true,
      maxActiveLines: 1,
      modifierText: "fight +10%",
      modifiers: [],
      sockets: [
        { id: "ember", label: "Ember", colorId: "red", x: 20, y: 20 },
        { id: "azure", label: "Azure", colorId: "blue", x: 70, y: 70 }
      ],
      links: [["red", "blue"]]
    },
    square: {
      id: "square",
      name: "Square",
      unlocked: true,
      maxActiveLines: 2,
      modifierText: "blue +15%",
      modifiers: [],
      sockets: [],
      links: []
    }
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
    },
    loose: {
      name: "Loose Shard",
      source: "Old Mine",
      xpToMax: 5,
      equipColors: ["blue"],
      affectedBy: ["blue"],
      colorEffects: {
        blue: [{ type: "loot_ore", min: 1, max: 2 }]
      },
      dungeonId: "old_mine"
    }
  };
  const state = {
    temple: {
      activeStoneId: "triangle",
      selectedShardId: "fang",
      shardInventory: {
        fang: { xp: 2 },
        loose: { xp: 1 }
      },
      stones: {
        triangle: {
          slots: {
            red: "fang"
          },
          activeLines: [
            { a: "red", b: "blue" }
          ],
          inventorySlots: ["loose", null]
        }
      },
      dungeonVisits: {
        rat_cellar: 4
      },
      bossVisits: {
        rat_cellar: 1
      }
    }
  };
  const adapter = createTempleRenderAdapter({
    state,
    el,
    colors,
    stones,
    shards,
    inventorySlots: 2,
    hasShard: (shardId) => shardId === "fang" || shardId === "loose",
    templeColor: (colorId) => colors.find((color) => color.id === colorId),
    colorName: (colorId) => colors.find((color) => color.id === colorId).name,
    onSelectStone: (stoneId) => selectedStones.push(stoneId),
    onToggleLine: () => {},
    onEquipShard: () => {},
    onSelectShard: () => {},
    onMoveShardToInventorySlot: () => {}
  });

  adapter.renderTemple();

  assert.match(el.templeStatus.textContent, /Triangle \/ links active: 1\/1/);
  assert.match(el.templeMatrix.innerHTML, /Fang/);
  assert.match(el.shardInventoryRows.innerHTML, /data-shard-token="loose"/);
  assert.match(el.templeBuffRows.innerHTML, /party atk \+1/);
  assert.match(el.shardDetailBox.innerHTML, /visits 4, boss 1/);

  stoneButton.listeners.click();
  assert.deepEqual(selectedStones, ["square"]);
});
