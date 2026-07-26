import assert from "node:assert/strict";
import test from "node:test";

import { spendWorkshopUpgradePoint } from "../src/game/workshop/workshopCommands.js";
import { advanceWorkshopProduction, advanceWorkshopResearch, ensureWorkshopState, setWorkshopSlotAutoInputs, setWorkshopSlotRecipe, workshopProductionProfile, workshopSlotCount } from "../src/game/workshop/workshopRuntime.js";

test("workshop production crafts selected recipes deterministically", () => {
  const state = {
    tavern: { jobs: { workshop: 2, research: 0 } },
    resources: { wood: 6 },
    workshop: { slots: [{ recipeId: "planks", progress: 0 }], recipeXp: {}, researchProgress: 0, progression: { points: {}, availablePoints: 0 } }
  };
  const events = advanceWorkshopProduction(state, 8);
  assert.equal(events.length, 1);
  assert.equal(events[0].type, "crafted");
  assert.equal(state.resources.wood, 3);
  assert.equal(state.resources.planks, 1);
  assert.equal(state.workshop.recipeXp.planks, 1);
});

test("workshop production can produce food as rations", () => {
  const state = {
    tavern: { jobs: { workshop: 1, research: 0 } },
    resources: { food: 0 },
    workshop: { slots: [{ recipeId: "rations", progress: 0 }], recipeXp: {}, researchProgress: 0, progression: { points: {}, availablePoints: 0 } }
  };

  const events = advanceWorkshopProduction(state, 6);

  assert.equal(events.length, 1);
  assert.equal(events[0].recipe.id, "rations");
  assert.equal(state.resources.food, 2);
  assert.equal(state.workshop.recipeXp.rations, 1);
});

test("workshop production only advances manned stations in slot order", () => {
  const state = {
    tavern: { jobs: { workshop: 2, research: 0 } },
    resources: { wood: 18 },
    workshop: {
      slots: [
        { recipeId: "planks", progress: 0 },
        { recipeId: "planks", progress: 0 },
        { recipeId: "planks", progress: 0 },
        { recipeId: "planks", progress: 0 }
      ],
      recipeXp: {},
      researchProgress: 0,
      progression: { points: { sharperSaws: 1, workerBenches: 3 }, availablePoints: 0 }
    }
  };
  advanceWorkshopProduction(state, 4);
  assert.equal(state.workshop.slots[0].progress, 4.4);
  assert.equal(state.workshop.slots[1].progress, 4.4);
  assert.equal(state.workshop.slots[2].progress, 0);
  assert.equal(state.workshop.slots[3].progress, 0);
});

test("workshop overflow workers increase production speed fractionally", () => {
  const state = {
    tavern: { jobs: { workshop: 6, research: 0 } },
    resources: { wood: 100 },
    workshop: {
      slots: [
        { recipeId: "planks", progress: 0 },
        { recipeId: "planks", progress: 0 },
        { recipeId: "planks", progress: 0 },
        { recipeId: "planks", progress: 0 }
      ],
      recipeXp: {},
      researchProgress: 0,
      progression: { points: { sharperSaws: 1, workerBenches: 3 }, availablePoints: 0 }
    }
  };

  const profile = workshopProductionProfile(state);
  assert.equal(profile.activeSlots, 4);
  assert.equal(profile.assistants, 2);
  assert.equal(Number(profile.speedMultiplier.toFixed(2)), 1.21);

  advanceWorkshopProduction(state, 1);
  assert.equal(Number(state.workshop.slots[0].progress.toFixed(2)), 1.21);
  assert.equal(Number(state.workshop.slots[3].progress.toFixed(2)), 1.21);
});

test("workshop recipe XP unlocks improve real crafting output", () => {
  const state = {
    tavern: { jobs: { workshop: 1, research: 0 } },
    resources: { wood: 2 },
    workshop: {
      slots: [{ recipeId: "planks", progress: 0 }],
      recipeXp: { planks: 36 },
      researchProgress: 0,
      progression: { points: {}, availablePoints: 0 }
    }
  };

  const events = advanceWorkshopProduction(state, 6);

  assert.equal(events.length, 1);
  assert.equal(events[0].recipe.id, "planks");
  assert.equal(state.resources.wood, 0);
  assert.equal(state.resources.planks, 2);
  assert.equal(state.workshop.recipeXp.planks, 37);
});


