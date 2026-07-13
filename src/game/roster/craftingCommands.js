export function craftBlueprint(state, blueprintId, blueprints, hero, { canPay, pay } = {}) {
  const blueprint = blueprints[blueprintId];
  if (!blueprint) return { ok: false, reason: "blueprint missing" };
  if (!state.blueprints[blueprintId]) {
    return { ok: false, reason: "not discovered", blueprint, hero };
  }
  if (canPay && !canPay(blueprint.cost)) {
    return { ok: false, reason: "cost", blueprint, hero };
  }
  if (hero.gear.includes(blueprintId)) {
    return { ok: false, reason: "already equipped", blueprint, hero };
  }
  if (pay) pay(blueprint.cost);
  hero.gear.push(blueprintId);
  state.crafted[blueprintId] = (state.crafted[blueprintId] || 0) + 1;
  state.lastEstimate = null;
  return { ok: true, blueprint, hero };
}
