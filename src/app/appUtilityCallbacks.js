import { createBrowserReplayTimerApi } from "./browserTimerAdapters.js";
import { addLogEntry } from "./logRuntime.js";
import { formatReward as formatRewardText } from "../ui/rewardText.js";

export function createAppUtilityCallbacks({
  state,
  blueprints,
  windowRef,
  templeQueries,
  templeProgressionHandlers,
  renderDungeonReplay,
  createReplayTimerApi = createBrowserReplayTimerApi
}) {
  return {
    addLog(text, type = "") {
      addLogEntry(state, text, type);
    },
    formatReward(reward = {}) {
      return formatRewardText(reward, blueprints);
    },
    recordShardProgress(estimate) {
      templeProgressionHandlers().recordShardProgress(estimate);
    },
    replayTimerApi() {
      return createReplayTimerApi({
        windowRef,
        onAdvance: renderDungeonReplay,
        onStop: renderDungeonReplay
      });
    },
    templeLootBonus() {
      return templeQueries().lootBonus();
    }
  };
}
