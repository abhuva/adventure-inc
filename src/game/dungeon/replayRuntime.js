export const REPLAY_SPEEDS_MS = [900, 650, 350, 180];

export function replayMaxCursor(replay) {
  return Math.max(0, replay.events.length - 1);
}

export function replaySpeedLabel(playbackMs) {
  if (playbackMs >= 900) return "0.75x";
  if (playbackMs >= 650) return "1x";
  if (playbackMs >= 350) return "2x";
  return "4x";
}

export function stopReplayPlayback(replay, { clearIntervalFn } = {}) {
  replay.playing = false;
  if (replay.timer && clearIntervalFn) {
    clearIntervalFn(replay.timer);
  }
  replay.timer = null;
}

export function resetReplay(replay, events = [], timerApi = {}) {
  stopReplayPlayback(replay, timerApi);
  replay.events = events;
  replay.cursor = 0;
}

export function setReplayCursor(replay, cursor, timerApi = {}) {
  const max = replayMaxCursor(replay);
  replay.cursor = Math.max(0, Math.min(max, cursor));
  if (replay.cursor >= max) {
    stopReplayPlayback(replay, timerApi);
  }
  return replay.cursor;
}

export function startReplayPlayback(replay, { setIntervalFn, clearIntervalFn, onAdvance, onStop } = {}) {
  if (!replay.events.length || !setIntervalFn) {
    return false;
  }
  if (replay.cursor >= replay.events.length - 1) {
    replay.cursor = 0;
  }
  replay.playing = true;
  replay.timer = setIntervalFn(() => {
    if (replay.cursor >= replay.events.length - 1) {
      stopReplayPlayback(replay, { clearIntervalFn });
      onStop?.();
      return;
    }
    replay.cursor += 1;
    onAdvance?.();
  }, replay.playbackMs);
  return true;
}

export function toggleReplayPlayback(replay, timerApi = {}) {
  if (!replay.events.length) {
    return "empty";
  }
  if (replay.playing) {
    stopReplayPlayback(replay, timerApi);
    return "stopped";
  }
  return startReplayPlayback(replay, timerApi) ? "started" : "empty";
}

export function cycleReplaySpeed(replay, timerApi = {}) {
  const index = REPLAY_SPEEDS_MS.indexOf(replay.playbackMs);
  replay.playbackMs = REPLAY_SPEEDS_MS[(index + 1) % REPLAY_SPEEDS_MS.length];
  if (replay.playing) {
    stopReplayPlayback(replay, timerApi);
    startReplayPlayback(replay, timerApi);
    return "restarted";
  }
  return "changed";
}
