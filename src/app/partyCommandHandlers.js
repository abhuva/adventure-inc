import {
  partyAddBlockedMessage,
  partyAlreadyHasHeroMessage,
  partyEditBlockedMessage,
  partyHeroAssignedMessage,
  partyMemberRemovedMessage,
  addPartyResultMessage,
  cancelPartyActionResultMessage
} from "./commandMessages.js";
import {
  addHeroToParty,
  addParty,
  cancelPartyAction,
  removePartyMember,
  selectParty
} from "../game/party/partyCommands.js";

export function createPartyCommandHandlers({
  state,
  addLog,
  render,
  populatePartySelect,
  selectedParty,
  characterState,
  heroName
}) {
  return {
    addParty() {
      const result = addParty(state);
      const message = addPartyResultMessage(result);
      if (!message) return;
      populatePartySelect();
      addLog(message.text, message.type);
      render();
    },

    selectParty(partyId) {
      const result = selectParty(state, partyId);
      if (!result.ok) return;
      populatePartySelect();
      render();
    },

    cancelPartyAction(partyId) {
      const result = cancelPartyAction(state, partyId);
      const message = cancelPartyActionResultMessage(result);
      if (!message) return;
      addLog(message.text, message.type);
      render();
    },

    togglePartyMember(partyId, heroId) {
      const status = characterState(heroId);
      if (status.state !== "Idle") {
        const message = partyEditBlockedMessage(heroName(heroId), status.state);
        addLog(message.text, message.type);
        render();
        return;
      }
      const party = state.parties.find((item) => item.id === partyId);
      if (!party) return;
      if (party.memberIds.includes(heroId)) {
        removePartyMember(state, partyId, heroId);
        const message = partyMemberRemovedMessage(heroName(heroId), party.name);
        addLog(message.text, message.type);
      }
      render();
    },

    addFocusedHeroToCurrentParty(heroId = state.focusedHeroId) {
      const party = selectedParty();
      const hero = state.roster.find((item) => item.id === heroId);
      if (!hero || !party) return;
      const status = characterState(hero.id);
      if (status.state !== "Idle") {
        const message = partyAddBlockedMessage(hero.name, status.state);
        addLog(message.text, message.type);
        render();
        return;
      }
      if (party.memberIds.includes(hero.id)) {
        const message = partyAlreadyHasHeroMessage(hero.name, party.name);
        addLog(message.text, message.type);
        render();
        return;
      }
      const result = addHeroToParty(state, party.id, hero.id);
      if (!result.ok) return;
      const message = partyHeroAssignedMessage(hero.name, party.name);
      addLog(message.text, message.type);
      render();
    }
  };
}
