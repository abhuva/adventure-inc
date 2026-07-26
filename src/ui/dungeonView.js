import {
  defaultDungeonTargetNodeId,
  activeDungeonModifiers,
  dungeonGraphLayout,
  dungeonGraphLinks,
  dungeonNodesById,
  dungeonRouteForStop,
  effectiveDungeonNode,
  isNodeUnlocked,
  nodeResolveCost
} from "../game/dungeon/dungeonGraphModel.js";

export function dungeonNodeMapHtml({ dungeon, reached = 0, failedIndex = -1, rewardText }) {
  return dungeon.nodes.map((node, index) => `
    <div class="node ${index < reached ? "reached" : ""} ${index === failedIndex ? "failed" : ""}">
      <div class="node-title">${index + 1}. ${node.name}</div>
      <div class="node-meta">${node.type}</div>
      <div class="node-meta">resolve: -${node.resolveCost ?? 1}</div>
      <div class="node-meta">reward: ${rewardText(node.reward)}</div>
    </div>
  `).join("");
}

export function dungeonNodeGraphHtml({
  dungeon,
  selectedTargetNodeId = defaultDungeonTargetNodeId(dungeon),
  plannedNodeIds = [],
  conquestState = {},
  estimate = null,
  rewardText
}) {
  const layout = dungeonGraphLayout(dungeon);
  const nodesById = dungeonNodesById(dungeon);
  const links = dungeonGraphLinks(dungeon);
  const path = dungeonRouteForStop(dungeon, selectedTargetNodeId ? `node:${selectedTargetNodeId}` : "all");
  const activePath = plannedNodeIds.length ? plannedNodeIds : path.nodeIds;
  const pathIds = new Set(activePath);
  const reachedIds = new Set(estimate?.routeNodeIds?.slice(0, estimate.reached) || []);
  const failedNodeId = estimate && !estimate.success ? estimate.routeNodeIds?.[estimate.reached] : null;
  const maxX = Math.max(1, ...Object.values(layout).map((position) => position.x));
  const maxY = Math.max(1, ...Object.values(layout).map((position) => position.y));
  const usesPercentPositions = maxX > 10 || maxY > 10;
  const positionFor = (nodeId) => {
    const position = layout[nodeId] || { x: 0, y: 0 };
    if (usesPercentPositions) {
      return {
        x: Math.max(5, Math.min(95, position.x)),
        y: Math.max(8, Math.min(92, position.y))
      };
    }
    return {
      x: 10 + (position.x / maxX) * 80,
      y: 14 + (position.y / maxY) * 72
    };
  };
  return `
    <div class="dungeon-route-graph" style="--dungeon-graph-rows:${maxY + 1}">
      <svg class="dungeon-route-link-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        ${links.map((link) => dungeonRouteLinkHtml({ link, positionFor, plannedNodeIds: activePath, conquestState })).join("")}
      </svg>
      ${Object.values(nodesById).map((node) => dungeonRouteNodeHtml({
        node,
        effectiveNode: effectiveDungeonNode(dungeon, node, conquestState),
        selected: node.id === selectedTargetNodeId,
        inPath: pathIds.has(node.id),
        reached: reachedIds.has(node.id),
        cleared: Boolean(conquestState.clearedNodes?.[node.id]),
        locked: !isNodeUnlocked(node, conquestState),
        failed: node.id === failedNodeId,
        position: positionFor(node.id),
        rewardText
      })).join("")}
    </div>
  `;
}

function dungeonRouteLinkHtml({ link, positionFor, plannedNodeIds, conquestState }) {
  const from = positionFor(link.from);
  const to = positionFor(link.to);
  const fromIndex = plannedNodeIds.indexOf(link.from);
  const inPath = fromIndex >= 0 && plannedNodeIds[fromIndex + 1] === link.to;
  const locked = link.lockedByNodeId && !conquestState.clearedNodes?.[link.lockedByNodeId];
  return `<line class="dungeon-route-link ${inPath ? "in-path" : ""} ${locked ? "locked" : ""}" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"></line>`;
}

