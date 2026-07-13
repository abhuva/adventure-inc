import assert from "node:assert/strict";
import test from "node:test";

import { createReplayCommandHandlers } from "../src/app/replayCommandHandlers.js";

function createHarness(overrides = {}) {
  const calls = [];
  let intervalCallback = null;
  const state = {
    dungeonReplay: {
      events: [{ text: "a" }, { text: "b" }, { text: "c" }],
      cursor: 0,
      playing: false,
      playbackMs: 650,
      timer: null,
      ...overrides.replay
    }
  };
  const handlers = createReplayCommandHandlers({
    state,
    timerApi: () => ({
      setIntervalFn: (callback, ms) => {
        calls.push(["setInterval", ms]);
        intervalCallback = callback;
        return "timer-id";
      },
      clearIntervalFn: (timer) => calls.push(["clearInterval", timer]),
      onAdvance: () => calls.push("advance"),
      onStop: () => calls.push("stop")
    }),
    render: () => calls.push("render"),
    renderReplayOnly: () => calls.push("renderReplayOnly")
  });
  return { state, calls, handlers, get intervalCallback() { return intervalCallback; } };
}

test("replay handlers set cursor and choose render scope", () => {
  const { state, calls, handlers } = createHarness();

  handlers.setReplayCursor(1);
  assert.equal(state.dungeonReplay.cursor, 1);
  assert.deepEqual(calls, ["render"]);

  handlers.setReplayCursor(2, true);
  assert.equal(state.dungeonReplay.cursor, 2);
  assert.deepEqual(calls, ["render", "renderReplayOnly"]);
});

test("replay handlers toggle playback and render expected panels", () => {
  const { state, calls, handlers } = createHarness();

  handlers.toggleReplayPlayback();
  assert.equal(state.dungeonReplay.playing, true);
  assert.deepEqual(calls, [["setInterval", 650], "renderReplayOnly"]);

  handlers.toggleReplayPlayback();
  assert.equal(state.dungeonReplay.playing, false);
  assert.deepEqual(calls, [["setInterval", 650], "renderReplayOnly", ["clearInterval", "timer-id"], "render"]);
});

test("replay handlers ignore empty playback and cycle speed", () => {
  const empty = createHarness({ replay: { events: [] } });
  empty.handlers.toggleReplayPlayback();
  assert.deepEqual(empty.calls, []);

  const active = createHarness({ replay: { playing: true, timer: "old" } });
  active.handlers.cycleReplaySpeed();
  assert.equal(active.state.dungeonReplay.playbackMs, 350);
  assert.equal(active.state.dungeonReplay.playing, true);
  assert.deepEqual(active.calls, [["clearInterval", "old"], ["setInterval", 350], "renderReplayOnly"]);
});

test("replay handlers stop playback and expose speed label", () => {
  const { state, calls, handlers } = createHarness({ replay: { playing: true, timer: "timer-id", playbackMs: 350 } });

  assert.equal(handlers.replaySpeedLabel(), "2x");
  handlers.stopReplayPlayback();

  assert.equal(state.dungeonReplay.playing, false);
  assert.equal(state.dungeonReplay.timer, null);
  assert.deepEqual(calls, [["clearInterval", "timer-id"]]);
});
