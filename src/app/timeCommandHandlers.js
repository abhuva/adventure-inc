import {
  autoTimeToggleMessage,
  settlementUpkeepMessage,
  timeAdvancedMessage,
  workerDeliveryMessage,
  workshopBlockedMessage,
  workshopCraftedMessage,
  workshopResearchMessage
} from "./commandMessages.js";
import { advancePartyOperations } from "../game/dungeon/operationRuntime.js";
import { applyDailyProduction } from "../game/time/dailyProductionRuntime.js";
import { advanceGameHours } from "../game/time/timeAdvanceRuntime.js";
import { unlockExpeditionRoutesForDay } from "../game/continent/continentState.js";
import { workerProductionMultiplier } from "../game/settlement/workforceModel.js";

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
  advanceWorkshopProduction,
  advanceWorkshopResearch,
  applyDailySettlementUpkeep,
  advanceExpeditionTransfers,
  refreshTavernVisitors,
  addLog,
  render,
  renderTimeTick = render
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

  function advanceTransfers(hours) {
    if (!advanceExpeditionTransfers) return;
    const arrivals = advanceExpeditionTransfers(hours);
    arrivals.forEach((arrival) => {
      addLog(`${arrival.partyName} reached ${arrival.destinationName}.`, "ok");
    });
  }

  function advanceWorkerCycles(hours) {
    advanceWorkerCyclesForSites({
      workerProgress: state.workerProgress,
      jobs: state.tavern.jobs,
      workSites: workSites(),
      hours,
      productionMultiplier: workerProductionMultiplier(state),
      applyOutput: (output, site) => {
        applyRewards(output);
        logMessage(workerDeliveryMessage(site.name, formatReward(output)));
      }
    });
  }

  function produceDailyResources(report) {
    const result = applyDailyProduction({ state });
    if (applyDailySettlementUpkeep) {
      const upkeep = applyDailySettlementUpkeep(state);
      if (report || upkeep.comfortMissing > 0 || upkeep.wageMissing > 0) {
        logMessage(settlementUpkeepMessage(upkeep));
      }
    }
    refreshTavernVisitors?.();
    unlockExpeditionRoutesForDay(state).forEach((route) => {
      logMessage({
        text: `new expedition available: ${route.name}`,
        type: "ok"
      });
    });
    result.repeatedPartyIds.forEach((partyId) => ensureRepeatedPlanQueued(partyId));
  }

  function advanceWorkshop(hours) {
    if (!advanceWorkshopProduction || !advanceWorkshopResearch) return;
    const events = advanceWorkshopProduction(state, hours);
    events.forEach((event) => {
      if (event.type === "crafted") {
        logMessage(workshopCraftedMessage(event, formatReward(event.output)));
      }
      if (event.type === "blocked") {
        logMessage(workshopBlockedMessage(event));
      }
    });
    const research = advanceWorkshopResearch(state, hours);
    if (research.pointsGained > 0) {
      logMessage(workshopResearchMessage(research.pointsGained));
    }
  }

  function advanceTime(hours, report) {
    const rollovers = advanceGameHours({
      state,
      hours,
      onBeforeHour: () => {
        advanceWorkerCycles(1);
        advanceWorkshop(1);
        advanceOperations(1);
        advanceTransfers(1);
      },
      onDayRollover: () => produceDailyResources(report),
      advanceClock
    });
    if (report) {
      logMessage(timeAdvancedMessage(hours));
    }
    autoTimeRuntime.markTick(state);
    if (report) {
      render();
    } else {
      renderTimeTick(state.activeTab, autoTimeRuntime.currentVisualHourFraction(state), {
        dayRolledOver: rollovers.length > 0
      });
    }
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

    enableAutoTime() {
      const result = autoTimeRuntime.start(state, () => advanceTime(1, false));
      if (result === "started") {
        logMessage(autoTimeToggleMessage(result));
      }
      render();
      return result;
    },

    currentVisualHourFraction() {
      return autoTimeRuntime.currentVisualHourFraction(state);
    }
  };
}
