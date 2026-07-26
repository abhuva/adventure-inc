import assert from "node:assert/strict";
import test from "node:test";

import { createInitialState } from "../src/app/appState.js";
import { createDungeonCommandHandlers } from "../src/app/dungeonCommandHandlers.js";
import { currentOperationPhase } from "../src/game/dungeon/dungeonOperationModel.js";

const dungeon = {
  id: "cellar",
  name: "Rat Cellar",
  coord: { x: 10, y: 10 },
  travelHours: 1,
  foodCost: 1,
  nodes: [
    { id: "entry", name: "Entry", type: "hazard", damage: 1, reward: { coin: 1, xp: 1 } }
  ]
};

const mine = {
  id: "mine",
  name: "Old Copper Mine",
  coord: { x: 20, y: 20 },
  travelHours: 2,
  foodCost: 2,
  nodes: []
};

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
    rewards: { coin: 2, xp: 1 },
    transcript: ["entry complete"],
    timeline: [{ type: "start", partyActors: [], enemyActors: [] }, { type: "end", partyActors: [], enemyActors: [] }],
    ...overrides
  };
}

function createHarness(overrides = {}) {
  const logs = [];
  const calls = [];
  const state = createInitialState({ templeInventorySlots: 20 });
  state.resources.food = 20;
  Object.assign(state, overrides.state);
  const controls = {
    strategy: () => overrides.strategy || "balanced",
    stopNode: () => overrides.stopNode || "all",
    repeatMode: () => overrides.repeatMode || "manual"
  };
  const handlers = createDungeonCommandHandlers({
    state,
    controls,
    selectedDungeon: () => dungeon,
    selectedParty: () => state.parties.find((party) => party.id === state.selectedPartyId),
    partyStats: () => ({ hpMax: 42, hpCurrent: 42, atk: 7, def: 2, utility: 1, travelSpeed: 0, recoveryReduce: 0, foodCostReduce: 0 }),
    partyMembers: () => state.roster,
    isPartyFullyHealed: () => overrides.fullyHealed ?? true,
    partyAssignmentReadiness: () => overrides.readiness || { canQueue: true, message: "ready in town" },
    currentOperationPhase: (operation) => currentOperationPhase(operation, { queuedCoord: { x: 0, y: 0 } }),
    dungeons: () => overrides.dungeons || [dungeon, mine],
    tavernCoord: () => ({ x: 0, y: 0 }),
    applyRewards: (rewards) => {
      Object.entries(rewards).forEach(([key, value]) => {
        if (key === "xp" || key === "blueprint") return;
        state.resources[key] = (state.resources[key] || 0) + value;
      });
    },
    gainXp: (hero, xp) => {
      hero.xp += xp;
    },
    templeLootBonus: () => overrides.templeLoot || {},
    recordShardProgress: () => calls.push("recordShardProgress"),
    formatReward: (reward = {}) => Object.entries(reward).map(([key, value]) => `${key}+${value}`).join(" ") || "none",
    replayTimerApi: () => ({ clearIntervalFn: () => calls.push("clearReplay") }),
    populateDungeonSelect: () => calls.push("populateDungeonSelect"),
    addLog: (text, type) => logs.push({ text, type }),
    render: () => calls.push("render")
  });
  return { state, logs, calls, handlers };
}

test("dungeon handlers simulate selected runs and cache replay estimates", () => {
  const { state, logs, calls, handlers } = createHarness();

  handlers.simulateSelectedRun();

  assert.equal(state.lastEstimate.dungeonId, "cellar");
  assert.equal(state.dungeonReplay.events.length > 0, true);
  assert.match(logs.at(-1).text, /simulated Alpha/);
  assert.equal(calls.includes("render"), true);
});

test("dungeon handlers schedule manual estimates and stop repeated plans", () => {
  const { state, logs, handlers } = createHarness();
  state.repeatedPlans["party-1"] = sampleEstimate();

  const queued = handlers.scheduleEstimate(sampleEstimate(), false);

  assert.equal(queued, true);
  assert.equal(state.operations.length, 1);
  assert.equal(state.resources.food, 19);
  assert.equal(state.repeatedPlans["party-1"], undefined);
  assert.match(logs[0].text, /repeated plan stopped/);
  assert.match(logs[1].text, /queued/);
});

test("dungeon handlers block automation without repeat mode and enable repeated plans", () => {
  const blocked = createHarness({ state: { lastEstimate: sampleEstimate() }, repeatMode: "manual" });
  blocked.handlers.automateLastEstimate();
  assert.match(blocked.logs[0].text, /repeat plan is manual only/);

  const enabled = createHarness({ state: { lastEstimate: sampleEstimate() }, repeatMode: "repeat" });
  enabled.handlers.automateLastEstimate();
  assert.equal(Boolean(enabled.state.repeatedPlans["party-1"]), true);
  assert.equal(enabled.state.operations.length, 1);
  assert.match(enabled.logs[0].text, /repeated plan enabled/);
});

test("dungeon handlers complete operations through injected progression callbacks", () => {
  const { state, logs, calls, handlers } = createHarness({ templeLoot: { hide: 2 } });
  const estimate = sampleEstimate();
  handlers.scheduleEstimate(estimate, false);
  const operation = state.operations[0];

  handlers.completeEstimate(operation);

  assert.equal(state.resources.coin, 12);
  assert.equal(state.roster[0].xp, 1);
  assert.equal(calls.includes("recordShardProgress"), true);
  assert.match(logs.at(-2).text, /temple resonance/);
  assert.match(logs.at(-1).text, /returned/);
});

test("dungeon handlers refresh dungeon options when a clear unlocks a dungeon", () => {
  const { state, calls, handlers } = createHarness();
  state.progression.dungeonClears.cellar = 49;
  const estimate = sampleEstimate();
  handlers.scheduleEstimate(estimate, false);
  const operation = state.operations[0];

  handlers.completeEstimate(operation);

  assert.equal(state.progression.unlockedLocations.mine, true);
  assert.equal(calls.includes("populateDungeonSelect"), true);
});
