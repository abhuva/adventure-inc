export function dungeonRoutes(dungeon) {
  if (Array.isArray(dungeon?.edges) && dungeon.edges.length) {
    return authoredGraphRoutes(dungeon);
  }
  if (Array.isArray(dungeon?.routes) && dungeon.routes.length) {
    return dungeon.routes.map((route) => ({
      id: route.id,
      name: route.name || route.id,
      default: Boolean(route.default),
      nodeIds: Array.isArray(route.nodeIds) ? [...route.nodeIds] : []
    }));
  }
  return [{
    id: "main",
    name: "main route",
    nodeIds: (dungeon?.nodes || []).map((node) => node.id)
  }];
}

export function dungeonRouteForStop(dungeon, stopNode, conquestState = {}) {
  const routes = dungeonRoutes(dungeon);
  if (String(stopNode || "all").startsWith("path:")) {
    const nodeIds = String(stopNode).slice("path:".length).split(",").filter(Boolean);
    return dungeonRouteForPath(dungeon, nodeIds, conquestState);
  }
  if (String(stopNode || "all").startsWith("node:")) {
    return dungeonRouteToNode(dungeon, String(stopNode).slice("node:".length));
  }
  if (String(stopNode || "all").startsWith("route:")) {
    const routeId = String(stopNode).slice("route:".length);
    return routes.find((route) => route.id === routeId) || routes[0];
  }
  const defaultRoute = routes.find((route) => route.default) || routes[0];
  if (stopNode === "all" || stopNode === undefined || stopNode === null) return defaultRoute;
  const index = Number(stopNode);
  if (Number.isFinite(index)) {
    return {
      id: `${defaultRoute.id}:${index}`,
      name: `${defaultRoute.name} to node ${index + 1}`,
      nodeIds: defaultRoute.nodeIds.slice(0, index + 1)
    };
  }
  return defaultRoute;
}

export function dungeonRouteForPath(dungeon, nodeIds = [], conquestState = {}) {
  const legalPath = legalDungeonPath(dungeon, nodeIds, conquestState);
  return {
    id: `path:${legalPath.join(",")}`,
    name: legalPath.length ? `planned path to ${nodeNameById(dungeon, legalPath.at(-1))}` : "empty path",
    targetNodeId: legalPath.at(-1) || null,
    nodeIds: legalPath
  };
}

export function dungeonRouteToNode(dungeon, targetNodeId) {
  const routes = dungeonRoutes(dungeon);
  const containingRoutes = routes.filter((route) => route.nodeIds.includes(targetNodeId));
  const route = containingRoutes.sort((a, b) => (
    a.nodeIds.indexOf(targetNodeId) - b.nodeIds.indexOf(targetNodeId)
    || a.nodeIds.length - b.nodeIds.length
    || a.id.localeCompare(b.id)
  ))[0] || routes[0];
  if (!route) return { id: "empty", name: "empty route", nodeIds: [] };
  const endIndex = route.nodeIds.includes(targetNodeId)
    ? route.nodeIds.indexOf(targetNodeId)
    : route.nodeIds.length - 1;
  return {
    id: `${route.id}:${targetNodeId}`,
    name: `${route.name} to ${nodeNameById(dungeon, targetNodeId)}`,
    targetNodeId,
    sourceRouteId: route.id,
    nodeIds: route.nodeIds.slice(0, endIndex + 1)
  };
}

export function defaultDungeonTargetNodeId(dungeon) {
  const route = dungeonRouteForStop(dungeon, "all");
  return route.nodeIds.at(-1) || dungeon?.nodes?.[0]?.id || "";
}

