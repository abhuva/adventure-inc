import assert from "node:assert/strict";
import test from "node:test";

import { createInitialState } from "../src/app/appState.js";
import { createMapCommandHandlers } from "../src/app/mapCommandHandlers.js";

function sampleEstimate(overrides = {}) {
  return {
    success: true,
    partyId: "party-1",
    partyName: "Alpha",
    dungeonId: "cellar",
    dungeonName: "Rat Cellar",
    memberIds: ["ada"],
    foodCost: 1,
    travelHours: 1,
    dungeonHours: 1,
    recoveryHours: 1,
    hours: 4,
    rewards: { coin: 1 },
    transcript: ["ok"],
    timeline: [{ type: "start", partyActors: [], enemyActors: [] }],
    ...overrides
  };
}

function createHarness(overrides = {}) {
  const logs = [];
  const calls = [];
  const state = createInitialState({ templeInventorySlots: 20 });
  Object.assign(state, overrides.state);
  const locations = {
    tavern: { id: "tavern", type: "tavern", name: "Tavern" },
    cellar: {
      id: "cellar",
      type: "dungeon",
      name: "Rat Cellar",
      dungeon: { id: "cellar", name: "Rat Cellar" }
    }
  };
  const handlers = createMapCommandHandlers({
    state,
    controls: {
      setDungeon: (dungeonId) => calls.push(["setDungeon", dungeonId]),
      strategy: () => "balanced",
      stopNode: () => "all"
    },
    selectedLocation: () => locations[state.selectedLocationId] || locations.tavern,
    selectedParty: () => state.parties.find((party) => party.id === state.selectedPartyId),
    simulateRun: ({ dungeon, strategy, stopNode, party }) => {
      calls.push(["simulate", dungeon.id, strategy, stopNode, party.id]);
      return sampleEstimate({ partyId: party.id, partyName: party.name, dungeonId: dungeon.id, dungeonName: dungeon.name });
    },
    ensureRepeatedPlanQueued: (partyId) => calls.push(["queue", partyId]),
    populateStopNodes: () => calls.push("populateStopNodes"),
    addLog: (text, type) => logs.push({ text, type }),
    render: () => calls.push("render")
  });
  return { state, logs, calls, handlers };
}

test("map handlers select dungeon locations and clear cached estimates", () => {
  const { state, calls, handlers } = createHarness({
    state: { selectedLocationId: "tavern", lastEstimate: sampleEstimate() }
  });

  handlers.selectLocation("cellar");

  assert.equal(state.selectedLocationId, "cellar");
  assert.equal(state.lastEstimate, null);
  assert.deepEqual(calls, [["setDungeon", "cellar"], "populateStopNodes", "render"]);
});

test("map handlers select non-dungeon locations without changing dungeon controls", () => {
  const { state, calls, handlers } = createHarness({
    state: { selectedLocationId: "cellar", lastEstimate: sampleEstimate() }
  });

  handlers.selectLocation("tavern");

  assert.equal(state.selectedLocationId, "tavern");
  assert.notEqual(state.lastEstimate, null);
  assert.deepEqual(calls, ["render"]);
});

test("map handlers assign selected party to dungeon as repeated route", () => {
  const { state, logs, calls, handlers } = createHarness({
    state: { selectedLocationId: "cellar" }
  });

  handlers.assignSelectedPartyToSelectedDungeon();

  assert.equal(state.lastEstimate.dungeonId, "cellar");
  assert.equal(state.repeatedPlans["party-1"].dungeonId, "cellar");
  assert.notEqual(state.repeatedPlans["party-1"], state.lastEstimate);
  assert.match(logs[0].text, /repeated map assignment set: Alpha -> Rat Cellar/);
  assert.deepEqual(calls, [["simulate", "cellar", "balanced", "all", "party-1"], ["queue", "party-1"], "render"]);
});

test("map handlers ignore assignment when selected location is not a dungeon", () => {
  const { state, logs, calls, handlers } = createHarness({
    state: { selectedLocationId: "tavern" }
  });

  handlers.assignSelectedPartyToSelectedDungeon();

  assert.equal(state.lastEstimate, null);
  assert.deepEqual(logs, []);
  assert.deepEqual(calls, []);
});
