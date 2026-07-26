import {
  populateDungeonSelect,
  populatePartySelect,
  populateStopNodes
} from "./selectControls.js";
import { localParties } from "../game/continent/continentState.js";

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
        parties: localParties(state),
        selectedPartyId: state.selectedPartyId
      });
    }
  };
}
