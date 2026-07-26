import assert from "node:assert/strict";
import test from "node:test";

import { createExpeditionCommandHandlers } from "../src/app/expeditionCommandHandlers.js";
import { createInitialState } from "../src/app/appState.js";

test("focusing a continent refreshes the map actor layer after rendering", () => {
  const state = createInitialState();
  state.world.unlockedContinents.ash_coast = true;
  state.world.focusedContinentId = "ash_coast";
  state.world.selectedContinentId = "old_marches";
  const calls = [];
  const handlers = createExpeditionCommandHandlers({
    state,
    controls: {
      setParty: (partyId) => calls.push(["party", partyId])
    },
    canPay: () => true,
    pay: () => {},
    addLog: (message, type) => calls.push(["log", type, message]),
    render: () => calls.push("render"),
    renderMapActors: (hourFraction) => calls.push(["actors", hourFraction]),
    currentVisualHourFraction: () => 0.42,
    setTab: (tabId) => calls.push(["tab", tabId])
  });

  const result = handlers.focusSelectedContinent();

  assert.equal(result.ok, true);
  assert.equal(state.world.focusedContinentId, "old_marches");
  assert.deepEqual(calls, [
    ["party", "party-1"],
    ["log", "ok", "focused continent: Old Marches"],
    ["log", "info", "Old Marches: no time away to resolve."],
    ["tab", "map"],
    "render",
    ["actors", 0.42]
  ]);
});

test("selecting continent markers opens switch context only for unlocked remote continents", () => {
  const state = createInitialState();
  const calls = [];
  const handlers = createExpeditionCommandHandlers({
    state,
    controls: {},
    canPay: () => true,
    pay: () => {},
    addLog: () => {},
    render: () => calls.push("render")
  });

  handlers.selectContinentFromMap("ash_coast", { x: 100, y: 120 });
  assert.equal(state.world.selectedContinentId, "ash_coast");
  assert.equal(state.continentContextMenu, null);

  state.world.unlockedContinents.ash_coast = true;
  handlers.selectContinentFromMap("ash_coast", { x: 140, y: 160 });
  assert.deepEqual(state.continentContextMenu, { continentId: "ash_coast", x: 140, y: 160 });

  handlers.closeContinentContextMenu();
  assert.equal(state.continentContextMenu, null);
  assert.deepEqual(calls, ["render", "render", "render"]);
});
