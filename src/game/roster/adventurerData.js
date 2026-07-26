const VISITOR_NAMES = [
  "Mira", "Teo", "Brann", "Sana", "Orin", "Kael", "Lysa", "Dorin",
  "Nera", "Voss", "Elia", "Hark", "Iven", "Runa", "Pax", "Talia",
  "Garr", "Mav", "Sel", "Borin", "Nyx", "Arlo", "Keir", "Fenn",
  "Vera", "Tor", "Edda", "Joss", "Mina", "Rook", "Cato", "Lio",
  "Bryn", "Oda", "Ren", "Sable", "Korr", "Anja", "Dax", "Vika",
  "Perrin", "Mael", "Iska", "Galen", "Rhea", "Tovin", "Niko", "Ysra"
];

const VISITOR_ARCHETYPES = [
  { job: "guard", role: "Guard", stats: { hp: 34, atk: 6, def: 2, utility: 0, resolve: 11 } },
  { job: "scout", role: "Scout", stats: { hp: 24, atk: 4, def: 1, utility: 3, resolve: 9 } },
  { job: "smith", role: "Smith", stats: { hp: 30, atk: 5, def: 2, utility: 2, resolve: 10 } },
  { job: "healer", role: "Healer", stats: { hp: 26, atk: 3, def: 1, utility: 5, resolve: 8 } },
  { job: "delver", role: "Delver", stats: { hp: 28, atk: 6, def: 1, utility: 2, resolve: 13 } },
  { job: "warden", role: "Warden", stats: { hp: 38, atk: 4, def: 4, utility: 0, resolve: 12 } },
  { job: "scholar", role: "Scholar", stats: { hp: 22, atk: 3, def: 1, utility: 6, resolve: 7 } },
  { job: "hunter", role: "Hunter", stats: { hp: 30, atk: 7, def: 1, utility: 1, resolve: 10 } }
];

const VISITOR_TIER_SIZES = [2, 5, 5, 10];
const VISITOR_TIER_THRESHOLDS = [0, 100, 500, 1000, 2000, 4000];

export const RACES = ["human", "dwarf", "elf", "half-elf", "demon", "halfling", "orc", "undead"];

function visitorTierForIndex(index) {
  let remaining = index;
  for (let tier = 0; tier < VISITOR_TIER_SIZES.length; tier += 1) {
    if (remaining < VISITOR_TIER_SIZES[tier]) return tier;
    remaining -= VISITOR_TIER_SIZES[tier];
  }
  return VISITOR_TIER_SIZES.length;
}

function visitorFameThreshold(index, tier) {
  const tierStart = VISITOR_TIER_THRESHOLDS[tier] ?? VISITOR_TIER_THRESHOLDS.at(-1);
  const tierEnd = VISITOR_TIER_THRESHOLDS[tier + 1] ?? tierStart + 2000;
  if (tierStart === 0) return 0;
  const spread = Math.max(1, tierEnd - tierStart);
  return tierStart + ((index * 37) % Math.floor(spread * 0.75));
}

export const VISITORS = VISITOR_NAMES.map((name, index) => {
  const archetype = VISITOR_ARCHETYPES[index % VISITOR_ARCHETYPES.length];
  const statTier = Math.floor(index / VISITOR_ARCHETYPES.length);
  const availabilityTier = visitorTierForIndex(index);
  const race = RACES[index % RACES.length];
  return {
    id: name.toLowerCase(),
    name,
    role: archetype.role,
    race,
    primaryJob: archetype.job,
    secondaryJob: null,
    spriteIndex: index + 1,
    availabilityTier,
    fameThreshold: visitorFameThreshold(index, availabilityTier),
    stayDays: 5 + ((index * 7) % 4),
    awayDays: 10 + ((index * 5) % 11),
    cost: { coin: 4 + statTier * 3 + index % 4 },
    stats: {
      hp: archetype.stats.hp + statTier * 2,
      atk: archetype.stats.atk + Math.floor(statTier / 2),
      def: archetype.stats.def + Math.floor(statTier / 3),
      utility: archetype.stats.utility + Math.floor(statTier / 2),
      resolve: archetype.stats.resolve + Math.floor(statTier / 2)
    }
  };
});