function dungeonRouteNodeHtml({ node, effectiveNode, selected, inPath, reached, cleared, locked, failed, position, rewardText }) {
  const classes = [
    "dungeon-route-node",
    `type-${node.type}`,
    selected ? "selected" : "",
    inPath ? "in-path" : "",
    reached ? "reached" : "",
    cleared ? "cleared" : "",
    locked ? "locked" : "",
    effectiveNode.activeModifiers?.length ? "modified" : "",
    failed ? "failed" : ""
  ].filter(Boolean).join(" ");
  return `
    <button class="${classes}" data-dungeon-target-node="${node.id}" style="left:${position.x}%;top:${position.y}%;" title="${escapeHtml(node.name)} / resolve -${nodeResolveCost(effectiveNode)} / ${escapeHtml(rewardText(node.reward))}">
      <span class="dungeon-node-type">${escapeHtml(node.type)}</span>
      <strong>${escapeHtml(node.name)}</strong>
      <span>rsv -${nodeResolveCost(effectiveNode)}</span>
    </button>
  `;
}

export function dungeonNodeInfoHtml({ dungeon, nodeId, conquestState = {}, rewardText }) {
  const nodesById = dungeonNodesById(dungeon);
  const node = nodesById[nodeId];
  if (!node) {
    return `<div class="dungeon-node-info">select a route node</div>`;
  }
  const effectiveNode = effectiveDungeonNode(dungeon, node, conquestState);
  const modifiers = activeDungeonModifiers(dungeon, node.id, conquestState);
  const effects = node.effectsOnClear || [];
  const rows = [
    ["node", node.name],
    ["type", node.type],
    ["state", conquestState.clearedNodes?.[node.id] ? "cleared" : isNodeUnlocked(node, conquestState) ? "available" : `locked by ${node.requiresNodeId}`],
    ["resolve", `${nodeResolveCost(node)} -> ${nodeResolveCost(effectiveNode)}`],
    ["reward", rewardText(node.reward)],
    ["modifiers", modifiers.length ? modifiers.map((modifier) => modifier.name || modifier.id).join(", ") : "none"],
    ["on clear", effects.length ? effects.map(effectLabel).join("; ") : "none"]
  ];
  return `
    <div class="dungeon-node-info">
      ${rows.map(([label, value]) => `
        <div class="detail-line"><span class="tag">${escapeHtml(label)}</span> ${escapeHtml(value)}</div>
      `).join("")}
    </div>
  `;
}

function effectLabel(effect) {
  if (effect.type === "disable_modifier") return `disable ${effect.modifierId}`;
  if (effect.type === "unlock_node") return `unlock ${effect.nodeId}`;
  if (effect.type === "unlock_location") return `reveal ${effect.locationId}`;
  if (effect.type === "unlock_location_when_cleared") return `reveal ${effect.locationId} when ${effect.requiredNodeIds?.length || 0} nodes cleared`;
  if (effect.type === "unlock_feature") return `unlock ${effect.featureId}`;
  if (effect.type === "node_resolve_cost_add") return `${effect.targetNodeId || "self"} resolve ${effect.value}`;
  return effect.type;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}

