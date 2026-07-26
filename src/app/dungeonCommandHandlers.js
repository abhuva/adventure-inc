import {
  automationManualOnlyMessage,
  automationMissingPlanMessage,
  operationQueuedMessage,
  operationReturnedMessage,
  repeatedPlanPausedMessage,
  repeatedPlanStoppedForAssignmentMessage,
  repeatedPlanToggleMessage,
  scheduleBlockedMessage,
  simulatedRunMessage,
  templeResonanceMessage
} from "./commandMessages.js";
import { setDungeonEstimate } from "./planInvalidation.js";
import { EVENT_TRIGGERS } from "../game/events/eventDefinitions.js";
import { awardDungeonMastery } from "../game/dungeon/dungeonMastery.js";
import {
  applyDungeonConquestProgress,
  conquestChangeMessages
} from "../game/dungeon/dungeonConquest.js";
import {
  canScheduleEstimate,
  cloneEstimate,
  createPartyOperation
} from "../game/dungeon/dungeonOperationModel.js";
import { completePartyOperation } from "../game/dungeon/dungeonCompletion.js";
import { simulateDungeonRun, uniqueBossKey } from "../game/dungeon/dungeonRunSimulator.js";
import {
  repeatedPlanQueueStatus,
  toggleRepeatedPlan
} from "../game/dungeon/repeatedPlanAutomation.js";
import {
  ensureDungeonConquestState,
  incrementDungeonClear,
  unlockLocation
} from "../game/progression/worldProgression.js";

