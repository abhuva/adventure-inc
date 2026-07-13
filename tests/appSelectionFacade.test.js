import assert from "node:assert/strict";
import test from "node:test";

import { createAppSelectionFacade } from "../src/app/appSelectionFacade.js";
import { SKILLS, SKILL_TREES } from "../src/game/roster/skills.js";

function createFacade(overrides = {}) {
  const calls = [];
  const appQueries = {
    selectedDungeon: () => ({ id: "dungeon_a" }),
    dungeons: () => [{ id: "dungeon_a" }],
    workSites: () => [{ id: "wood" }],
    tavernCoord: () => ({ x: 10, y: 20 }),
    focusedHero: () => ({ id: "hero_a" }),
    selectedParty: () => ({ id: "party_a" }),
    partyMembers: (party) => {
      calls.push(["partyMembers", party.id]);
      return [{ id: "hero_a" }];
    },
    partyStats: (party) => {
      calls.push(["partyStats", party.id]);
      return { atk: 4 };
    },
    partyAssignmentReadiness: (party) => {
      calls.push(["readiness", party.id]);
      return { ok: true };
    },
    isPartyFullyHealed: (party) => {
      calls.push(["healed", party.id]);
      return true;
    },
    mapLocations: () => [{ id: "tavern" }],
    selectedLocation: () => ({ id: "tavern" }),
    operationTotalHours: (operation) => operation.total,
    currentOperationPhase: (operation, hourFraction) => ({ state: operation.id, hourFraction }),
    heroName: (heroId) => `hero:${heroId}`,
    partyForHero: (heroId) => ({ id: `party:${heroId}` }),
    characterState: (heroId) => ({ state: `state:${heroId}` }),
    ...overrides
  };
  return {
    calls,
    facade: createAppSelectionFacade({
      appQueries,
      skills: SKILLS,
      skillTrees: SKILL_TREES
    })
  };
}

test("app selection facade forwards app query reads", () => {
  const { facade, calls } = createFacade();

  assert.equal(facade.selectedDungeon().id, "dungeon_a");
  assert.equal(facade.dungeons().length, 1);
  assert.equal(facade.workSites()[0].id, "wood");
  assert.deepEqual(facade.tavernCoord(), { x: 10, y: 20 });
  assert.equal(facade.focusedHero().id, "hero_a");
  assert.equal(facade.selectedParty().id, "party_a");
  assert.equal(facade.partyMembers()[0].id, "hero_a");
  assert.equal(facade.partyStats().atk, 4);
  assert.equal(facade.partyAssignmentReadiness().ok, true);
  assert.equal(facade.isPartyFullyHealed(), true);
  assert.equal(facade.mapLocations()[0].id, "tavern");
  assert.equal(facade.selectedLocation().id, "tavern");
  assert.equal(facade.operationTotalHours({ total: 9 }), 9);
  assert.deepEqual(facade.currentOperationPhase({ id: "op_a" }, 0.5), { state: "op_a", hourFraction: 0.5 });
  assert.equal(facade.heroName("hero_a"), "hero:hero_a");
  assert.equal(facade.partyForHero("hero_a").id, "party:hero_a");
  assert.equal(facade.characterState("hero_a").state, "state:hero_a");
  assert.deepEqual(calls, [
    ["partyMembers", "party_a"],
    ["partyStats", "party_a"],
    ["readiness", "party_a"],
    ["healed", "party_a"]
  ]);
});

test("app selection facade owns skill progression projections", () => {
  const { facade } = createFacade();
  const hero = {
    race: "human",
    primaryJob: "guard",
    secondaryJob: null,
    skillPoints: 1,
    learnedSkills: {}
  };

  assert.deepEqual(facade.availableSkillTreeIds(hero), ["race.human", "job.guard"]);
  assert.equal(facade.skillRank(hero, "race.human.adaptable"), 0);
  assert.equal(facade.canLearnSkill(hero, "race.human.adaptable").ok, true);
});
