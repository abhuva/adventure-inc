import assert from "node:assert/strict";
import test from "node:test";

import {
  registerAppBootstrap,
  startMapAnimationLoop
} from "../src/app/bootstrap.js";

test("registerAppBootstrap runs startup sequence after DOMContentLoaded", async () => {
  const calls = [];
  let listener = null;
  let poiData = null;

  registerAppBootstrap({
    documentRef: {
      addEventListener(type, callback) {
        assert.equal(type, "DOMContentLoaded");
        listener = callback;
      }
    },
    windowRef: {},
    state: { activeTab: "map", timeRunning: false },
    bindElements: () => calls.push("bindElements"),
    setupControls: () => calls.push("setupControls"),
    loadPoiData: async () => ({ tavern: { coord: { x: 1, y: 2 } } }),
    setPoiData: (loaded) => {
      poiData = loaded;
      calls.push("setPoiData");
    },
    populateDungeonSelect: () => calls.push("populateDungeonSelect"),
    populatePartySelect: () => calls.push("populatePartySelect"),
    addLog: (text, type) => calls.push(["addLog", text, type]),
    renderSystems: () => calls.push("renderSystems"),
    render: () => calls.push("render"),
    renderMapActors: () => calls.push("renderMapActors"),
    currentVisualHourFraction: () => 0.5,
    startMapLoop: () => calls.push("startMapLoop")
  });

  await listener();

  assert.deepEqual(poiData, { tavern: { coord: { x: 1, y: 2 } } });
  assert.deepEqual(calls, [
    "bindElements",
    "setupControls",
    "setPoiData",
    "populateDungeonSelect",
    "populatePartySelect",
    ["addLog", "system ready: deterministic prototype loaded", "ok"],
    "render",
    "startMapLoop"
  ]);
});

test("registerAppBootstrap logs and renders systems on POI load failure", async () => {
  const calls = [];
  let listener = null;
  registerAppBootstrap({
    documentRef: {
      addEventListener(_type, callback) {
        listener = callback;
      }
    },
    windowRef: {},
    state: {},
    bindElements: () => calls.push("bindElements"),
    setupControls: () => calls.push("setupControls"),
    loadPoiData: async () => {
      throw new Error("missing poi");
    },
    setPoiData: () => calls.push("setPoiData"),
    populateDungeonSelect: () => calls.push("populateDungeonSelect"),
    populatePartySelect: () => calls.push("populatePartySelect"),
    addLog: (text, type) => calls.push(["addLog", text, type]),
    renderSystems: () => calls.push("renderSystems"),
    render: () => calls.push("render"),
    renderMapActors: () => calls.push("renderMapActors"),
    currentVisualHourFraction: () => 0,
    startMapLoop: () => calls.push("startMapLoop")
  });

  await assert.rejects(listener(), /missing poi/);
  assert.deepEqual(calls, [
    "bindElements",
    "setupControls",
    ["addLog", "POI data load failed: missing poi", "bad"],
    "renderSystems"
  ]);
});

test("startMapAnimationLoop renders map actors only while map auto-time is active", () => {
  const callbacks = [];
  const rendered = [];
  const state = {
    activeTab: "map",
    timeRunning: true
  };
  startMapAnimationLoop({
    windowRef: {
      requestAnimationFrame(callback) {
        callbacks.push(callback);
      }
    },
    state,
    renderMapActors: (fraction) => rendered.push(fraction),
    currentVisualHourFraction: () => 0.25
  });

  assert.equal(callbacks.length, 1);
  callbacks.shift()();
  assert.deepEqual(rendered, [0.25]);
  assert.equal(callbacks.length, 1);

  state.activeTab = "dungeon";
  callbacks.shift()();
  assert.deepEqual(rendered, [0.25]);
});
