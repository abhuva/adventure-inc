import test from "node:test";
import assert from "node:assert/strict";

import { heroStats } from "../src/game/roster/heroStats.js";

test("heroStats applies level, gear, and learned skill effects", () => {
  const hero = {
    base: { hp: 30, atk: 5, def: 2, utility: 1 },
    level: 3,
    gear: ["ironBlade", "wardCharm"],
    learnedSkills: {
      "job.guard.steady_stance": 1,
      "job.guard.shield_wall": 2,
      "race.elf.light_step": 1
    }
  };

  assert.deepEqual(heroStats(hero), {
    hpMax: 42,
    atk: 11,
    def: 6,
    utility: 1,
    travelSpeed: 1,
    recoveryReduce: 0,
    foodCostReduce: 0
  });
});
