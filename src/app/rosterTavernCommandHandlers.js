import {
  assignWorkerResultMessage,
  craftResultMessage,
  focusHeroResultMessage,
  recruitResultMessage,
  upgradeTavernResultMessage
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

export function createRosterTavernCommandHandlers({
  state,
  visitors,
  blueprints,
  focusedHero,
  canPay,
  pay,
  addLog,
  render
}) {
  return {
    recruit(visitorId) {
      const result = recruitVisitor(state, visitorId, visitors, { canPay, pay });
      const message = recruitResultMessage(result, state);
      if (!message) return;
      addLog(message.text, message.type);
      render();
    },

    setFocusedHero(heroId) {
      const result = focusHero(state, heroId);
      const message = focusHeroResultMessage(result);
      if (!message) return;
      addLog(message.text, message.type);
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
    }
  };
}
