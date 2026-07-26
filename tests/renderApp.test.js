import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_RENDER_ORDER,
  renderAppSections
} from "../src/ui/renderApp.js";

test("DEFAULT_RENDER_ORDER keeps top-level render sequence stable", () => {
  assert.deepEqual(DEFAULT_RENDER_ORDER, [
    "header",
    "encounter",
    "map",
    "visitors",
    "jobs",
    "parties",
    "roster",
    "dungeon",
    "continent",
    "temple",
    "systems",
    "arrival"
  ]);
});

test("renderAppSections invokes renderers in configured order", () => {
  const calls = [];

  renderAppSections({
    header: () => calls.push("header"),
    map: () => calls.push("map"),
    log: () => calls.push("log")
  }, ["header", "map", "log"]);

  assert.deepEqual(calls, ["header", "map", "log"]);
});

test("renderAppSections throws on missing renderer", () => {
  assert.throws(
    () => renderAppSections({}, ["missing"]),
    /missing renderer: missing/
  );
});
