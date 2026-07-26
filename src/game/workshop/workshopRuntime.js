import { progressionEffects } from "../progression/progressionGraphEffects.js";
import { workerProductionMultiplier } from "../settlement/workforceModel.js";
import { WORKSHOP_RECIPES, WOOD_WORKSHOP_GRAPH } from "./workshopData.js";
import { effectiveWorkshopRecipe } from "./workshopRecipeProgression.js";

export const WORKSHOP_RESEARCH_REQUIRED = 24;
export const WORKSHOP_ASSISTANT_SPEED_PER_WORKER = 0.05;

export function ensureWorkshopState(state) {
  state.workshop = {
    slots: [createWorkshopSlot("rations")],
    recipeXp: {},
    researchProgress: 0,
    progression: { points: {}, availablePoints: 0 },
    ...(state.workshop || {})
  };
  state.workshop.progression = {
    points: {},
    availablePoints: 0,
    ...(state.workshop.progression || {})
  };
  normalizeWorkshopSlots(state);
  return state.workshop;
}

export function workshopBonuses(workshop) {
  return progressionEffects(WOOD_WORKSHOP_GRAPH, workshop?.progression || { points: {} });
}

export function workshopSlotCount(state) {
  const workshop = ensureWorkshopState(state);
  const bonuses = workshopBonuses(workshop);
  return Math.max(1, 1 + (bonuses.workshop_slot_add || 0));
}

export function workshopProductionProfile(state) {
  const workshop = ensureWorkshopState(state);
  const workers = Math.max(0, Math.floor(state.tavern?.jobs?.workshop || 0));
  const activeSlots = Math.min(workers, workshop.slots.length);
  const assistants = Math.max(0, workers - activeSlots);
  const bonuses = workshopBonuses(workshop);
  const upgradeSpeedMultiplier = 1 + (bonuses.workshop_speed_pct || 0) / 100;
  const assistantSpeedMultiplier = 1 + assistants * WORKSHOP_ASSISTANT_SPEED_PER_WORKER;
  const upkeepMultiplier = workerProductionMultiplier(state);
  return {
    workers,
    activeSlots,
    assistants,
    bonuses,
    speedMultiplier: upgradeSpeedMultiplier * assistantSpeedMultiplier * upkeepMultiplier,
    upkeepMultiplier
  };
}

export function normalizeWorkshopSlots(state) {
  const workshop = state.workshop || {};
  const target = workshopSlotCountWithoutNormalize(state, workshop);
  const slots = Array.isArray(workshop.slots) ? workshop.slots : [];
  while (slots.length < target) slots.push(createWorkshopSlot("planks"));
  while (slots.length > target) slots.pop();
  workshop.slots = slots.map(normalizeWorkshopSlot);
  state.workshop = workshop;
}

export function setWorkshopSlotRecipe(state, slotIndex, recipeId) {
  ensureWorkshopState(state);
  const index = Math.max(0, Math.floor(Number(slotIndex) || 0));
  const recipe = WORKSHOP_RECIPES[recipeId];
  if (!recipe) return { ok: false, reason: "unknown recipe", recipeId };
  if (!state.workshop.slots[index]) return { ok: false, reason: "missing slot", slotIndex: index };
  state.workshop.slots[index] = {
    ...state.workshop.slots[index],
    recipeId,
    targetRecipeId: recipeId,
    activeRecipeId: recipeId,
    progress: 0
  };
  return { ok: true, slotIndex: index, recipe };
}

export function setWorkshopSlotAutoInputs(state, slotIndex, enabled) {
  ensureWorkshopState(state);
  const index = Math.max(0, Math.floor(Number(slotIndex) || 0));
  if (!state.workshop.slots[index]) return { ok: false, reason: "missing slot", slotIndex: index };
  state.workshop.slots[index].autoInputs = Boolean(enabled);
  state.workshop.slots[index].progress = 0;
  return { ok: true, slotIndex: index, enabled: state.workshop.slots[index].autoInputs };
}

