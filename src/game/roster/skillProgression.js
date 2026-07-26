import { SKILLS, SKILL_TREES } from "./skills.js";
import { graphFromLinearTree } from "../progression/progressionGraphModel.js";
import { canSpendProgressionPoint, progressionNodeRank } from "../progression/progressionGraphRules.js";

export function availableSkillTreeIds(hero, skillTrees = SKILL_TREES) {
  const treeIds = [`race.${hero.race}`, `job.${hero.primaryJob}`];
  if (hero.secondaryJob) {
    treeIds.push(`job.${hero.secondaryJob}`);
  }
  return treeIds.filter((treeId) => skillTrees[treeId]);
}

export function skillRank(hero, skillId) {
  return progressionNodeRank(heroSkillProgressionState(hero), skillId);
}

export function canLearnSkill(hero, skillId, { skills = SKILLS, skillTrees = SKILL_TREES } = {}) {
  if (!skills[skillId]) return { ok: false, reason: "missing skill" };
  const treeId = availableSkillTreeIds(hero, skillTrees).find((availableTreeId) => skillTrees[availableTreeId].skillIds.includes(skillId));
  if (!treeId) {
    return { ok: false, reason: "tree unavailable" };
  }
  const graph = skillTreeProgressionGraph(treeId, { skills, skillTrees });
  const result = canSpendProgressionPoint(graph, heroSkillProgressionState(hero), skillId, { availablePoints: hero.skillPoints });
  if (result.reason === "no points") return { ok: false, reason: "no skill points" };
  if (result.reason === "requires connected node") return { ok: false, reason: "requires connected skill" };
  return result;
}

export function heroSkillProgressionState(hero) {
  return {
    points: hero.learnedSkills || {},
    availablePoints: hero.skillPoints || 0
  };
}

export function skillTreeProgressionGraph(treeId, { skills = SKILLS, skillTrees = SKILL_TREES } = {}) {
  const tree = skillTrees[treeId];
  if (!tree) return null;
  return graphFromLinearTree({
    id: treeId,
    name: tree.name,
    skillIds: tree.skillIds,
    skills
  });
}
