export function progressionNodeRank(state, nodeId) {
  return (state.points && state.points[nodeId]) || 0;
}

export function progressionNodeCost(node) {
  return Math.max(1, Number(node?.costPerRank || 1));
}

export function progressionSpentPoints(state, graph = null) {
  return Object.entries(state.points || {}).reduce((sum, [nodeId, rank]) => {
    const node = graph?.nodes?.[nodeId];
    return sum + Math.max(0, rank) * progressionNodeCost(node);
  }, 0);
}

export function isProgressionNodeUnlocked(graph, state, nodeId) {
  const node = graph.nodes[nodeId];
  if (!node) return false;
  if (!node.requires.length) return true;
  return node.requires.some((requiredId) => progressionNodeRank(state, requiredId) > 0);
}

export function canSpendProgressionPoint(graph, state, nodeId, { availablePoints = state.availablePoints ?? 0 } = {}) {
  const node = graph.nodes[nodeId];
  if (!node) return { ok: false, reason: "missing node" };
  if (progressionNodeRank(state, nodeId) >= node.maxRank) return { ok: false, reason: "max rank" };
  if (!isProgressionNodeUnlocked(graph, state, nodeId)) return { ok: false, reason: "requires connected node" };
  if (availablePoints < progressionNodeCost(node)) return { ok: false, reason: "no points" };
  return { ok: true, reason: "available" };
}
