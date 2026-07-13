import {
  renderDungeonSelect,
  renderPartySelect,
  renderStopNodeSelect
} from "../ui/selectView.js";

export function populateDungeonSelect({ el, dungeons, selectedDungeon }) {
  renderDungeonSelect(el.dungeonSelect, dungeons);
  populateStopNodes({ el, dungeon: selectedDungeon() });
}

export function populateStopNodes({ el, dungeon }) {
  renderStopNodeSelect(el.stopNodeSelect, dungeon);
}

export function populatePartySelect({ el, parties, selectedPartyId }) {
  renderPartySelect(el.partySelect, parties, selectedPartyId);
}