export function createDungeonCommandHandlers({
  state,
  controls,
  selectedDungeon,
  selectedParty,
  partyStats,
  partyMembers,
  isPartyFullyHealed,
  partyAssignmentReadiness,
  currentOperationPhase,
  dungeons,
  tavernCoord,
  applyRewards,
  gainXp,
  templeLootBonus,
  recordShardProgress,
  formatReward,
  replayTimerApi,
  populateDungeonSelect,
  addLog,
  render,
  triggerEvent
}) {
  function logMessage(message) {
    if (!message) return;
    addLog(message.text, message.type);
  }

  function simulateRun({ dungeon, strategy, stopNode, party }) {
    if (!dungeon) return null;
    return simulateDungeonRun({
      dungeon,
      strategy,
      stopNode,
      party,
      stats: partyStats(party),
      members: partyMembers(party),
      availableFood: state.resources.food,
      defeatedBosses: state.progression.uniqueBosses,
      conquestState: ensureDungeonConquestState(state, dungeon.id)
    });
  }

  function simulateSelectedRun({ updateRepeatedPlan = false } = {}) {
    const party = selectedParty();
    const dungeon = selectedDungeon();
    if (!dungeon) {
      logMessage({ text: "no local dungeon available on this continent", type: "bad" });
      return null;
    }
    const estimate = simulateRun({
      dungeon,
      strategy: controls.strategy(),
      stopNode: controls.stopNode(),
      party
    });
    if (!estimate) return null;
    setDungeonEstimate(state, estimate, replayTimerApi());
    if (updateRepeatedPlan && state.repeatedPlans[party.id]) {
      state.repeatedPlans[party.id] = cloneEstimate(estimate);
    }
    logMessage(simulatedRunMessage(party.name, estimate));
    triggerEvent?.(EVENT_TRIGGERS.FIRST_DUNGEON_SIMULATED, { renderAfter: false });
    return estimate;
  }

  function scheduleEstimate(estimate, automated) {
    const party = state.parties.find((item) => item.id === estimate.partyId) || selectedParty();
    const scheduleStatus = canScheduleEstimate({
      estimate,
      party,
      operations: state.operations,
      resources: state.resources,
      fullyHealed: isPartyFullyHealed(party),
      phaseForOperation: currentOperationPhase
    });
    if (!scheduleStatus.ok) {
      logMessage(scheduleBlockedMessage({ automated, reason: scheduleStatus.reason }));
      return false;
    }
    const dungeon = dungeons().find((item) => item.id === estimate.dungeonId);
    if (!automated && state.repeatedPlans[party.id]) {
      delete state.repeatedPlans[party.id];
      logMessage(repeatedPlanStoppedForAssignmentMessage(party.name));
    }
    const operation = createPartyOperation({
      estimate,
      party,
      dungeon,
      operations: state.operations,
      tavernCoord: tavernCoord(),
      id: `op-${Date.now()}-${state.operations.length}`
    });
    state.resources.food -= estimate.foodCost;
    state.operations.push(operation);
    logMessage(operationQueuedMessage({ automated, label: operation.label, foodCost: estimate.foodCost }));
    triggerEvent?.(EVENT_TRIGGERS.FIRST_RUN_QUEUED, { renderAfter: false });
    return true;
  }

  function ensureRepeatedPlanQueued(partyId) {
    const status = repeatedPlanQueueStatus({
      repeatedPlans: state.repeatedPlans,
      operations: state.operations,
      parties: state.parties,
      resources: state.resources,
      partyId,
      readinessForParty: partyAssignmentReadiness
    });
    if (status.action === "none") return;
    if (status.action === "pause") {
      logMessage(repeatedPlanPausedMessage(status.estimate.partyName, status.reason));
      return;
    }
    const queued = scheduleEstimate(status.estimate, true);
    if (!queued) {
      logMessage(repeatedPlanPausedMessage(status.estimate.partyName, "queue rejected"));
    }
  }

  function completeEstimate(operation) {
    const result = completePartyOperation(state, operation, {
      applyRewards,
      gainXp,
      templeLootBonus,
      recordShardProgress
    });
    const dungeon = dungeons().find((item) => item.id === operation.estimate.dungeonId);
    if (dungeon) {
      const mastery = awardDungeonMastery(state, operation.estimate, dungeon);
      if (mastery.xp > 0) {
        logMessage({ text: `${dungeon.name} mastery +${mastery.xp}${mastery.autoSpent.length ? `; unlocked ${mastery.autoSpent.join(", ")}` : ""}`, type: "ok" });
      }
      mastery.unlockedBlueprints.forEach((blueprintId) => {
        logMessage({ text: `${dungeon.name} mastery revealed blueprint: ${blueprintId}`, type: "ok" });
      });
      markUniqueBossesCleared(state, operation.estimate, dungeon);
      const conquestChanges = applyDungeonConquestProgress(state, operation.estimate, dungeon, { unlockLocation });
      conquestChangeMessages(conquestChanges, dungeon).forEach(logMessage);
      conquestChanges.unlockedLocations.forEach((locationId) => {
        const location = dungeons().find((item) => item.id === locationId);
        logMessage({ text: `new dungeon revealed: ${location?.name || locationId}`, type: "ok" });
        if (locationId === "mine") {
          triggerEvent?.(EVENT_TRIGGERS.SECOND_DUNGEON_REVEALED, { renderAfter: false });
        }
      });
      if (conquestChanges.unlockedLocations.length) {
        populateDungeonSelect?.();
      }
    }
    const clearResult = incrementDungeonClear(state, operation.estimate.dungeonId, {
      success: operation.estimate.success
    });
    clearResult.unlocked.forEach((locationId) => {
      const location = dungeons().find((item) => item.id === locationId);
      logMessage({ text: `new dungeon revealed: ${location?.name || locationId}`, type: "ok" });
      unlockLocation(state, locationId);
      if (locationId === "mine") {
        triggerEvent?.(EVENT_TRIGGERS.SECOND_DUNGEON_REVEALED, { renderAfter: false });
      }
    });
    if (clearResult.unlocked.length) {
      populateDungeonSelect?.();
    }
    if (Object.keys(result.templeLoot).length) {
      logMessage(templeResonanceMessage(formatReward(result.templeLoot)));
    }
    logMessage(operationReturnedMessage(operation.label, formatReward(result.estimate.rewards)));
    triggerEvent?.(EVENT_TRIGGERS.FIRST_OPERATION_RETURNED, { renderAfter: false });
  }

  return {
    simulateRun,
    scheduleEstimate,
    ensureRepeatedPlanQueued,
    completeEstimate,

    simulateSelectedRun() {
      simulateSelectedRun();
      render();
    },

    resimulateSelectedRun() {
    const estimate = simulateSelectedRun({ updateRepeatedPlan: true });
      if (!estimate) return;
      if (state.repeatedPlans[estimate.partyId]) {
        ensureRepeatedPlanQueued(estimate.partyId);
      }
      render();
    },

    selectTargetNode(nodeId) {
      const dungeon = selectedDungeon();
      if (!dungeon) {
        logMessage({ text: "no local dungeon available on this continent", type: "bad" });
        render();
        return;
      }
      const conquest = ensureDungeonConquestState(state, dungeon.id);
      const planned = controls.planNodeClick?.(dungeon, nodeId, conquest) || [];
      conquest.selectedNodeId = nodeId;
      conquest.plannedNodeIds = planned;
      controls.setStopNode?.(planned.length ? `path:${planned.join(",")}` : "path:");
      if (!planned.length) {
        render();
        return;
      }
      const estimate = simulateSelectedRun({ updateRepeatedPlan: true });
      if (!estimate) return;
      if (state.repeatedPlans[estimate.partyId]) {
        ensureRepeatedPlanQueued(estimate.partyId);
      }
      render();
    },

    commitLastEstimate() {
      if (!state.lastEstimate) {
        this.simulateSelectedRun();
      }
      if (!state.lastEstimate) return;
      scheduleEstimate(state.lastEstimate, false);
      render();
    },

    automateLastEstimate() {
      if (!state.lastEstimate) {
        logMessage(automationMissingPlanMessage());
        render();
        return;
      }
      if (controls.repeatMode() !== "repeat") {
        logMessage(automationManualOnlyMessage());
        render();
        return;
      }
      const result = toggleRepeatedPlan(state.repeatedPlans, state.lastEstimate);
      logMessage(repeatedPlanToggleMessage({
        enabled: result.enabled,
        partyName: state.lastEstimate.partyName
      }));
      if (result.enabled) {
        ensureRepeatedPlanQueued(result.partyId);
      }
      render();
    }
  };
}

function markUniqueBossesCleared(state, estimate, dungeon) {
  const reachedIds = new Set((estimate.routeNodeIds || []).slice(0, estimate.reached));
  (dungeon.nodes || []).forEach((node) => {
    if (!reachedIds.has(node.id)) return;
    if (node.type !== "boss" && node.type !== "miniboss" && !node.uniqueBoss && !node.oneTime) return;
    state.progression.uniqueBosses[uniqueBossKey(dungeon.id, node.id)] = true;
  });
}
