import assert from "node:assert/strict";
import test from "node:test";
import { createInitialState } from "../src/app/appState.js";
import {
  characterState,
  heroName,
  isPartyFullyHealed,
  partyForHero,
  partyMembers,
  partyStats,
  selectedParty
} from "../src/game/party/partySelectors.js";

test("party selectors resolve selected party and members deterministically", () => {
  const state = createInitialState();

  assert.equal(selectedParty(state).id, "party-1");
  assert.deepEqual(partyMembers(state).map((hero) => hero.id), ["ada"]);
  assert.equal(partyForHero(state, "ada")?.id, "party-1");
  assert.equal(partyForHero(state, "missing"), null);
});

test("heroName resolves names and falls back to id", () => {
  const state = createInitialState();

  assert.equal(heroName(state, "ada"), "Ada");
  assert.equal(heroName(state, "missing"), "missing");
});

test("characterState reports idle party membership and operation phases", () => {
  const state = createInitialState();

  assert.deepEqual(characterState(state, "ada", {
    currentOperationPhase: () => ({ phase: { name: "queued" } })
  }), { state: "Idle", party: "Alpha" });

  state.operations.push({
    label: "Alpha: Rat Cellar",
    memberIds: ["ada"]
  });

  assert.deepEqual(characterState(state, "ada", {
    currentOperationPhase: () => ({ phase: { name: "outbound" } })
  }), { state: "Walking to dungeon", party: "Alpha: Rat Cellar" });
  assert.deepEqual(characterState(state, "ada", {
    currentOperationPhase: () => ({ phase: { name: "dungeon" } })
  }), { state: "Fighting", party: "Alpha: Rat Cellar" });
  assert.deepEqual(characterState(state, "ada", {
    currentOperationPhase: () => ({ phase: { name: "return" } })
  }), { state: "Walking home", party: "Alpha: Rat Cellar" });
  assert.deepEqual(characterState(state, "ada", {
    currentOperationPhase: () => ({ phase: { name: "regenerate" } })
  }), { state: "Recovering", party: "Alpha: Rat Cellar" });
  assert.deepEqual(characterState(state, "ada", {
    currentOperationPhase: () => ({ phase: { name: "custom" } })
  }), { state: "custom", party: "Alpha: Rat Cellar" });
});

test("partyStats aggregates member stats and external bonuses", () => {
  const state = createInitialState();
  state.roster[0].level = 2;

  const stats = partyStats(state, selectedParty(state), { party_atk: 2, party_def: 1, party_utility: 3, recovery_reduce: 4 });

  assert.equal(stats.hpMax, 46);
  assert.equal(stats.atk, 11);
  assert.equal(stats.def, 3);
  assert.equal(stats.utility, 4);
  assert.equal(stats.recoveryReduce, 4);
});

test("isPartyFullyHealed compares current hp against derived max hp", () => {
  const state = createInitialState();

  assert.equal(isPartyFullyHealed(state), true);
  state.roster[0].hp = 1;
  assert.equal(isPartyFullyHealed(state), false);
});
