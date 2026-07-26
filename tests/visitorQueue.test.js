import assert from "node:assert/strict";
import test from "node:test";

import { createInitialState } from "../src/app/appState.js";
import { VISITORS } from "../src/game/roster/adventurerData.js";
import {
  MIN_VISITOR_STAY_DAYS,
  refreshTavernVisitors,
  tavernVisitorsForDay,
  visitorStayDays
} from "../src/game/roster/visitorQueue.js";

test("visitor data assigns fame tiers and deterministic visit cycles", () => {
  assert.deepEqual(VISITORS.slice(0, 2).map((visitor) => visitor.availabilityTier), [0, 0]);
  assert.deepEqual(VISITORS.slice(2, 7).map((visitor) => visitor.availabilityTier), [1, 1, 1, 1, 1]);
  assert.deepEqual(VISITORS.slice(7, 12).map((visitor) => visitor.availabilityTier), [2, 2, 2, 2, 2]);
  assert.deepEqual(VISITORS.slice(12, 22).map((visitor) => visitor.availabilityTier), [3, 3, 3, 3, 3, 3, 3, 3, 3, 3]);
  assert.equal(VISITORS[22].availabilityTier, 4);
  assert.equal(VISITORS[0].fameThreshold, 0);
  assert.equal(VISITORS[1].fameThreshold, 0);
  assert.equal(VISITORS.every((visitor) => visitor.stayDays >= 5 && visitor.stayDays <= 8), true);
  assert.equal(VISITORS.every((visitor) => visitor.awayDays >= 10 && visitor.awayDays <= 20), true);
});

test("visitor stays clamp to at least five days", () => {
  assert.equal(MIN_VISITOR_STAY_DAYS, 5);
  assert.equal(visitorStayDays({ stayDays: 2 }), 5);
  assert.equal(visitorStayDays({ stayDays: 7 }), 7);
});

test("tavernVisitorsForDay fills visible seats from fame-eligible visitors", () => {
  const state = createInitialState();
  state.tavern.visitorSeats = 3;
  state.tavern.fame = 0;

  assert.deepEqual(tavernVisitorsForDay(state, VISITORS).map((visitor) => visitor.id), ["mira", "teo"]);

  state.day = 2;
  state.tavern.fame = 500;
  assert.deepEqual(tavernVisitorsForDay(state, VISITORS).map((visitor) => visitor.id), ["mira", "teo", "brann"]);

  state.day = 6;
  const waiting = tavernVisitorsForDay(state, VISITORS).map((visitor) => visitor.id);
  assert.deepEqual(waiting, ["teo", "brann"]);
  assert.equal(state.tavernVisitors.visitors.mira.state, "away");
  assert.equal(state.tavernVisitors.visitors.teo.state, "present");
  assert.equal(state.tavernVisitors.visitors.brann.state, "present");
  assert.equal(state.tavernVisitors.visitors.sana.state, "away");
});

test("refreshTavernVisitors does not refill seats again on the same day", () => {
  const state = createInitialState();
  state.tavern.fame = 500;
  refreshTavernVisitors(state, VISITORS);
  delete state.tavernVisitors.visitors.mira;

  assert.deepEqual(tavernVisitorsForDay(state, VISITORS).map((visitor) => visitor.id), ["teo", "brann"]);
});
