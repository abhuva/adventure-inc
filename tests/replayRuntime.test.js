import assert from "node:assert/strict";
import test from "node:test";

import {
  cycleReplaySpeed,
  replayMaxCursor,
  replaySpeedLabel,
  resetReplay,
  setReplayCursor,
  startReplayPlayback,
  stopReplayPlayback,
  toggleReplayPlayback
} from "../src/game/dungeon/replayRuntime.js";

function replay(overrides = {}) {
  return {
    events: [{ text: "a" }, { text: "b" }, { text: "c" }],
    cursor: 0,
    playing: false,
    playbackMs: 650,
    timer: null,
    ...overrides
  };
}

test("replayMaxCursor and replaySpeedLabel derive replay UI values", () => {
  assert.equal(replayMaxCursor(replay()), 2);
  assert.equal(replayMaxCursor(replay({ events: [] })), 0);
  assert.equal(replaySpeedLabel(900), "0.75x");
  assert.equal(replaySpeedLabel(650), "1x");
  assert.equal(replaySpeedLabel(350), "2x");
  assert.equal(replaySpeedLabel(180), "4x");
});

test("setReplayCursor clamps cursor and stops when reaching the end", () => {
  const state = replay({ playing: true, timer: 42 });
  const cleared = [];

  const cursor = setReplayCursor(state, 99, {
    clearIntervalFn: (timer) => cleared.push(timer)
  });

  assert.equal(cursor, 2);
  assert.equal(state.cursor, 2);
  assert.equal(state.playing, false);
  assert.equal(state.timer, null);
  assert.deepEqual(cleared, [42]);
});

test("resetReplay stops playback and replaces events", () => {
  const state = replay({ cursor: 2, playing: true, timer: 7 });
  const cleared = [];
  const events = [{ text: "new" }];

  resetReplay(state, events, {
    clearIntervalFn: (timer) => cleared.push(timer)
  });

  assert.equal(state.cursor, 0);
  assert.equal(state.events, events);
  assert.equal(state.playing, false);
  assert.equal(state.timer, null);
  assert.deepEqual(cleared, [7]);
});

test("startReplayPlayback advances through injected interval callback", () => {
  const state = replay();
  let intervalCallback = null;
  let intervalMs = null;
  let advanceCount = 0;
  let stopCount = 0;

  const started = startReplayPlayback(state, {
    setIntervalFn: (callback, ms) => {
      intervalCallback = callback;
      intervalMs = ms;
      return "timer-id";
    },
    clearIntervalFn: () => {},
    onAdvance: () => {
      advanceCount += 1;
    },
    onStop: () => {
      stopCount += 1;
    }
  });

  assert.equal(started, true);
  assert.equal(state.playing, true);
  assert.equal(state.timer, "timer-id");
  assert.equal(intervalMs, 650);

  intervalCallback();
  assert.equal(state.cursor, 1);
  assert.equal(advanceCount, 1);

  intervalCallback();
  assert.equal(state.cursor, 2);
  assert.equal(advanceCount, 2);

  intervalCallback();
  assert.equal(state.playing, false);
  assert.equal(state.timer, null);
  assert.equal(stopCount, 1);
});

test("toggleReplayPlayback starts and stops playback", () => {
  const state = replay();
  const cleared = [];

  assert.equal(toggleReplayPlayback(state, {
    setIntervalFn: () => "timer-id",
    clearIntervalFn: (timer) => cleared.push(timer)
  }), "started");
  assert.equal(state.playing, true);

  assert.equal(toggleReplayPlayback(state, {
    clearIntervalFn: (timer) => cleared.push(timer)
  }), "stopped");
  assert.equal(state.playing, false);
  assert.deepEqual(cleared, ["timer-id"]);

  assert.equal(toggleReplayPlayback(replay({ events: [] })), "empty");
});

test("cycleReplaySpeed changes speed and restarts active playback", () => {
  const state = replay({ playing: true, timer: "old-timer" });
  const cleared = [];

  const result = cycleReplaySpeed(state, {
    clearIntervalFn: (timer) => cleared.push(timer),
    setIntervalFn: () => "new-timer"
  });

  assert.equal(result, "restarted");
  assert.equal(state.playbackMs, 350);
  assert.equal(state.playing, true);
  assert.equal(state.timer, "new-timer");
  assert.deepEqual(cleared, ["old-timer"]);

  assert.equal(cycleReplaySpeed(replay({ playbackMs: 180 })), "changed");
});

test("stopReplayPlayback clears timer and playback flag", () => {
  const state = replay({ playing: true, timer: 123 });
  const cleared = [];

  stopReplayPlayback(state, {
    clearIntervalFn: (timer) => cleared.push(timer)
  });

  assert.equal(state.playing, false);
  assert.equal(state.timer, null);
  assert.deepEqual(cleared, [123]);
});
