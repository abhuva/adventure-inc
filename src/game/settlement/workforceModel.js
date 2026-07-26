export const WORKFORCE_JOBS = ["wood", "ore", "workshop", "research"];
export const MIN_WORKERS = 3;
export const WORKER_UPKEEP_COIN = 1;
export const UNPAID_WORKER_PRODUCTION_MULTIPLIER = 0.5;

export function ensureSettlementState(state) {
  state.settlement = {
    housingCapacity: 5,
    wagePerWorker: 1,
    happiness: 80,
    availableWorkers: MIN_WORKERS,
    hiredWorkers: MIN_WORKERS,
    productionMultiplier: 1,
    ...(state.settlement || {})
  };
  state.settlement.workSiteUpgrades = {
    wood: 0,
    ore: 0,
    ...(state.settlement.workSiteUpgrades || {})
  };
  state.tavern = state.tavern || {};
  state.tavern.jobs = {
    wood: 0,
    ore: 0,
    workshop: 0,
    research: 0,
    ...(state.tavern.jobs || {})
  };
  state.settlement.happiness = clamp(state.settlement.happiness, 0, 100);
  state.settlement.housingCapacity = Math.max(0, Math.floor(state.settlement.housingCapacity || 0));
  state.settlement.wagePerWorker = WORKER_UPKEEP_COIN;
  state.settlement.hiredWorkers = Math.max(MIN_WORKERS, Math.floor(state.settlement.hiredWorkers ?? state.settlement.availableWorkers ?? MIN_WORKERS));
  state.settlement.availableWorkers = Math.max(MIN_WORKERS, Math.floor(state.settlement.availableWorkers ?? state.settlement.hiredWorkers));
  state.settlement.productionMultiplier = state.settlement.productionMultiplier === UNPAID_WORKER_PRODUCTION_MULTIPLIER
    ? UNPAID_WORKER_PRODUCTION_MULTIPLIER
    : 1;
  syncWorkforce(state);
  trimAssignmentsToWorkforce(state);
  return state.settlement;
}

export function workforceTarget(settlement = {}, tavern = {}) {
  return Math.max(MIN_WORKERS, Math.floor(settlement.hiredWorkers ?? settlement.availableWorkers ?? MIN_WORKERS));
}

export function wageAttractionFactor(wagePerWorker = 0) {
  return 1;
}

export function syncWorkforce(state) {
  const settlement = state.settlement || {};
  settlement.availableWorkers = workforceTarget(settlement, state.tavern || {});
  settlement.hiredWorkers = settlement.availableWorkers;
  state.settlement = settlement;
  return settlement.availableWorkers;
}

export function assignedWorkers(state) {
  const jobs = state.tavern?.jobs || {};
  return WORKFORCE_JOBS.reduce((sum, job) => sum + Math.max(0, Math.floor(jobs[job] || 0)), 0);
}

export function unassignedWorkers(state) {
  ensureSettlementShapeOnly(state);
  return Math.max(0, (state.settlement.availableWorkers || 0) - assignedWorkers(state));
}

export function assignWorkerToJob(state, job) {
  ensureSettlementState(state);
  if (!WORKFORCE_JOBS.includes(job)) return { ok: false, reason: "unknown job", job };

  const free = unassignedWorkers(state);
  if (free > 0) {
    state.tavern.jobs[job] = (state.tavern.jobs[job] || 0) + 1;
    return { ok: true, job, source: "unassigned", workers: state.tavern.jobs[job] };
  }

  const source = WORKFORCE_JOBS
    .filter((candidate) => candidate !== job)
    .sort((a, b) => (state.tavern.jobs[b] || 0) - (state.tavern.jobs[a] || 0))[0];
  if (!source || (state.tavern.jobs[source] || 0) <= 0) {
    return { ok: false, reason: "no worker", job };
  }
  state.tavern.jobs[source] -= 1;
  state.tavern.jobs[job] = (state.tavern.jobs[job] || 0) + 1;
  return { ok: true, job, source, workers: state.tavern.jobs[job] };
}

