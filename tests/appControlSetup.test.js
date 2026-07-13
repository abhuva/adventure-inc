import assert from "node:assert/strict";
import test from "node:test";

import { setupAppControls } from "../src/app/appControlSetup.js";

function fakeElement(dataset = {}) {
  const listeners = {};
  return {
    dataset,
    value: "0",
    addEventListener(type, callback) {
      listeners[type] = callback;
    },
    trigger(type) {
      listeners[type]?.();
    }
  };
}

function createHarness() {
  const calls = [];
  const registered = {};
  const mapTab = fakeElement({ tab: "map" });
  const operationsTab = fakeElement({ mapSideTab: "operations" });
  const replayTimelineSlider = fakeElement();
  const dungeonSelect = fakeElement();
  const partySelect = fakeElement();

  setupAppControls({
    documentRef: {
      querySelectorAll(selector) {
        return {
          "[data-tab]": [mapTab],
          "[data-map-side-tab]": [operationsTab]
        }[selector] || [];
      }
    },
    on: (id, eventName, callback) => {
      registered[`${id}:${eventName}`] = callback;
    },
    el: {
      dungeonSelect,
      partySelect,
      replayTimelineSlider
    },
    state: {
      dungeonReplay: {
        cursor: 4,
        events: [{}, {}, {}, {}, {}, {}, {}]
      }
    },
    appShellCommandHandlers: {
      clearLog: () => calls.push("clearLog"),
      onDungeonSelectChange: () => calls.push("dungeonChange"),
      onPartySelectChange: () => calls.push("partyChange"),
      setMapSideTab: (tabId) => calls.push(["mapSide", tabId]),
      setTab: (tabId) => calls.push(["tab", tabId])
    },
    dungeonCommandHandlers: {
      automateLastEstimate: () => calls.push("autoEstimate"),
      commitLastEstimate: () => calls.push("commitEstimate"),
      simulateSelectedRun: () => calls.push("simulate")
    },
    partyCommandHandlers: {
      addParty: () => calls.push("addParty")
    },
    replayCommandHandlers: {
      cycleReplaySpeed: () => calls.push("replaySpeed"),
      setReplayCursor: (cursor, renderOnly) => calls.push(["cursor", cursor, renderOnly]),
      toggleReplayPlayback: () => calls.push("replayToggle")
    },
    rosterTavernCommandHandlers: {
      assignWorker: (job) => calls.push(["assign", job]),
      craft: (id) => calls.push(["craft", id]),
      toggleRosterView: () => calls.push("toggleRoster"),
      upgradeTavern: () => calls.push("upgrade")
    },
    timeCommandHandlers: {
      advanceTime: (hours, report) => calls.push(["time", hours, report]),
      toggleAutoTime: () => calls.push("autoTime")
    },
    setupMapInteractions: () => calls.push("setupMap")
  });

  return {
    calls,
    dungeonSelect,
    mapTab,
    operationsTab,
    partySelect,
    registered,
    replayTimelineSlider
  };
}

test("setupAppControls delegates bound controls to command owners", () => {
  const { calls, registered } = createHarness();

  registered["advanceHourBtn:click"]();
  registered["assignWoodBtn:click"]();
  registered["craftBladeBtn:click"]();
  registered["simulateBtn:click"]();
  registered["replayPrevBtn:click"]();
  registered["clearLogBtn:click"]();

  assert.deepEqual(calls.slice(-6), [
    ["time", 1, true],
    ["assign", "wood"],
    ["craft", "ironBlade"],
    "simulate",
    ["cursor", 3, undefined],
    "clearLog"
  ]);
});

test("setupAppControls delegates tabs, selects, slider, and startup map setup", () => {
  const { calls, dungeonSelect, mapTab, operationsTab, partySelect, replayTimelineSlider } = createHarness();

  mapTab.trigger("click");
  operationsTab.trigger("click");
  replayTimelineSlider.value = "5";
  replayTimelineSlider.trigger("input");
  dungeonSelect.trigger("change");
  partySelect.trigger("change");

  assert.deepEqual(calls, [
    "setupMap",
    ["tab", "map"],
    ["mapSide", "operations"],
    ["cursor", 5, true],
    "dungeonChange",
    "partyChange"
  ]);
});
