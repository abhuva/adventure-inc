import assert from "node:assert/strict";
import test from "node:test";

import {
  LOCAL_SAVE_KEY,
  createLocalSaveRuntime
} from "../src/app/localSaveRuntime.js";

function createStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    removeItem(key) {
      values.delete(key);
    },
    setItem(key, value) {
      values.set(key, value);
    }
  };
}

test("local save runtime saves and restores payloads through storage", () => {
  const storage = createStorage();
  const state = { resources: { coin: 3 } };
  const runtime = createLocalSaveRuntime({
    state,
    storage,
    createPayload: (source) => ({ version: 1, savedAt: "now", state: { resources: { coin: source.resources.coin } } }),
    restorePayload: (payload, target) => {
      target.resources = { ...payload.state.resources };
      return target;
    }
  });

  assert.deepEqual(runtime.load(), { ok: false, reason: "empty" });
  assert.deepEqual(runtime.saveNow(), { ok: true, savedAt: "now" });

  state.resources.coin = 0;
  assert.deepEqual(runtime.load(), { ok: true, savedAt: "now" });
  assert.equal(state.resources.coin, 3);
  assert.equal(runtime.key, LOCAL_SAVE_KEY);
});

test("local save runtime debounces scheduled saves and reset clears pending save", () => {
  const storage = createStorage();
  const state = { value: 1 };
  const timers = new Map();
  let nextTimer = 1;
  const runtime = createLocalSaveRuntime({
    state,
    storage,
    delayMs: 10,
    setTimeoutFn(callback) {
      const id = nextTimer;
      nextTimer += 1;
      timers.set(id, callback);
      return id;
    },
    clearTimeoutFn(id) {
      timers.delete(id);
    },
    createPayload: (source) => ({ version: 1, savedAt: "later", state: { value: source.value } }),
    restorePayload: () => {}
  });

  assert.deepEqual(runtime.scheduleSave(), { ok: true, pending: true });
  assert.deepEqual(runtime.scheduleSave(), { ok: true, pending: true });
  assert.equal(timers.size, 1);
  const fired = timers.entries().next().value;
  timers.delete(fired[0]);
  fired[1]();
  assert.match(storage.getItem(LOCAL_SAVE_KEY), /"value":1/);

  runtime.scheduleSave();
  assert.equal(timers.size, 1);
  assert.deepEqual(runtime.reset(), { ok: true });
  assert.equal(timers.size, 0);
  assert.equal(storage.getItem(LOCAL_SAVE_KEY), null);
});
