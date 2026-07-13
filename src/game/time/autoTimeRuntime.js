export function createAutoTimeRuntime({ setIntervalFn, clearIntervalFn, nowFn, tickMs = 750 }) {
  let timer = null;

  function markTick(state) {
    state.visual.lastTickAt = nowFn();
  }

  function start(state, onTick) {
    if (timer) {
      state.timeRunning = true;
      return "already-running";
    }
    state.timeRunning = true;
    state.visual.tickMs = tickMs;
    markTick(state);
    timer = setIntervalFn(onTick, tickMs);
    return "started";
  }

  function stop(state) {
    state.timeRunning = false;
    if (!timer) {
      return "idle";
    }
    clearIntervalFn(timer);
    timer = null;
    return "stopped";
  }

  function toggle(state, onTick) {
    if (state.timeRunning) {
      stop(state);
      return "stopped";
    }
    return start(state, onTick);
  }

  function currentVisualHourFraction(state) {
    if (!state.timeRunning || !state.visual.lastTickAt) {
      return 0;
    }
    const elapsed = nowFn() - state.visual.lastTickAt;
    return Math.max(0, Math.min(0.98, elapsed / state.visual.tickMs));
  }

  function hasTimer() {
    return Boolean(timer);
  }

  return {
    currentVisualHourFraction,
    hasTimer,
    markTick,
    start,
    stop,
    toggle
  };
}
