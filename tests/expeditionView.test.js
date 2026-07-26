import assert from "node:assert/strict";
import test from "node:test";

import { EXPEDITION_ROUTES } from "../src/game/continent/continentData.js";
import { locationDetailHtml } from "../src/ui/mapSideView.js";
import {
  arrivalPromptHtml,
  continentDetailHtml,
  continentMapHtml,
  expeditionRouteDetailHtml,
  transferRowsHtml
} from "../src/ui/expeditionView.js";

test("expedition route detail renders route facts and readiness", () => {
  const route = EXPEDITION_ROUTES[0];
  const html = expeditionRouteDetailHtml({
    route,
    origin: { name: "Old Marches" },
    destination: { name: "Ash Coast" },
    costText: "food 40 / coin 120 / planks 20",
    readiness: { ok: true, message: "ready" }
  });

  assert.match(html, /Ash Coast Charter/);
  assert.match(html, /destination: Ash Coast/);
  assert.match(html, /readiness: ready/);
});

test("continent detail renders rule modifiers and local counts", () => {
  const html = continentDetailHtml({
    continent: {
      id: "ash_coast",
      name: "Ash Coast",
      description: "Harder baseline.",
      rules: ["training expected"]
    },
    focused: true,
    heroCount: 2,
    partyCount: 1
  });

  assert.match(html, /Ash Coast \/ focused/);
  assert.match(html, /status: locked/);
  assert.match(html, /local adventurers: 2/);
  assert.match(html, /training expected/);
});

test("continent map renders markers and switch context actions", () => {
  const html = continentMapHtml({
    continents: [
      { id: "old_marches", name: "Old Marches", coord: { x: 768, y: 512 } },
      { id: "ash_coast", name: "Ash Coast", coord: { x: 384, y: 256 } }
    ],
    unlockedById: { old_marches: true, ash_coast: true },
    focusedContinentId: "old_marches",
    selectedContinentId: "ash_coast",
    contextMenu: { continentId: "ash_coast", x: 44, y: 55 }
  });

  assert.match(html, /continent-marker unlocked focused/);
  assert.match(html, /continent-marker unlocked  selected/);
  assert.match(html, /left:25.000%;top:25.000%/);
  assert.match(html, /data-continent-context-action="switch"/);
  assert.match(html, /data-continent-context-action="cancel"/);
});

test("transfer and arrival views expose deterministic actions", () => {
  const rows = transferRowsHtml({
    transfers: [{ routeId: "old_marches_to_ash_coast", partyName: "Alpha", durationHours: 10, elapsedHours: 3 }],
    pendingArrivals: [],
    routeName: () => "Ash Coast Charter",
    heroName: (heroId) => heroId
  });
  const prompt = arrivalPromptHtml({
    arrival: {
      id: "arrival-1",
      destinationName: "Ash Coast",
      routeName: "Ash Coast Charter",
      partyName: "Alpha",
      memberIds: ["ada"]
    },
    heroName: (heroId) => heroId
  });

  assert.match(rows, /7h left/);
  assert.match(prompt, /data-expedition-arrival-action="switch"/);
  assert.match(prompt, /data-expedition-arrival-action="stay"/);
});

test("map location detail renders expedition summary without start action", () => {
  const route = EXPEDITION_ROUTES[0];
  const html = locationDetailHtml({
    location: {
      id: "expedition",
      name: "Expedition",
      type: "expedition",
      coord: route.coord,
      description: route.description,
      route
    },
    party: { id: "party-1", name: "Alpha", memberIds: [] },
    partyReady: { message: "ready" },
    tavernCoord: { x: 0, y: 0 },
    distanceText: () => "10.0",
    rewardText: () => "food 40 / coin 120 / planks 20",
    heroName: (heroId) => heroId
  });

  assert.match(html, /type: expedition/);
  assert.match(html, /Ash Coast Charter/);
  assert.doesNotMatch(html, /data-run-expedition/);
});
