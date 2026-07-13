import assert from "node:assert/strict";
import test from "node:test";
import { createInitialState } from "../src/app/appState.js";
import { addHeroToParty, addParty, cancelPartyAction, removePartyMember, selectParty } from "../src/game/party/partyCommands.js";

function stateWithSecondHero() {
  const state = createInitialState();
  state.roster.push({
    id: "ben",
    name: "Ben",
    role: "Scout",
    level: 1,
    xp: 0,
    skillPoints: 1,
    race: "human",
    primaryJob: "scout",
    secondaryJob: null,
    learnedSkills: {},
    base: { hp: 20, atk: 3, def: 1, utility: 2 },
    hp: 5,
    spriteIndex: 1,
    gear: []
  });
  return state;
}

test("addParty appends a new empty party and selects it", () => {
  const state = createInitialState();
  const result = addParty(state);

  assert.equal(result.ok, true);
  assert.equal(result.party.id, "party-2");
  assert.equal(state.selectedPartyId, "party-2");
  assert.deepEqual(state.parties.at(-1).memberIds, []);
});

test("selectParty changes selection and invalidates cached estimate", () => {
  const state = createInitialState();
  addParty(state);
  state.lastEstimate = { id: "cached" };

  const result = selectParty(state, "party-1");

  assert.equal(result.ok, true);
  assert.equal(state.selectedPartyId, "party-1");
  assert.equal(state.lastEstimate, null);
  assert.deepEqual(selectParty(state, "missing"), { ok: false, reason: "party missing" });
});

test("cancelPartyAction removes operations and repeated plan, then fully heals members", () => {
  const state = stateWithSecondHero();
  state.parties[0].memberIds.push("ben");
  state.repeatedPlans["party-1"] = { id: "plan" };
  state.operations = [{ partyId: "party-1" }, { partyId: "other" }];
  state.lastEstimate = { id: "cached" };

  const result = cancelPartyAction(state, "party-1");

  assert.equal(result.ok, true);
  assert.equal(result.removedOperations, 1);
  assert.equal(result.hadRepeatedPlan, true);
  assert.equal(state.operations.length, 1);
  assert.equal(state.roster.find((hero) => hero.id === "ben").hp, 20);
  assert.equal(state.lastEstimate, null);
  assert.equal(state.repeatedPlans["party-1"], undefined);
});

test("removePartyMember removes existing members and invalidates estimate", () => {
  const state = createInitialState();
  state.lastEstimate = { id: "cached" };

  const result = removePartyMember(state, "party-1", "ada");

  assert.equal(result.ok, true);
  assert.equal(result.wasMember, true);
  assert.deepEqual(state.parties[0].memberIds, []);
  assert.equal(state.lastEstimate, null);
});

test("addHeroToParty moves a hero from old party into target party", () => {
  const state = stateWithSecondHero();
  addParty(state);
  state.parties[0].memberIds.push("ben");
  state.lastEstimate = { id: "cached" };

  const result = addHeroToParty(state, "party-2", "ben");

  assert.equal(result.ok, true);
  assert.deepEqual(state.parties[0].memberIds, ["ada"]);
  assert.deepEqual(state.parties[1].memberIds, ["ben"]);
  assert.equal(state.lastEstimate, null);
});
