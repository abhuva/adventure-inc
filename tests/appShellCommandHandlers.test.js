import assert from "node:assert/strict";
import test from "node:test";

import { createAppShellCommandHandlers } from "../src/app/appShellCommandHandlers.js";

function fakeElement(dataset = {}) {
  const classes = new Set();
  return {
    dataset,
    classList: {
      toggle(name, active) {
        if (active) {
          classes.add(name);
        } else {
          classes.delete(name);
        }
      },
      contains(name) {
        return classes.has(name);
      }
    }
  };
}

function createHarness() {
  const calls = [];
  const clearedTimers = [];
  const mapButton = fakeElement({ tab: "map" });
  const mapPanel = fakeElement({ tabPanel: "map" });
  const operationButton = fakeElement({ mapSideTab: "operations" });
  const operationPanel = fakeElement({ mapSidePanel: "operations" });
  const state = {
    activeTab: "tavern",
    selectedPartyId: "old_party",
    log: [{ text: "entry" }],
    lastEstimate: { id: "estimate" },
    dungeonReplay: {
      events: [{ text: "event" }],
      cursor: 2,
      playing: true,
      timer: 42
    }
  };
  const handlers = createAppShellCommandHandlers({
    state,
    documentRef: {
      querySelectorAll(selector) {
        return {
          "[data-tab]": [mapButton],
          "[data-tab-panel]": [mapPanel],
          "[data-map-side-tab]": [operationButton],
          "[data-map-side-panel]": [operationPanel]
        }[selector] || [];
      }
    },
    controls: {
      partySelectValue: () => "party_beta"
    },
    replayTimerApi: () => ({
      clearIntervalFn: (timer) => clearedTimers.push(timer)
    }),
    populateStopNodes: () => calls.push("populateStopNodes"),
    render: () => calls.push("render")
  });
  return {
    calls,
    clearedTimers,
    handlers,
    mapButton,
    mapPanel,
    operationButton,
    operationPanel,
    state
  };
}

test("app shell handlers clear log and render", () => {
  const { calls, handlers, state } = createHarness();

  handlers.clearLog();

  assert.deepEqual(state.log, []);
  assert.deepEqual(calls, ["render"]);
});

test("app shell handlers invalidate dungeon estimate when dungeon select changes", () => {
  const { calls, clearedTimers, handlers, state } = createHarness();

  handlers.onDungeonSelectChange();

  assert.equal(state.lastEstimate, null);
  assert.deepEqual(state.dungeonReplay.events, []);
  assert.equal(state.dungeonReplay.timer, null);
  assert.deepEqual(calls, ["populateStopNodes", "render"]);
  assert.deepEqual(clearedTimers, [42]);
});

test("app shell handlers update selected party and invalidate estimate", () => {
  const { calls, clearedTimers, handlers, state } = createHarness();

  handlers.onPartySelectChange();

  assert.equal(state.selectedPartyId, "party_beta");
  assert.equal(state.lastEstimate, null);
  assert.deepEqual(calls, ["render"]);
  assert.deepEqual(clearedTimers, [42]);
});

test("app shell handlers set active tab and map side tab classes", () => {
  const {
    handlers,
    mapButton,
    mapPanel,
    operationButton,
    operationPanel,
    state
  } = createHarness();

  handlers.setTab("map");
  handlers.setMapSideTab("operations");

  assert.equal(state.activeTab, "map");
  assert.equal(mapButton.classList.contains("active"), true);
  assert.equal(mapPanel.classList.contains("active"), true);
  assert.equal(operationButton.classList.contains("active"), true);
  assert.equal(operationPanel.classList.contains("active"), true);
});
