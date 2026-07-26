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
  const dungeonInfoButton = fakeElement({ dungeonLocalTab: "info" });
  const dungeonInfoPanel = fakeElement({ dungeonLocalPanel: "info" });
  const populationWorkshopButton = fakeElement({ populationLocalTab: "workshop" });
  const populationWorkshopPanel = fakeElement({ populationLocalPanel: "workshop" });
  const rosterSkillButton = fakeElement({ rosterDetailTab: "skill1" });
  const rosterSkillPanel = fakeElement({ rosterDetailPanel: "skill1" });
  const tavernSkillButton = fakeElement({ tavernDetailTab: "skill1" });
  const tavernSkillPanel = fakeElement({ tavernDetailPanel: "skill1" });
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
          "[data-map-side-panel]": [operationPanel],
          "[data-dungeon-local-tab]": [dungeonInfoButton],
          "[data-dungeon-local-panel]": [dungeonInfoPanel],
          "[data-population-local-tab]": [populationWorkshopButton],
          "[data-population-local-panel]": [populationWorkshopPanel],
          "[data-roster-detail-tab]": [rosterSkillButton],
          "[data-roster-detail-panel]": [rosterSkillPanel],
          "[data-tavern-detail-tab]": [tavernSkillButton],
          "[data-tavern-detail-panel]": [tavernSkillPanel]
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
    render: () => calls.push("render"),
    saveNow: () => {
      calls.push("saveNow");
      return { ok: true };
    },
    resetSave: () => {
      calls.push("resetSave");
      return { ok: true };
    }
  });
  return {
    calls,
    clearedTimers,
    handlers,
    dungeonInfoButton,
    dungeonInfoPanel,
    mapButton,
    mapPanel,
    operationButton,
    operationPanel,
    populationWorkshopButton,
    populationWorkshopPanel,
    rosterSkillButton,
    rosterSkillPanel,
    tavernSkillButton,
    tavernSkillPanel,
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
    calls,
    handlers,
    dungeonInfoButton,
    dungeonInfoPanel,
    mapButton,
    mapPanel,
    operationButton,
    operationPanel,
    populationWorkshopButton,
    populationWorkshopPanel,
    rosterSkillButton,
    rosterSkillPanel,
    tavernSkillButton,
    tavernSkillPanel,
    state
  } = createHarness();

  handlers.setTab("map");
  handlers.setMapSideTab("operations");
  handlers.setDungeonLocalTab("info");
  handlers.setPopulationLocalTab("workshop");
  handlers.setRosterDetailTab("skill1");
  handlers.setTavernDetailTab("skill1");

  assert.equal(state.activeTab, "map");
  assert.equal(mapButton.classList.contains("active"), true);
  assert.equal(mapPanel.classList.contains("active"), true);
  assert.equal(operationButton.classList.contains("active"), true);
  assert.equal(operationPanel.classList.contains("active"), true);
  assert.equal(dungeonInfoButton.classList.contains("active"), true);
  assert.equal(dungeonInfoPanel.classList.contains("active"), true);
  assert.equal(populationWorkshopButton.classList.contains("active"), true);
  assert.equal(populationWorkshopPanel.classList.contains("active"), true);
  assert.equal(rosterSkillButton.classList.contains("active"), true);
  assert.equal(rosterSkillPanel.classList.contains("active"), true);
  assert.equal(tavernSkillButton.classList.contains("active"), true);
  assert.equal(tavernSkillPanel.classList.contains("active"), true);
  assert.equal(state.activeRosterDetailTab, "skill1");
  assert.equal(state.activeTavernDetailTab, "skill1");
  assert.equal(calls.includes("saveNow"), true);
});

test("app shell handlers expose save and reset actions", () => {
  const { calls, handlers } = createHarness();

  assert.deepEqual(handlers.saveNow(), { ok: true });
  assert.deepEqual(handlers.resetSave(), { ok: true });

  assert.deepEqual(calls, ["saveNow", "render", "resetSave"]);
});
