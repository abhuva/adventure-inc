export const WORK_SITE_BASE_MAX_WORKERS = 2;
export const WORK_SITE_MAX_WORKERS_PER_UPGRADE = 2;
export const WORK_SITE_BASE_UPGRADE_COST = { wood: 200, coin: 50 };

export function ensureWorkSiteUpgradeState(state) {
  state.settlement = state.settlement || {};
  state.settlement.workSiteUpgrades = {
    wood: 0,
    ore: 0,
    ...(state.settlement.workSiteUpgrades || {})
  };
  for (const [siteId, level] of Object.entries(state.settlement.workSiteUpgrades)) {
    state.settlement.workSiteUpgrades[siteId] = Math.max(0, Math.floor(Number(level) || 0));
  }
  return state.settlement.workSiteUpgrades;
}

export function workSiteUpgradeLevel(state, siteId) {
  ensureWorkSiteUpgradeState(state);
  return state.settlement.workSiteUpgrades[siteId] || 0;
}

export function workSiteMaxWorkers(state, siteId) {
  const level = workSiteUpgradeLevel(state, siteId);
  return WORK_SITE_BASE_MAX_WORKERS + level * WORK_SITE_MAX_WORKERS_PER_UPGRADE;
}

export function workSiteUpgradeCost(state, siteId) {
  const level = workSiteUpgradeLevel(state, siteId);
  const multiplier = 2 ** level;
  return Object.fromEntries(
    Object.entries(WORK_SITE_BASE_UPGRADE_COST).map(([resource, amount]) => [resource, amount * multiplier])
  );
}

export function workSiteWorkerCaps(state, workSites = []) {
  ensureWorkSiteUpgradeState(state);
  return Object.fromEntries(workSites.map((site) => [site.id, workSiteMaxWorkers(state, site.id)]));
}

export function upgradeWorkSite(state, siteId, { canPay, pay } = {}) {
  ensureWorkSiteUpgradeState(state);
  const cost = workSiteUpgradeCost(state, siteId);
  if (canPay && !canPay(cost)) {
    return { ok: false, reason: "cost", siteId, cost };
  }
  if (pay) pay(cost);
  const nextLevel = workSiteUpgradeLevel(state, siteId) + 1;
  state.settlement.workSiteUpgrades[siteId] = nextLevel;
  return {
    ok: true,
    siteId,
    cost,
    level: nextLevel,
    maxWorkers: workSiteMaxWorkers(state, siteId),
    nextCost: workSiteUpgradeCost(state, siteId)
  };
}