export function advanceWorkshopProduction(state, hours) {
  ensureWorkshopState(state);
  normalizeWorkshopSlots(state);
  const { activeSlots, bonuses, speedMultiplier } = workshopProductionProfile(state);
  const workshop = state.workshop;
  const workPerSlot = speedMultiplier * hours;
  const events = [];
  if (activeSlots <= 0 || workPerSlot <= 0) return events;

  workshop.slots.forEach((slot, index) => {
    if (index >= activeSlots) return;
    const targetRecipeId = validRecipeId(slot.targetRecipeId || slot.recipeId);
    const nextActiveRecipeId = slot.autoInputs
      ? resolveWorkshopActiveRecipeId(targetRecipeId, state.resources)
      : targetRecipeId;
    if (slot.activeRecipeId !== nextActiveRecipeId) {
      slot.activeRecipeId = nextActiveRecipeId;
      slot.recipeId = targetRecipeId;
      slot.progress = 0;
    }
    const recipe = WORKSHOP_RECIPES[slot.activeRecipeId];
    let effectiveRecipe = effectiveWorkshopRecipe(recipe, workshop);
    if (!recipe || !effectiveRecipe) return;
    slot.progress += workPerSlot;
    while (slot.progress >= effectiveRecipe.workRequired) {
      if (!canPay(state.resources, effectiveRecipe.input)) {
        slot.progress = effectiveRecipe.workRequired;
        events.push({ type: "blocked", reason: "input", slotIndex: index, recipe, effectiveRecipe, targetRecipe: WORKSHOP_RECIPES[targetRecipeId] });
        break;
      }
      pay(state.resources, effectiveRecipe.input);
      const output = applyWorkshopOutputBonuses(effectiveRecipe.output, recipe, bonuses);
      addResources(state.resources, output);
      workshop.recipeXp[recipe.id] = (workshop.recipeXp[recipe.id] || 0) + (recipe.xpPerCraft || 1);
      slot.progress -= effectiveRecipe.workRequired;
      events.push({ type: "crafted", slotIndex: index, recipe, effectiveRecipe, targetRecipe: WORKSHOP_RECIPES[targetRecipeId], output });
      effectiveRecipe = effectiveWorkshopRecipe(recipe, workshop);
    }
  });
  return events;
}

export function advanceWorkshopResearch(state, hours) {
  const workshop = ensureWorkshopState(state);
  const workers = Math.max(0, state.tavern?.jobs?.research || 0);
  const bonuses = workshopBonuses(workshop);
  const speedMultiplier = (1 + (bonuses.workshop_research_speed_pct || 0) / 100) * workerProductionMultiplier(state);
  workshop.researchProgress += workers * speedMultiplier * hours;
  let pointsGained = 0;
  while (workshop.researchProgress >= WORKSHOP_RESEARCH_REQUIRED) {
    workshop.researchProgress -= WORKSHOP_RESEARCH_REQUIRED;
    workshop.progression.availablePoints = (workshop.progression.availablePoints || 0) + 1;
    pointsGained += 1;
  }
  return { pointsGained, researchProgress: workshop.researchProgress, availablePoints: workshop.progression.availablePoints };
}

function workshopSlotCountWithoutNormalize(state, workshop) {
  const bonuses = workshopBonuses(workshop);
  return Math.max(1, 1 + (bonuses.workshop_slot_add || 0));
}

function createWorkshopSlot(recipeId) {
  const validId = validRecipeId(recipeId);
  return {
    recipeId: validId,
    targetRecipeId: validId,
    activeRecipeId: validId,
    autoInputs: false,
    progress: 0
  };
}

function normalizeWorkshopSlot(slot = {}) {
  const targetRecipeId = validRecipeId(slot.targetRecipeId || slot.recipeId);
  const activeRecipeId = validRecipeId(slot.activeRecipeId || targetRecipeId);
  return {
    recipeId: targetRecipeId,
    targetRecipeId,
    activeRecipeId,
    autoInputs: Boolean(slot.autoInputs),
    progress: Math.max(0, Number(slot.progress || 0))
  };
}

function validRecipeId(recipeId) {
  return WORKSHOP_RECIPES[recipeId] ? recipeId : "rations";
}

function resolveWorkshopActiveRecipeId(targetRecipeId, resources = {}, visited = new Set()) {
  const recipe = WORKSHOP_RECIPES[targetRecipeId];
  if (!recipe || canPay(resources, recipe.input)) return targetRecipeId;
  if (visited.has(targetRecipeId)) return targetRecipeId;
  visited.add(targetRecipeId);

  for (const [resourceId, required] of Object.entries(recipe.input || {})) {
    if ((resources[resourceId] || 0) >= required) continue;
    const producer = recipeProducing(resourceId);
    if (!producer) return targetRecipeId;
    return resolveWorkshopActiveRecipeId(producer.id, resources, visited);
  }
  return targetRecipeId;
}

function recipeProducing(resourceId) {
  return Object.values(WORKSHOP_RECIPES).find((recipe) => (recipe.output?.[resourceId] || 0) > 0);
}

function canPay(resources = {}, cost = {}) {
  return Object.entries(cost).every(([key, value]) => (resources[key] || 0) >= value);
}

function pay(resources, cost = {}) {
  Object.entries(cost).forEach(([key, value]) => {
    resources[key] = Math.max(0, (resources[key] || 0) - value);
  });
}

function addResources(resources, output = {}) {
  Object.entries(output).forEach(([key, value]) => {
    resources[key] = (resources[key] || 0) + value;
  });
}

function applyWorkshopOutputBonuses(output, recipe, bonuses) {
  if (recipe.id !== "simpleFurniture") return { ...output };
  const multiplier = 1 + (bonuses.comfort_output_pct || 0) / 100;
  return Object.fromEntries(Object.entries(output).map(([key, value]) => [key, Math.max(1, Math.floor(value * multiplier))]));
}
