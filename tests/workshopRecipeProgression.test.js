import assert from "node:assert/strict";
import test from "node:test";

import { WORKSHOP_RECIPES } from "../src/game/workshop/workshopData.js";
import {
  effectiveWorkshopRecipe,
  recipeLevelFromXp,
  recipeProgress,
  recipeUnlockStates
} from "../src/game/workshop/workshopRecipeProgression.js";

test("recipe level derives deterministic square XP thresholds", () => {
  assert.equal(recipeLevelFromXp(0), 1);
  assert.equal(recipeLevelFromXp(1), 2);
  assert.equal(recipeLevelFromXp(3), 2);
  assert.equal(recipeLevelFromXp(4), 3);
});

test("recipe unlocks alter effective cost output and work", () => {
  const workshop = { recipeXp: { planks: 36 } };
  const progress = recipeProgress(workshop, "planks");
  assert.equal(progress.level, 7);

  const unlocks = recipeUnlockStates(workshop, "planks");
  assert.deepEqual(unlocks.map((unlock) => unlock.unlocked), [true, true, true]);

  const effective = effectiveWorkshopRecipe(WORKSHOP_RECIPES.planks, workshop);
  assert.deepEqual(effective.input, { wood: 2 });
  assert.deepEqual(effective.output, { planks: 2 });
  assert.equal(effective.workRequired, 6);
});