test("workshop research grants upgrade points", () => {
  const state = {
    tavern: { jobs: { workshop: 0, research: 2 } },
    resources: {},
    workshop: { slots: [{ recipeId: "planks", progress: 0 }], recipeXp: {}, researchProgress: 0, progression: { points: {}, availablePoints: 0 } }
  };
  const result = advanceWorkshopResearch(state, 12);
  assert.equal(result.pointsGained, 1);
  assert.equal(state.workshop.progression.availablePoints, 1);
});

test("workshop upgrades can add slots", () => {
  const state = {
    tavern: { jobs: { workshop: 0, research: 0 } },
    resources: {},
    workshop: { slots: [{ recipeId: "planks", progress: 0 }], recipeXp: {}, researchProgress: 0, progression: { points: {}, availablePoints: 2 } }
  };
  assert.equal(spendWorkshopUpgradePoint(state, "sharperSaws").ok, true);
  assert.equal(spendWorkshopUpgradePoint(state, "workerBenches").ok, true);
  ensureWorkshopState(state);
  assert.equal(workshopSlotCount(state), 2);
  assert.equal(state.workshop.slots.length, 2);
});

test("workshop recipe command resets slot progress", () => {
  const state = {
    tavern: { jobs: { workshop: 0, research: 0 } },
    resources: {},
    workshop: { slots: [{ recipeId: "planks", progress: 4 }], recipeXp: {}, researchProgress: 0, progression: { points: {}, availablePoints: 0 } }
  };
  const result = setWorkshopSlotRecipe(state, 0, "simpleFurniture");
  assert.equal(result.ok, true);
  assert.deepEqual(state.workshop.slots[0], {
    recipeId: "simpleFurniture",
    targetRecipeId: "simpleFurniture",
    activeRecipeId: "simpleFurniture",
    autoInputs: false,
    progress: 0
  });
});

test("workshop auto inputs temporarily crafts missing prerequisites", () => {
  const state = {
    tavern: { jobs: { workshop: 1, research: 0 } },
    resources: { wood: 6, planks: 0 },
    workshop: {
      slots: [{ recipeId: "simpleFurniture", autoInputs: true, progress: 0 }],
      recipeXp: {},
      researchProgress: 0,
      progression: { points: {}, availablePoints: 0 }
    }
  };

  let events = advanceWorkshopProduction(state, 8);
  assert.equal(events.length, 1);
  assert.equal(events[0].recipe.id, "planks");
  assert.equal(state.workshop.slots[0].targetRecipeId, "simpleFurniture");
  assert.equal(state.workshop.slots[0].activeRecipeId, "planks");
  assert.equal(state.resources.planks, 1);

  events = advanceWorkshopProduction(state, 8);
  assert.equal(events.length, 1);
  assert.equal(events[0].recipe.id, "planks");
  assert.equal(state.resources.planks, 2);

  events = advanceWorkshopProduction(state, 12);
  assert.equal(events.length, 1);
  assert.equal(events[0].recipe.id, "simpleFurniture");
  assert.equal(state.workshop.slots[0].activeRecipeId, "simpleFurniture");
  assert.equal(state.resources.planks, 0);
  assert.equal(state.resources.comfort_goods, 10);
});

test("workshop auto input toggle resets active progress", () => {
  const state = {
    tavern: { jobs: { workshop: 0, research: 0 } },
    resources: {},
    workshop: { slots: [{ recipeId: "planks", progress: 4 }], recipeXp: {}, researchProgress: 0, progression: { points: {}, availablePoints: 0 } }
  };

  const result = setWorkshopSlotAutoInputs(state, 0, true);
  assert.equal(result.ok, true);
  assert.equal(state.workshop.slots[0].autoInputs, true);
  assert.equal(state.workshop.slots[0].progress, 0);
});
