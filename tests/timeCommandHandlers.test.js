import assert from "node:assert/strict";
import test from "node:test";

import { createInitialState } from "../src/app/appState.js";
import { createTimeCommandHandlers } from "../src/app/timeCommandHandlers.js";
import {
  advanceClock,
  advanceWorkerCycles
} from "../src/game/time/gameClock.js";

function createAutoRuntime(calls) {
  return {
    toggle(state, callback) {
      state.timeRunning = !state.timeRunning;
      calls.push("toggle");
      if (state.timeRunning) {
        calls.callback = callback;
        return "started";
      }
      return "stopped";
    },
    start(state, callback) {
      state.timeRunning = true;
      calls.push("start");
      calls.callback = callback;
      return "started";
    },
    stop(state) {
      state.timeRunning = false;
      calls.push("stop");
    },
    markTick(state) {
      state.visual.lastTickAt += 1;
      calls.push("markTick");
    },
    currentVisualHourFraction() {
      return 0.25;
    }
  };
}

function createHarness(overrides = {}) {
  const logs = [];
  const calls = [];
  const state = createInitialState({ templeInventorySlots: 20 });
  state.resources.food = 10;
  Object.assign(state, overrides.state);
  const handlers = createTimeCommandHandlers({
    state,
    autoTimeRuntime: createAutoRuntime(calls),
    workSites: () => overrides.workSites || [],
    operationTotalHours: (operation) => operation.totalHours,
    completeEstimate: (operation) => {
      calls.push(["complete", operation.id]);
    },
    ensureRepeatedPlanQueued: (partyId) => {
      calls.push(["queue", partyId]);
    },
    applyRewards: (rewards) => {
      Object.entries(rewards).forEach(([key, value]) => {
        state.resources[key] = (state.resources[key] || 0) + value;
      });
    },
    formatReward: (reward = {}) => Object.entries(reward).map(([key, value]) => `${key}+${value}`).join(" ") || "none",
    advanceClock,
    advanceWorkerCyclesForSites: advanceWorkerCycles,
    addLog: (text, type) => logs.push({ text, type }),
    render: () => calls.push("render"),
    renderTimeTick: (activeTab, hourFraction, options) => {
      calls.push(options ? ["renderTimeTick", activeTab, hourFraction, options] : ["renderTimeTick", activeTab, hourFraction]);
    }
  });
  return { state, logs, calls, handlers };
}

test("time handlers toggle and stop auto time", () => {
  const { state, logs, calls, handlers } = createHarness();

  handlers.toggleAutoTime();
  assert.equal(state.timeRunning, false);
  assert.match(logs[0].text, /auto time disabled/);
  assert.equal(calls.includes("render"), true);

  handlers.toggleAutoTime();
  assert.equal(state.timeRunning, true);

  handlers.stopAutoTime();
  assert.equal(state.timeRunning, false);
  assert.equal(handlers.currentVisualHourFraction(), 0.25);
});

test("time handlers can enable auto time by default", () => {
  const { state, logs, calls, handlers } = createHarness();

  assert.equal(handlers.enableAutoTime(), "started");

  assert.equal(state.timeRunning, true);
  assert.equal(calls.includes("start"), true);
  assert.equal(calls.includes("render"), true);
  assert.match(logs[0].text, /auto time enabled/);
});


test("time handlers advance worker cycles and log deliveries", () => {
  const { state, logs, handlers } = createHarness({
    state: {
      tavern: { capacity: 3, fame: 0, population: 2, jobs: { wood: 1, ore: 0 } },
      workerProgress: { wood: 0, ore: 0 }
    },
    workSites: [{ id: "wood", name: "North Woodlot", cycleHours: 1, output: { wood: 3 } }]
  });

  handlers.advanceWorkerCycles(1);

  assert.equal(state.resources.wood, 11);
  assert.match(logs[0].text, /North Woodlot delivery complete: wood\+3/);
});

test("time handlers complete operations and requeue repeated parties", () => {
  const { state, calls, handlers } = createHarness({
    state: {
      operations: [
        { id: "done", partyId: "party-1", elapsed: 0, totalHours: 1 },
        { id: "later", partyId: "party-2", elapsed: 0, totalHours: 3 }
      ]
    }
  });

  handlers.advanceOperations(1);

  assert.deepEqual(state.operations.map((operation) => operation.id), ["later"]);
  assert.deepEqual(calls.filter(Array.isArray), [["complete", "done"], ["queue", "party-1"]]);
});

test("time handlers advance game time without passive daily resource income", () => {
  const { state, logs, calls, handlers } = createHarness({
    state: {
      day: 1,
      hour: 23,
      tavern: { capacity: 3, fame: 2, population: 2, jobs: { wood: 0, ore: 0 } }
    }
  });

  handlers.advanceTime(1, true);

  assert.equal(state.day, 2);
  assert.equal(state.hour, 0);
  assert.equal(state.resources.food, 10);
  assert.equal(calls.includes("markTick"), true);
  assert.equal(calls.includes("render"), true);
  assert.match(logs.at(-1).text, /time advanced 1h/);
});

test("time handlers use scoped render for automatic ticks", () => {
  const { state, calls, handlers } = createHarness({
    state: {
      activeTab: "map"
    }
  });

  handlers.advanceTime(1, false);

  assert.equal(calls.includes("render"), false);
  assert.deepEqual(calls.at(-1), ["renderTimeTick", "map", 0.25, { dayRolledOver: false }]);
});

test("time handlers report quiet day rollover to scoped render", () => {
  const { state, calls, handlers } = createHarness({
    state: {
      activeTab: "tavern",
      day: 1,
      hour: 23
    }
  });

  handlers.advanceTime(1, false);

  assert.equal(state.day, 2);
  assert.deepEqual(calls.at(-1), ["renderTimeTick", "tavern", 0.25, { dayRolledOver: true }]);
});
