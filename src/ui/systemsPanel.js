import { renderBlueprintRows } from "./blueprintView.js";
import { renderLogRows } from "./logView.js";

export function renderSystemsPanel({ el, blueprints, unlockedBlueprints, logEntries }) {
  renderBlueprintRows(el, blueprints, unlockedBlueprints);
  renderLogRows(el, logEntries);
}
