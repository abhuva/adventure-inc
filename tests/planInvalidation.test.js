import assert from "node:assert/strict";
import test from "node:test";

import {
  clearDungeonEstimate,
  clearDungeonEstimateOnly,
  setDungeonEstimate,
  setDungeonEstimateOnly
} from "../src/app/planInvalidation.js";

function createState() {
  return {
    lastEstimate: { id: "old" },
    dungeonReplay: {
      events: [{ text: "old" }],
      cursor: 3,
      playing: true,
      playbackMs: 500,
      timer: 12
    }
  };
}

function timerApi(cleared) {
  return {
    clearIntervalFn: (timer) => cleared.push(timer),
    setIntervalFn: () => 99,
    onAdvance: () => {},
    onStop: () => {}
  };
}

test("clearDungeonEstimate clears cached estimate and resets replay", () => {
  const state = createState();
  const cleared = [];

  clearDungeonEstimate(state, timerApi(cleared));

  assert.equal(state.lastEstimate, null);
  assert.deepEqual(state.dungeonReplay.events, []);
  assert.equal(state.dungeonReplay.cursor, 0);
  assert.equal(state.dungeonReplay.playing, false);
  assert.equal(state.dungeonReplay.timer, null);
  assert.deepEqual(cleared, [12]);
});

test("setDungeonEstimate stores estimate and replaces replay events", () => {
  const state = createState();
  const estimate = {
    id: "next",
    timeline: [{ text: "one" }, { text: "two" }]
  };

  setDungeonEstimate(state, estimate, timerApi([]));

  assert.equal(state.lastEstimate, estimate);
  assert.deepEqual(state.dungeonReplay.events, estimate.timeline);
  assert.equal(state.dungeonReplay.cursor, 0);
  assert.equal(state.dungeonReplay.playing, false);
});

test("estimate-only helpers do not mutate replay state", () => {
  const state = createState();
  const replay = state.dungeonReplay;
  const estimate = { id: "map-assignment" };

  setDungeonEstimateOnly(state, estimate);
  assert.equal(state.lastEstimate, estimate);
  assert.equal(state.dungeonReplay, replay);

  clearDungeonEstimateOnly(state);
  assert.equal(state.lastEstimate, null);
  assert.equal(state.dungeonReplay, replay);
});
