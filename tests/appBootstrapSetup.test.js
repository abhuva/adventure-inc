import assert from "node:assert/strict";
import test from "node:test";

import { setupAppBootstrap } from "../src/app/appBootstrapSetup.js";

test("setupAppBootstrap registers startup callbacks and binds app elements", () => {
  const documentRef = {};
  const windowRef = {};
  const state = { activeTab: "map" };
  const el = {};
  const callbacks = {
    setupControls: () => {},
    loadPoiData: () => {},
    setPoiData: () => {},
    populateDungeonSelect: () => {},
    populatePartySelect: () => {},
    addLog: () => {},
    renderSystems: () => {},
    render: () => {},
    renderMapActors: () => {},
    currentVisualHourFraction: () => 0
  };
  let registered = null;

  setupAppBootstrap({
    documentRef,
    windowRef,
    state,
    el,
    ...callbacks,
    bindElements: () => ({ mapPanel: "map", rosterPanel: "roster" }),
    registerAppBootstrap: (args) => {
      registered = args;
    }
  });

  assert.equal(registered.documentRef, documentRef);
  assert.equal(registered.windowRef, windowRef);
  assert.equal(registered.state, state);
  assert.equal(registered.setupControls, callbacks.setupControls);
  assert.equal(registered.loadPoiData, callbacks.loadPoiData);
  assert.equal(registered.currentVisualHourFraction, callbacks.currentVisualHourFraction);

  registered.bindElements();
  assert.deepEqual(el, { mapPanel: "map", rosterPanel: "roster" });
});
