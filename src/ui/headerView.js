export function resourceTitleLine(state) {
  return [
    `coin ${state.resources.coin}`,
    `food ${state.resources.food}`,
    `wood ${state.resources.wood}`,
    `ore ${state.resources.ore}`,
    `hide ${state.resources.hide}`,
    `fame ${state.tavern.fame}`
  ].join(" / ");
}

export function renderHeaderView({ el, state, party, autoTimeButton }) {
  el.dayLabel.textContent = `day ${state.day}`;
  el.phaseLabel.textContent = `phase ${String(state.hour).padStart(2, "0")}:00`;
  el.runStateLabel.textContent = state.timeRunning ? "auto time" : state.lastEstimate ? "plan cached" : "manual";
  if (autoTimeButton) {
    autoTimeButton.textContent = `auto time: ${state.timeRunning ? "on" : "off"}`;
  }
  el.tavernStatus.textContent = `capacity ${state.roster.length}/${state.tavern.capacity} / fame ${state.tavern.fame}`;
  el.tavernResourceLine.textContent = resourceTitleLine(state);
  el.partyStatus.textContent = `${state.roster.length} adventurer${state.roster.length === 1 ? "" : "s"} / selected ${party.name} (${party.memberIds.length})`;
  el.toggleRosterViewBtn.textContent = `view: ${state.rosterView}`;
}
