const TEMPLE_LOOT_RESOURCE_MAP = {
  loot_hide: "hide",
  loot_ore: "ore",
  loot_wood: "wood",
  loot_coin: "coin"
};

export function canPay(resources, cost = {}) {
  return Object.entries(cost).every(([key, value]) => (resources[key] || 0) >= value);
}

export function payCost(resources, cost = {}) {
  Object.entries(cost).forEach(([key, value]) => {
    resources[key] = (resources[key] || 0) - value;
  });
  return resources;
}

export function applyRewards(state, rewards = {}) {
  Object.entries(rewards).forEach(([key, value]) => {
    if (key === "xp" || key === "blueprint") return;
    if (key === "fame") {
      state.tavern.fame += value;
      return;
    }
    state.resources[key] = (state.resources[key] || 0) + value;
  });
  return state;
}

export function templeLootFromBonuses(bonuses = {}) {
  const loot = {};
  Object.entries(TEMPLE_LOOT_RESOURCE_MAP).forEach(([bonusKey, resourceKey]) => {
    if (bonuses[bonusKey] > 0) {
      loot[resourceKey] = bonuses[bonusKey];
    }
  });
  return loot;
}
