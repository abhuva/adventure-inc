import { SKILLS, SKILL_TREES } from "./skills.js";

export function availableSkillTreeIds(hero, skillTrees = SKILL_TREES) {
  const treeIds = [`race.${hero.race}`, `job.${hero.primaryJob}`];
  if (hero.secondaryJob) {
    treeIds.push(`job.${hero.secondaryJob}`);
  }
  return treeIds.filter((treeId) => skillTrees[treeId]);
}

export function skillRank(hero, skillId) {
  return (hero.learnedSkills && hero.learnedSkills[skillId]) || 0;
}

export function canLearnSkill(hero, skillId, { skills = SKILLS, skillTrees = SKILL_TREES } = {}) {
  const definition = skills[skillId];
  if (!definition) return { ok: false, reason: "missing skill" };
  if (hero.skillPoints <= 0) return { ok: false, reason: "no skill points" };
  if (skillRank(hero, skillId) >= definition.maxRank) return { ok: false, reason: "max rank" };
  if (!availableSkillTreeIds(hero, skillTrees).some((treeId) => skillTrees[treeId].skillIds.includes(skillId))) {
    return { ok: false, reason: "tree unavailable" };
  }
  if (!definition.requires.length || definition.requires.some((requiredId) => skillRank(hero, requiredId) > 0)) {
    return { ok: true, reason: "available" };
  }
  return { ok: false, reason: "requires connected skill" };
}
