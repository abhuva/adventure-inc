import assert from "node:assert/strict";
import test from "node:test";

import { createInitialState } from "../src/app/appState.js";
import { awardDungeonMastery } from "../src/game/dungeon/dungeonMastery.js";

test("awardDungeonMastery stores xp, spends graph points, and applies blueprint effects", () => {
  const state = createInitialState();
  const dungeon = {
    id: "cellar",
    name: "Rat Cellar",
    mastery: {
      xpPerPoint: 5,
      nodes: {
        root: {
          name: "Root",
          maxRank: 1,
          requires: [],
          effects: [],
          x: 0,
          y: 0
        },
        blade: {
          name: "Blade Lead",
          maxRank: 1,
          requires: ["root"],
          effects: [{ type: "blueprint_hint", blueprint: "ironBlade", valuePerRank: 1 }],
          x: 1,
          y: 1
        }
      }
    }
  };

  const result = awardDungeonMastery(state, { rewards: { dungeonXp: 10 } }, dungeon);

  assert.equal(state.progression.dungeonMastery.cellar.xp, 10);
  assert.deepEqual(result.autoSpent, ["root", "blade"]);
  assert.equal(state.blueprints.ironBlade, true);
});
