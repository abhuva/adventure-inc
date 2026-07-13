import assert from "node:assert/strict";
import test from "node:test";

import { createAutoTimeRuntime } from "../src/game/time/autoTimeRuntime.js";

function state() {
  return {
    timeRunning: false,
    visual: {
      lastTickAt: 0,
      tickMs: 750
    }
  };
}

function runtime(nowRef, calls = {}) {
  return createAutoTimeRuntime({
    setIntervalFn: (callback, ms) => {
      calls.callback = callback;
      calls.ms = ms;
      return "timer-id";
    },
    clearIntervalFn: (timer) => {
      calls.cleared = timer;
    },
    nowFn: () => nowRef.value,
    tickMs: 750
  });
}

test("start enables auto time and creates interval", () => {
  const now = { value: 100 };
  const calls = {};
  const auto = runtime(now, calls);
  const game = state();

  const result = auto.start(game, () => {});

  assert.equal(result, "started");
  assert.equal(game.timeRunning, true);
  assert.equal(game.visual.lastTickAt, 100);
  assert.equal(game.visual.tickMs, 750);
  assert.equal(calls.ms, 750);
  assert.equal(auto.hasTimer(), true);
});

test("stop clears interval and disables auto time", () => {
  const now = { value: 100 };
  const calls = {};
  const auto = runtime(now, calls);
  const game = state();

  auto.start(game, () => {});
  const result = auto.stop(game);

  assert.equal(result, "stopped");
  assert.equal(game.timeRunning, false);
  assert.equal(calls.cleared, "timer-id");
  assert.equal(auto.hasTimer(), false);
  assert.equal(auto.stop(game), "idle");
});

test("toggle starts and stops auto time", () => {
  const now = { value: 100 };
  const calls = {};
  const auto = runtime(now, calls);
  const game = state();

  assert.equal(auto.toggle(game, () => {}), "started");
  assert.equal(game.timeRunning, true);
  assert.equal(auto.toggle(game, () => {}), "stopped");
  assert.equal(game.timeRunning, false);
});

test("markTick updates visual timestamp", () => {
  const now = { value: 250 };
  const auto = runtime(now);
  const game = state();

  auto.markTick(game);

  assert.equal(game.visual.lastTickAt, 250);
});

test("currentVisualHourFraction derives clamped interpolation progress", () => {
  const now = { value: 1000 };
  const auto = runtime(now);
  const game = state();

  assert.equal(auto.currentVisualHourFraction(game), 0);

  game.timeRunning = true;
  game.visual.lastTickAt = 625;
  game.visual.tickMs = 750;
  assert.equal(auto.currentVisualHourFraction(game), 0.5);

  now.value = 5000;
  assert.equal(auto.currentVisualHourFraction(game), 0.98);
});

test("created interval callback remains callable", () => {
  const now = { value: 100 };
  const calls = {};
  const auto = runtime(now, calls);
  const game = state();
  let ticks = 0;

  auto.start(game, () => {
    ticks += 1;
  });
  calls.callback();

  assert.equal(ticks, 1);
});
