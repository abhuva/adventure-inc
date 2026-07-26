import {
  createPartyCombatActors,
  partyHpCurrent,
  recoveryHours,
  resolveNode
} from "../combat/combatTimeline.js";
import { pushReplayEvent } from "../combat/combatReplayModel.js";
import {
  dungeonNodesForRoute,
  dungeonRouteForStop,
  effectiveDungeonNode,
  isUniqueBossNode,
  nodeResolveCost
} from "./dungeonGraphModel.js";

export function simulateDungeonRun({ dungeon, strategy, stopNode, party, stats, members, availableFood, defeatedBosses = {}, conquestState = {} }) {
  const route = dungeonRouteForStop(dungeon, stopNode, conquestState);
  const routeNodes = dungeonNodesForRoute(dungeon, route);
  const partyActors = createPartyCombatActors(members);
  const timeline = [];
  const travelHours = adjustedTravelHours(dungeon.travelHours, stats);
  const result = {
    dungeonId: dungeon.id,
    dungeonName: dungeon.name,
    partyId: party.id,
    partyName: party.name,
    memberIds: [...party.memberIds],
    strategy,
    routeId: route.id,
    routeName: route.name,
    routeNodeIds: routeNodes.map((node) => node.id),
    targetLastIndex: routeNodes.length - 1,
    totalNodes: routeNodes.length,
    reached: 0,
    success: false,
    hours: travelHours * 2,
    travelHours,
    dungeonHours: 0,
    recoveryHours: 0,
    foodCost: adjustedFoodCost(dungeon.foodCost, stats),
    hpMax: stats.hpMax,
    hpStart: stats.hpCurrent,
    hpEnd: stats.hpCurrent,
    resolveStart: partyActors.reduce((sum, actor) => sum + actor.resolveLeft, 0),
    resolveEnd: partyActors.reduce((sum, actor) => sum + actor.resolveLeft, 0),
    activeMemberIds: partyActors.map((actor) => actor.id),
    withdrawnMemberIds: [],
    rewards: {},
    transcript: [],
    timeline
  };

  if (availableFood < result.foodCost) {
    result.transcript.push(`blocked before departure: needs ${result.foodCost} food`);
    pushReplayEvent(timeline, {
      type: "blocked",
      icon: "!",
      text: `Blocked before departure: needs ${result.foodCost} food.`,
      partyActors,
      enemyActors: []
    });
    return result;
  }

  if (!party.memberIds.length || stats.hpCurrent <= 0) {
    result.transcript.push("blocked before departure: selected party has no ready members");
    pushReplayEvent(timeline, {
      type: "blocked",
      icon: "!",
      text: "Blocked before departure: selected party has no ready members.",
      partyActors,
      enemyActors: []
    });
    return result;
  }

  pushReplayEvent(timeline, {
    type: "start",
    icon: ">>",
    text: `${party.name} enters ${dungeon.name}: ${route.name}.`,
    partyActors,
    enemyActors: []
  });

  for (let index = 0; index < routeNodes.length; index += 1) {
    const baseNode = routeNodes[index];
    const node = effectiveDungeonNode(dungeon, baseNode, conquestState);
    const activeActors = prepareResolveForNode(partyActors, nodeResolveCost(node), node.name, result.transcript, timeline);
    result.resolveEnd = partyActors.reduce((sum, actor) => sum + Math.max(0, actor.resolveLeft), 0);
    result.activeMemberIds = activePartyActors(partyActors).map((actor) => actor.id);
    result.withdrawnMemberIds = partyActors.filter((actor) => actor.withdrew).map((actor) => actor.id);
    if (!activeActors.length) {
      result.transcript.push("run stops: no adventurer has enough resolve to continue");
      break;
    }
    const before = partyHpCurrent(partyActors);
    const alreadyDefeated = isClearedOneTimeNode(dungeon.id, node, defeatedBosses, conquestState);
    const nodeResult = alreadyDefeated
      ? { success: true, hp: partyHpCurrent(activeActors), hours: 1, summary: "unique threat already cleared" }
      : resolveNode(node, stats, activeActors, strategy, timeline);
    result.hpEnd = partyHpCurrent(partyActors);
    result.hours += nodeResult.hours;
    result.dungeonHours += nodeResult.hours;
    result.transcript.push(`${node.name}: ${nodeResult.summary}`);

    if (!nodeResult.success) {
      result.transcript.push(`run stops: hp ${before} -> ${result.hpEnd}`);
      break;
    }

    result.reached += 1;
    if (!alreadyDefeated || node.repeatRewards) mergeRewards(result.rewards, node.reward);
    if (node.activeModifiers?.length) {
      result.transcript.push(`${node.name}: active modifiers ${node.activeModifiers.map((modifier) => modifier.name || modifier.id).join(", ")}`);
    }
    markSpentActorsWithdrawn(partyActors, node.name, result.transcript, timeline);
    result.resolveEnd = partyActors.reduce((sum, actor) => sum + Math.max(0, actor.resolveLeft), 0);
    result.activeMemberIds = activePartyActors(partyActors).map((actor) => actor.id);
    result.withdrawnMemberIds = partyActors.filter((actor) => actor.withdrew).map((actor) => actor.id);
  }

  result.success = result.reached === result.totalNodes && result.hpEnd > 0;
  const finalRecoveryHours = recoveryHours(result.hpEnd, stats.hpMax, stats);
  result.recoveryHours = finalRecoveryHours;
  result.transcript.push(`return/regenerate: ${result.travelHours}h travel, ${finalRecoveryHours}h recovery`);
  pushReplayEvent(timeline, {
    type: "end",
    icon: result.success ? "OK" : "X",
    text: `${result.success ? "Run solved" : "Run failed"}: ${result.reached}/${result.totalNodes} nodes reached. Return ${result.travelHours}h, recovery ${finalRecoveryHours}h.`,
    partyActors,
    enemyActors: []
  });
  result.hours += finalRecoveryHours;
  return result;
}

