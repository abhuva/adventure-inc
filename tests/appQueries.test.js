import assert from "node:assert/strict";
import test from "node:test";

import { createAppQueries } from "../src/app/appQueries.js";

function createHarness() {
  const state = {
    selectedPartyId: "party_alpha",
    focusedHeroId: "hero_a",
    selectedLocationId: "mine",
    roster: [
      {
        id: "hero_a",
        name: "Ada",
        level: 1,
        hp: 10,
        base: { hp: 10, atk: 2, def: 1, utility: 0 },
        learnedSkills: {},
        gear: []
      },
      {
        id: "hero_b",
        name: "Bert",
        level: 1,
        hp: 7,
        base: { hp: 8, atk: 1, def: 1, utility: 1 },
        learnedSkills: {},
        gear: []
      }
    ],
    parties: [
      { id: "party_alpha", name: "Alpha", memberIds: ["hero_a"] },
      { id: "party_beta", name: "Beta", memberIds: ["hero_b"] }
    ],
    operations: []
  };
  const poiData = {
    tavern: {
      coord: { x: 50, y: 50 },
      title: "Tavern"
    },
    workSites: [
      { id: "mine", name: "Mine", kind: "work", coord: { x: 100, y: 50 }, cycleHours: 4, resource: "ore" }
    ],
    dungeons: [
      { id: "rat_cellar", name: "Rat Cellar", coord: { x: 200, y: 50 }, nodes: [] }
    ]
  };
  const queries = createAppQueries({
    state,
    el: {
      dungeonSelect: { value: "rat_cellar" }
    },
    getPoiData: () => poiData,
    templeQueries: {
      bonuses: () => ({ party_atk: 2, party_def: 0, party_utility: 0, recovery_reduce: 0 })
    }
  });
  return { queries, state };
}

test("app queries expose POI and party selections", () => {
  const { queries } = createHarness();

  assert.equal(queries.selectedDungeon().name, "Rat Cellar");
  assert.equal(queries.dungeons().length, 1);
  assert.equal(queries.workSites()[0].id, "mine");
  assert.deepEqual(queries.tavernCoord(), { x: 50, y: 50 });
  assert.equal(queries.mapLocations().length, 3);
  assert.equal(queries.selectedLocation().id, "mine");
  assert.equal(queries.focusedHero().name, "Ada");
  assert.equal(queries.selectedParty().name, "Alpha");
  assert.deepEqual(queries.partyMembers().map((hero) => hero.name), ["Ada"]);
});

test("app queries expose party derived reads with Temple bonuses", () => {
  const { queries, state } = createHarness();

  assert.equal(queries.partyStats().atk, 5);
  assert.equal(queries.isPartyFullyHealed(), true);
  state.roster[0].hp = 9;
  assert.equal(queries.isPartyFullyHealed(), false);
  assert.equal(queries.heroName("hero_b"), "Bert");
  assert.equal(queries.partyForHero("hero_b").name, "Beta");
  assert.equal(queries.characterState("hero_b").state, "Idle");
});
