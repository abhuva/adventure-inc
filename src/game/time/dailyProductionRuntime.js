import { applyDailyTavernIncome as defaultApplyDailyTavernIncome } from "./gameClock.js";
import { repeatedPlanPartyIds as defaultRepeatedPlanPartyIds } from "../dungeon/repeatedPlanAutomation.js";

export function applyDailyProduction({
  state,
  applyDailyTavernIncome = defaultApplyDailyTavernIncome,
  repeatedPlanPartyIds = defaultRepeatedPlanPartyIds
}) {
  const income = applyDailyTavernIncome(state);
  return {
    income,
    repeatedPartyIds: repeatedPlanPartyIds(state.repeatedPlans)
  };
}
