import { ensureDungeonConquestState } from "../progression/worldProgression.js";

export function applyDungeonConquestProgress(state, estimate, dungeon, { unlockLocation = () => ({ unlocked: false }) } = {}) {
  const conquest = ensureDungeonConquestState(state, dungeon.id);
  const reachedNodeIds = (estimate.routeNodeIds || []).slice(0, estimate.reached);
  const changes = {
    clearedNodes: [],
    disabledModifiers: [],
    unlockedNodes: [],
    unlockedLocations: [],
    unlockedFeatures: [],
    costAdjustments: []
  };

  reachedNodeIds.forEach((nodeId) => {
    const node = (dungeon.nodes || []).find((item) => item.id === nodeId);
    if (!node) return;
    if (!conquest.clearedNodes[nodeId]) {
      conquest.clearedNodes[nodeId] = true;
      changes.clearedNodes.push(nodeId);
    }
    applyNodeEffects({
      state,
      conquest,
      node,
      effects: node.effectsOnClear || [],
      changes,
      unlockLocation
    });
  });

  return changes;
}

function applyNodeEffects({ state, conquest, node, effects, changes, unlockLocation }) {
  effects.forEach((effect) => {
    if (effect.type === "disable_modifier") {
      if (!conquest.disabledModifiers[effect.modifierId]) {
        conquest.disabledModifiers[effect.modifierId] = true;
        changes.disabledModifiers.push(effect.modifierId);
      }
      return;
    }
    if (effect.type === "unlock_node") {
      if (!conquest.unlockedNodes[effect.nodeId]) {
        conquest.unlockedNodes[effect.nodeId] = true;
        changes.unlockedNodes.push(effect.nodeId);
      }
      return;
    }
    if (effect.type === "unlock_location") {
      const result = unlockLocation(state, effect.locationId);
      if (result.unlocked) changes.unlockedLocations.push(effect.locationId);
      return;
    }
    if (effect.type === "unlock_location_when_cleared") {
      const requiredNodeIds = effect.requiredNodeIds || [];
      const allCleared = requiredNodeIds.every((nodeId) => conquest.clearedNodes[nodeId]);
      if (allCleared) {
        const result = unlockLocation(state, effect.locationId);
        if (result.unlocked) changes.unlockedLocations.push(effect.locationId);
      }
      return;
    }
    if (effect.type === "unlock_feature") {
      state.progression.unlockedFeatures[effect.featureId] = true;
      changes.unlockedFeatures.push(effect.featureId);
      return;
    }
    if (effect.type === "node_resolve_cost_add") {
      const targetNodeId = effect.targetNodeId || node.id;
      const current = Number(conquest.nodeCostAdjustments[targetNodeId] || 0);
      const minimum = Number(effect.minimum ?? -99);
      const maximum = Number(effect.maximum ?? 99);
      const next = Math.max(minimum, Math.min(maximum, current + Number(effect.value || 0)));
      if (next !== current) {
        conquest.nodeCostAdjustments[targetNodeId] = next;
        changes.costAdjustments.push({ nodeId: targetNodeId, value: next });
      }
    }
  });
}

export function conquestChangeMessages(changes, dungeon) {
  const nodeName = (nodeId) => (dungeon.nodes || []).find((node) => node.id === nodeId)?.name || nodeId;
  return [
    ...changes.disabledModifiers.map((modifierId) => ({ text: `${dungeon.name}: modifier disabled ${modifierId}`, type: "ok" })),
    ...changes.unlockedNodes.map((nodeId) => ({ text: `${dungeon.name}: route node unlocked ${nodeName(nodeId)}`, type: "ok" })),
    ...changes.unlockedFeatures.map((featureId) => ({ text: `${dungeon.name}: feature unlocked ${featureId}`, type: "ok" })),
    ...changes.costAdjustments.map((change) => ({ text: `${dungeon.name}: ${nodeName(change.nodeId)} resolve adjustment ${change.value}`, type: "ok" }))
  ];
}
