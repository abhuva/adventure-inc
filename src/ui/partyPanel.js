import {
  focusedCharacterHtml,
  partyRowsHtml,
  skillTreeHtml
} from "./rosterView.js";
import { setRosterDetailTabActive } from "./tabRuntime.js";

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
  onCraft,
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
  el.partyRows.onclick = (event) => {
    const cancelButton = event.target.closest?.("[data-cancel-party]");
    if (cancelButton && el.partyRows.contains?.(cancelButton)) {
      onCancelParty(cancelButton.dataset.cancelParty);
      return;
    }
    const memberButton = event.target.closest?.("[data-toggle-member]");
    if (memberButton && el.partyRows.contains?.(memberButton)) {
      onTogglePartyMember(memberButton.dataset.partyId, memberButton.dataset.toggleMember);
      return;
    }
    const partyCell = event.target.closest?.("[data-select-party]");
    if (partyCell && el.partyRows.contains?.(partyCell)) {
      onSelectParty(partyCell.dataset.selectParty);
    }
  };

  const hero = focusedHero();
  const stats = heroStats(hero);
  const status = characterState(hero.id);
  const treeIds = availableSkillTreeIds(hero).slice(0, 2);
  const skillTreePanelsHtml = ["skill1", "skill2"].map((panelId, index) => {
    const treeId = treeIds[index];
    const content = treeId
      ? skillTreeHtml({
        hero,
        treeId,
        skillTrees,
        skills,
        skillRank,
        canLearnSkill
      })
      : `<div class="empty-state">no ${index === 0 ? "first" : "second"} skill tree</div>`;
    return `
      <div class="local-tab-panel ${state.activeRosterDetailTab === panelId ? "active" : ""}" data-roster-detail-panel="${panelId}">
        <div class="skill-tree-panel">${content}</div>
      </div>
    `;
  }).join("");
  el.focusedCharacterBox.innerHTML = focusedCharacterHtml({
    hero,
    stats,
    status,
    currentParty: selectedParty(),
    blueprints,
    atlas,
    activeTab: state.activeRosterDetailTab || "info",
    skillTreePanelsHtml
  });
  if (documentRef.querySelectorAll) {
    setRosterDetailTabActive(documentRef, state.activeRosterDetailTab || "info");
  }
  el.focusedCharacterBox.onclick = (event) => {
    const addButton = event.target.closest?.("#addFocusedToPartyBtn");
    if (addButton && el.focusedCharacterBox.contains?.(addButton)) {
      onAddFocusedToParty();
      return;
    }
    const craftButton = event.target.closest?.("[data-craft-focused]");
    if (craftButton && el.focusedCharacterBox.contains?.(craftButton)) {
      onCraft?.(craftButton.dataset.craftFocused);
      return;
    }
    const skillButton = event.target.closest?.("[data-learn-skill]");
    if (skillButton && el.focusedCharacterBox.contains?.(skillButton)) {
      onLearnSkill(hero.id, skillButton.dataset.learnSkill);
    }
  };
}
