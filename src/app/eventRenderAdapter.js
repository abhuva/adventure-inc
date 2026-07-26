import { activeEventDefinition } from "../game/events/eventRuntime.js";
import { renderEncounterPanel } from "../ui/encounterPanel.js";

export function createEventRenderAdapter({
  state,
  el,
  eventDefinitions,
  onAction
}) {
  function renderEncounter() {
    renderEncounterPanel({
      el,
      event: activeEventDefinition(state.events, eventDefinitions),
      onAction
    });
  }

  return {
    renderEncounter
  };
}
