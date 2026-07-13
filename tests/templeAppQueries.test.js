import assert from "node:assert/strict";
import test from "node:test";

import { createTempleAppQueries } from "../src/app/templeAppQueries.js";

test("temple app queries expose shared Temple state reads", () => {
  const state = {
    temple: {
      activeStoneId: "triangle",
      shardInventory: {
        fang: { xp: 5 }
      },
      stones: {
        triangle: {
          slots: {
            red: "fang"
          },
          activeLines: [],
          inventorySlots: []
        }
      }
    }
  };
  const queries = createTempleAppQueries({
    state,
    colors: [
      { id: "red", name: "Ember", hex: "#f00" }
    ],
    stones: {
      triangle: {
        id: "triangle",
        name: "Triangle",
        unlocked: true,
        maxActiveLines: 1,
        modifiers: [],
        sockets: [
          { id: "red_socket", colorId: "red" }
        ],
        links: []
      }
    },
    shards: {
      fang: {
        name: "Fang",
        xpToMax: 5,
        equipColors: ["red"],
        affectedBy: ["red"],
        colorEffects: {
          red: [
            { type: "party_atk", min: 1, max: 3 },
            { type: "loot_hide", min: 2, max: 4 }
          ]
        }
      }
    },
    inventorySlots: 2
  });

  assert.equal(queries.activeStoneDefinition().name, "Triangle");
  assert.equal(queries.colorName("red"), "Ember");
  assert.equal(queries.colorName("unknown"), "unknown");
  assert.equal(queries.hasShard("fang"), true);
  assert.deepEqual(queries.bonuses(), {
    party_atk: 3,
    party_def: 0,
    party_utility: 0,
    recovery_reduce: 0,
    loot_hide: 4,
    loot_ore: 0,
    loot_wood: 0,
    loot_coin: 0
  });
  assert.deepEqual(queries.lootBonus(), { hide: 4 });
});
