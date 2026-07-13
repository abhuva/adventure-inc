import assert from "node:assert/strict";
import test from "node:test";

import { createInitialState } from "../src/app/appState.js";
import { createRosterProgressionHandlers } from "../src/app/rosterProgressionHandlers.js";
import { SKILLS, SKILL_TREES } from "../src/game/roster/skills.js";
import { heroStats } from "../src/game/roster/heroStats.js";

test("roster progression handlers learn skills, log, and render", () => {
  const state = createInitialState();
  const calls = [];
  state.roster[0].skillPoints = 1;
  const handlers = createRosterProgressionHandlers({
    state,
    skills: SKILLS,
    skillTrees: SKILL_TREES,
    characterState: () => ({ state: "Idle" }),
    partyForHero: () => state.parties[0],
    heroStats,
    addLog: (text, type) => calls.push(["log", text, type]),
    render: () => calls.push(["render"])
  });

  handlers.learnSkill("ada", "race.human.adaptable");

  assert.equal(state.roster[0].learnedSkills["race.human.adaptable"], 1);
  assert.deepEqual(calls, [
    ["log", "Ada learned Adaptable 1/3", "ok"],
    ["render"]
  ]);
});

test("roster progression handlers log level ups without rendering", () => {
  const hero = {
    name: "Ada",
    level: 1,
    xp: 9,
    skillPoints: 0,
    hp: 10,
    base: { hp: 10, atk: 2, def: 1, utility: 1 },
    gear: [],
    learnedSkills: {}
  };
  const calls = [];
  const handlers = createRosterProgressionHandlers({
    state: { roster: [hero] },
    skills: SKILLS,
    skillTrees: SKILL_TREES,
    characterState: () => ({ state: "Idle" }),
    partyForHero: () => null,
    heroStats,
    addLog: (text, type) => calls.push(["log", text, type]),
    render: () => calls.push(["render"])
  });

  handlers.gainXp(hero, 1);

  assert.equal(hero.level, 2);
  assert.deepEqual(calls, [
    ["log", "Ada reached level 2; skill point available", "ok"]
  ]);
});
