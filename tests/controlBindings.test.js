import assert from "node:assert/strict";
import test from "node:test";

import { setupControls } from "../src/app/controlBindings.js";

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

function fakeDocument(selectors) {
  return {
    querySelectorAll(selector) {
      return selectors[selector] || [];
    }
  };
}

function createHarness() {
  const calls = [];
  const registered = {};
  const handlers = {
    addParty: () => calls.push(["addParty"]),
    advanceTime: (hours, report) => calls.push(["advanceTime", hours, report]),
    assignWorker: (job) => calls.push(["assignWorker", job]),
    automateLastEstimate: () => calls.push(["automateLastEstimate"]),
    clearLog: () => calls.push(["clearLog"]),
    commitLastEstimate: () => calls.push(["commitLastEstimate"]),
    craft: (id) => calls.push(["craft", id]),
    cycleReplaySpeed: () => calls.push(["cycleReplaySpeed"]),
    onDungeonSelectChange: () => calls.push(["onDungeonSelectChange"]),
    onPartySelectChange: () => calls.push(["onPartySelectChange"]),
    replayCursor: () => 4,
    replayLastCursor: () => 9,
    setMapSideTab: (id) => calls.push(["setMapSideTab", id]),
    setReplayCursor: (cursor, renderOnly) => calls.push(["setReplayCursor", cursor, renderOnly]),
    setTab: (id) => calls.push(["setTab", id]),
    setupMapInteractions: () => calls.push(["setupMapInteractions"]),
    simulateSelectedRun: () => calls.push(["simulateSelectedRun"]),
    toggleAutoTime: () => calls.push(["toggleAutoTime"]),
    toggleReplayPlayback: () => calls.push(["toggleReplayPlayback"]),
    toggleRosterView: () => calls.push(["toggleRosterView"]),
    upgradeTavern: () => calls.push(["upgradeTavern"])
  };
  const on = (id, eventName, callback) => {
    registered[`${id}:${eventName}`] = callback;
  };
  const replayTimelineSlider = fakeElement();
  const dungeonSelect = fakeElement();
  const partySelect = fakeElement();
  const mapTab = fakeElement({ tab: "map" });
  const operationsTab = fakeElement({ mapSideTab: "operations" });

  setupControls({
    documentRef: fakeDocument({
      "[data-tab]": [mapTab],
      "[data-map-side-tab]": [operationsTab]
    }),
    on,
    el: {
      dungeonSelect,
      partySelect,
      replayTimelineSlider
    },
    handlers
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

test("setupControls binds tab and map side tab clicks", () => {
  const { calls, mapTab, operationsTab } = createHarness();

  mapTab.trigger("click");
  operationsTab.trigger("click");

  assert.deepEqual(calls.slice(-2), [
    ["setTab", "map"],
    ["setMapSideTab", "operations"]
  ]);
});

test("setupControls binds primary command buttons", () => {
  const { calls, registered } = createHarness();

  registered["advanceHourBtn:click"]();
  registered["advanceDayBtn:click"]();
  registered["assignWoodBtn:click"]();
  registered["craftBladeBtn:click"]();
  registered["replayPrevBtn:click"]();
  registered["replayLastBtn:click"]();

  assert.deepEqual(calls.slice(-6), [
    ["advanceTime", 1, true],
    ["advanceTime", 24, true],
    ["assignWorker", "wood"],
    ["craft", "ironBlade"],
    ["setReplayCursor", 3, undefined],
    ["setReplayCursor", 9, undefined]
  ]);
});

test("setupControls binds replay slider and select changes", () => {
  const { calls, dungeonSelect, partySelect, replayTimelineSlider } = createHarness();

  replayTimelineSlider.value = "6";
  replayTimelineSlider.trigger("input");
  dungeonSelect.trigger("change");
  partySelect.trigger("change");

  assert.deepEqual(calls.slice(-3), [
    ["setReplayCursor", 6, true],
    ["onDungeonSelectChange"],
    ["onPartySelectChange"]
  ]);
});

test("setupControls runs map interaction setup", () => {
  const { calls } = createHarness();

  assert.deepEqual(calls[0], ["setupMapInteractions"]);
});
