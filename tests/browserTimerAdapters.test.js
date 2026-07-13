import assert from "node:assert/strict";
import test from "node:test";

import {
  createBrowserAutoTimeRuntime,
  createBrowserReplayTimerApi,
  DEFAULT_AUTO_TIME_TICK_MS
} from "../src/app/browserTimerAdapters.js";

function createWindowHarness() {
  const calls = [];
  return {
    calls,
    windowRef: {
      setInterval(callback, ms) {
        calls.push(["setInterval", ms, callback]);
        return "timer-id";
      },
      clearInterval(timer) {
        calls.push(["clearInterval", timer]);
      }
    }
  };
}

test("browser timer adapter creates auto-time runtime from browser APIs", () => {
  const { calls, windowRef } = createWindowHarness();
  const performanceRef = { now: () => 123 };
  const runtime = createBrowserAutoTimeRuntime({ windowRef, performanceRef });
  const state = {
    timeRunning: false,
    visual: {
      lastTickAt: 0,
      tickMs: 0
    }
  };

  runtime.start(state, () => {});
  runtime.stop(state);

  assert.equal(state.visual.lastTickAt, 123);
  assert.equal(state.visual.tickMs, DEFAULT_AUTO_TIME_TICK_MS);
  assert.equal(calls[0][0], "setInterval");
  assert.equal(calls[0][1], DEFAULT_AUTO_TIME_TICK_MS);
  assert.deepEqual(calls[1], ["clearInterval", "timer-id"]);
});

test("browser replay timer adapter exposes bound timer callbacks", () => {
  const { calls, windowRef } = createWindowHarness();
  const replayApi = createBrowserReplayTimerApi({
    windowRef,
    onAdvance: () => calls.push("advance"),
    onStop: () => calls.push("stop")
  });

  const timer = replayApi.setIntervalFn(() => calls.push("tick"), 350);
  replayApi.clearIntervalFn(timer);
  replayApi.onAdvance();
  replayApi.onStop();

  assert.equal(timer, "timer-id");
  assert.equal(calls[0][0], "setInterval");
  assert.equal(calls[0][1], 350);
  assert.deepEqual(calls.slice(1), [
    ["clearInterval", "timer-id"],
    "advance",
    "stop"
  ]);
});
