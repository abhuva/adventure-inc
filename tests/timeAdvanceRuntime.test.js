import assert from "node:assert/strict";
import test from "node:test";

import { advanceGameHours } from "../src/game/time/timeAdvanceRuntime.js";

test("advanceGameHours runs per-hour work before advancing the clock", () => {
  const state = { day: 1, hour: 0 };
  const calls = [];

  advanceGameHours({
    state,
    hours: 2,
    onBeforeHour: (index) => calls.push(["before", index, state.hour]),
    advanceClock: (clockState, hours) => {
      calls.push(["clock", hours, clockState.hour]);
      clockState.hour += hours;
      return [];
    }
  });

  assert.deepEqual(calls, [
    ["before", 0, 0],
    ["clock", 1, 0],
    ["before", 1, 1],
    ["clock", 1, 1]
  ]);
  assert.equal(state.hour, 2);
});

test("advanceGameHours returns clock rollovers", () => {
  const state = { day: 1, hour: 23 };
  const seen = [];

  const rollovers = advanceGameHours({
    state,
    hours: 2,
    onBeforeHour: () => {},
    onDayRollover: (rollover) => seen.push(rollover.day)
  });

  assert.deepEqual(state, { day: 2, hour: 1 });
  assert.deepEqual(rollovers, [{ day: 2, hour: 0 }]);
  assert.deepEqual(seen, [2]);
});
