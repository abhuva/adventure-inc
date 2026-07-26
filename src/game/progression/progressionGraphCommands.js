import { canSpendProgressionPoint, progressionNodeCost, progressionNodeRank } from "./progressionGraphRules.js";

export function spendProgressionPoint(graph, state, nodeId) {
  const availability = canSpendProgressionPoint(graph, state, nodeId);
  if (!availability.ok) return { ok: false, reason: availability.reason };
  const cost = progressionNodeCost(graph.nodes[nodeId]);
  state.points = { ...(state.points || {}) };
  state.points[nodeId] = progressionNodeRank(state, nodeId) + 1;
  state.availablePoints = Math.max(0, (state.availablePoints || 0) - cost);
  return { ok: true, node: graph.nodes[nodeId], rank: state.points[nodeId] };
}

export function refundProgressionPoint(graph, state, nodeId) {
  const rank = progressionNodeRank(state, nodeId);
  if (!graph.nodes[nodeId]) return { ok: false, reason: "missing node" };
  if (rank <= 0) return { ok: false, reason: "no rank" };
  const cost = progressionNodeCost(graph.nodes[nodeId]);
  state.points = { ...(state.points || {}) };
  state.points[nodeId] = rank - 1;
  if (state.points[nodeId] <= 0) delete state.points[nodeId];
  state.availablePoints = (state.availablePoints || 0) + cost;
  return { ok: true, node: graph.nodes[nodeId], rank: progressionNodeRank(state, nodeId) };
}
