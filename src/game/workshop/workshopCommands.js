import { spendProgressionPoint } from "../progression/progressionGraphCommands.js";
import { WOOD_WORKSHOP_GRAPH } from "./workshopData.js";
import { ensureWorkshopState, setWorkshopSlotAutoInputs, setWorkshopSlotRecipe } from "./workshopRuntime.js";

export function setWorkshopRecipe(state, slotIndex, recipeId) {
  return setWorkshopSlotRecipe(state, slotIndex, recipeId);
}

export function setWorkshopAutoInputs(state, slotIndex, enabled) {
  return setWorkshopSlotAutoInputs(state, slotIndex, enabled);
}

export function spendWorkshopUpgradePoint(state, nodeId) {
  const workshop = ensureWorkshopState(state);
  return spendProgressionPoint(WOOD_WORKSHOP_GRAPH, workshop.progression, nodeId);
}
