import { progressionNodeRank } from "./progressionGraphRules.js";

export function progressionEffects(graph, state) {
  const totals = {};
  for (const node of Object.values(graph.nodes)) {
    const rank = progressionNodeRank(state, node.id);
    if (rank <= 0) continue;
    for (const effect of node.effects) {
      const value = (effect.valuePerRank ?? 0) * rank;
      totals[effect.type] = (totals[effect.type] || 0) + value;
    }
  }
  return totals;
}
