export const TEMPLE_COLORS = [
  { id: "ember", name: "Ember", hex: "#c8794a", x: 50, y: 20 },
  { id: "verdant", name: "Verdant", hex: "#7fc77b", x: 22, y: 72 },
  { id: "azure", name: "Azure", hex: "#70a6d9", x: 78, y: 72 }
];

export const TEMPLE_STONES = {
  triangle: {
    name: "Triangle Stone",
    unlocked: true,
    boardClass: "altar-triangle",
    maxActiveLines: 1,
    modifierText: "Fight color effects +10%",
    modifiers: [{ type: "effect_family_power", family: "fight", multiplier: 1.1 }],
    sockets: [
      { colorId: "ember", x: 50, y: 28.5 },
      { colorId: "verdant", x: 25.2, y: 62.6 },
      { colorId: "azure", x: 74.8, y: 62.6 }
    ],
    links: [["ember", "verdant"], ["verdant", "azure"], ["azure", "ember"]]
  },
  square: {
    name: "Square Stone",
    unlocked: true,
    maxActiveLines: 2,
    modifierText: "Verdant and Azure effects +15%",
    modifiers: [{ type: "color_power", colorId: "verdant", multiplier: 1.15 }, { type: "color_power", colorId: "azure", multiplier: 1.15 }],
    sockets: [
      { colorId: "ember", x: 28, y: 26 },
      { colorId: "verdant", x: 72, y: 26 },
      { colorId: "azure", x: 72, y: 74 },
      { colorId: "ember", socketId: "ember2", x: 28, y: 74, label: "Ember II" }
    ],
    links: [["ember", "verdant"], ["verdant", "azure"], ["azure", "ember2"], ["ember2", "ember"], ["ember", "azure"], ["verdant", "ember2"]]
  },
  hourglass: {
    name: "Hourglass Stone",
    unlocked: true,
    maxActiveLines: 1,
    modifierText: "Loot color effects +20%, fight color effects -10%",
    modifiers: [{ type: "effect_family_power", family: "loot", multiplier: 1.2 }, { type: "effect_family_power", family: "fight", multiplier: 0.9 }],
    sockets: [
      { colorId: "ember", x: 28, y: 20 },
      { colorId: "verdant", x: 72, y: 20 },
      { colorId: "azure", x: 50, y: 50 },
      { colorId: "verdant", socketId: "verdant2", x: 28, y: 80, label: "Verdant II" },
      { colorId: "ember", socketId: "ember2", x: 72, y: 80, label: "Ember II" }
    ],
    links: [["ember", "azure"], ["verdant", "azure"], ["azure", "verdant2"], ["azure", "ember2"], ["ember", "verdant"], ["verdant2", "ember2"]]
  }
};

export const SHARDS = {
  cellarFang: {
    name: "Cellar Fang",
    source: "Rat Cellar visits",
    dungeonId: "cellar",
    dropType: "visit",
    dropEvery: 10,
    xpToMax: 5,
    equipColors: ["ember", "verdant"],
    affectedBy: ["ember", "verdant", "azure"],
    colorEffects: {
      ember: [{ type: "party_atk", min: 1, max: 3 }],
      verdant: [{ type: "loot_hide", min: 1, max: 3 }],
      azure: [{ type: "recovery_reduce", min: 1, max: 2 }]
    }
  },
  broodCrown: {
    name: "Brood Crown",
    source: "Rat Cellar boss clears",
    dungeonId: "cellar",
    dropType: "boss",
    dropEvery: 10,
    xpToMax: 6,
    equipColors: ["ember"],
    affectedBy: ["ember", "azure"],
    colorEffects: {
      ember: [{ type: "party_def", min: 1, max: 3 }],
      azure: [{ type: "loot_coin", min: 2, max: 6 }]
    }
  },
  copperSplinter: {
    name: "Copper Splinter",
    source: "Old Copper Mine visits",
    dungeonId: "mine",
    dropType: "visit",
    dropEvery: 10,
    xpToMax: 5,
    equipColors: ["verdant", "azure"],
    affectedBy: ["verdant", "azure"],
    colorEffects: {
      verdant: [{ type: "loot_ore", min: 1, max: 4 }],
      azure: [{ type: "party_utility", min: 1, max: 2 }]
    }
  },
  wardPrism: {
    name: "Ward Prism",
    source: "Old Copper Mine boss clears",
    dungeonId: "mine",
    dropType: "boss",
    dropEvery: 10,
    xpToMax: 6,
    equipColors: ["azure"],
    affectedBy: ["ember", "azure"],
    colorEffects: {
      ember: [{ type: "party_atk", min: 1, max: 2 }],
      azure: [{ type: "party_def", min: 1, max: 4 }, { type: "recovery_reduce", min: 1, max: 3 }]
    }
  },
  captainGear: {
    name: "Captain Gear",
    source: "Old Barracks boss clears",
    dungeonId: "barracks",
    dropType: "boss",
    dropEvery: 10,
    xpToMax: 8,
    equipColors: ["ember", "verdant", "azure"],
    affectedBy: ["ember", "verdant", "azure"],
    colorEffects: {
      ember: [{ type: "party_atk", min: 2, max: 5 }],
      verdant: [{ type: "loot_wood", min: 2, max: 6 }],
      azure: [{ type: "party_utility", min: 1, max: 4 }, { type: "loot_coin", min: 3, max: 8 }]
    }
  }
};
