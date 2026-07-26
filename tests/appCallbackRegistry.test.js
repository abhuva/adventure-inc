import assert from "node:assert/strict";
import test from "node:test";

import { createAppCallbackRegistry } from "../src/app/appCallbackRegistry.js";

test("app callback registry forwards app-level callbacks to owners", () => {
  const calls = [];
  const registry = createAppCallbackRegistry({
    appRenderHandlers: {
      render: () => calls.push("render"),
      renderDungeonReplay: () => calls.push("renderDungeonReplay"),
      renderLocationDetail: () => calls.push("renderLocationDetail"),
      renderMapActors: (hourFraction) => calls.push(["renderMapActors", hourFraction]),
      renderSystems: () => calls.push("renderSystems"),
      renderTimeTick: (activeTab, hourFraction) => calls.push(["renderTimeTick", activeTab, hourFraction])
    },
    mapCommandHandlers: {
      assignSelectedPartyToSelectedDungeon: () => calls.push("assign"),
      selectLocation: (locationId) => calls.push(["selectLocation", locationId])
    },
    mapRenderAdapter: {
      applyMapTransform: () => calls.push("applyMapTransform")
    },
    replayCommandHandlers: {
      replaySpeedLabel: () => "2x"
    },
    rosterRenderAdapter: {
      portraitStyle: (spriteIndex) => `portrait:${spriteIndex}`
    },
    selectControlAdapter: {
      populateDungeonSelect: () => calls.push("populateDungeonSelect"),
      populatePartySelect: () => calls.push("populatePartySelect"),
      populateStopNodes: () => calls.push("populateStopNodes")
    },
    timeCommandHandlers: {
      currentVisualHourFraction: () => 0.75
    }
  });

  registry.applyMapTransform();
  registry.assignSelectedPartyToSelectedDungeon();
  assert.equal(registry.currentVisualHourFraction(), 0.75);
  registry.populateDungeonSelect();
  registry.populatePartySelect();
  registry.populateStopNodes();
  assert.equal(registry.portraitStyle(3), "portrait:3");
  registry.render();
  registry.renderDungeonReplay();
  registry.renderLocationDetail();
  registry.renderMapActors(0.25);
  registry.renderSystems();
  registry.renderTimeTick("map", 0.5);
  assert.equal(registry.replaySpeedLabel(), "2x");
  registry.selectLocation("rat_cellar");

  assert.deepEqual(calls, [
    "applyMapTransform",
    "assign",
    "populateDungeonSelect",
    "populatePartySelect",
    "populateStopNodes",
    "render",
    "renderDungeonReplay",
    "renderLocationDetail",
    ["renderMapActors", 0.25],
    "renderSystems",
    ["renderTimeTick", "map", 0.5],
    ["selectLocation", "rat_cellar"]
  ]);
});
