import { normalizeProgressionGraph } from "../progression/progressionGraphModel.js";
import { spendProgressionPoint } from "../progression/progressionGraphCommands.js";

export function dungeonMasteryGraph(dungeon) {
  return normalizeProgressionGraph({
    id: `${dungeon.id}:mastery`,
    name: `${dungeon.name} Mastery`,
    type: "dungeonMastery",
    nodes: dungeon.mastery?.nodes || {}
  });
}

export function ensureDungeonMasteryState(state, dungeonId) {
  state.progression.dungeonMastery[dungeonId] = {
    xp: 0,
    points: {},
    availablePoints: 0,
    ...(state.progression.dungeonMastery[dungeonId] || {}),
    points: { ...(state.progression.dungeonMastery[dungeonId]?.points || {}) }
  };
  return state.progression.dungeonMastery[dungeonId];
}

export function awardDungeonMastery(state, estimate, dungeon) {
  const masteryReward = Number(estimate.rewards?.dungeonXp || 0);
  const graph = dungeonMasteryGraph(dungeon);
  const mastery = ensureDungeonMasteryState(state, dungeon.id);
  const pointEvery = Math.max(1, Number(dungeon.mastery?.xpPerPoint || 10));
  const beforePoints = Math.floor(mastery.xp / pointEvery);
  mastery.xp += masteryReward;
  const afterPoints = Math.floor(mastery.xp / pointEvery);
  mastery.availablePoints += Math.max(0, afterPoints - beforePoints);
  const autoSpent = autoSpendAvailableMastery(graph, mastery);
  const unlockedBlueprints = applyMasteryEffects(state, graph, autoSpent);
  return {
    xp: masteryReward,
    availablePoints: mastery.availablePoints,
    autoSpent,
    unlockedBlueprints
  };
}

function autoSpendAvailableMastery(graph, mastery) {
  const spent = [];
  while (mastery.availablePoints > 0) {
    const node = Object.values(graph.nodes).find((candidate) => (
      spendPreview(graph, mastery, candidate.id)
    ));
    if (!node) break;
    const result = spendProgressionPoint(graph, mastery, node.id);
    if (!result.ok) break;
    spent.push(node.id);
  }
  return spent;
}

function applyMasteryEffects(state, graph, nodeIds) {
  const blueprints = [];
  nodeIds.forEach((nodeId) => {
    const node = graph.nodes[nodeId];
    (node?.effects || []).forEach((effect) => {
      if (effect.type !== "blueprint_hint" || !effect.blueprint) return;
      state.blueprints[effect.blueprint] = true;
      blueprints.push(effect.blueprint);
    });
  });
  return blueprints;
}

function spendPreview(graph, mastery, nodeId) {
  const clone = {
    points: { ...(mastery.points || {}) },
    availablePoints: mastery.availablePoints
  };
  return spendProgressionPoint(graph, clone, nodeId).ok;
}