export function dungeonGraphLinks(dungeon) {
  if (Array.isArray(dungeon?.edges) && dungeon.edges.length) {
    const seen = new Set();
    return dungeon.edges.map((edge) => ({
      from: edge.from,
      to: edge.to,
      lockedByNodeId: edge.lockedByNodeId || null
    })).filter((link) => {
      const key = `${link.from}->${link.to}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  const seen = new Set();
  return dungeonRoutes(dungeon).flatMap((route) => route.nodeIds.slice(1).map((nodeId, index) => ({
    from: route.nodeIds[index],
    to: nodeId
  }))).filter((link) => {
    const key = `${link.from}->${link.to}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function dungeonGraphLayout(dungeon) {
  if (Array.isArray(dungeon?.nodes) && dungeon.nodes.some((node) => Number.isFinite(node.x) && Number.isFinite(node.y))) {
    return Object.fromEntries(dungeon.nodes.map((node) => [node.id, {
      id: node.id,
      x: Number(node.x) || 0,
      y: Number(node.y) || 0
    }]));
  }
  const routes = dungeonRoutes(dungeon);
  const nodesById = dungeonNodesById(dungeon);
  const positions = {};
  routes.forEach((route, routeIndex) => {
    route.nodeIds.forEach((nodeId, depth) => {
      if (!nodesById[nodeId]) return;
      if (!positions[nodeId]) {
        positions[nodeId] = { id: nodeId, x: depth, y: routeIndex };
        return;
      }
      positions[nodeId].x = Math.min(positions[nodeId].x, depth);
      positions[nodeId].y = Math.min(positions[nodeId].y, routeIndex);
    });
  });
  return positions;
}

export function dungeonNodesById(dungeon) {
  return Object.fromEntries((dungeon?.nodes || []).map((node) => [node.id, node]));
}

export function dungeonNodesForRoute(dungeon, route) {
  const nodesById = dungeonNodesById(dungeon);
  return route.nodeIds.map((nodeId) => nodesById[nodeId]).filter(Boolean);
}

export function nodeResolveCost(node) {
  return Math.max(0, Number(node?.resolveCost ?? node?.confidenceCost ?? 1));
}

export function effectiveNodeResolveCost(node, conquestState = {}, activeModifiers = []) {
  const adjustment = Number(conquestState.nodeCostAdjustments?.[node?.id] || 0);
  const modifierAdjustment = activeModifiers.reduce((sum, modifier) => (
    sum + modifier.effects.reduce((effectSum, effect) => (
      effectSum + (effect.type === "resolve_cost_add" ? Number(effect.value || 0) : 0)
    ), 0)
  ), 0);
  return Math.max(0, nodeResolveCost(node) + adjustment + modifierAdjustment);
}

export function activeDungeonModifiers(dungeon, nodeId, conquestState = {}) {
  return (dungeon?.modifiers || []).filter((modifier) => {
    if (conquestState.disabledModifiers?.[modifier.id]) return false;
    if (modifier.sourceNodeId && conquestState.clearedNodes?.[modifier.sourceNodeId]) return false;
    return (modifier.targetNodeIds || []).includes(nodeId);
  }).map((modifier) => ({
    ...modifier,
    effects: Array.isArray(modifier.effects) ? modifier.effects : []
  }));
}

export function effectiveDungeonNode(dungeon, node, conquestState = {}) {
  const activeModifiers = activeDungeonModifiers(dungeon, node.id, conquestState);
  const effective = {
    ...node,
    enemy: node.enemy ? { ...node.enemy } : node.enemy,
    damage: Number(node.damage || 0),
    utility: Number(node.utility || 0),
    activeModifiers
  };
  activeModifiers.forEach((modifier) => {
    modifier.effects.forEach((effect) => {
      if (effect.type === "enemy_atk_add" && effective.enemy) {
        effective.enemy.atk = Math.max(0, Number(effective.enemy.atk || 0) + Number(effect.value || 0));
      }
      if (effect.type === "enemy_hp_add" && effective.enemy) {
        effective.enemy.hp = Math.max(1, Number(effective.enemy.hp || 1) + Number(effect.value || 0));
      }
      if (effect.type === "hazard_damage_add") {
        effective.damage = Math.max(0, Number(effective.damage || 0) + Number(effect.value || 0));
      }
      if (effect.type === "utility_required_add") {
        effective.utility = Math.max(0, Number(effective.utility || 0) + Number(effect.value || 0));
      }
    });
  });
  effective.resolveCost = effectiveNodeResolveCost(node, conquestState, activeModifiers);
  return effective;
}

export function isNodeUnlocked(node, conquestState = {}) {
  if (!node?.requiresNodeId) return true;
  return Boolean(conquestState.clearedNodes?.[node.requiresNodeId] || conquestState.unlockedNodes?.[node.id]);
}

export function legalDungeonPath(dungeon, desiredNodeIds = [], conquestState = {}) {
  const nodesById = dungeonNodesById(dungeon);
  const links = dungeonGraphLinks(dungeon);
  const path = [];
  desiredNodeIds.forEach((nodeId) => {
    if (!nodesById[nodeId]) return;
    if (!isNodeUnlocked(nodesById[nodeId], conquestState)) return;
    if (!path.length) {
      if (isStartNode(dungeon, nodeId)) path.push(nodeId);
      return;
    }
    if (path.includes(nodeId)) return;
    if (canMoveBetween(path.at(-1), nodeId, links, conquestState)) path.push(nodeId);
  });
  return path;
}

export function plannedPathAfterNodeClick(dungeon, currentNodeIds = [], nodeId, conquestState = {}) {
  const currentPath = legalDungeonPath(dungeon, currentNodeIds, conquestState);
  const existingIndex = currentPath.indexOf(nodeId);
  if (existingIndex >= 0) {
    return currentPath.slice(0, existingIndex);
  }
  const directPath = legalDungeonPath(dungeon, [...currentPath, nodeId], conquestState);
  if (directPath.at(-1) === nodeId) return directPath;
  const shortest = shortestPathToNode(dungeon, nodeId, conquestState);
  if (!shortest.length) return currentPath;
  if (!currentPath.length) return shortest;
  if (shortest.slice(0, currentPath.length).join("|") === currentPath.join("|")) return shortest;
  return shortest;
}

export function shortestPathToNode(dungeon, targetNodeId, conquestState = {}) {
  const starts = dungeonStartNodeIds(dungeon);
  const links = dungeonGraphLinks(dungeon);
  const nodesById = dungeonNodesById(dungeon);
  const queue = starts.map((nodeId) => [nodeId]);
  const seen = new Set(starts);
  while (queue.length) {
    const path = queue.shift();
    const last = path.at(-1);
    if (last === targetNodeId) return path;
    links.filter((link) => link.from === last).forEach((link) => {
      if (seen.has(link.to)) return;
      if (!nodesById[link.to] || !isNodeUnlocked(nodesById[link.to], conquestState)) return;
      if (!canMoveBetween(last, link.to, links, conquestState)) return;
      seen.add(link.to);
      queue.push([...path, link.to]);
    });
  }
  return [];
}

export function dungeonStartNodeIds(dungeon) {
  if (Array.isArray(dungeon?.startNodeIds) && dungeon.startNodeIds.length) return [...dungeon.startNodeIds];
  const route = dungeonRouteForStop(dungeon, "all");
  return route.nodeIds[0] ? [route.nodeIds[0]] : [];
}

export function isUniqueBossNode(node) {
  return node?.type === "boss" || Boolean(node?.uniqueBoss);
}

function nodeNameById(dungeon, nodeId) {
  return dungeonNodesById(dungeon)[nodeId]?.name || nodeId;
}

function authoredGraphRoutes(dungeon) {
  const starts = dungeonStartNodeIds({
    ...dungeon,
    edges: [],
    routes: dungeon.routes
  });
  if (Array.isArray(dungeon?.routes) && dungeon.routes.length) {
    return dungeon.routes.map((route) => ({
      id: route.id,
      name: route.name || route.id,
      default: Boolean(route.default),
      nodeIds: Array.isArray(route.nodeIds) ? [...route.nodeIds] : []
    }));
  }
  const firstStart = dungeon.startNodeIds?.[0] || dungeon.nodes?.[0]?.id;
  return [{
    id: "main",
    name: "main route",
    default: true,
    nodeIds: firstStart ? shortestDefaultRoute(dungeon, firstStart) : []
  }];
}

function shortestDefaultRoute(dungeon, startNodeId) {
  const boss = (dungeon.nodes || []).find((node) => node.type === "boss") || dungeon.nodes?.at(-1);
  if (!boss) return [startNodeId];
  return shortestPathToNode(dungeon, boss.id, { clearedNodes: {}, unlockedNodes: {}, disabledModifiers: {}, nodeCostAdjustments: {} });
}

function isStartNode(dungeon, nodeId) {
  return dungeonStartNodeIds(dungeon).includes(nodeId);
}

function canMoveBetween(from, to, links, conquestState) {
  return links.some((link) => (
    link.from === from
    && link.to === to
    && (!link.lockedByNodeId || conquestState.clearedNodes?.[link.lockedByNodeId])
  ));
}