export function adjustWorkerAssignment(state, job, delta, { maxWorkersByJob = {} } = {}) {
  ensureSettlementState(state);
  if (!WORKFORCE_JOBS.includes(job)) return { ok: false, reason: "unknown job", job, delta };
  const amount = Math.trunc(Number(delta) || 0);
  if (amount === 0) return { ok: false, reason: "no change", job, delta: amount };

  if (amount > 0) {
    const free = unassignedWorkers(state);
    if (free <= 0) return { ok: false, reason: "no unassigned worker", job, delta: amount };
    const maxWorkers = maxWorkersByJob[job];
    if (Number.isFinite(maxWorkers)) {
      const current = Math.max(0, state.tavern.jobs[job] || 0);
      const remainingCapacity = Math.max(0, maxWorkers - current);
      if (remainingCapacity <= 0) return { ok: false, reason: "no workplace capacity", job, delta: amount, maxWorkers };
      const added = Math.min(amount, free, remainingCapacity);
      state.tavern.jobs[job] = current + added;
      return { ok: true, job, delta: added, workers: state.tavern.jobs[job], unassigned: unassignedWorkers(state), maxWorkers };
    }
    const added = Math.min(amount, free);
    state.tavern.jobs[job] = (state.tavern.jobs[job] || 0) + added;
    return { ok: true, job, delta: added, workers: state.tavern.jobs[job], unassigned: unassignedWorkers(state) };
  }

  const current = Math.max(0, state.tavern.jobs[job] || 0);
  if (current <= 0) return { ok: false, reason: "no assigned worker", job, delta: amount };
  const removed = Math.min(Math.abs(amount), current);
  state.tavern.jobs[job] = current - removed;
  return { ok: true, job, delta: -removed, workers: state.tavern.jobs[job], unassigned: unassignedWorkers(state) };
}

export function adjustSettlementWage(state, delta) {
  ensureSettlementState(state);
  return {
    ok: false,
    reason: "fixed upkeep",
    delta: 0,
    wagePerWorker: state.settlement.wagePerWorker,
    availableWorkers: state.settlement.availableWorkers,
    unassigned: unassignedWorkers(state)
  };
}

export function hireWorkerCost(state) {
  ensureSettlementShapeOnly(state);
  const workers = Math.max(MIN_WORKERS, Math.floor(state.settlement?.hiredWorkers ?? state.settlement?.availableWorkers ?? MIN_WORKERS));
  const step = Math.max(0, workers - MIN_WORKERS);
  return {
    coin: Math.floor(10 * (1.55 ** step))
  };
}

export function hireWorker(state, { canPay, pay } = {}) {
  ensureSettlementState(state);
  const cost = hireWorkerCost(state);
  if (canPay && !canPay(cost)) return { ok: false, reason: "cost", cost };
  if (pay) pay(cost);
  state.settlement.hiredWorkers = Math.max(MIN_WORKERS, state.settlement.hiredWorkers || MIN_WORKERS) + 1;
  syncWorkforce(state);
  return { ok: true, cost, availableWorkers: state.settlement.availableWorkers, hiredWorkers: state.settlement.hiredWorkers, nextCost: hireWorkerCost(state) };
}

export function buildHousesCost(state) {
  return hireWorkerCost(state);
}

export function buildHouses(state, options = {}) {
  return hireWorker(state, options);
}

export function workerProductionMultiplier(state) {
  ensureSettlementShapeOnly(state);
  return state.settlement.productionMultiplier === UNPAID_WORKER_PRODUCTION_MULTIPLIER
    ? UNPAID_WORKER_PRODUCTION_MULTIPLIER
    : 1;
}

export function trimAssignmentsToWorkforce(state) {
  ensureSettlementShapeOnly(state);
  let overflow = assignedWorkers(state) - (state.settlement.availableWorkers || 0);
  if (overflow <= 0) return 0;
  for (const job of [...WORKFORCE_JOBS].reverse()) {
    const remove = Math.min(overflow, state.tavern.jobs[job] || 0);
    state.tavern.jobs[job] -= remove;
    overflow -= remove;
    if (overflow <= 0) break;
  }
  return overflow;
}

function ensureSettlementShapeOnly(state) {
  state.settlement = state.settlement || {
    housingCapacity: 5,
    wagePerWorker: WORKER_UPKEEP_COIN,
    happiness: 80,
    availableWorkers: MIN_WORKERS,
    hiredWorkers: MIN_WORKERS,
    productionMultiplier: 1
  };
  state.tavern = state.tavern || {};
  state.tavern.jobs = state.tavern.jobs || {};
  state.settlement.workSiteUpgrades = {
    wood: 0,
    ore: 0,
    ...(state.settlement.workSiteUpgrades || {})
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}
