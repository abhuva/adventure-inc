import { interpolateCoord } from "../../core/math.js";

export function workerCoord({
  job,
  site,
  workerProgress,
  jobCounts,
  tavernCoord,
  hourFraction = 0
}) {
  const cycle = site.cycleHours;
  const visualProgress = (workerProgress[job] || 0) + hourFraction * (jobCounts[job] || 0);
  const progress = cycle <= 0 ? 0 : (visualProgress % cycle) / cycle;
  const outbound = progress < 0.35;
  const working = progress >= 0.35 && progress < 0.65;
  if (working) return site.coord;
  if (outbound) return interpolateCoord(tavernCoord, site.coord, progress / 0.35);
  return interpolateCoord(site.coord, tavernCoord, (progress - 0.65) / 0.35);
}
