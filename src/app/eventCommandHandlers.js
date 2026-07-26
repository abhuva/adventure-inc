import {
  activeEventDefinition,
  closeActiveEvent,
  isBlockingEvent,
  triggerEvent as triggerRuntimeEvent
} from "../game/events/eventRuntime.js";

export function createEventCommandHandlers({
  state,
  eventDefinitions,
  addLog,
  render,
  setTab,
  stopAutoTime,
  resumeAutoTime
}) {
  function pauseForBlockingEncounter(definition) {
    if (!isBlockingEvent(definition) || !state.timeRunning) return;
    state.events.pausedTimeRunning = true;
    stopAutoTime();
  }

  function resumeAfterBlockingQueue() {
    if (activeEventDefinition(state.events, eventDefinitions)) return;
    if (!state.events.pausedTimeRunning) return;
    state.events.pausedTimeRunning = false;
    resumeAutoTime();
  }

  function triggerEvent(trigger, { renderAfter = true } = {}) {
    const result = triggerRuntimeEvent(state.events, eventDefinitions, trigger);
    const openedDefinition = activeEventDefinition(state.events, eventDefinitions);
    if (result.openedId && openedDefinition) {
      pauseForBlockingEncounter(openedDefinition);
      addLog(`encounter opened: ${openedDefinition.title}`, "ok");
    }
    if ((result.openedId || result.queuedIds.length) && renderAfter) {
      render();
    }
    return result;
  }

  function closeEncounter(actionId) {
    const definition = activeEventDefinition(state.events, eventDefinitions);
    const action = definition?.actions?.find((item) => item.id === actionId) || null;
    const result = closeActiveEvent(state.events, eventDefinitions);
    if (definition) {
      addLog(`encounter closed: ${definition.title}`, "ok");
    }
    if (action?.kind === "tab" && action.tabId) {
      setTab(action.tabId);
    }
    const openedDefinition = result.openedId
      ? activeEventDefinition(state.events, eventDefinitions)
      : null;
    if (openedDefinition) {
      pauseForBlockingEncounter(openedDefinition);
      addLog(`encounter opened: ${openedDefinition.title}`, "ok");
    }
    resumeAfterBlockingQueue();
    render();
    return result;
  }

  return {
    closeEncounter,
    triggerEvent
  };
}
