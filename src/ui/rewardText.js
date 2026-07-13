export function formatReward(reward = {}, blueprints = {}) {
  return Object.entries(reward).map(([key, value]) => {
    if (key === "blueprint") return `blueprint:${blueprints[value]?.name || value}`;
    return `${value} ${key}`;
  }).join(", ") || "none";
}
