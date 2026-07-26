import { renderBlueprintRows } from "./blueprintView.js";

export function renderSystemsPanel({ el, blueprints, unlockedBlueprints }) {
  renderBlueprintRows(el, blueprints, unlockedBlueprints);
}
