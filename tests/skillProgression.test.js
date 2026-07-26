import assert from "node:assert/strict";
import test from "node:test";
import { availableSkillTreeIds, canLearnSkill, skillRank } from "../src/game/roster/skillProgression.js";

const baseHero = {
  race: "human",
  primaryJob: "guard",
  secondaryJob: null,
  skillPoints: 1,
  learnedSkills: {}
};

test("availableSkillTreeIds includes race, primary job, and unlocked secondary job", () => {
  const hero = { ...baseHero, secondaryJob: "healer" };

  assert.deepEqual(availableSkillTreeIds(hero), ["race.human", "job.guard", "job.healer"]);
});

test("skillRank returns zero for missing learned skills", () => {
  assert.equal(skillRank(baseHero, "race.human.adaptable"), 0);
  assert.equal(skillRank({ ...baseHero, learnedSkills: { "race.human.adaptable": 2 } }, "race.human.adaptable"), 2);
});

test("canLearnSkill accepts roots and blocks missing prerequisites", () => {
  assert.deepEqual(canLearnSkill(baseHero, "race.human.adaptable"), { ok: true, reason: "available" });
  assert.deepEqual(canLearnSkill(baseHero, "race.human.cross_training"), { ok: false, reason: "requires connected skill" });
});

test("canLearnSkill blocks unavailable trees, missing points, and max rank", () => {
  assert.deepEqual(canLearnSkill(baseHero, "race.elf.light_step"), { ok: false, reason: "tree unavailable" });
  assert.deepEqual(canLearnSkill({ ...baseHero, skillPoints: 0 }, "race.human.adaptable"), { ok: false, reason: "no skill points" });
  assert.deepEqual(canLearnSkill({ ...baseHero, learnedSkills: { "race.human.adaptable": 3 } }, "race.human.adaptable"), { ok: false, reason: "max rank" });
});

test("race resolve chains use connected expensive ranks", () => {
  assert.deepEqual(canLearnSkill(baseHero, "race.human.resolve_nerve"), { ok: true, reason: "available" });
  assert.deepEqual(canLearnSkill(baseHero, "race.human.resolve_grit"), { ok: false, reason: "requires connected skill" });
  assert.deepEqual(
    canLearnSkill({ ...baseHero, skillPoints: 1, learnedSkills: { "race.human.resolve_nerve": 1 } }, "race.human.resolve_grit"),
    { ok: false, reason: "no skill points" }
  );
  assert.deepEqual(
    canLearnSkill({ ...baseHero, skillPoints: 2, learnedSkills: { "race.human.resolve_nerve": 1 } }, "race.human.resolve_grit"),
    { ok: true, reason: "available" }
  );
});
