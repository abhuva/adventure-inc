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
    automateLastEstimate: () => calls.push(["automateLastEstimate"]),
    buildHouses: () => calls.push(["buildHouses"]),
    clearLog: () => calls.push(["clearLog"]),
    commitLastEstimate: () => calls.push(["commitLastEstimate"]),
    cycleReplaySpeed: () => calls.push(["cycleReplaySpeed"]),
    onDungeonSelectChange: () => calls.push(["onDungeonSelectChange"]),
    onExpeditionPartySelectChange: () => calls.push(["onExpeditionPartySelectChange"]),
    onMapPartySelectChange: () => calls.push(["onMapPartySelectChange"]),
    onPartySelectChange: () => calls.push(["onPartySelectChange"]),
    onStrategySelectChange: () => calls.push(["onStrategySelectChange"]),
    replayCursor: () => 4,
    replayLastCursor: () => 9,
    resetSave: () => calls.push(["resetSave"]),
    saveNow: () => calls.push(["saveNow"]),
    setDungeonLocalTab: (id) => calls.push(["setDungeonLocalTab", id]),
    setMapSideTab: (id) => calls.push(["setMapSideTab", id]),
    setPopulationLocalTab: (id) => calls.push(["setPopulationLocalTab", id]),
    setRosterDetailTab: (id) => calls.push(["setRosterDetailTab", id]),
    setTavernDetailTab: (id) => calls.push(["setTavernDetailTab", id]),
    setReplayCursor: (cursor, renderOnly) => calls.push(["setReplayCursor", cursor, renderOnly]),
    setTab: (id) => calls.push(["setTab", id]),
    setupMapInteractions: () => calls.push(["setupMapInteractions"]),
    simulateSelectedRun: () => calls.push(["simulateSelectedRun"]),
    startSelectedExpedition: () => calls.push(["startSelectedExpedition"]),
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
  const expeditionPartySelect = fakeElement();
  const mapPartySelect = fakeElement();
  const partySelect = fakeElement();
  const strategySelect = fakeElement();
  const mapTab = fakeElement({ tab: "map" });
  const operationsTab = fakeElement({ mapSideTab: "operations" });
  const dungeonInfoTab = fakeElement({ dungeonLocalTab: "info" });
  const populationWorkshopTab = fakeElement({ populationLocalTab: "workshop" });
  const rosterSkillTab = fakeElement({ rosterDetailTab: "skill1" });
  const tavernSkillTab = fakeElement({ tavernDetailTab: "skill1" });

  setupControls({
    documentRef: fakeDocument({
      "[data-tab]": [mapTab],
      "[data-map-side-tab]": [operationsTab],
      "[data-dungeon-local-tab]": [dungeonInfoTab],
      "[data-population-local-tab]": [populationWorkshopTab],
      "[data-roster-detail-tab]": [rosterSkillTab],
      "[data-tavern-detail-tab]": [tavernSkillTab]
    }),
    on,
    el: {
      dungeonSelect,
      expeditionPartySelect,
      mapPartySelect,
      partySelect,
      replayTimelineSlider,
      strategySelect
    },
    handlers
  });

  return {
    calls,
    dungeonSelect,
    expeditionPartySelect,
    mapPartySelect,
    mapTab,
    dungeonInfoTab,
    populationWorkshopTab,
    rosterSkillTab,
    tavernSkillTab,
    operationsTab,
    partySelect,
    registered,
    replayTimelineSlider,
    strategySelect
  };
}

test("setupControls binds tab and local tab clicks", () => {
  const { calls, dungeonInfoTab, mapTab, operationsTab, populationWorkshopTab, rosterSkillTab, tavernSkillTab } = createHarness();

  mapTab.trigger("click");
  operationsTab.trigger("click");
  dungeonInfoTab.trigger("click");
  populationWorkshopTab.trigger("click");
  rosterSkillTab.trigger("click");
  tavernSkillTab.trigger("click");

  assert.deepEqual(calls.slice(-6), [
    ["setTab", "map"],
    ["setMapSideTab", "operations"],
    ["setDungeonLocalTab", "info"],
    ["setPopulationLocalTab", "workshop"],
    ["setRosterDetailTab", "skill1"],
    ["setTavernDetailTab", "skill1"]
  ]);
});

test("setupControls binds primary command buttons", () => {
  const { calls, registered } = createHarness();

  registered["advanceDayBtn:click"]();
  registered["buildHousesBtn:click"]();
  registered["saveNowBtn:click"]();
  registered["resetSaveBtn:click"]();
  registered["startExpeditionBtn:click"]();
  registered["replayPrevBtn:click"]();
  registered["replayLastBtn:click"]();

  assert.deepEqual(calls.slice(-7), [
    ["advanceTime", 24, true],
    ["buildHouses"],
    ["saveNow"],
    ["resetSave"],
    ["startSelectedExpedition"],
    ["setReplayCursor", 3, undefined],
    ["setReplayCursor", 9, undefined]
  ]);
});

test("setupControls binds replay slider and select changes", () => {
  const { calls, dungeonSelect, expeditionPartySelect, mapPartySelect, partySelect, replayTimelineSlider, strategySelect } = createHarness();

  replayTimelineSlider.value = "6";
  replayTimelineSlider.trigger("input");
  mapPartySelect.trigger("change");
  expeditionPartySelect.trigger("change");
  dungeonSelect.trigger("change");
  partySelect.trigger("change");
  strategySelect.trigger("change");

  assert.deepEqual(calls.slice(-6), [
    ["setReplayCursor", 6, true],
    ["onMapPartySelectChange"],
    ["onExpeditionPartySelectChange"],
    ["onDungeonSelectChange"],
    ["onPartySelectChange"],
    ["onStrategySelectChange"]
  ]);
});

test("setupControls runs map interaction setup", () => {
  const { calls } = createHarness();

  assert.deepEqual(calls[0], ["setupMapInteractions"]);
});
