import { heroStats } from "../roster/heroStats.js";

export function completePartyOperation(state, operation, {
  applyRewards,
  gainXp,
  templeLootBonus = () => ({}),
  recordShardProgress = () => {}
} = {}) {
  const estimate = operation.estimate;
  const members = state.roster.filter((hero) => operation.memberIds.includes(hero.id));

  applyRewards(estimate.rewards);
  members.forEach((hero) => {
    const stats = heroStats(hero);
    hero.hp = stats.hpMax;
    if (estimate.rewards.xp) {
      gainXp(hero, estimate.rewards.xp);
    }
  });
  if (estimate.rewards.blueprint) {
    state.blueprints[estimate.rewards.blueprint] = true;
  }
  const templeLoot = templeLootBonus();
  if (Object.keys(templeLoot).length) {
    applyRewards(templeLoot);
  }
  recordShardProgress(estimate);
  return { estimate, members, templeLoot };
}
