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
  const dungeonInfoTab = fakeElement({ dungeonLocalTab: "info" });
  const populationWorkshopTab = fakeElement({ populationLocalTab: "workshop" });
  const rosterSkillTab = fakeElement({ rosterDetailTab: "skill1" });
  const tavernSkillTab = fakeElement({ tavernDetailTab: "skill1" });
  const replayTimelineSlider = fakeElement();
  const dungeonSelect = fakeElement();
  const mapPartySelect = fakeElement();
  const partySelect = fakeElement();
  const strategySelect = fakeElement();

  setupAppControls({
    documentRef: {
      querySelectorAll(selector) {
        return {
          "[data-tab]": [mapTab],
          "[data-map-side-tab]": [operationsTab],
          "[data-dungeon-local-tab]": [dungeonInfoTab],
          "[data-population-local-tab]": [populationWorkshopTab],
          "[data-roster-detail-tab]": [rosterSkillTab],
          "[data-tavern-detail-tab]": [tavernSkillTab]
        }[selector] || [];
      }
    },
    on: (id, eventName, callback) => {
      registered[`${id}:${eventName}`] = callback;
    },
    el: {
      dungeonSelect,
      mapPartySelect,
      partySelect,
      replayTimelineSlider,
      strategySelect
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
      onMapPartySelectChange: () => calls.push("mapPartyChange"),
      onPartySelectChange: () => calls.push("partyChange"),
      setDungeonLocalTab: (tabId) => calls.push(["dungeonLocal", tabId]),
      setMapSideTab: (tabId) => calls.push(["mapSide", tabId]),
      setPopulationLocalTab: (tabId) => calls.push(["populationLocal", tabId]),
      setRosterDetailTab: (tabId) => calls.push(["rosterDetail", tabId]),
      setTavernDetailTab: (tabId) => calls.push(["tavernDetail", tabId]),
      setTab: (tabId) => calls.push(["tab", tabId])
    },
    dungeonCommandHandlers: {
      automateLastEstimate: () => calls.push("autoEstimate"),
      commitLastEstimate: () => calls.push("commitEstimate"),
      resimulateSelectedRun: () => calls.push("resimulate"),
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
      buildHouses: () => calls.push("buildHouses"),
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
    dungeonInfoTab,
    populationWorkshopTab,
    rosterSkillTab,
    tavernSkillTab,
    mapPartySelect,
    mapTab,
    operationsTab,
    partySelect,
    registered,
    replayTimelineSlider,
    strategySelect
  };
}

test("setupAppControls delegates bound controls to command owners", () => {
  const { calls, registered } = createHarness();

  registered["advanceDayBtn:click"]();
  registered["buildHousesBtn:click"]();
  registered["simulateBtn:click"]();
  registered["replayPrevBtn:click"]();
  registered["clearLogBtn:click"]();

  assert.deepEqual(calls.slice(-5), [
    ["time", 24, true],
    "buildHouses",
    "simulate",
    ["cursor", 3, undefined],
    "clearLog"
  ]);
});

test("setupAppControls delegates tabs, selects, slider, and startup map setup", () => {
  const { calls, dungeonInfoTab, dungeonSelect, mapPartySelect, mapTab, operationsTab, partySelect, populationWorkshopTab, replayTimelineSlider, rosterSkillTab, strategySelect, tavernSkillTab } = createHarness();

  mapTab.trigger("click");
  operationsTab.trigger("click");
  dungeonInfoTab.trigger("click");
  populationWorkshopTab.trigger("click");
  rosterSkillTab.trigger("click");
  tavernSkillTab.trigger("click");
  replayTimelineSlider.value = "5";
  replayTimelineSlider.trigger("input");
  mapPartySelect.trigger("change");
  dungeonSelect.trigger("change");
  partySelect.trigger("change");
  strategySelect.trigger("change");

  assert.deepEqual(calls, [
    "setupMap",
    ["tab", "map"],
    ["mapSide", "operations"],
    ["dungeonLocal", "info"],
    ["populationLocal", "workshop"],
    ["rosterDetail", "skill1"],
    ["tavernDetail", "skill1"],
    ["cursor", 5, true],
    "mapPartyChange",
    "dungeonChange",
    "partyChange",
    "resimulate"
  ]);
});
