export function advanceClock(state, hours, onDayRollover = null) {
  const rollovers = [];
  for (let i = 0; i < hours; i += 1) {
    state.hour += 1;
    while (state.hour >= 24) {
      state.hour -= 24;
      state.day += 1;
      const rollover = { day: state.day, hour: state.hour };
      rollovers.push(rollover);
      if (onDayRollover) onDayRollover(rollover);
    }
  }
  return rollovers;
}

export function normalizeClock(state, onDayRollover = null) {
  const rollovers = [];
  while (state.hour >= 24) {
    state.hour -= 24;
    state.day += 1;
    const rollover = { day: state.day, hour: 0 };
    rollovers.push(rollover);
    if (onDayRollover) onDayRollover(rollover);
  }
  return rollovers;
}

export function advanceWorkerCycles({ workerProgress, jobs, workSites, hours, applyOutput, productionMultiplier = 1 }) {
  const deliveries = [];
  const multiplier = Math.max(0, Number(productionMultiplier) || 0);
  workSites.forEach((site) => {
    workerProgress[site.id] = (workerProgress[site.id] || 0) + hours * (jobs[site.id] || 0) * multiplier;
    while (workerProgress[site.id] >= site.cycleHours) {
      workerProgress[site.id] -= site.cycleHours;
      if (applyOutput) applyOutput(site.output, site);
      deliveries.push({ site, output: site.output });
    }
  });
  return deliveries;
}
