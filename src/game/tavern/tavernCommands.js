import { assignWorkerToJob } from "../settlement/workforceModel.js";

export function tavernUpgradeCost(state, blueprints) {
  return state.blueprints.bunkRoom ? blueprints.bunkRoom.cost : { wood: 10, ore: 4 };
}

export function upgradeTavern(state, blueprints, { canPay, pay } = {}) {
  const cost = tavernUpgradeCost(state, blueprints);
  if (canPay && !canPay(cost)) {
    return { ok: false, reason: "cost", cost };
  }
  if (pay) pay(cost);
  state.tavern.capacity += state.blueprints.bunkRoom ? 2 : 1;
  state.tavern.population += 1;
  return { ok: true, cost, capacity: state.tavern.capacity, population: state.tavern.population };
}

export function assignWorker(state, job) {
  return assignWorkerToJob(state, job);
}
