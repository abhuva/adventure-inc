import {
  createPartyCombatActors,
  partyHpCurrent,
  recoveryHours,
  resolveNode
} from "../combat/combatTimeline.js";
import { pushReplayEvent } from "../combat/combatReplayModel.js";

export function simulateDungeonRun({ dungeon, strategy, stopNode, party, stats, members, availableFood }) {
  const targetLastIndex = stopNode === "all" ? dungeon.nodes.length - 1 : Number(stopNode);
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
    targetLastIndex,
    totalNodes: targetLastIndex + 1,
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
    text: `${party.name} enters ${dungeon.name}.`,
    partyActors,
    enemyActors: []
  });

  for (let index = 0; index <= targetLastIndex; index += 1) {
    const node = dungeon.nodes[index];
    const before = partyHpCurrent(partyActors);
    const nodeResult = resolveNode(node, stats, partyActors, strategy, timeline);
    result.hpEnd = partyHpCurrent(partyActors);
    result.hours += nodeResult.hours;
    result.dungeonHours += nodeResult.hours;
    result.transcript.push(`${node.name}: ${nodeResult.summary}`);

    if (!nodeResult.success) {
      result.transcript.push(`run stops: hp ${before} -> ${result.hpEnd}`);
      break;
    }

    result.reached += 1;
    mergeRewards(result.rewards, node.reward);
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
