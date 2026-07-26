export const LOCATION_UNLOCKS = {
  TAVERN: "tavern",
  RAT_CELLAR: "cellar",
  WOODLOT: "wood",
  ORE_CUT: "ore",
  OLD_COPPER_MINE: "mine",
  OLD_BARRACKS: "barracks"
};

export function createInitialWorldProgressionState() {
  return {
    unlockedLocations: {
      [LOCATION_UNLOCKS.TAVERN]: true,
      [LOCATION_UNLOCKS.RAT_CELLAR]: true
    },
    dungeonClears: {},
    dungeonMastery: {},
    uniqueBosses: {},
    dungeonConquest: {},
    unlockedFeatures: {}
  };
}

export function ensureWorldProgressionState(state) {
  state.progression = {
    ...createInitialWorldProgressionState(),
    ...(state.progression || {}),
    unlockedLocations: {
      ...createInitialWorldProgressionState().unlockedLocations,
      ...(state.progression?.unlockedLocations || {})
    },
    dungeonClears: { ...(state.progression?.dungeonClears || {}) },
    dungeonMastery: { ...(state.progression?.dungeonMastery || {}) },
    uniqueBosses: { ...(state.progression?.uniqueBosses || {}) },
    dungeonConquest: { ...(state.progression?.dungeonConquest || {}) },
    unlockedFeatures: { ...(state.progression?.unlockedFeatures || {}) }
  };
  return state.progression;
}

export function ensureDungeonConquestState(state, dungeonId) {
  const progression = ensureWorldProgressionState(state);
  const existing = progression.dungeonConquest[dungeonId] || {};
  progression.dungeonConquest[dungeonId] = {
    clearedNodes: { ...(existing.clearedNodes || {}) },
    unlockedNodes: { ...(existing.unlockedNodes || {}) },
    disabledModifiers: { ...(existing.disabledModifiers || {}) },
    nodeCostAdjustments: { ...(existing.nodeCostAdjustments || {}) },
    selectedNodeId: existing.selectedNodeId || null,
    plannedNodeIds: Array.isArray(existing.plannedNodeIds) ? [...existing.plannedNodeIds] : []
  };
  return progression.dungeonConquest[dungeonId];
}

export function isLocationUnlocked(state, locationId) {
  return Boolean(ensureWorldProgressionState(state).unlockedLocations[locationId]);
}

export function unlockLocation(state, locationId) {
  const progression = ensureWorldProgressionState(state);
  if (progression.unlockedLocations[locationId]) {
    return { unlocked: false, locationId };
  }
  progression.unlockedLocations[locationId] = true;
  return { unlocked: true, locationId };
}

export function unlockPopulationLocations(state) {
  return [
    unlockLocation(state, LOCATION_UNLOCKS.WOODLOT),
    unlockLocation(state, LOCATION_UNLOCKS.ORE_CUT)
  ].filter((result) => result.unlocked);
}

export function incrementDungeonClear(state, dungeonId, { success }) {
  const progression = ensureWorldProgressionState(state);
  if (!success) return { count: progression.dungeonClears[dungeonId] || 0, unlocked: [] };
  progression.dungeonClears[dungeonId] = (progression.dungeonClears[dungeonId] || 0) + 1;
  const unlocked = applyDungeonClearUnlocks(state, dungeonId, progression.dungeonClears[dungeonId]);
  return {
    count: progression.dungeonClears[dungeonId],
    unlocked
  };
}

export function applyDungeonClearUnlocks(state, dungeonId, clearCount) {
  const unlocked = [];
  if (dungeonId === LOCATION_UNLOCKS.RAT_CELLAR && clearCount >= 50) {
    const result = unlockLocation(state, LOCATION_UNLOCKS.OLD_COPPER_MINE);
    if (result.unlocked) unlocked.push(result.locationId);
  }
  return unlocked;
}