export function uniqueBossKey(dungeonId, nodeId) {
  return `${dungeonId}:${nodeId}`;
}

export function adjustedTravelHours(baseHours, stats) {
  return Math.max(1, baseHours - Math.floor((stats.travelSpeed || 0) / 2));
}

export function adjustedFoodCost(baseCost, stats) {
  return Math.max(0, baseCost - (stats.foodCostReduce || 0));
}

export function mergeRewards(target, rewards = {}) {
  Object.entries(rewards).forEach(([key, value]) => {
    if (key === "blueprint") {
      target.blueprint = value;
      return;
    }
    target[key] = (target[key] || 0) + value;
  });
  return target;
}

function isClearedOneTimeNode(dungeonId, node, defeatedBosses, conquestState) {
  if (!node.oneTime) return false;
  if (conquestState.clearedNodes?.[node.id]) return true;
  return isUniqueBossNode(node) && defeatedBosses[uniqueBossKey(dungeonId, node.id)];
}

function activePartyActors(partyActors) {
  return partyActors.filter((actor) => actor.hp > 0 && !actor.withdrew);
}

function prepareResolveForNode(partyActors, cost, nodeName, transcript, timeline) {
  if (cost <= 0) return activePartyActors(partyActors);
  const cannotContinue = [];
  const entering = [];
  partyActors.forEach((actor) => {
    if (actor.hp <= 0 || actor.withdrew) return;
    if (actor.resolveLeft < cost) {
      actor.withdrew = true;
      cannotContinue.push(actor.name);
      return;
    }
    actor.resolveLeft = Math.max(0, actor.resolveLeft - cost);
    entering.push(actor);
  });
  const detail = cannotContinue.length
    ? `${nodeName}: requires ${cost} resolve; withdrew before node: ${cannotContinue.join(", ")}`
    : `${nodeName}: resolve -${cost}`;
  transcript.push(detail);
  pushReplayEvent(timeline, {
    type: "resolve",
    icon: "RSV",
    text: detail,
    partyActors,
    enemyActors: []
  });
  return entering;
}

function markSpentActorsWithdrawn(partyActors, nodeName, transcript, timeline) {
  const withdrawn = [];
  partyActors.forEach((actor) => {
    if (actor.hp <= 0 || actor.withdrew) return;
    if (actor.resolveLeft <= 0) {
      actor.withdrew = true;
      withdrawn.push(actor.name);
    }
  });
  if (!withdrawn.length) return;
  const detail = `${nodeName}: resolve spent; withdrew after node: ${withdrawn.join(", ")}`;
  transcript.push(detail);
  pushReplayEvent(timeline, {
    type: "resolve",
    icon: "RSV",
    text: detail,
    partyActors,
    enemyActors: []
  });
}
