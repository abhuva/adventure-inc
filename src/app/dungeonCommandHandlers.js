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
import {
  canScheduleEstimate,
  createPartyOperation
} from "../game/dungeon/dungeonOperationModel.js";
import { completePartyOperation } from "../game/dungeon/dungeonCompletion.js";
import { simulateDungeonRun } from "../game/dungeon/dungeonRunSimulator.js";
import {
  repeatedPlanQueueStatus,
  toggleRepeatedPlan
} from "../game/dungeon/repeatedPlanAutomation.js";

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
  addLog,
  render
}) {
  function logMessage(message) {
    if (!message) return;
    addLog(message.text, message.type);
  }

  function simulateRun({ dungeon, strategy, stopNode, party }) {
    return simulateDungeonRun({
      dungeon,
      strategy,
      stopNode,
      party,
      stats: partyStats(party),
      members: partyMembers(party),
      availableFood: state.resources.food
    });
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
    if (Object.keys(result.templeLoot).length) {
      logMessage(templeResonanceMessage(formatReward(result.templeLoot)));
    }
    logMessage(operationReturnedMessage(operation.label, formatReward(result.estimate.rewards)));
  }

  return {
    simulateRun,
    scheduleEstimate,
    ensureRepeatedPlanQueued,
    completeEstimate,

    simulateSelectedRun() {
      const party = selectedParty();
      const estimate = simulateRun({
        dungeon: selectedDungeon(),
        strategy: controls.strategy(),
        stopNode: controls.stopNode(),
        party
      });
      setDungeonEstimate(state, estimate, replayTimerApi());
      logMessage(simulatedRunMessage(party.name, estimate));
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
