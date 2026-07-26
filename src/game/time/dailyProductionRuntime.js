import { repeatedPlanPartyIds as defaultRepeatedPlanPartyIds } from "../dungeon/repeatedPlanAutomation.js";

export function applyDailyProduction({
  state,
  repeatedPlanPartyIds = defaultRepeatedPlanPartyIds
}) {
  return {
    repeatedPartyIds: repeatedPlanPartyIds(state.repeatedPlans)
  };
}
