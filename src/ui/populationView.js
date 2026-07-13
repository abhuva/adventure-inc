import { formatReward } from "./rewardText.js";

export function populationJobRowsHtml({ tavern, workSites, blueprints }) {
  const workRows = workSites.map((site) => `
    <tr><td>${site.name}</td><td>${tavern.jobs[site.id] || 0}</td><td>${formatReward(site.output, blueprints)} / ${site.cycleHours} worker-hours</td></tr>
  `).join("");
  const kitchenFood = 2 + Math.floor(tavern.fame / 3);
  return `${workRows}
    <tr><td>kitchen</td><td>base</td><td>${kitchenFood} food / day</td></tr>
  `;
}

export function renderPopulationJobs(el, options) {
  el.jobRows.innerHTML = populationJobRowsHtml(options);
}
