import { normalizeAppState } from "./stateNormalizer.js";

export const SAVEGAME_SCHEMA_VERSION = 1;

const SERIALIZABLE_TOP_LEVEL_KEYS = [
  "day",
  "hour",
  "events",
  "progression",
  "world",
  "tavern",
  "tavernVisitors",
  "settlement",
  "resources",
  "roster",
  "focusedHeroId",
  "selectedTavernVisitorId",
  "activeTavernDetailTab",
  "selectedPartyId",
  "rosterView",
  "parties",
  "blueprints",
  "crafted",
  "temple",
  "lastEstimate",
  "repeatedPlans",
  "activeTab",
  "selectedLocationId",
  "mapView",
  "operations",
  "workerProgress",
  "workshop",
  "visual",
  "log"
];

export function createSavePayload(state) {
  return {
    version: SAVEGAME_SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    state: createSerializableState(state)
  };
}

export function createSerializableState(state) {
  const output = {};
  for (const key of SERIALIZABLE_TOP_LEVEL_KEYS) {
    if (Object.hasOwn(state, key)) {
      output[key] = cloneSerializableValue(state[key]);
    }
  }
  if (output.dungeonReplay) {
    output.dungeonReplay.timer = null;
  }
  if (output.mapView) {
    output.mapView.dragging = false;
    output.mapView.dragStartX = 0;
    output.mapView.dragStartY = 0;
  }
  return output;
}

export function restoreSavePayload(payload, currentState) {
  const normalized = normalizeSavePayload(payload);
  for (const key of SERIALIZABLE_TOP_LEVEL_KEYS) {
    if (Object.hasOwn(normalized.state, key)) {
      currentState[key] = cloneSerializableValue(normalized.state[key]);
    }
  }
  return normalizeAppState(currentState);
}

export function normalizeSavePayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid save payload: expected object.");
  }
  if (payload.version !== SAVEGAME_SCHEMA_VERSION) {
    throw new Error(`Unsupported save payload version: ${payload.version ?? "none"}.`);
  }
  if (!payload.state || typeof payload.state !== "object") {
    throw new Error("Invalid save payload: missing state object.");
  }
  return payload;
}

function cloneSerializableValue(value) {
  return JSON.parse(JSON.stringify(value, (_key, item) => {
    if (typeof item === "function") return undefined;
    return item;
  }));
}
