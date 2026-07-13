const VISITOR_NAMES = [
  "Mira", "Teo", "Brann", "Sana", "Orin", "Kael", "Lysa", "Dorin",
  "Nera", "Voss", "Elia", "Hark", "Iven", "Runa", "Pax", "Talia",
  "Garr", "Mav", "Sel", "Borin", "Nyx", "Arlo", "Keir", "Fenn",
  "Vera", "Tor", "Edda", "Joss", "Mina", "Rook", "Cato", "Lio",
  "Bryn", "Oda", "Ren", "Sable", "Korr", "Anja", "Dax", "Vika",
  "Perrin", "Mael", "Iska", "Galen", "Rhea", "Tovin", "Niko", "Ysra"
];

const VISITOR_ARCHETYPES = [
  { job: "guard", role: "Guard", stats: { hp: 34, atk: 6, def: 2, utility: 0 } },
  { job: "scout", role: "Scout", stats: { hp: 24, atk: 4, def: 1, utility: 3 } },
  { job: "smith", role: "Smith", stats: { hp: 30, atk: 5, def: 2, utility: 2 } },
  { job: "healer", role: "Healer", stats: { hp: 26, atk: 3, def: 1, utility: 5 } },
  { job: "delver", role: "Delver", stats: { hp: 28, atk: 6, def: 1, utility: 2 } },
  { job: "warden", role: "Warden", stats: { hp: 38, atk: 4, def: 4, utility: 0 } },
  { job: "scholar", role: "Scholar", stats: { hp: 22, atk: 3, def: 1, utility: 6 } },
  { job: "hunter", role: "Hunter", stats: { hp: 30, atk: 7, def: 1, utility: 1 } }
];

export const RACES = ["human", "dwarf", "elf", "half-elf", "demon", "halfling", "orc", "undead"];

export const VISITORS = VISITOR_NAMES.map((name, index) => {
  const archetype = VISITOR_ARCHETYPES[index % VISITOR_ARCHETYPES.length];
  const tier = Math.floor(index / VISITOR_ARCHETYPES.length);
  const race = RACES[index % RACES.length];
  return {
    id: name.toLowerCase(),
    name,
    role: archetype.role,
    race,
    primaryJob: archetype.job,
    secondaryJob: null,
    spriteIndex: index + 1,
    cost: { coin: 4 + tier * 3 + index % 4 },
    stats: {
      hp: archetype.stats.hp + tier * 2,
      atk: archetype.stats.atk + Math.floor(tier / 2),
      def: archetype.stats.def + Math.floor(tier / 3),
      utility: archetype.stats.utility + Math.floor(tier / 2)
    }
  };
});
