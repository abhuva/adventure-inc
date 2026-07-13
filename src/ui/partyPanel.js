import {
  focusedCharacterHtml,
  partyRowsHtml,
  skillTreesHtml
} from "./rosterView.js";

export function renderPartyPanel({
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
}) {
  el.partyRows.innerHTML = partyRowsHtml({
    parties: state.parties,
    selectedPartyId: state.selectedPartyId,
    operations: state.operations,
    partyStats,
    currentOperationPhase,
    characterState,
    heroName
  });
  el.partyRows.querySelectorAll("[data-select-party]").forEach((cell) => {
    cell.addEventListener("click", () => onSelectParty(cell.dataset.selectParty));
  });
  el.partyRows.querySelectorAll("[data-cancel-party]").forEach((button) => {
    button.addEventListener("click", () => onCancelParty(button.dataset.cancelParty));
  });
  el.partyRows.querySelectorAll("[data-toggle-member]").forEach((button) => {
    button.addEventListener("click", () => onTogglePartyMember(button.dataset.partyId, button.dataset.toggleMember));
  });

  const hero = focusedHero();
  const stats = heroStats(hero);
  const status = characterState(hero.id);
  el.focusedCharacterBox.innerHTML = focusedCharacterHtml({
    hero,
    stats,
    status,
    currentParty: selectedParty(),
    blueprints,
    atlas,
    skillTreeHtml: skillTreesHtml({
      hero,
      availableSkillTreeIds,
      skillTrees,
      skills,
      skillRank,
      canLearnSkill
    })
  });
  documentRef.getElementById("addFocusedToPartyBtn")?.addEventListener("click", () => onAddFocusedToParty());
  el.focusedCharacterBox.querySelectorAll("[data-learn-skill]").forEach((button) => {
    button.addEventListener("click", () => onLearnSkill(hero.id, button.dataset.learnSkill));
  });
}
