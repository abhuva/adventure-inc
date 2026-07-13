export function formatLabel(value) {
  return String(value || "-").replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatCost(cost = {}) {
  return Object.entries(cost).map(([key, value]) => `${value} ${key}`).join(", ");
}
