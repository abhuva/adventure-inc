import { advanceClock as defaultAdvanceClock } from "./gameClock.js";

export function advanceGameHours({
  state,
  hours,
  onBeforeHour,
  onDayRollover,
  advanceClock = defaultAdvanceClock
}) {
  const rollovers = [];
  for (let i = 0; i < hours; i += 1) {
    if (onBeforeHour) onBeforeHour(i);
    const hourRollovers = advanceClock(state, 1, onDayRollover);
    rollovers.push(...hourRollovers);
  }
  return rollovers;
}
