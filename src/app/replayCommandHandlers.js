import {
  cycleReplaySpeed,
  replaySpeedLabel,
  setReplayCursor,
  stopReplayPlayback,
  toggleReplayPlayback
} from "../game/dungeon/replayRuntime.js";

export function createReplayCommandHandlers({
  state,
  timerApi,
  render,
  renderReplayOnly
}) {
  return {
    setReplayCursor(cursor, replayOnly = false) {
      setReplayCursor(state.dungeonReplay, cursor, timerApi());
      if (replayOnly) {
        renderReplayOnly();
      } else {
        render();
      }
    },

    toggleReplayPlayback() {
      const result = toggleReplayPlayback(state.dungeonReplay, timerApi());
      if (result === "empty") return;
      if (result === "stopped") {
        render();
        return;
      }
      renderReplayOnly();
    },

    stopReplayPlayback() {
      stopReplayPlayback(state.dungeonReplay, timerApi());
    },

    cycleReplaySpeed() {
      cycleReplaySpeed(state.dungeonReplay, timerApi());
      renderReplayOnly();
    },

    replaySpeedLabel() {
      return replaySpeedLabel(state.dungeonReplay.playbackMs);
    }
  };
}
