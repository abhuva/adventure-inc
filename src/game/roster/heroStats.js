import { SKILLS } from "./skills.js";

export function heroStats(hero) {
  const gearAtk = hero.gear.includes("ironBlade") ? 3 : 0;
  const gearDef = hero.gear.includes("wardCharm") ? 2 : 0;
  const effects = heroSkillEffects(hero);
  return {
    hpMax: hero.base.hp + Math.max(0, hero.level - 1) * 4 + effects.hp_add,
    atk: hero.base.atk + hero.level + gearAtk + effects.atk_add,
    def: hero.base.def + gearDef + effects.def_add,
    utility: hero.base.utility + effects.utility_add,
    resolve: (hero.base.resolve ?? 10) + Math.floor(hero.level / 2) + effects.resolve_add,
    travelSpeed: effects.travel_speed_add,
    recoveryReduce: effects.recovery_reduce,
    foodCostReduce: effects.food_cost_reduce - effects.food_cost_add
  };
}

export function heroSkillEffects(hero) {
  const totals = {
    hp_add: 0,
    atk_add: 0,
    def_add: 0,
    utility_add: 0,
    resolve_add: 0,
    travel_speed_add: 0,
    recovery_reduce: 0,
    food_cost_reduce: 0,
    food_cost_add: 0,
    hire_discount: 0,
    skill_point_bonus: 0
  };
  Object.entries(hero.learnedSkills || {}).forEach(([skillId, rank]) => {
    const definition = SKILLS[skillId];
    if (!definition || rank <= 0) return;
    definition.effects.forEach((effect) => {
      totals[effect.type] = (totals[effect.type] || 0) + effect.valuePerRank * rank;
    });
  });
  return totals;
}
