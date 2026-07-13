import { createInitialState } from "./appState.js";
import { createAppDataContext } from "./appDataContext.js";
import { createBrowserAutoTimeRuntime } from "./browserTimerAdapters.js";
import { createResourceRuntime } from "./resourceRuntime.js";

export function createAppRuntimeContext({
  windowRef,
  performanceRef,
  templeInventorySlots,
  replayDefaultMs
}) {
  const state = createInitialState({ templeInventorySlots, replayDefaultMs });
  const autoTimeRuntime = createBrowserAutoTimeRuntime({ windowRef, performanceRef });
  const appDataContext = createAppDataContext();
  const el = {};
  const resourceRuntime = createResourceRuntime({ state });

  return {
    appDataContext,
    autoTimeRuntime,
    el,
    resourceRuntime,
    state
  };
}
