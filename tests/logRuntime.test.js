import assert from "node:assert/strict";
import test from "node:test";

import { addLogEntry, clearLogEntries } from "../src/app/logRuntime.js";

test("addLogEntry prepends stamped entries", () => {
  const state = { day: 3, hour: 7, log: [] };

  addLogEntry(state, "first", "ok");
  state.hour = 8;
  addLogEntry(state, "second", "warn");

  assert.deepEqual(state.log, [
    { text: "second", type: "warn", stamp: "d3 08:00" },
    { text: "first", type: "ok", stamp: "d3 07:00" }
  ]);
});

test("addLogEntry keeps only the newest eighty entries", () => {
  const state = { day: 1, hour: 0, log: [] };

  for (let index = 0; index < 90; index += 1) {
    addLogEntry(state, `entry ${index}`);
  }

  assert.equal(state.log.length, 80);
  assert.equal(state.log[0].text, "entry 89");
  assert.equal(state.log.at(-1).text, "entry 10");
});

test("clearLogEntries removes all log entries", () => {
  const state = { log: [{ text: "old" }] };

  clearLogEntries(state);

  assert.deepEqual(state.log, []);
});
