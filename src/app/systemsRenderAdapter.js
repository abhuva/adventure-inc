import { renderSystemsPanel } from "../ui/systemsPanel.js";

export function createSystemsRenderAdapter({
  state,
  el,
  blueprints
}) {
  function renderSystems() {
    renderSystemsPanel({
      el,
      blueprints,
      unlockedBlueprints: state.blueprints
    });
  }

  return {
    renderSystems
  };
}
