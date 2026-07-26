import assert from "node:assert/strict";
import test from "node:test";

import { createInitialState } from "../src/app/appState.js";
import {
  incrementDungeonClear,
  isLocationUnlocked,
  unlockPopulationLocations
} from "../src/game/progression/worldProgression.js";

test("world progression starts with tavern and rat cellar only", () => {
  const state = createInitialState();

  assert.equal(isLocationUnlocked(state, "tavern"), true);
  assert.equal(isLocationUnlocked(state, "cellar"), true);
  assert.equal(isLocationUnlocked(state, "wood"), false);
  assert.equal(isLocationUnlocked(state, "mine"), false);
});

test("population and dungeon clear gates reveal later locations", () => {
  const state = createInitialState();

  assert.deepEqual(unlockPopulationLocations(state).map((item) => item.locationId), ["wood", "ore"]);
  assert.equal(isLocationUnlocked(state, "wood"), true);

  for (let index = 0; index < 49; index += 1) {
    incrementDungeonClear(state, "cellar", { success: true });
  }
  assert.equal(isLocationUnlocked(state, "mine"), false);

  const result = incrementDungeonClear(state, "cellar", { success: true });

  assert.equal(result.count, 50);
  assert.deepEqual(result.unlocked, ["mine"]);
  assert.equal(isLocationUnlocked(state, "mine"), true);

  for (let index = 0; index < 50; index += 1) {
    incrementDungeonClear(state, "mine", { success: true });
  }
  assert.equal(isLocationUnlocked(state, "barracks"), false);
});
