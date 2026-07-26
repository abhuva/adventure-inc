import {
  ensureSettlementState,
  UNPAID_WORKER_PRODUCTION_MULTIPLIER,
  WORKER_UPKEEP_COIN
} from "./workforceModel.js";

export function applyDailySettlementUpkeep(state) {
  ensureSettlementState(state);
  state.resources = state.resources || {};
  const settlement = state.settlement;
  const workers = settlement.availableWorkers || 0;

  const comfortRequired = 0;
  const comfortConsumed = 0;
  const comfortMissing = 0;
  const wageRequired = workers * WORKER_UPKEEP_COIN;
  const wagePaid = Math.min(wageRequired, Math.max(0, state.resources.coin || 0));
  state.resources.coin = Math.max(0, (state.resources.coin || 0) - wagePaid);
  const wageMissing = wageRequired - wagePaid;
  settlement.wagePerWorker = WORKER_UPKEEP_COIN;
  settlement.productionMultiplier = wageMissing > 0 ? UNPAID_WORKER_PRODUCTION_MULTIPLIER : 1;

  return {
    workers,
    comfortRequired,
    comfortConsumed,
    comfortMissing,
    wageRequired,
    wagePaid,
    wageMissing,
    productionMultiplier: settlement.productionMultiplier,
    happiness: settlement.happiness,
    availableWorkers: settlement.availableWorkers
  };
}
