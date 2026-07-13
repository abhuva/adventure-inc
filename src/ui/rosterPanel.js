import { rosterCardsHtml } from "./rosterView.js";

export function renderRosterPanel({
  el,
  state,
  atlas,
  heroStats,
  characterState,
  onFocusHero
}) {
  const minimized = state.rosterView === "minimized";
  el.rosterRows.classList.toggle("minimized", minimized);
  el.rosterRows.innerHTML = rosterCardsHtml({
    roster: state.roster,
    focusedHeroId: state.focusedHeroId,
    minimized,
    heroStats,
    characterState,
    atlas
  });
  el.rosterRows.querySelectorAll("[data-focus]").forEach((button) => {
    button.addEventListener("click", () => onFocusHero(button.dataset.focus));
  });
}
