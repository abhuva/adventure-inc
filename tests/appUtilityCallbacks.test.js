import assert from "node:assert/strict";
import test from "node:test";

import { createAppUtilityCallbacks } from "../src/app/appUtilityCallbacks.js";

test("app utility callbacks add log entries and format rewards", () => {
  const state = { clock: { day: 4, hour: 7 }, log: [] };
  const callbacks = createAppUtilityCallbacks({
    state,
    blueprints: { bunk_room: { name: "Bunk Room" } },
    windowRef: {},
    templeQueries: () => ({ lootBonus: () => ({ hide: 2 }) }),
    templeProgressionHandlers: () => ({ recordShardProgress: () => {} }),
    renderDungeonReplay: () => {}
  });

  callbacks.addLog("entry", "info");

  assert.equal(state.log.length, 1);
  assert.equal(state.log[0].text, "entry");
  assert.equal(state.log[0].type, "info");
  assert.equal(callbacks.formatReward({ coin: 3, blueprint: "bunk_room" }), "3 coin, blueprint:Bunk Room");
});

test("app utility callbacks delegate Temple progression and replay timer creation", () => {
  const renderCalls = [];
  const progressCalls = [];
  const timerCalls = [];
  const callbacks = createAppUtilityCallbacks({
    state: { clock: { day: 1, hour: 0 }, log: [] },
    blueprints: {},
    windowRef: "window",
    templeQueries: () => ({ lootBonus: () => ({ ore: 1 }) }),
    templeProgressionHandlers: () => ({
      recordShardProgress: (estimate) => progressCalls.push(estimate)
    }),
    renderDungeonReplay: () => renderCalls.push("replay"),
    createReplayTimerApi: (args) => {
      timerCalls.push(args);
      return args;
    }
  });
  const estimate = { dungeonId: "rat_cellar" };

  callbacks.recordShardProgress(estimate);
  const timerApi = callbacks.replayTimerApi();
  timerApi.onAdvance();
  timerApi.onStop();

  assert.deepEqual(callbacks.templeLootBonus(), { ore: 1 });
  assert.deepEqual(progressCalls, [estimate]);
  assert.equal(timerCalls[0].windowRef, "window");
  assert.deepEqual(renderCalls, ["replay", "replay"]);
});
