import { heroStats } from "./heroStats.js";
import { SKILLS, SKILL_TREES } from "./skills.js";
import { canLearnSkill, skillRank } from "./skillProgression.js";

export function nextVisitor(roster, visitors) {
  const recruitedIds = new Set(roster.map((hero) => hero.id));
  return visitors.find((visitor) => !recruitedIds.has(visitor.id)) || null;
}

export function createHeroFromVisitor(visitor) {
  return {
    id: visitor.id,
    name: visitor.name,
    role: visitor.role,
    level: 1,
    xp: 0,
    skillPoints: 1,
    race: visitor.race,
    primaryJob: visitor.primaryJob,
    secondaryJob: visitor.secondaryJob,
    learnedSkills: {},
    base: visitor.stats,
    hp: visitor.stats.hp,
    spriteIndex: visitor.spriteIndex,
    gear: []
  };
}

export function recruitVisitor(state, visitorId, visitors, { canPay, pay } = {}) {
  const visitor = visitors.find((item) => item.id === visitorId);
  if (!visitor) return { ok: false, reason: "visitor missing" };
  if (state.roster.length >= state.tavern.capacity) {
    return { ok: false, reason: "capacity", visitor };
  }
  if (canPay && !canPay(visitor.cost)) {
    return { ok: false, reason: "cost", visitor };
  }
  if (pay) pay(visitor.cost);
  const hero = createHeroFromVisitor(visitor);
  state.roster.push(hero);
  return { ok: true, visitor, hero };
}

export function focusHero(state, heroId) {
  const hero = state.roster.find((item) => item.id === heroId);
  if (!hero) return { ok: false, reason: "hero missing" };
  state.focusedHeroId = heroId;
  state.lastEstimate = null;
  return { ok: true, hero };
}

export function learnSkill(state, heroId, skillId, {
  skills = SKILLS,
  skillTrees = SKILL_TREES,
  characterState = () => ({ state: "Idle" }),
  partyForHero = () => null
} = {}) {
  const hero = state.roster.find((item) => item.id === heroId);
  if (!hero) return { ok: false, reason: "hero missing" };
  const status = characterState(hero.id);
  if (status.state !== "Idle") {
    return { ok: false, reason: "busy", hero, status };
  }
  const availability = canLearnSkill(hero, skillId, { skills, skillTrees });
  if (!availability.ok) {
    return { ok: false, reason: availability.reason, hero, skill: skills[skillId] || null };
  }

  const oldStats = heroStats(hero);
  const wasFullyHealed = hero.hp >= oldStats.hpMax;
  hero.skillPoints -= 1;
  hero.learnedSkills = { ...(hero.learnedSkills || {}) };
  hero.learnedSkills[skillId] = skillRank(hero, skillId) + 1;
  skills[skillId].effects.forEach((effect) => {
    if (effect.type === "skill_point_bonus") {
      hero.skillPoints += effect.valuePerRank;
    }
  });
  const stats = heroStats(hero);
  hero.hp = wasFullyHealed ? stats.hpMax : Math.min(stats.hpMax, hero.hp + 2);
  const party = partyForHero(hero.id);
  const stoppedRepeatedPlan = Boolean(party && state.repeatedPlans[party.id]);
  if (stoppedRepeatedPlan) {
    delete state.repeatedPlans[party.id];
  }
  state.lastEstimate = null;
  return { ok: true, hero, skill: skills[skillId], rank: hero.learnedSkills[skillId], party, stoppedRepeatedPlan };
}
