export function dailyTavernIncome(tavern) {
  return {
    food: 2 + Math.floor((tavern.fame || 0) / 3),
    coin: Math.max(1, Math.floor((tavern.population || 0) / 2))
  };
}

export function applyDailyTavernIncome(state) {
  const income = dailyTavernIncome(state.tavern);
  state.resources.food = (state.resources.food || 0) + income.food;
  state.resources.coin = (state.resources.coin || 0) + income.coin;
  return income;
}

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

export function advanceWorkerCycles({ workerProgress, jobs, workSites, hours, applyOutput }) {
  const deliveries = [];
  workSites.forEach((site) => {
    workerProgress[site.id] = (workerProgress[site.id] || 0) + hours * (jobs[site.id] || 0);
    while (workerProgress[site.id] >= site.cycleHours) {
      workerProgress[site.id] -= site.cycleHours;
      if (applyOutput) applyOutput(site.output, site);
      deliveries.push({ site, output: site.output });
    }
  });
  return deliveries;
}
