import { renderPopulationJobs } from "../ui/populationView.js";
import { renderPartyPanel } from "../ui/partyPanel.js";
import { renderRosterPanel } from "../ui/rosterPanel.js";
import {
  portraitHtml,
  portraitStyle
} from "../ui/rosterView.js";
import { renderVisitorQueue } from "../ui/tavernView.js";

export function createRosterRenderAdapter({
  state,
  el,
  documentRef,
  atlas,
  visitors,
  blueprints,
  workSites,
  focusedHero,
  selectedParty,
  heroStats,
  partyStats,
  currentOperationPhase,
  characterState,
  heroName,
  availableSkillTreeIds,
  skillTrees,
  skills,
  skillRank,
  canLearnSkill,
  populatePartySelect,
  onRecruit,
  onSelectParty,
  onCancelParty,
  onTogglePartyMember,
  onAddFocusedToParty,
  onLearnSkill,
  onFocusHero
}) {
  function renderPortrait(hero, sizeClass) {
    return portraitHtml(hero, sizeClass, atlas);
  }

  function renderPortraitStyle(spriteIndex) {
    return portraitStyle(spriteIndex, atlas);
  }

  function renderVisitors() {
    renderVisitorQueue(el, {
      visitors,
      roster: state.roster,
      portraitHtml: renderPortrait
    }, onRecruit);
  }

  function renderJobs() {
    renderPopulationJobs(el, {
      tavern: state.tavern,
      workSites: workSites(),
      blueprints
    });
  }

  function renderParties() {
    populatePartySelect();
    renderPartyPanel({
      documentRef,
      el,
      state,
      atlas,
      blueprints,
      focusedHero,
      selectedParty,
      heroStats,
      partyStats,
      currentOperationPhase,
      characterState,
      heroName,
      availableSkillTreeIds,
      skillTrees,
      skills,
      skillRank,
      canLearnSkill,
      onSelectParty,
      onCancelParty,
      onTogglePartyMember,
      onAddFocusedToParty,
      onLearnSkill
    });
  }

  function renderRoster() {
    renderRosterPanel({
      el,
      state,
      atlas,
      heroStats,
      characterState,
      onFocusHero
    });
  }

  return {
    atlasConfig: () => atlas,
    portraitStyle: renderPortraitStyle,
    renderJobs,
    renderParties,
    renderPortrait,
    renderRoster,
    renderVisitors
  };
}
