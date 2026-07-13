import { resetReplay } from "../game/dungeon/replayRuntime.js";

export function clearDungeonEstimate(state, replayTimerApi) {
  state.lastEstimate = null;
  resetReplay(state.dungeonReplay, [], replayTimerApi);
}

export function setDungeonEstimate(state, estimate, replayTimerApi) {
  state.lastEstimate = estimate;
  resetReplay(state.dungeonReplay, estimate?.timeline || [], replayTimerApi);
}

export function setDungeonEstimateOnly(state, estimate) {
  state.lastEstimate = estimate;
}

export function clearDungeonEstimateOnly(state) {
  state.lastEstimate = null;
}
