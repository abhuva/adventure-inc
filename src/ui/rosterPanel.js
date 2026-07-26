import { rosterCardsHtml } from "./rosterView.js";

export function renderRosterPanel({
  el,
  state,
  roster = state.roster,
  atlas,
  heroStats,
  characterState,
  onFocusHero
}) {
  const minimized = state.rosterView === "minimized";
  el.rosterRows.classList.toggle("minimized", minimized);
  el.rosterRows.innerHTML = rosterCardsHtml({
    roster,
    focusedHeroId: state.focusedHeroId,
    minimized,
    heroStats,
    characterState,
    atlas
  });
  el.rosterRows.onclick = (event) => {
    const button = event.target.closest?.("[data-focus]");
    if (!button || !el.rosterRows.contains?.(button)) return;
    onFocusHero(button.dataset.focus);
  };
}
