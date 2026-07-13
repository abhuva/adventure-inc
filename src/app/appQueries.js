import {
  dungeonsFromPoi,
  mapLocationsFromPoi,
  selectedLocationFromPoi,
  tavernCoordFromPoi,
  workSitesFromPoi
} from "../data/poiSelectors.js";
import {
  characterState,
  focusedHero,
  heroName,
  isPartyFullyHealed,
  partyForHero,
  partyMembers,
  partyStats,
  selectedParty
} from "../game/party/partySelectors.js";
import {
  currentOperationPhase,
  operationTotalHours,
  partyAssignmentReadiness
} from "../game/dungeon/dungeonOperationModel.js";

export function createAppQueries({
  state,
  el,
  getPoiData,
  templeQueries
}) {
  function dungeons() {
    return dungeonsFromPoi(getPoiData());
  }

  function tavernCoord() {
    return tavernCoordFromPoi(getPoiData());
  }

  function currentPhase(operation, hourFraction = 0) {
    return currentOperationPhase(operation, {
      hourFraction,
      queuedCoord: tavernCoord()
    });
  }

  function selectedPartyQuery() {
    return selectedParty(state);
  }

  function isFullyHealed(party = selectedPartyQuery()) {
    return isPartyFullyHealed(state, party);
  }

  return {
    selectedDungeon() {
      return dungeons().find((dungeon) => dungeon.id === el.dungeonSelect.value) || dungeons()[0];
    },
    dungeons,
    workSites() {
      return workSitesFromPoi(getPoiData());
    },
    tavernCoord,
    focusedHero() {
      return focusedHero(state);
    },
    selectedParty: selectedPartyQuery,
    partyMembers(party = selectedPartyQuery()) {
      return partyMembers(state, party);
    },
    partyStats(party = selectedPartyQuery()) {
      return partyStats(state, party, templeQueries.bonuses());
    },
    partyAssignmentReadiness(party = selectedPartyQuery()) {
      return partyAssignmentReadiness({
        party,
        operations: state.operations,
        fullyHealed: isFullyHealed(party),
        phaseForOperation: currentPhase
      });
    },
    isPartyFullyHealed: isFullyHealed,
    mapLocations() {
      return mapLocationsFromPoi(getPoiData());
    },
    selectedLocation() {
      return selectedLocationFromPoi(getPoiData(), state.selectedLocationId);
    },
    operationTotalHours,
    currentOperationPhase: currentPhase,
    heroName(heroId) {
      return heroName(state, heroId);
    },
    partyForHero(heroId) {
      return partyForHero(state, heroId);
    },
    characterState(heroId) {
      return characterState(state, heroId, { currentOperationPhase: currentPhase });
    }
  };
}
