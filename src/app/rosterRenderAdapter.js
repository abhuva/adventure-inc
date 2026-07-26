import { renderPopulationJobs } from "../ui/populationView.js";
import { renderPartyPanel } from "../ui/partyPanel.js";
import { renderRosterPanel } from "../ui/rosterPanel.js";
import {
  portraitHtml,
  portraitStyle
} from "../ui/rosterView.js";
import { renderVisitorQueue } from "../ui/tavernView.js";
import { localHeroes, localParties } from "../game/continent/continentState.js";
import { createHeroFromVisitor } from "../game/roster/rosterCommands.js";
import { tavernVisitorsForDay } from "../game/roster/visitorQueue.js";

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
  onCraft,
  onLearnSkill,
  onAdjustWorker,
  onAdjustWage,
  onSetWorkshopRecipe,
  onSetWorkshopAutoInputs,
  onSpendWorkshopUpgradePoint,
  onSelectTavernVisitor,
  onFocusHero
}) {
  function renderPortrait(hero, sizeClass) {
    return portraitHtml(hero, sizeClass, atlas);
  }

  function renderPortraitStyle(spriteIndex) {
    return portraitStyle(spriteIndex, atlas);
  }

  function renderVisitors() {
    const visibleVisitors = tavernVisitorsForDay(state, visitors);
    const recruitedIds = new Set(state.roster.map((hero) => hero.id));
    const availableVisitors = visibleVisitors.filter((visitor) => !recruitedIds.has(visitor.id)).slice(0, 3);
    const selectedVisitor = availableVisitors.find((visitor) => visitor.id === state.selectedTavernVisitorId)
      || availableVisitors[0]
      || null;
    state.selectedTavernVisitorId = selectedVisitor?.id || null;
    const selectedHero = selectedVisitor ? createHeroFromVisitor(selectedVisitor) : null;
    renderVisitorQueue(el, {
      documentRef,
      state,
      blueprints,
      visitors: visibleVisitors,
      roster: state.roster,
      tavern: state.tavern,
      selectedVisitorId: state.selectedTavernVisitorId,
      visitor: selectedVisitor,
      hero: selectedHero,
      stats: selectedHero ? heroStats(selectedHero) : null,
      atlas,
      activeTab: state.activeTavernDetailTab || "info",
      availableSkillTreeIds,
      skillTrees,
      skills,
      skillRank,
      canLearnSkill: () => ({ ok: false, reason: "hire first" }),
      portraitHtml: renderPortrait
    }, {
      onRecruit,
      onSelectVisitorInfo: onSelectTavernVisitor
    });
  }

  function renderJobs() {
    renderPopulationJobs(el, {
      state,
      tavern: state.tavern,
      workSites: workSites(),
      blueprints
    }, {
      onAdjustWorker,
      onAdjustWage,
      onSetWorkshopRecipe,
      onSetWorkshopAutoInputs,
      onSpendWorkshopUpgradePoint
    });
  }

  function renderParties() {
    populatePartySelect();
    renderPartyPanel({
      documentRef,
      el,
      state,
      parties: localParties(state),
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
      onCraft,
      onLearnSkill
    });
  }

  function renderRoster() {
    renderRosterPanel({
      el,
      state,
      roster: localHeroes(state),
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