export function dungeonEstimateHtml({ estimate, repeated, repeatMode }) {
  if (!estimate) {
    return `
      <div class="dungeon-inspector-empty">
        No cached estimate. Select a dungeon from the map or run simulate to inspect deterministic combat, food cost, rewards, and recovery time.
      </div>
    `;
  }
  const result = estimate.success
    ? "success"
    : estimate.reached > 0
      ? `partial ${estimate.reached}/${estimate.totalNodes}`
      : "blocked";
  const repeatState = repeated ? "repeated route" : repeatMode === "repeat" ? "ready to repeat" : "manual";
  const rows = [
    ["party", estimate.partyName],
    ["dungeon", estimate.dungeonName],
    ["strategy", estimate.strategy],
    ["result", result],
    ["nodes", `${estimate.reached}/${estimate.totalNodes}`],
    ["time", `${estimate.hours}h`],
    ["food", `-${estimate.foodCost}`],
    ["hp", `${estimate.hpStart} -> ${estimate.hpEnd}`],
    ["resolve", `${estimate.resolveStart ?? 0} -> ${estimate.resolveEnd ?? 0}`],
    ["rewards", estimate.rewardText],
    ["route", `${estimate.routeName || "main"} / ${repeatState}`]
  ];
  return `
    <div class="dungeon-inspector">
      <div class="dungeon-stat-grid">
        ${rows.map(([label, value]) => `
          <div class="dungeon-stat">
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(value)}</strong>
          </div>
        `).join("")}
      </div>
      <div class="dungeon-transcript">
        <div class="detail-title">time / combat log</div>
        <ol>
          ${(estimate.transcript || []).map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
        </ol>
      </div>
    </div>
  `;
}

export function dungeonEstimateText({ estimate, repeated, repeatMode }) {
  if (!estimate) {
    return "No cached estimate.\n\nRun simulate to preview deterministic combat, food cost, rewards, and recovery time.";
  }
  return [
    `${estimate.dungeonName} / ${estimate.strategy}`,
    `party: ${estimate.partyName}`,
    `repeat: ${repeated ? "repeated" : repeatMode === "repeat" ? "ready to enable" : "manual"}`,
    `target nodes: ${estimate.totalNodes}`,
    `reached: ${estimate.reached}`,
    `success: ${estimate.success ? "yes" : "no"}`,
    `time: ${estimate.hours}h`,
    `food: -${estimate.foodCost}`,
    `hp: ${estimate.hpStart} -> ${estimate.hpEnd}`,
    `rewards: ${estimate.rewardText}`,
    "",
    ...estimate.transcript
  ].join("\n");
}

export function replayActorRowsHtml({ actors = [], event = {}, portraitHtml }) {
  if (!actors.length) {
    return `<div class="replay-empty">none</div>`;
  }
  return actors.map((actor) => {
    const pct = actor.maxHp > 0 ? Math.max(0, Math.min(100, actor.hp / actor.maxHp * 100)) : 0;
    const active = actor.id === event.actorId;
    const targeted = actor.id === event.targetId;
    return `
      <div class="replay-actor ${active ? "active" : ""} ${targeted ? "targeted" : ""}">
        ${actor.spriteIndex !== null ? portraitHtml(actor.spriteIndex) : `<span class="enemy-portrait">${actor.name.slice(0, 2).toUpperCase()}</span>`}
        <div class="replay-actor-body">
          <div class="replay-actor-name">${actor.name}</div>
          <div class="bar"><span style="width:${pct}%"></span></div>
          <div class="shard-meta">hp ${actor.hp}/${actor.maxHp}${actor.resolveMax !== undefined ? ` / rsv ${actor.resolveLeft}/${actor.resolveMax}${actor.withdrew ? " withdrawn" : ""}` : ""} / init ${actor.initiative} / spd ${actor.speed}</div>
        </div>
      </div>
    `;
  }).join("");
}

export function replayEventRowsHtml(events = [], cursor = 0) {
  return events.slice(0, cursor + 1).slice(-12).map((item, index, list) => `
    <li class="${index === list.length - 1 ? "current" : ""}">
      <span class="tag">${item.icon}</span> ${item.text}
    </li>
  `).join("");
}

export function replayEmptyState() {
  return {
    partyActorsHtml: `<div class="replay-empty">no party snapshot</div>`,
    enemyActorsHtml: `<div class="replay-empty">no enemy snapshot</div>`,
    actionIcon: "--",
    eventText: "simulate a run to inspect combat events",
    eventRowsHtml: ""
  };
}
