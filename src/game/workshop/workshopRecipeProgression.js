import { WORKSHOP_RECIPES } from "./workshopData.js";

export function recipeXp(workshop, recipeId) {
  return Math.max(0, Math.floor(workshop?.recipeXp?.[recipeId] || 0));
}

export function recipeLevelFromXp(xp = 0) {
  return 1 + Math.floor(Math.sqrt(Math.max(0, Number(xp) || 0)));
}

export function recipeXpForLevel(level) {
  const targetLevel = Math.max(1, Math.floor(Number(level) || 1));
  return (targetLevel - 1) ** 2;
}

export function recipeProgress(workshop, recipeId) {
  const xp = recipeXp(workshop, recipeId);
  const level = recipeLevelFromXp(xp);
  const currentLevelXp = recipeXpForLevel(level);
  const nextLevelXp = recipeXpForLevel(level + 1);
  return {
    recipeId,
    xp,
    level,
    currentLevelXp,
    nextLevelXp,
    xpIntoLevel: xp - currentLevelXp,
    xpForNextLevel: nextLevelXp - currentLevelXp
  };
}

export function recipeUnlockStates(workshop, recipeId) {
  const recipe = WORKSHOP_RECIPES[recipeId];
  const progress = recipeProgress(workshop, recipeId);
  return (recipe?.levelUnlocks || []).map((unlock) => ({
    ...unlock,
    unlocked: progress.level >= unlock.level
  }));
}

export function effectiveWorkshopRecipe(recipe, workshop) {
  if (!recipe) return null;
  const unlocks = recipeUnlockStates(workshop, recipe.id).filter((unlock) => unlock.unlocked);
  const effective = {
    ...recipe,
    input: { ...(recipe.input || {}) },
    output: { ...(recipe.output || {}) },
    workRequired: recipe.workRequired
  };

  unlocks.forEach((unlock) => {
    if (unlock.input) {
      Object.entries(unlock.input).forEach(([resourceId, delta]) => {
        effective.input[resourceId] = Math.max(0, (effective.input[resourceId] || 0) + delta);
        if (effective.input[resourceId] <= 0) delete effective.input[resourceId];
      });
    }
    if (unlock.output) {
      Object.entries(unlock.output).forEach(([resourceId, delta]) => {
        effective.output[resourceId] = Math.max(0, (effective.output[resourceId] || 0) + delta);
      });
    }
    if (unlock.workRequiredPct) {
      effective.workRequired *= 1 + unlock.workRequiredPct / 100;
    }
    if (unlock.workRequiredDelta) {
      effective.workRequired += unlock.workRequiredDelta;
    }
  });

  effective.workRequired = Math.max(1, Math.floor(effective.workRequired));
  return effective;
}
