import {
  populateDungeonSelect,
  populatePartySelect,
  populateStopNodes
} from "./selectControls.js";

export function createSelectControlAdapter({
  state,
  el,
  dungeons,
  selectedDungeon
}) {
  return {
    populateDungeonSelect() {
      populateDungeonSelect({
        el,
        dungeons: dungeons(),
        selectedDungeon
      });
    },
    populateStopNodes() {
      populateStopNodes({
        el,
        dungeon: selectedDungeon()
      });
    },
    populatePartySelect() {
      populatePartySelect({
        el,
        parties: state.parties,
        selectedPartyId: state.selectedPartyId
      });
    }
  };
}
