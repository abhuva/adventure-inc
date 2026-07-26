import assert from "node:assert/strict";
import test from "node:test";

import { createAppRenderHandlers } from "../src/app/appRenderHandlers.js";

function createHarness() {
  const calls = [];
  const handlers = createAppRenderHandlers({
    headerRenderAdapter: {
      renderHeader: () => calls.push("header")
    },
    mapRenderAdapter: {
      renderMap: () => calls.push("map"),
      renderMapActors: (hourFraction) => calls.push(["mapActors", hourFraction]),
      renderLocationDetail: () => calls.push("locationDetail")
    },
    rosterRenderAdapter: {
      renderVisitors: () => calls.push("visitors"),
      renderJobs: () => calls.push("jobs"),
      renderParties: () => calls.push("parties"),
      renderRoster: () => calls.push("roster")
    },
    dungeonRenderAdapter: {
      renderDungeon: () => calls.push("dungeon"),
      renderDungeonReplay: () => calls.push("dungeonReplay")
    },
    templeRenderAdapter: {
      renderTemple: () => calls.push("temple")
    },
    systemsRenderAdapter: {
      renderSystems: () => calls.push("systems")
    },
    eventRenderAdapter: {
      renderEncounter: () => calls.push("encounter")
    }
  });
  return { calls, handlers };
}

test("app render handlers preserve top-level render order", () => {
  const { calls, handlers } = createHarness();

  handlers.render();

  assert.deepEqual(calls, [
    "header",
    "encounter",
    "map",
    "visitors",
    "jobs",
    "parties",
    "roster",
    "dungeon",
    "temple",
    "systems"
  ]);
});

test("app render handlers expose focused render delegates", () => {
  const { calls, handlers } = createHarness();

  handlers.renderMapActors(0.5);
  handlers.renderLocationDetail();
  handlers.renderDungeonReplay();
  handlers.renderEncounter();
  handlers.renderSystems();

  assert.deepEqual(calls, [
    ["mapActors", 0.5],
    "locationDetail",
    "dungeonReplay",
    "encounter",
    "systems"
  ]);
});

test("app render handlers expose scoped time tick render", () => {
  const { calls, handlers } = createHarness();

  handlers.renderTimeTick("map", 0.5);
  handlers.renderTimeTick("population", 0.25);
  handlers.renderTimeTick("dungeon", 0.75);
  handlers.renderTimeTick("roster", 0.1);
  handlers.renderTimeTick("tavern", 0.2, { dayRolledOver: true });
  handlers.renderTimeTick("tavern", 0.3, { dayRolledOver: false });

  assert.deepEqual(calls, [
    "header",
    ["mapActors", 0.5],
    "header",
    "jobs",
    "header",
    "dungeonReplay",
    "header",
    "header",
    "visitors",
    "header"
  ]);
});
