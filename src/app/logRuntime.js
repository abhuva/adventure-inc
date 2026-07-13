export function addLogEntry(state, text, type = "") {
  state.log.unshift({ text, type, stamp: `d${state.day} ${String(state.hour).padStart(2, "0")}:00` });
  state.log = state.log.slice(0, 80);
}

export function clearLogEntries(state) {
  state.log = [];
}
