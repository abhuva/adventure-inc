import assert from "node:assert/strict";
import test from "node:test";

import { createInitialState } from "../src/app/appState.js";
import { EXPEDITION_ROUTES } from "../src/game/continent/continentData.js";
import { visibleMapLocationsFromPoi } from "../src/data/poiSelectors.js";
import {
  advanceExpeditionTransfers,
  activateFocusedContinentResources,
  focusContinent,
  isRouteUnlocked,
  localHeroes,
  localParties,
  resolveArrivalPrompt,
  startExpeditionTransfer,
  unlockExpeditionRoutesForDay
} from "../src/game/continent/continentState.js";

test("expedition route unlocks deterministically on day 7", () => {
  const state = createInitialState();
  const route = EXPEDITION_ROUTES[0];

  assert.equal(isRouteUnlocked(state, route.id), false);

  state.day = 7;
  const unlocked = unlockExpeditionRoutesForDay(state);

  assert.deepEqual(unlocked.map((item) => item.id), [route.id]);
  assert.equal(isRouteUnlocked(state, route.id), true);
  assert.deepEqual(unlockExpeditionRoutesForDay(state), []);
});

test("starting an expedition creates a transfer and removes party from local continent", () => {
  const state = createInitialState();
  const route = EXPEDITION_ROUTES[0];
  state.day = 7;
  state.resources = { ...state.resources, coin: 200, food: 80, planks: 30 };
  unlockExpeditionRoutesForDay(state);

  const result = startExpeditionTransfer(state, route.id, "party-1", {
    canPay: (cost) => Object.entries(cost).every(([key, amount]) => (state.resources[key] || 0) >= amount),
    pay: (cost) => {
      Object.entries(cost).forEach(([key, amount]) => {
        state.resources[key] -= amount;
      });
    }
  });

  assert.equal(result.ok, true);
  assert.equal(state.world.transfers.length, 1);
  assert.equal(state.world.heroLocations.ada.startsWith("travel:"), true);
  assert.equal(state.world.partyLocations["party-1"].startsWith("travel:"), true);
  assert.equal(localHeroes(state, "old_marches").some((hero) => hero.id === "ada"), false);
  assert.equal(localParties(state, "old_marches").some((party) => party.id === "party-1"), false);
  assert.equal(localParties(state, "old_marches").some((party) => party.memberIds.length === 0), true);
});

test("transfer completion unlocks destination and arrival prompt can switch focus", () => {
  const state = createInitialState();
  const route = EXPEDITION_ROUTES[0];
  state.day = 7;
  state.resources = { ...state.resources, coin: 200, food: 80, planks: 30 };
  unlockExpeditionRoutesForDay(state);
  startExpeditionTransfer(state, route.id, "party-1", {
    canPay: () => true,
    pay: () => {}
  });

  const arrivals = advanceExpeditionTransfers(state, route.durationHours);

  assert.equal(arrivals.length, 1);
  assert.equal(state.world.unlockedContinents.ash_coast, true);
  assert.equal(state.world.heroLocations.ada, "ash_coast");
  assert.equal(state.world.partyLocations["party-1"], "ash_coast");
  assert.equal(state.world.pendingArrivals.length, 1);

  const result = resolveArrivalPrompt(state, arrivals[0].id, { switchFocus: true });

  assert.equal(result.ok, true);
  assert.equal(state.world.focusedContinentId, "ash_coast");
  assert.equal(result.catchUp?.timeAwayHours, undefined);
  assert.equal(state.world.lastCatchUpReport.timeAwayHours, 0);
  assert.equal(state.world.pendingArrivals.length, 0);
  assert.equal(localHeroes(state, "ash_coast").map((hero) => hero.id).includes("ada"), true);
});

test("focusContinent records deterministic time-away catch-up report", () => {
  const state = createInitialState();
  state.world.unlockedContinents.ash_coast = true;
  state.world.lastFocusedAtHours.ash_coast = 24;
  state.day = 5;
  state.hour = 0;

  const result = focusContinent(state, "ash_coast");

  assert.equal(result.ok, true);
  assert.equal(result.catchUp.timeAwayHours, 72);
  assert.match(result.catchUp.summary, /72h deterministic catch-up/);
});

test("continent focus switches the active local resource stockpile", () => {
  const state = createInitialState();
  state.resources.coin = 77;
  state.world.unlockedContinents.ash_coast = true;
  state.world.resourcesByContinent.ash_coast = { coin: 3, food: 1 };

  const result = focusContinent(state, "ash_coast");

  assert.equal(result.ok, true);
  assert.equal(state.resources.coin, 3);
  state.resources.coin = 9;
  focusContinent(state, "old_marches");
  assert.equal(state.resources.coin, 77);
  assert.equal(state.world.resourcesByContinent.ash_coast.coin, 9);
});

test("activateFocusedContinentResources migrates legacy resources to Old Marches", () => {
  const state = {
    resources: { coin: 14, food: 2 },
    world: {
      focusedContinentId: "old_marches",
      unlockedContinents: { old_marches: true },
      resourcesByContinent: {}
    }
  };

  activateFocusedContinentResources(state);

  assert.equal(state.resources.coin, 14);
  assert.equal(state.world.resourcesByContinent.old_marches.food, 2);
});

test("focusContinent refuses locked continents", () => {
  const state = createInitialState();

  assert.deepEqual(focusContinent(state, "ash_coast"), {
    ok: false,
    reason: "continent locked",
    continentId: "ash_coast"
  });
});

test("visible map locations include Expedition POI after route unlock", () => {
  const state = createInitialState();
  state.day = 7;
  unlockExpeditionRoutesForDay(state);
  const poiData = {
    tavern: { id: "tavern", name: "Tavern", coord: { x: 1, y: 1 } },
    workSites: [],
    dungeons: []
  };

  const locations = visibleMapLocationsFromPoi(poiData, state);

  assert.equal(locations.some((location) => location.id === "expedition" && location.type === "expedition"), true);
});
