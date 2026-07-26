import {
  assignWorkerResultMessage,
  adjustWorkerResultMessage,
  adjustWageResultMessage,
  buildHousesResultMessage,
  craftResultMessage,
  focusHeroResultMessage,
  recruitResultMessage,
  upgradeTavernResultMessage,
  workshopAutoInputsResultMessage,
  workshopRecipeResultMessage,
  workshopUpgradeResultMessage
} from "./commandMessages.js";
import { craftBlueprint } from "../game/roster/craftingCommands.js";
import {
  focusHero,
  recruitVisitor
} from "../game/roster/rosterCommands.js";
import {
  assignWorker,
  tavernUpgradeCost,
  upgradeTavern
} from "../game/tavern/tavernCommands.js";
import {
  adjustWorkerAssignment,
  adjustSettlementWage,
  buildHouses
} from "../game/settlement/workforceModel.js";
import { EVENT_TRIGGERS } from "../game/events/eventDefinitions.js";
import {
  setWorkshopRecipe,
  setWorkshopAutoInputs,
  spendWorkshopUpgradePoint
} from "../game/workshop/workshopCommands.js";

export function createRosterTavernCommandHandlers({
  state,
  visitors,
  blueprints,
  focusedHero,
  canPay,
  pay,
  addLog,
  render,
  triggerEvent
}) {
  return {
    recruit(visitorId) {
      const result = recruitVisitor(state, visitorId, visitors, { canPay, pay });
      const message = recruitResultMessage(result, state);
      if (!message) return;
      addLog(message.text, message.type);
      if (result.ok) {
        triggerEvent?.(EVENT_TRIGGERS.FIRST_RECRUIT, { renderAfter: false });
      }
      render();
    },

    setFocusedHero(heroId) {
      const result = focusHero(state, heroId);
      const message = focusHeroResultMessage(result);
      if (!message) return;
      addLog(message.text, message.type);
      render();
    },

    selectTavernVisitor(visitorId) {
      if (!visitors.some((visitor) => visitor.id === visitorId)) return;
      state.selectedTavernVisitorId = visitorId;
      state.activeTavernDetailTab = "info";
      render();
    },

    toggleRosterView() {
      state.rosterView = state.rosterView === "detailed" ? "minimized" : "detailed";
      render();
    },

    craft(id) {
      const result = craftBlueprint(state, id, blueprints, focusedHero(), { canPay, pay });
      const message = craftResultMessage(result);
      if (!message) return;
      addLog(message.text, message.type);
      if (result.ok) {
        triggerEvent?.(EVENT_TRIGGERS.FIRST_ITEM_CRAFTED, { renderAfter: false });
      }
      render();
    },

    upgradeTavern() {
      const result = upgradeTavern(state, blueprints, { canPay, pay });
      const message = upgradeTavernResultMessage(result, state, tavernUpgradeCost(state, blueprints));
      addLog(message.text, message.type);
      render();
    },

    assignWorker(job) {
      const result = assignWorker(state, job);
      const message = assignWorkerResultMessage(result, job);
      addLog(message.text, message.type);
      render();
    },

    adjustWorker(job, delta, options = {}) {
      const result = adjustWorkerAssignment(state, job, delta, options);
      const message = adjustWorkerResultMessage(result, job);
      addLog(message.text, message.type);
      render();
    },

    adjustWage(delta) {
      const result = adjustSettlementWage(state, delta);
      const message = adjustWageResultMessage(result);
      addLog(message.text, message.type);
      render();
    },

    buildHouses() {
      const result = buildHouses(state, { canPay, pay });
      const message = buildHousesResultMessage(result);
      addLog(message.text, message.type);
      render();
    },

    setWorkshopRecipe(slotIndex, recipeId) {
      const result = setWorkshopRecipe(state, slotIndex, recipeId);
      const message = workshopRecipeResultMessage(result);
      addLog(message.text, message.type);
      render();
    },

    setWorkshopAutoInputs(slotIndex, enabled) {
      const result = setWorkshopAutoInputs(state, slotIndex, enabled);
      const message = workshopAutoInputsResultMessage(result);
      addLog(message.text, message.type);
      render();
    },

    spendWorkshopUpgradePoint(nodeId) {
      const result = spendWorkshopUpgradePoint(state, nodeId);
      const message = workshopUpgradeResultMessage(result);
      addLog(message.text, message.type);
      render();
    }
  };
}
