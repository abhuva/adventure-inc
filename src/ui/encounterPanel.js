import { encounterPanelHtml } from "./encounterView.js";

export function renderEncounterPanel({ el, event, onAction }) {
  el.encounterOverlay.classList.toggle("hidden", !event);
  el.encounterOverlay.innerHTML = encounterPanelHtml(event);
  el.encounterOverlay.onclick = (clickEvent) => {
    const button = clickEvent.target.closest?.("[data-encounter-action]");
    if (!button) return;
    onAction(button.dataset.encounterAction);
  };
}
