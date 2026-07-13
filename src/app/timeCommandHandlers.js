import {
  autoTimeToggleMessage,
  dailyTavernIncomeMessage,
  timeAdvancedMessage,
  workerDeliveryMessage
} from "./commandMessages.js";
import { advancePartyOperations } from "../game/dungeon/operationRuntime.js";
import { applyDailyProduction } from "../game/time/dailyProductionRuntime.js";
import { advanceGameHours } from "../game/time/timeAdvanceRuntime.js";

export function createTimeCommandHandlers({
  state,
  autoTimeRuntime,
  workSites,
  operationTotalHours,
  completeEstimate,
  ensureRepeatedPlanQueued,
  applyRewards,
  formatReward,
  advanceClock,
  advanceWorkerCyclesForSites,
  addLog,
  render
}) {
  function logMessage(message) {
    if (!message) return;
    addLog(message.text, message.type);
  }

  function advanceOperations(hours) {
    const result = advancePartyOperations({
      operations: state.operations,
      hours,
      operationTotalHours
    });
    result.completed.forEach(completeEstimate);
    state.operations = result.remaining;
    result.completedPartyIds.forEach((partyId) => ensureRepeatedPlanQueued(partyId));
  }

  function advanceWorkerCycles(hours) {
    advanceWorkerCyclesForSites({
      workerProgress: state.workerProgress,
      jobs: state.tavern.jobs,
      workSites: workSites(),
      hours,
      applyOutput: (output, site) => {
        applyRewards(output);
        logMessage(workerDeliveryMessage(site.name, formatReward(output)));
      }
    });
  }

  function produceDailyResources(report) {
    const result = applyDailyProduction({ state });
    if (report) {
      logMessage(dailyTavernIncomeMessage(result.income));
    }
    result.repeatedPartyIds.forEach((partyId) => ensureRepeatedPlanQueued(partyId));
  }

  function advanceTime(hours, report) {
    advanceGameHours({
      state,
      hours,
      onBeforeHour: () => {
        advanceWorkerCycles(1);
        advanceOperations(1);
      },
      onDayRollover: () => produceDailyResources(report),
      advanceClock
    });
    if (report) {
      logMessage(timeAdvancedMessage(hours));
    }
    autoTimeRuntime.markTick(state);
    render();
  }

  return {
    advanceTime,
    advanceOperations,
    advanceWorkerCycles,
    produceDailyResources,

    toggleAutoTime() {
      const result = autoTimeRuntime.toggle(state, () => advanceTime(1, false));
      logMessage(autoTimeToggleMessage(result));
      render();
    },

    stopAutoTime() {
      autoTimeRuntime.stop(state);
    },

    currentVisualHourFraction() {
      return autoTimeRuntime.currentVisualHourFraction(state);
    }
  };
}
