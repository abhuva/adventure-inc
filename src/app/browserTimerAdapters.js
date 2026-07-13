import { createAutoTimeRuntime } from "../game/time/autoTimeRuntime.js";

export const DEFAULT_AUTO_TIME_TICK_MS = 750;

export function createBrowserAutoTimeRuntime({
  windowRef,
  performanceRef,
  tickMs = DEFAULT_AUTO_TIME_TICK_MS
}) {
  return createAutoTimeRuntime({
    setIntervalFn: windowRef.setInterval.bind(windowRef),
    clearIntervalFn: windowRef.clearInterval.bind(windowRef),
    nowFn: () => performanceRef.now(),
    tickMs
  });
}

export function createBrowserReplayTimerApi({
  windowRef,
  onAdvance,
  onStop
}) {
  return {
    setIntervalFn: windowRef.setInterval.bind(windowRef),
    clearIntervalFn: windowRef.clearInterval.bind(windowRef),
    onAdvance,
    onStop
  };
}
