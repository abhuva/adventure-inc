import {
  availableSkillTreeIds as availableSkillTreeIdsForHero,
  canLearnSkill as canLearnSkillForHero,
  skillRank as skillRankForHero
} from "../game/roster/skillProgression.js";

export function createAppSelectionFacade({
  appQueries,
  skills,
  skillTrees
}) {
  return {
    selectedDungeon() {
      return appQueries.selectedDungeon();
    },
    dungeons() {
      return appQueries.dungeons();
    },
    workSites() {
      return appQueries.workSites();
    },
    tavernCoord() {
      return appQueries.tavernCoord();
    },
    focusedHero() {
      return appQueries.focusedHero();
    },
    selectedParty() {
      return appQueries.selectedParty();
    },
    partyMembers(party = appQueries.selectedParty()) {
      return appQueries.partyMembers(party);
    },
    partyStats(party = appQueries.selectedParty()) {
      return appQueries.partyStats(party);
    },
    partyAssignmentReadiness(party = appQueries.selectedParty()) {
      return appQueries.partyAssignmentReadiness(party);
    },
    isPartyFullyHealed(party = appQueries.selectedParty()) {
      return appQueries.isPartyFullyHealed(party);
    },
    mapLocations() {
      return appQueries.mapLocations();
    },
    selectedLocation() {
      return appQueries.selectedLocation();
    },
    operationTotalHours(operation) {
      return appQueries.operationTotalHours(operation);
    },
    currentOperationPhase(operation, hourFraction = 0) {
      return appQueries.currentOperationPhase(operation, hourFraction);
    },
    heroName(heroId) {
      return appQueries.heroName(heroId);
    },
    partyForHero(heroId) {
      return appQueries.partyForHero(heroId);
    },
    characterState(heroId) {
      return appQueries.characterState(heroId);
    },
    availableSkillTreeIds(hero) {
      return availableSkillTreeIdsForHero(hero, skillTrees);
    },
    skillRank(hero, skillId) {
      return skillRankForHero(hero, skillId);
    },
    canLearnSkill(hero, skillId) {
      return canLearnSkillForHero(hero, skillId, { skills, skillTrees });
    }
  };
}
