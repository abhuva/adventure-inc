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
  const other = job === "wood" ? "ore" : "wood";
  if ((state.tavern.jobs[other] || 0) <= 0) {
    return { ok: false, reason: "no worker", job, other };
  }
  state.tavern.jobs[other] -= 1;
  state.tavern.jobs[job] = (state.tavern.jobs[job] || 0) + 1;
  return { ok: true, job, other };
}
