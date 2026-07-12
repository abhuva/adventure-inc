"use strict";

const ATLAS_COLUMNS = 7;
const ATLAS_ROWS = 7;
const MAP_WORLD_SIZE = 1024;
const MAP_MIN_ZOOM = 0.35;
const MAP_MAX_ZOOM = 3;
const TEMPLE_INVENTORY_SLOTS = 20;
const REPLAY_DEFAULT_MS = 650;

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

const RACES = ["human", "dwarf", "elf", "half-elf", "demon", "halfling", "orc", "undead"];

const SKILL_TREES = {
  "race.human": {
    name: "Human",
    skillIds: ["race.human.adaptable", "race.human.cross_training", "race.human.logistics"]
  },
  "race.dwarf": {
    name: "Dwarf",
    skillIds: ["race.dwarf.stone_bones", "race.dwarf.ore_sense", "race.dwarf.grit"]
  },
  "race.elf": {
    name: "Elf",
    skillIds: ["race.elf.light_step", "race.elf.keen_eye", "race.elf.precision"]
  },
  "race.half-elf": {
    name: "Half-Elf",
    skillIds: ["race.half-elf.bridge", "race.half-elf.field_medic", "race.half-elf.negotiator"]
  },
  "race.demon": {
    name: "Demon",
    skillIds: ["race.demon.burning_blood", "race.demon.hunger", "race.demon.dread"]
  },
  "race.halfling": {
    name: "Halfling",
    skillIds: ["race.halfling.light_pack", "race.halfling.forager", "race.halfling.slip"]
  },
  "race.orc": {
    name: "Orc",
    skillIds: ["race.orc.brute_force", "race.orc.thick_hide", "race.orc.war_cry"]
  },
  "race.undead": {
    name: "Undead",
    skillIds: ["race.undead.no_appetite", "race.undead.bone_frame", "race.undead.cold_focus"]
  },
  "job.guard": {
    name: "Guard",
    skillIds: ["job.guard.steady_stance", "job.guard.shield_wall", "job.guard.intercept"]
  },
  "job.scout": {
    name: "Scout",
    skillIds: ["job.scout.pathfinder", "job.scout.trap_read", "job.scout.forward_camp"]
  },
  "job.smith": {
    name: "Smith",
    skillIds: ["job.smith.field_repair", "job.smith.ore_sorting", "job.smith.hardened_edges"]
  },
  "job.healer": {
    name: "Healer",
    skillIds: ["job.healer.first_aid", "job.healer.clean_recovery", "job.healer.triage"]
  },
  "job.delver": {
    name: "Delver",
    skillIds: ["job.delver.dungeon_pace", "job.delver.hazard_sense", "job.delver.clean_finish"]
  },
  "job.warden": {
    name: "Warden",
    skillIds: ["job.warden.anchor", "job.warden.guardian_aura", "job.warden.lockdown"]
  },
  "job.scholar": {
    name: "Scholar",
    skillIds: ["job.scholar.field_notes", "job.scholar.blueprint_reading", "job.scholar.pattern_logic"]
  },
  "job.hunter": {
    name: "Hunter",
    skillIds: ["job.hunter.tracker", "job.hunter.clean_shot", "job.hunter.field_dressing"]
  }
};

const SKILLS = {
  "race.human.adaptable": skill("Adaptable", "utility", 3, [], [{ type: "utility_add", valuePerRank: 1 }]),
  "race.human.cross_training": skill("Cross Training", "utility", 1, ["race.human.adaptable"], [{ type: "skill_point_bonus", valuePerRank: 1 }]),
  "race.human.logistics": skill("Logistics", "resource", 2, ["race.human.adaptable"], [{ type: "food_cost_reduce", valuePerRank: 1 }]),
  "race.dwarf.stone_bones": skill("Stone Bones", "fight", 3, [], [{ type: "def_add", valuePerRank: 1 }]),
  "race.dwarf.ore_sense": skill("Ore Sense", "resource", 2, ["race.dwarf.stone_bones"], [{ type: "utility_add", valuePerRank: 1 }]),
  "race.dwarf.grit": skill("Grit", "fight", 2, ["race.dwarf.stone_bones"], [{ type: "hp_add", valuePerRank: 4 }]),
  "race.elf.light_step": skill("Light Step", "utility", 3, [], [{ type: "travel_speed_add", valuePerRank: 1 }]),
  "race.elf.keen_eye": skill("Keen Eye", "utility", 2, ["race.elf.light_step"], [{ type: "utility_add", valuePerRank: 1 }]),
  "race.elf.precision": skill("Precision", "fight", 2, ["race.elf.keen_eye"], [{ type: "atk_add", valuePerRank: 1 }]),
  "race.half-elf.bridge": skill("Bridge", "utility", 3, [], [{ type: "utility_add", valuePerRank: 1 }]),
  "race.half-elf.field_medic": skill("Field Medic", "utility", 2, ["race.half-elf.bridge"], [{ type: "recovery_reduce", valuePerRank: 1 }]),
  "race.half-elf.negotiator": skill("Negotiator", "resource", 2, ["race.half-elf.bridge"], [{ type: "hire_discount", valuePerRank: 1 }]),
  "race.demon.burning_blood": skill("Burning Blood", "fight", 3, [], [{ type: "atk_add", valuePerRank: 2 }]),
  "race.demon.hunger": skill("Hunger", "resource", 1, ["race.demon.burning_blood"], [{ type: "food_cost_add", valuePerRank: 1 }]),
  "race.demon.dread": skill("Dread", "fight", 2, ["race.demon.burning_blood"], [{ type: "def_add", valuePerRank: 1 }]),
  "race.halfling.light_pack": skill("Light Pack", "resource", 3, [], [{ type: "food_cost_reduce", valuePerRank: 1 }]),
  "race.halfling.forager": skill("Forager", "resource", 2, ["race.halfling.light_pack"], [{ type: "utility_add", valuePerRank: 1 }]),
  "race.halfling.slip": skill("Slip", "fight", 2, ["race.halfling.light_pack"], [{ type: "def_add", valuePerRank: 1 }]),
  "race.orc.brute_force": skill("Brute Force", "fight", 3, [], [{ type: "atk_add", valuePerRank: 2 }]),
  "race.orc.thick_hide": skill("Thick Hide", "fight", 2, ["race.orc.brute_force"], [{ type: "hp_add", valuePerRank: 5 }]),
  "race.orc.war_cry": skill("War Cry", "fight", 1, ["race.orc.brute_force"], [{ type: "atk_add", valuePerRank: 2 }]),
  "race.undead.no_appetite": skill("No Appetite", "resource", 1, [], [{ type: "food_cost_reduce", valuePerRank: 2 }]),
  "race.undead.bone_frame": skill("Bone Frame", "fight", 2, ["race.undead.no_appetite"], [{ type: "def_add", valuePerRank: 1 }]),
  "race.undead.cold_focus": skill("Cold Focus", "utility", 2, ["race.undead.no_appetite"], [{ type: "utility_add", valuePerRank: 1 }]),
  "job.guard.steady_stance": skill("Steady Stance", "fight", 3, [], [{ type: "hp_add", valuePerRank: 4 }]),
  "job.guard.shield_wall": skill("Shield Wall", "fight", 3, ["job.guard.steady_stance"], [{ type: "def_add", valuePerRank: 1 }]),
  "job.guard.intercept": skill("Intercept", "fight", 1, ["job.guard.shield_wall"], [{ type: "def_add", valuePerRank: 2 }]),
  "job.scout.pathfinder": skill("Pathfinder", "utility", 3, [], [{ type: "travel_speed_add", valuePerRank: 1 }]),
  "job.scout.trap_read": skill("Trap Read", "utility", 2, ["job.scout.pathfinder"], [{ type: "utility_add", valuePerRank: 2 }]),
  "job.scout.forward_camp": skill("Forward Camp", "resource", 1, ["job.scout.pathfinder"], [{ type: "food_cost_reduce", valuePerRank: 1 }]),
  "job.smith.field_repair": skill("Field Repair", "utility", 3, [], [{ type: "recovery_reduce", valuePerRank: 1 }]),
  "job.smith.ore_sorting": skill("Ore Sorting", "resource", 2, ["job.smith.field_repair"], [{ type: "utility_add", valuePerRank: 1 }]),
  "job.smith.hardened_edges": skill("Hardened Edges", "fight", 2, ["job.smith.field_repair"], [{ type: "atk_add", valuePerRank: 1 }]),
  "job.healer.first_aid": skill("First Aid", "utility", 3, [], [{ type: "recovery_reduce", valuePerRank: 1 }]),
  "job.healer.clean_recovery": skill("Clean Recovery", "utility", 2, ["job.healer.first_aid"], [{ type: "hp_add", valuePerRank: 3 }]),
  "job.healer.triage": skill("Triage", "fight", 1, ["job.healer.first_aid"], [{ type: "def_add", valuePerRank: 1 }]),
  "job.delver.dungeon_pace": skill("Dungeon Pace", "utility", 3, [], [{ type: "travel_speed_add", valuePerRank: 1 }]),
  "job.delver.hazard_sense": skill("Hazard Sense", "utility", 2, ["job.delver.dungeon_pace"], [{ type: "utility_add", valuePerRank: 1 }]),
  "job.delver.clean_finish": skill("Clean Finish", "fight", 2, ["job.delver.dungeon_pace"], [{ type: "atk_add", valuePerRank: 1 }]),
  "job.warden.anchor": skill("Anchor", "fight", 3, [], [{ type: "def_add", valuePerRank: 1 }]),
  "job.warden.guardian_aura": skill("Guardian Aura", "fight", 2, ["job.warden.anchor"], [{ type: "hp_add", valuePerRank: 4 }]),
  "job.warden.lockdown": skill("Lockdown", "fight", 1, ["job.warden.guardian_aura"], [{ type: "def_add", valuePerRank: 2 }]),
  "job.scholar.field_notes": skill("Field Notes", "utility", 3, [], [{ type: "utility_add", valuePerRank: 2 }]),
  "job.scholar.blueprint_reading": skill("Blueprint Reading", "resource", 2, ["job.scholar.field_notes"], [{ type: "recovery_reduce", valuePerRank: 1 }]),
  "job.scholar.pattern_logic": skill("Pattern Logic", "fight", 1, ["job.scholar.field_notes"], [{ type: "atk_add", valuePerRank: 1 }]),
  "job.hunter.tracker": skill("Tracker", "utility", 3, [], [{ type: "utility_add", valuePerRank: 1 }]),
  "job.hunter.clean_shot": skill("Clean Shot", "fight", 2, ["job.hunter.tracker"], [{ type: "atk_add", valuePerRank: 2 }]),
  "job.hunter.field_dressing": skill("Field Dressing", "resource", 2, ["job.hunter.tracker"], [{ type: "food_cost_reduce", valuePerRank: 1 }])
};

function skill(name, category, maxRank, requires, effects) {
  return { name, category, maxRank, requires, effects };
}

const VISITORS = VISITOR_NAMES.map((name, index) => {
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

const BLUEPRINTS = {
  ironBlade: {
    name: "Iron Blade",
    source: "cellar boss",
    cost: { ore: 8, wood: 2 },
    effect: "active hero +3 atk"
  },
  wardCharm: {
    name: "Ward Charm",
    source: "mine ward",
    cost: { hide: 4, ore: 4 },
    effect: "active hero +2 def"
  },
  bunkRoom: {
    name: "Bunk Room",
    source: "old barracks",
    cost: { wood: 16, ore: 4 },
    effect: "tavern capacity +2"
  }
};

const TEMPLE_COLORS = [
  { id: "ember", name: "Ember", hex: "#c8794a", x: 50, y: 20 },
  { id: "verdant", name: "Verdant", hex: "#7fc77b", x: 22, y: 72 },
  { id: "azure", name: "Azure", hex: "#70a6d9", x: 78, y: 72 }
];

const TEMPLE_STONES = {
  triangle: {
    name: "Triangle Stone",
    unlocked: true,
    maxActiveLines: 1,
    modifierText: "Fight color effects +10%",
    modifiers: [{ type: "effect_family_power", family: "fight", multiplier: 1.1 }],
    sockets: [
      { colorId: "ember", x: 50, y: 20 },
      { colorId: "verdant", x: 22, y: 72 },
      { colorId: "azure", x: 78, y: 72 }
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

const SHARDS = {
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

let poiData = null;
let autoTimer = null;

const state = {
  day: 1,
  hour: 0,
  timeRunning: false,
  tavern: {
    capacity: 3,
    fame: 0,
    population: 2,
    jobs: { wood: 1, ore: 1 }
  },
  resources: {
    coin: 10,
    food: 6,
    wood: 8,
    ore: 4,
    hide: 0
  },
  roster: [
    {
      id: "ada",
      name: "Ada",
      role: "Founder",
      level: 1,
      xp: 0,
      skillPoints: 2,
      race: "human",
      primaryJob: "guard",
      secondaryJob: null,
      learnedSkills: {},
      base: { hp: 42, atk: 7, def: 2, utility: 1 },
      hp: 42,
      spriteIndex: 0,
      gear: []
    }
  ],
  focusedHeroId: "ada",
  selectedPartyId: "party-1",
  rosterView: "detailed",
  parties: [
    { id: "party-1", name: "Alpha", memberIds: ["ada"] }
  ],
  blueprints: {},
  crafted: {},
  dungeonReplay: {
    events: [],
    cursor: 0,
    playing: false,
    playbackMs: REPLAY_DEFAULT_MS,
    timer: null
  },
  temple: {
    activeStoneId: "triangle",
    selectedShardId: "cellarFang",
    shardInventory: { cellarFang: { xp: 1 } },
    stones: {
      triangle: {
        slots: { ember: "cellarFang", verdant: null, azure: null },
        activeLines: [{ a: "ember", b: "verdant" }],
        inventorySlots: Array(TEMPLE_INVENTORY_SLOTS).fill(null)
      },
      square: {
        slots: { ember: null, verdant: null, azure: null, ember2: null },
        activeLines: [],
        inventorySlots: Array(TEMPLE_INVENTORY_SLOTS).fill(null)
      },
      hourglass: {
        slots: { ember: null, verdant: null, azure: null, verdant2: null, ember2: null },
        activeLines: [],
        inventorySlots: Array(TEMPLE_INVENTORY_SLOTS).fill(null)
      }
    },
    dungeonVisits: {},
    bossVisits: {}
  },
  lastEstimate: null,
  repeatedPlans: {},
  activeTab: "map",
  selectedLocationId: "tavern",
  mapView: {
    panX: 24,
    panY: 24,
    zoom: 0.65,
    dragging: false,
    dragStartX: 0,
    dragStartY: 0,
    dragPanX: 0,
    dragPanY: 0
  },
  operations: [],
  workerProgress: { wood: 0, ore: 0 },
  visual: {
    lastTickAt: 0,
    tickMs: 750
  },
  log: []
};

const el = {};

document.addEventListener("DOMContentLoaded", async () => {
  bindElements();
  setupControls();
  try {
    poiData = await loadPoiData();
  } catch (error) {
    addLog(`POI data load failed: ${error.message}`, "bad");
    renderLog();
    throw error;
  }
  populateDungeonSelect();
  populatePartySelect();
  addLog("system ready: deterministic prototype loaded", "ok");
  render();
  startMapAnimationLoop();
});

async function loadPoiData() {
  const response = await fetch("assets/data/poi.json");
  if (!response.ok) {
    throw new Error(`assets/data/poi.json ${response.status}`);
  }
  const data = await response.json();
  validatePoiData(data);
  return data;
}

function validatePoiData(data) {
  if (!data || !data.tavern || !Array.isArray(data.workSites) || !Array.isArray(data.dungeons)) {
    throw new Error("invalid POI data shape");
  }
  if (!data.tavern.coord || typeof data.tavern.coord.x !== "number" || typeof data.tavern.coord.y !== "number") {
    throw new Error("invalid tavern coordinate");
  }
}

function bindElements() {
  [
    "dayLabel",
    "phaseLabel",
    "runStateLabel",
    "mapStatus",
    "overlandMap",
    "locationDetail",
    "operationRows",
    "poiRows",
    "tavernStatus",
    "tavernResourceLine",
    "visitorRows",
    "jobRows",
    "rosterRows",
    "partyRows",
    "focusedCharacterBox",
    "partyStatus",
    "toggleRosterViewBtn",
    "partySelect",
    "dungeonSelect",
    "strategySelect",
    "stopNodeSelect",
    "repeatSelect",
    "nodeMap",
    "estimateBox",
    "replayStatus",
    "replayPartyActors",
    "replayEnemyActors",
    "replayActionIcon",
    "replayEventText",
    "replayEventRows",
    "replayTimelineSlider",
    "templeStatus",
    "templeStoneButtons",
    "templeMatrix",
    "templeBuffRows",
    "shardInventoryRows",
    "shardDetailBox",
    "logRows",
    "blueprintRows"
  ].forEach((id) => {
    el[id] = document.getElementById(id);
  });
}

function setupControls() {
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => setTab(button.dataset.tab));
  });
  document.querySelectorAll("[data-map-side-tab]").forEach((button) => {
    button.addEventListener("click", () => setMapSideTab(button.dataset.mapSideTab));
  });
  on("advanceHourBtn", "click", () => advanceTime(1, true));
  on("advanceDayBtn", "click", () => advanceTime(24, true));
  on("advanceTavernDayBtn", "click", () => advanceTime(24, true));
  on("autoTimeBtn", "click", toggleAutoTime);
  on("upgradeTavernBtn", "click", upgradeTavern);
  on("assignWoodBtn", "click", () => assignWorker("wood"));
  on("assignOreBtn", "click", () => assignWorker("ore"));
  on("addPartyBtn", "click", addParty);
  on("craftBladeBtn", "click", () => craft("ironBlade"));
  on("craftWardBtn", "click", () => craft("wardCharm"));
  on("toggleRosterViewBtn", "click", toggleRosterView);
  on("simulateBtn", "click", simulateSelectedRun);
  on("commitBtn", "click", commitLastEstimate);
  on("autoBtn", "click", automateLastEstimate);
  on("replayFirstBtn", "click", () => setReplayCursor(0));
  on("replayPrevBtn", "click", () => setReplayCursor(state.dungeonReplay.cursor - 1));
  on("replayPlayBtn", "click", toggleReplayPlayback);
  on("replayNextBtn", "click", () => setReplayCursor(state.dungeonReplay.cursor + 1));
  on("replayLastBtn", "click", () => setReplayCursor(state.dungeonReplay.events.length - 1));
  on("replaySpeedBtn", "click", cycleReplaySpeed);
  el.replayTimelineSlider.addEventListener("input", () => {
    setReplayCursor(Number(el.replayTimelineSlider.value), true);
  });
  on("clearLogBtn", "click", () => {
    state.log = [];
    render();
  });
  setupMapInteractions();
  el.dungeonSelect.addEventListener("change", () => {
    populateStopNodes();
    state.lastEstimate = null;
    resetDungeonReplay([]);
    render();
  });
  el.partySelect.addEventListener("change", () => {
    state.selectedPartyId = el.partySelect.value;
    state.lastEstimate = null;
    resetDungeonReplay([]);
    render();
  });
}

function setupMapInteractions() {
  el.overlandMap.addEventListener("pointerdown", (event) => {
    if (event.target.closest("[data-location-id]")) return;
    state.mapView.dragging = true;
    state.mapView.dragStartX = event.clientX;
    state.mapView.dragStartY = event.clientY;
    state.mapView.dragPanX = state.mapView.panX;
    state.mapView.dragPanY = state.mapView.panY;
    el.overlandMap.setPointerCapture(event.pointerId);
    el.overlandMap.classList.add("dragging");
  });
  el.overlandMap.addEventListener("pointermove", (event) => {
    if (!state.mapView.dragging) return;
    state.mapView.panX = state.mapView.dragPanX + event.clientX - state.mapView.dragStartX;
    state.mapView.panY = state.mapView.dragPanY + event.clientY - state.mapView.dragStartY;
    applyMapTransform();
  });
  el.overlandMap.addEventListener("pointerup", endMapDrag);
  el.overlandMap.addEventListener("pointercancel", endMapDrag);
  el.overlandMap.addEventListener("wheel", (event) => {
    event.preventDefault();
    zoomMapAt(event.clientX, event.clientY, event.deltaY < 0 ? 1.12 : 0.88);
  }, { passive: false });
}

function endMapDrag(event) {
  if (!state.mapView.dragging) return;
  state.mapView.dragging = false;
  el.overlandMap.classList.remove("dragging");
  if (event.pointerId !== undefined && el.overlandMap.hasPointerCapture(event.pointerId)) {
    el.overlandMap.releasePointerCapture(event.pointerId);
  }
}

function zoomMapAt(clientX, clientY, factor) {
  const rect = el.overlandMap.getBoundingClientRect();
  const before = screenToWorld(clientX - rect.left, clientY - rect.top);
  const nextZoom = clamp(state.mapView.zoom * factor, MAP_MIN_ZOOM, MAP_MAX_ZOOM);
  state.mapView.zoom = nextZoom;
  state.mapView.panX = clientX - rect.left - before.x * nextZoom;
  state.mapView.panY = clientY - rect.top - before.y * nextZoom;
  applyMapTransform();
  renderLocationDetail();
}

function screenToWorld(screenX, screenY) {
  return {
    x: (screenX - state.mapView.panX) / state.mapView.zoom,
    y: (screenY - state.mapView.panY) / state.mapView.zoom
  };
}

function applyMapTransform() {
  const world = document.getElementById("mapWorld");
  if (!world) return;
  world.style.transform = `translate(${state.mapView.panX}px, ${state.mapView.panY}px) scale(${state.mapView.zoom})`;
  el.mapStatus.textContent = mapStatusText();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function on(id, event, handler) {
  document.getElementById(id).addEventListener(event, handler);
}

function setTab(tabId) {
  state.activeTab = tabId;
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabId);
  });
  document.querySelectorAll("[data-tab-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.tabPanel === tabId);
  });
}

function setMapSideTab(tabId) {
  document.querySelectorAll("[data-map-side-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.mapSideTab === tabId);
  });
  document.querySelectorAll("[data-map-side-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.mapSidePanel === tabId);
  });
}

function toggleAutoTime() {
  state.timeRunning = !state.timeRunning;
  if (state.timeRunning) {
    state.visual.lastTickAt = performance.now();
    autoTimer = window.setInterval(() => advanceTime(1, false), 750);
    addLog("auto time enabled: +1 hour per tick", "ok");
  } else {
    stopAutoTime();
    addLog("auto time disabled", "warn");
  }
  render();
}

function stopAutoTime() {
  state.timeRunning = false;
  if (autoTimer) {
    window.clearInterval(autoTimer);
    autoTimer = null;
  }
}

function startMapAnimationLoop() {
  const frame = () => {
    if (state.activeTab === "map" && state.timeRunning) {
      renderMapActors(currentVisualHourFraction());
    }
    window.requestAnimationFrame(frame);
  };
  window.requestAnimationFrame(frame);
}

function currentVisualHourFraction() {
  if (!state.timeRunning || !state.visual.lastTickAt) {
    return 0;
  }
  const elapsed = performance.now() - state.visual.lastTickAt;
  return Math.max(0, Math.min(0.98, elapsed / state.visual.tickMs));
}

function populateDungeonSelect() {
  el.dungeonSelect.innerHTML = dungeons().map((dungeon) => `<option value="${dungeon.id}">${dungeon.name}</option>`).join("");
  populateStopNodes();
}

function populateStopNodes() {
  const dungeon = selectedDungeon();
  el.stopNodeSelect.innerHTML = [
    `<option value="all">full run</option>`,
    ...dungeon.nodes.map((node, index) => `<option value="${index}">${index + 1}: ${node.name}</option>`)
  ].join("");
}

function populatePartySelect() {
  el.partySelect.innerHTML = state.parties.map((party) => `<option value="${party.id}">${party.name}</option>`).join("");
  el.partySelect.value = state.selectedPartyId;
}

function selectedDungeon() {
  return dungeons().find((dungeon) => dungeon.id === el.dungeonSelect.value) || dungeons()[0];
}

function dungeons() {
  return poiData?.dungeons || [];
}

function workSites() {
  return poiData?.workSites || [];
}

function workSiteById(id) {
  return workSites().find((site) => site.id === id);
}

function tavernCoord() {
  return poiData?.tavern?.coord || { x: 0, y: 0 };
}

function focusedHero() {
  return state.roster.find((hero) => hero.id === state.focusedHeroId) || state.roster[0];
}

function selectedParty() {
  return state.parties.find((party) => party.id === state.selectedPartyId) || state.parties[0];
}

function partyMembers(party = selectedParty()) {
  const memberIds = new Set(party.memberIds);
  return state.roster.filter((hero) => memberIds.has(hero.id));
}

function heroStats(hero) {
  const gearAtk = hero.gear.includes("ironBlade") ? 3 : 0;
  const gearDef = hero.gear.includes("wardCharm") ? 2 : 0;
  const effects = heroSkillEffects(hero);
  return {
    hpMax: hero.base.hp + Math.max(0, hero.level - 1) * 4 + effects.hp_add,
    atk: hero.base.atk + hero.level + gearAtk + effects.atk_add,
    def: hero.base.def + gearDef + effects.def_add,
    utility: hero.base.utility + effects.utility_add,
    travelSpeed: effects.travel_speed_add,
    recoveryReduce: effects.recovery_reduce,
    foodCostReduce: effects.food_cost_reduce - effects.food_cost_add
  };
}

function heroSkillEffects(hero) {
  const totals = {
    hp_add: 0,
    atk_add: 0,
    def_add: 0,
    utility_add: 0,
    travel_speed_add: 0,
    recovery_reduce: 0,
    food_cost_reduce: 0,
    food_cost_add: 0,
    hire_discount: 0,
    skill_point_bonus: 0
  };
  Object.entries(hero.learnedSkills || {}).forEach(([skillId, rank]) => {
    const definition = SKILLS[skillId];
    if (!definition || rank <= 0) return;
    definition.effects.forEach((effect) => {
      totals[effect.type] = (totals[effect.type] || 0) + effect.valuePerRank * rank;
    });
  });
  return totals;
}

function partyStats(party = selectedParty()) {
  const members = partyMembers(party);
  const stats = members.reduce((partyTotals, hero) => {
    const heroStat = heroStats(hero);
    partyTotals.hpMax += heroStat.hpMax;
    partyTotals.hpCurrent += Math.min(hero.hp, heroStat.hpMax);
    partyTotals.atk += heroStat.atk;
    partyTotals.def += heroStat.def;
    partyTotals.utility += heroStat.utility;
    partyTotals.travelSpeed += heroStat.travelSpeed;
    partyTotals.recoveryReduce += heroStat.recoveryReduce;
    partyTotals.foodCostReduce += heroStat.foodCostReduce;
    return partyTotals;
  }, { hpMax: 0, hpCurrent: 0, atk: 0, def: 0, utility: 0, travelSpeed: 0, recoveryReduce: 0, foodCostReduce: 0 });
  const temple = templeBonuses();
  stats.atk += temple.party_atk;
  stats.def += temple.party_def;
  stats.utility += temple.party_utility;
  stats.recoveryReduce += temple.recovery_reduce;
  return stats;
}

function activeTempleStoneId() {
  return state.temple.activeStoneId && TEMPLE_STONES[state.temple.activeStoneId] ? state.temple.activeStoneId : "triangle";
}

function activeTempleStoneDefinition() {
  return TEMPLE_STONES[activeTempleStoneId()];
}

function activeTempleStoneState() {
  const stoneId = activeTempleStoneId();
  if (!state.temple.stones) {
    state.temple.stones = {};
  }
  if (!state.temple.stones[stoneId]) {
    state.temple.stones[stoneId] = createTempleStoneState(stoneId);
  }
  normalizeTempleStoneState(stoneId, state.temple.stones[stoneId]);
  return state.temple.stones[stoneId];
}

function createTempleStoneState(stoneId) {
  const definition = TEMPLE_STONES[stoneId];
  const slots = {};
  definition.sockets.forEach((socket) => {
    slots[templeSocketId(socket)] = null;
  });
  return {
    slots,
    activeLines: [],
    inventorySlots: Array(TEMPLE_INVENTORY_SLOTS).fill(null)
  };
}

function normalizeTempleStoneState(stoneId, stoneState) {
  const definition = TEMPLE_STONES[stoneId];
  const validSocketIds = new Set(definition.sockets.map(templeSocketId));
  const nextSlots = {};
  definition.sockets.forEach((socket) => {
    const socketId = templeSocketId(socket);
    nextSlots[socketId] = stoneState.slots?.[socketId] || null;
  });
  stoneState.slots = nextSlots;
  stoneState.activeLines = (stoneState.activeLines || [])
    .filter((line) => validSocketIds.has(line.a) && validSocketIds.has(line.b) && hasTempleLink(definition, line.a, line.b))
    .slice(0, definition.maxActiveLines);
  if (!Array.isArray(stoneState.inventorySlots)) {
    stoneState.inventorySlots = [];
  }
}

function templeSocketId(socket) {
  return socket.socketId || socket.colorId;
}

function templeSocketById(socketId, stone = activeTempleStoneDefinition()) {
  return stone.sockets.find((socket) => templeSocketId(socket) === socketId);
}

function templeSocketColorId(socketId, stone = activeTempleStoneDefinition()) {
  return templeSocketById(socketId, stone)?.colorId || socketId;
}

function hasTempleLink(stone, a, b) {
  return stone.links.some(([linkA, linkB]) => (linkA === a && linkB === b) || (linkA === b && linkB === a));
}

function templeBonuses() {
  const bonuses = {
    party_atk: 0,
    party_def: 0,
    party_utility: 0,
    recovery_reduce: 0,
    loot_hide: 0,
    loot_ore: 0,
    loot_wood: 0,
    loot_coin: 0
  };
  const stone = activeTempleStoneDefinition();
  Object.entries(activeTempleStoneState().slots).forEach(([socketId, shardId]) => {
    const slotColor = templeSocketColorId(socketId, stone);
    const shard = SHARDS[shardId];
    if (!shard || !hasShard(shardId) || !shard.equipColors.includes(slotColor)) return;
    activeInfluenceColors(socketId, shard, stone).forEach((colorId) => {
      applyTempleEffectsToTotals(bonuses, shardId, shard.colorEffects[colorId] || [], colorId);
    });
  });
  applyTempleStoneModifiers(bonuses);
  return bonuses;
}

function activeInfluenceColors(socketId, shard, stone = activeTempleStoneDefinition()) {
  const slotColor = templeSocketColorId(socketId, stone);
  const colors = new Set([slotColor]);
  activeTempleStoneState().activeLines.forEach((line) => {
    if (line.a === socketId) colors.add(templeSocketColorId(line.b, stone));
    if (line.b === socketId) colors.add(templeSocketColorId(line.a, stone));
  });
  return [...colors].filter((colorId) => shard.affectedBy.includes(colorId));
}

function applyTempleEffectsToTotals(totals, shardId, effects = [], colorId = null) {
  effects.forEach((effect) => {
    totals[effect.type] = (totals[effect.type] || 0) + modifiedTempleEffectValue(shardId, effect, colorId);
  });
}

function modifiedTempleEffectValue(shardId, effect, colorId) {
  let value = shardEffectValue(shardId, effect);
  activeTempleStoneDefinition().modifiers.forEach((modifier) => {
    if (modifier.type === "color_power" && modifier.colorId === colorId) {
      value *= modifier.multiplier;
    }
    if (modifier.type === "effect_family_power" && effectFamily(effect.type) === modifier.family) {
      value *= modifier.multiplier;
    }
  });
  return Math.max(0, Math.floor(value));
}

function effectFamily(effectType) {
  if (effectType.startsWith("party_") || effectType === "recovery_reduce") return "fight";
  if (effectType.startsWith("loot_")) return "loot";
  return "utility";
}

function applyTempleStoneModifiers() {
  // Modifiers are applied per color/effect in modifiedTempleEffectValue().
}

function shardEffectValue(shardId, effect) {
  const shard = SHARDS[shardId];
  const xp = state.temple.shardInventory[shardId]?.xp || 0;
  if (!shard || xp <= 0) return 0;
  const capped = Math.min(xp, shard.xpToMax);
  const progress = shard.xpToMax <= 1 ? 1 : (capped - 1) / (shard.xpToMax - 1);
  return Math.floor(effect.min + (effect.max - effect.min) * progress);
}

function hasShard(shardId) {
  return (state.temple.shardInventory[shardId]?.xp || 0) > 0;
}

function availableSkillTreeIds(hero) {
  const treeIds = [`race.${hero.race}`, `job.${hero.primaryJob}`];
  if (hero.secondaryJob) {
    treeIds.push(`job.${hero.secondaryJob}`);
  }
  return treeIds.filter((treeId) => SKILL_TREES[treeId]);
}

function skillRank(hero, skillId) {
  return (hero.learnedSkills && hero.learnedSkills[skillId]) || 0;
}

function canLearnSkill(hero, skillId) {
  const definition = SKILLS[skillId];
  if (!definition) return { ok: false, reason: "missing skill" };
  if (hero.skillPoints <= 0) return { ok: false, reason: "no skill points" };
  if (skillRank(hero, skillId) >= definition.maxRank) return { ok: false, reason: "max rank" };
  if (!availableSkillTreeIds(hero).some((treeId) => SKILL_TREES[treeId].skillIds.includes(skillId))) {
    return { ok: false, reason: "tree unavailable" };
  }
  if (!definition.requires.length || definition.requires.some((requiredId) => skillRank(hero, requiredId) > 0)) {
    return { ok: true, reason: "available" };
  }
  return { ok: false, reason: "requires connected skill" };
}

function learnSkill(heroId, skillId) {
  const hero = state.roster.find((item) => item.id === heroId);
  if (!hero) return;
  const status = characterState(hero.id);
  if (status.state !== "Idle") {
    addLog(`skill blocked: ${hero.name} is ${status.state}`, "warn");
    render();
    return;
  }
  const result = canLearnSkill(hero, skillId);
  if (!result.ok) {
    addLog(`skill blocked: ${hero.name} ${SKILLS[skillId]?.name || skillId}: ${result.reason}`, "warn");
    render();
    return;
  }
  const oldStats = heroStats(hero);
  const wasFullyHealed = hero.hp >= oldStats.hpMax;
  hero.skillPoints -= 1;
  hero.learnedSkills = { ...(hero.learnedSkills || {}) };
  hero.learnedSkills[skillId] = skillRank(hero, skillId) + 1;
  SKILLS[skillId].effects.forEach((effect) => {
    if (effect.type === "skill_point_bonus") {
      hero.skillPoints += effect.valuePerRank;
    }
  });
  const stats = heroStats(hero);
  hero.hp = wasFullyHealed ? stats.hpMax : Math.min(stats.hpMax, hero.hp + 2);
  const party = partyForHero(hero.id);
  if (party && state.repeatedPlans[party.id]) {
    delete state.repeatedPlans[party.id];
    addLog(`repeated plan stopped for ${party.name}; ${hero.name} changed build`, "warn");
  }
  state.lastEstimate = null;
  addLog(`${hero.name} learned ${SKILLS[skillId].name} ${hero.learnedSkills[skillId]}/${SKILLS[skillId].maxRank}`, "ok");
  render();
}

function partyAssignmentReadiness(party = selectedParty()) {
  if (!party) {
    return { canQueue: false, message: "blocked: party no longer exists" };
  }
  if (!party.memberIds.length) {
    return { canQueue: false, message: "blocked: empty party" };
  }
  const activeOperation = state.operations.find((operation) => operation.partyId === party.id);
  if (activeOperation) {
    return { canQueue: true, message: `will queue after ${currentOperationPhase(activeOperation).phase.name}` };
  }
  if (!isPartyFullyHealed(party)) {
    return { canQueue: false, message: "blocked: party must be in town and fully healed" };
  }
  return { canQueue: true, message: "ready in town" };
}

function isPartyFullyHealed(party = selectedParty()) {
  return partyMembers(party).every((hero) => {
    const stats = heroStats(hero);
    return hero.hp >= stats.hpMax;
  });
}

function mapLocations() {
  return [
    { ...poiData.tavern, type: "tavern" },
    ...workSites().map((site) => ({
      ...site,
      type: "work",
      description: site.description || `Worker route. Completes a deterministic delivery every ${site.cycleHours} worker-hours.`
    })),
    ...dungeons().map((dungeon) => ({
      id: dungeon.id,
      name: dungeon.name,
      titleImage: dungeon.titleImage,
      coord: dungeon.coord,
      type: "dungeon",
      dungeon,
      description: dungeon.description || `Dungeon POI. Travel ${dungeon.travelHours}h each way, food cost ${dungeon.foodCost}.`
    }))
  ];
}

function selectedLocation() {
  return mapLocations().find((location) => location.id === state.selectedLocationId) || mapLocations()[0];
}

function simulateSelectedRun() {
  const party = selectedParty();
  const estimate = simulateRun({
    dungeon: selectedDungeon(),
    strategy: el.strategySelect.value,
    stopNode: el.stopNodeSelect.value,
    party
  });
  state.lastEstimate = estimate;
  resetDungeonReplay(estimate.timeline || []);
  addLog(`simulated ${party.name} -> ${estimate.dungeonName}: ${estimate.success ? "success" : "blocked"} at ${estimate.reached}/${estimate.totalNodes} nodes`, estimate.success ? "ok" : "warn");
  render();
}

function simulateRun({ dungeon, strategy, stopNode, party }) {
  const targetLastIndex = stopNode === "all" ? dungeon.nodes.length - 1 : Number(stopNode);
  const stats = partyStats(party);
  const partyActors = createPartyCombatActors(party);
  const timeline = [];
  const result = {
    dungeonId: dungeon.id,
    dungeonName: dungeon.name,
    partyId: party.id,
    partyName: party.name,
    memberIds: [...party.memberIds],
    strategy,
    targetLastIndex,
    totalNodes: targetLastIndex + 1,
    reached: 0,
    success: false,
    hours: adjustedTravelHours(dungeon.travelHours, stats) * 2,
    travelHours: adjustedTravelHours(dungeon.travelHours, stats),
    dungeonHours: 0,
    recoveryHours: 0,
    foodCost: adjustedFoodCost(dungeon.foodCost, stats),
    hpMax: stats.hpMax,
    hpStart: stats.hpCurrent,
    hpEnd: stats.hpCurrent,
    rewards: {},
    transcript: [],
    timeline
  };

  if (state.resources.food < result.foodCost) {
    result.transcript.push(`blocked before departure: needs ${result.foodCost} food`);
    pushReplayEvent(timeline, {
      type: "blocked",
      icon: "!",
      text: `Blocked before departure: needs ${result.foodCost} food.`,
      partyActors,
      enemyActors: []
    });
    return result;
  }
  if (!party.memberIds.length || stats.hpCurrent <= 0) {
    result.transcript.push("blocked before departure: selected party has no ready members");
    pushReplayEvent(timeline, {
      type: "blocked",
      icon: "!",
      text: "Blocked before departure: selected party has no ready members.",
      partyActors,
      enemyActors: []
    });
    return result;
  }

  pushReplayEvent(timeline, {
    type: "start",
    icon: ">>",
    text: `${party.name} enters ${dungeon.name}.`,
    partyActors,
    enemyActors: []
  });

  for (let index = 0; index <= targetLastIndex; index += 1) {
    const node = dungeon.nodes[index];
    const before = partyHpCurrent(partyActors);
    const nodeResult = resolveNode(node, stats, partyActors, strategy, timeline);
    result.hpEnd = partyHpCurrent(partyActors);
    result.hours += nodeResult.hours;
    result.dungeonHours += nodeResult.hours;
    result.transcript.push(`${node.name}: ${nodeResult.summary}`);

    if (!nodeResult.success) {
      result.transcript.push(`run stops: hp ${before} -> ${result.hpEnd}`);
      break;
    }

    result.reached += 1;
    mergeRewards(result.rewards, node.reward);
  }

  result.success = result.reached === result.totalNodes && result.hpEnd > 0;
  const finalRecoveryHours = recoveryHours(result.hpEnd, stats.hpMax, stats);
  result.recoveryHours = finalRecoveryHours;
  result.transcript.push(`return/regenerate: ${result.travelHours}h travel, ${finalRecoveryHours}h recovery`);
  pushReplayEvent(timeline, {
    type: "end",
    icon: result.success ? "OK" : "X",
    text: `${result.success ? "Run solved" : "Run failed"}: ${result.reached}/${result.totalNodes} nodes reached. Return ${result.travelHours}h, recovery ${finalRecoveryHours}h.`,
    partyActors,
    enemyActors: []
  });
  result.hours += finalRecoveryHours;
  return result;
}

function adjustedTravelHours(baseHours, stats) {
  return Math.max(1, baseHours - Math.floor((stats.travelSpeed || 0) / 2));
}

function adjustedFoodCost(baseCost, stats) {
  return Math.max(0, baseCost - (stats.foodCostReduce || 0));
}

function resolveNode(node, stats, partyActors, strategy, timeline) {
  if (node.type === "hazard") {
    const damage = Math.max(0, node.damage - Math.floor(stats.def / 2));
    applyPartyDamage(partyActors, damage);
    const hp = partyHpCurrent(partyActors);
    pushReplayEvent(timeline, {
      type: "hazard",
      icon: "!",
      text: `${node.name}: hazard deals ${damage} party damage.`,
      partyActors,
      enemyActors: []
    });
    return {
      success: hp > 0,
      hp,
      hours: 1,
      summary: `hazard damage ${damage}`
    };
  }

  if (node.type === "check") {
    const success = stats.utility >= node.utility;
    pushReplayEvent(timeline, {
      type: "check",
      icon: success ? "OK" : "X",
      text: `${node.name}: ${success ? "passed" : "failed"} utility check ${stats.utility}/${node.utility}.`,
      partyActors,
      enemyActors: []
    });
    return {
      success,
      hp: partyHpCurrent(partyActors),
      hours: 1,
      summary: success ? `utility check ${stats.utility}/${node.utility}` : `failed utility check ${stats.utility}/${node.utility}`
    };
  }

  return resolveCombat(node, stats, partyActors, strategy, timeline);
}

function resolveCombat(node, stats, partyActors, strategy, timeline) {
  const startHp = partyHpCurrent(partyActors);
  const enemyActors = [createEnemyCombatActor(node)];
  const actors = [...partyActors, ...enemyActors];
  const transcript = [];
  const maxEvents = 80;
  let eventCount = 0;
  let guardUntil = 0;

  pushReplayEvent(timeline, {
    type: "combat_start",
    icon: "VS",
    text: `${node.name}: ${enemyActors[0].name} engages.`,
    partyActors,
    enemyActors
  });

  while (eventCount < maxEvents && livingActors(partyActors).length && livingActors(enemyActors).length) {
    const actor = nextCombatActor(actors);
    if (!actor) break;
    actor.nextActionAt = Math.max(actor.nextActionAt, 0);

    if (actor.team === "party") {
      const action = choosePartyAction(actor, partyActors, enemyActors, strategy, actor.nextActionAt, node);
      if (action.type === "heal") {
        const target = lowestHpActor(partyActors);
        const before = target.hp;
        target.hp = Math.min(target.maxHp, target.hp + action.amount);
        actor.cooldowns[action.id] = actor.nextActionAt + action.cooldown;
        actor.nextActionAt += action.recovery;
        transcript.push(`${actor.name} ${action.name} +${target.hp - before}`);
        pushReplayEvent(timeline, {
          type: "heal",
          icon: "+",
          text: `${actor.name} used ${action.name} on ${target.name} for ${target.hp - before} HP.`,
          partyActors,
          enemyActors,
          actorId: actor.id,
          targetId: target.id
        });
      } else if (action.type === "guard") {
        guardUntil = Math.max(guardUntil, actor.nextActionAt + action.duration);
        actor.cooldowns[action.id] = actor.nextActionAt + action.cooldown;
        actor.nextActionAt += action.recovery;
        transcript.push(`${actor.name} guards`);
        pushReplayEvent(timeline, {
          type: "guard",
          icon: "[]",
          text: `${actor.name} used ${action.name}; next incoming heavy pressure is reduced.`,
          partyActors,
          enemyActors,
          actorId: actor.id
        });
      } else {
        const target = firstLiving(enemyActors);
        const damage = Math.max(1, Math.floor(actor.atk * action.power) - target.def);
        target.hp = Math.max(0, target.hp - damage);
        actor.cooldowns[action.id] = actor.nextActionAt + action.cooldown;
        actor.nextActionAt += action.recovery;
        transcript.push(`${actor.name} ${action.name} ${damage}`);
        pushReplayEvent(timeline, {
          type: "attack",
          icon: "ATK",
          text: `${actor.name} hit ${target.name} with ${action.name} for ${damage} HP.`,
          partyActors,
          enemyActors,
          actorId: actor.id,
          targetId: target.id
        });
      }
    } else {
      const actionName = actor.script[actor.scriptIndex % actor.script.length];
      actor.scriptIndex += 1;
      const target = chooseEnemyTarget(partyActors);
      const guarded = guardUntil >= actor.nextActionAt && actionName === "heavy";
      const incoming = enemyDamage(actor.atk, actionName);
      const damage = Math.max(1, incoming - target.def - (guarded ? 5 : 0));
      target.hp = Math.max(0, target.hp - damage);
      actor.nextActionAt += enemyActionRecovery(actionName, actor.speed);
      transcript.push(`${actor.name} ${actionName} ${damage}`);
      pushReplayEvent(timeline, {
        type: "enemy",
        icon: "DMG",
        text: `${actor.name} used ${formatLabel(actionName)} on ${target.name} for ${damage} HP${guarded ? " (guarded)" : ""}.`,
        partyActors,
        enemyActors,
        actorId: actor.id,
        targetId: target.id
      });
    }
    eventCount += 1;
  }

  const heroHp = partyHpCurrent(partyActors);
  const enemyHp = partyHpCurrent(enemyActors);
  const success = heroHp > 0 && enemyHp <= 0;
  return {
    success,
    hp: heroHp,
    hours: Math.max(1, Math.ceil(eventCount / 4)),
    summary: `${success ? "won" : "lost"}; hp ${startHp}->${heroHp}; ${transcript.join(", ")}`
  };
}

function enemyDamage(atk, action) {
  if (action === "heavy") return atk + 5;
  if (action === "pulse" || action === "shriek") return atk + 2;
  if (action === "brace" || action === "guard") return Math.max(1, atk - 2);
  return atk;
}

function createPartyCombatActors(party) {
  return partyMembers(party).map((hero, index) => {
    const stats = heroStats(hero);
    const initiative = 35 + stats.utility * 5 + stats.travelSpeed * 4 + index;
    const speed = 20 + stats.utility * 3 + stats.travelSpeed * 5;
    return {
      id: hero.id,
      name: hero.name,
      team: "party",
      role: hero.role,
      spriteIndex: hero.spriteIndex ?? 0,
      hp: Math.min(hero.hp, stats.hpMax),
      maxHp: stats.hpMax,
      atk: stats.atk,
      def: stats.def,
      utility: stats.utility,
      initiative,
      speed,
      nextActionAt: Math.max(0, 100 - initiative),
      cooldowns: {},
      order: index
    };
  });
}

function createEnemyCombatActor(node) {
  const enemy = node.enemy;
  const initiative = enemy.initiative ?? 30;
  const speed = enemy.speed ?? 20;
  return {
    id: `enemy-${node.id}`,
    name: node.name,
    team: "enemy",
    hp: enemy.hp,
    maxHp: enemy.hp,
    atk: enemy.atk,
    def: enemy.def || 0,
    initiative,
    speed,
    nextActionAt: Math.max(0, 110 - initiative),
    script: enemy.script?.length ? enemy.script : ["strike"],
    scriptIndex: 0,
    cooldowns: {},
    order: 100
  };
}

function nextCombatActor(actors) {
  return actors
    .filter((actor) => actor.hp > 0)
    .sort((a, b) => a.nextActionAt - b.nextActionAt || b.initiative - a.initiative || teamOrder(a) - teamOrder(b) || a.id.localeCompare(b.id))[0];
}

function teamOrder(actor) {
  return actor.team === "party" ? 0 : 1;
}

function choosePartyAction(actor, partyActors, enemyActors, strategy, now, node) {
  const wounded = lowestHpActor(partyActors);
  if ((strategy === "balanced" || actor.role === "Healer") && wounded && wounded.hp / wounded.maxHp <= 0.45 && isCooldownReady(actor, "field_dress", now)) {
    return {
      id: "field_dress",
      type: "heal",
      name: actor.role === "Healer" ? "Field Mend" : "Field Dress",
      amount: Math.max(5, 6 + Math.floor(actor.utility / 2)),
      recovery: actionRecovery(actor, 120),
      cooldown: 280
    };
  }
  if (strategy === "guarded" && enemyUpcomingHeavy(node, enemyActors[0]) && isCooldownReady(actor, "guard", now)) {
    return {
      id: "guard",
      type: "guard",
      name: "Guard Stance",
      recovery: actionRecovery(actor, 80),
      cooldown: 240,
      duration: 180
    };
  }
  if (strategy === "burst" && isCooldownReady(actor, "power_strike", now)) {
    return {
      id: "power_strike",
      type: "attack",
      name: actor.role === "Hunter" ? "Clean Shot" : "Smashing Hands",
      power: 1.55,
      recovery: actionRecovery(actor, 145),
      cooldown: 220
    };
  }
  return {
    id: "basic_attack",
    type: "attack",
    name: actor.role === "Scout" ? "Quick Cut" : "Strike",
    power: 1,
    recovery: actionRecovery(actor, 100),
    cooldown: 0
  };
}

function enemyUpcomingHeavy(node, enemyActor) {
  if (!enemyActor || !node.enemy.script?.length) return false;
  return node.enemy.script[enemyActor.scriptIndex % node.enemy.script.length] === "heavy";
}

function isCooldownReady(actor, skillId, now) {
  return !actor.cooldowns[skillId] || actor.cooldowns[skillId] <= now;
}

function actionRecovery(actor, baseRecovery) {
  return Math.max(35, baseRecovery - actor.speed);
}

function enemyActionRecovery(actionName, speed) {
  const base = actionName === "heavy" ? 150 : actionName === "guard" || actionName === "brace" ? 120 : 100;
  return Math.max(40, base - speed);
}

function livingActors(actors) {
  return actors.filter((actor) => actor.hp > 0);
}

function firstLiving(actors) {
  return livingActors(actors)[0];
}

function lowestHpActor(actors) {
  return livingActors(actors)
    .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp || a.order - b.order || a.id.localeCompare(b.id))[0];
}

function chooseEnemyTarget(partyActors) {
  return livingActors(partyActors)
    .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp || b.atk - a.atk || a.order - b.order)[0];
}

function partyHpCurrent(actors) {
  return actors.reduce((sum, actor) => sum + Math.max(0, actor.hp), 0);
}

function applyPartyDamage(partyActors, damage) {
  let remaining = damage;
  const targets = livingActors(partyActors).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp || a.order - b.order);
  for (const target of targets) {
    if (remaining <= 0) break;
    const dealt = Math.min(target.hp, remaining);
    target.hp -= dealt;
    remaining -= dealt;
  }
}

function pushReplayEvent(timeline, event) {
  timeline.push({
    time: timeline.length ? timeline[timeline.length - 1].time + 1 : 0,
    type: event.type,
    icon: event.icon,
    text: event.text,
    actorId: event.actorId || null,
    targetId: event.targetId || null,
    partyActors: snapshotCombatActors(event.partyActors || []),
    enemyActors: snapshotCombatActors(event.enemyActors || [])
  });
}

function snapshotCombatActors(actors) {
  return actors.map((actor) => ({
    id: actor.id,
    name: actor.name,
    team: actor.team,
    role: actor.role || "",
    spriteIndex: actor.spriteIndex ?? null,
    hp: Math.max(0, actor.hp),
    maxHp: actor.maxHp,
    atk: actor.atk,
    def: actor.def,
    initiative: actor.initiative,
    speed: actor.speed
  }));
}

function recoveryHours(hp, maxHp, stats = null) {
  const base = Math.max(1, Math.ceil((maxHp - Math.max(0, hp)) / 8));
  return Math.max(1, base - Math.max(0, stats?.recoveryReduce || 0));
}

function commitLastEstimate() {
  if (!state.lastEstimate) {
    simulateSelectedRun();
  }
  if (!state.lastEstimate) return;
  scheduleEstimate(state.lastEstimate, false);
  render();
}

function automateLastEstimate() {
  if (!state.lastEstimate) {
    addLog("automation blocked: simulate a plan first", "warn");
    render();
    return;
  }
  if (el.repeatSelect.value !== "repeat") {
    addLog("automation blocked: repeat plan is manual only", "warn");
    render();
    return;
  }
  const partyId = state.lastEstimate.partyId;
  if (state.repeatedPlans[partyId]) {
    delete state.repeatedPlans[partyId];
    addLog(`repeated plan disabled for ${state.lastEstimate.partyName}`, "warn");
  } else {
    state.repeatedPlans[partyId] = cloneEstimate(state.lastEstimate);
    addLog(`repeated plan enabled for ${state.lastEstimate.partyName}`, "ok");
    ensureRepeatedPlanQueued(partyId);
  }
  render();
}

function ensureRepeatedPlanQueued(partyId) {
  const estimate = state.repeatedPlans[partyId];
  if (!estimate) return;
  if (state.operations.some((operation) => operation.partyId === partyId)) return;
  const party = state.parties.find((item) => item.id === partyId);
  const readiness = partyAssignmentReadiness(party);
  if (!readiness.canQueue) {
    addLog(`repeated plan paused for ${estimate.partyName}: ${readiness.message}`, "warn");
    return;
  }
  if (state.resources.food < estimate.foodCost) {
    addLog(`repeated plan paused for ${estimate.partyName}: waiting for food ${state.resources.food}/${estimate.foodCost}`, "warn");
    return;
  }
  const queued = scheduleEstimate(estimate, true);
  if (!queued) {
    addLog(`repeated plan paused for ${estimate.partyName}: queue rejected`, "warn");
  }
}

function scheduleEstimate(estimate, automated) {
  if (!estimate.memberIds.length) {
    addLog(`${automated ? "automation" : "commit"} blocked: selected party is empty`, "warn");
    return false;
  }
  const party = state.parties.find((item) => item.id === estimate.partyId) || selectedParty();
  const readiness = partyAssignmentReadiness(party);
  if (!readiness.canQueue) {
    addLog(`${automated ? "automation" : "commit"} blocked: ${readiness.message}`, "warn");
    return false;
  }
  if (state.resources.food < estimate.foodCost) {
    addLog(`${automated ? "automation" : "commit"} blocked: insufficient food`, "warn");
    return false;
  }
  const dungeon = dungeons().find((item) => item.id === estimate.dungeonId);
  if (!automated && state.repeatedPlans[party.id]) {
    delete state.repeatedPlans[party.id];
    addLog(`repeated plan stopped for ${party.name}; new assignment queued`, "warn");
  }
  const travelHours = estimate.travelHours || dungeon.travelHours;
  const dungeonHours = estimate.dungeonHours || Math.max(1, estimate.hours - travelHours * 2 - (estimate.recoveryHours || 1));
  const recoveryPhaseHours = estimate.recoveryHours || 1;
  const operation = {
    id: `op-${Date.now()}-${state.operations.length}`,
    type: "party",
    label: `${estimate.partyName}: ${estimate.dungeonName}`,
    partyId: party.id,
    memberIds: [...estimate.memberIds],
    estimate: cloneEstimate(estimate),
    elapsed: -queuedPartyHours(party.id),
    phases: [
      { name: "outbound", hours: travelHours, from: tavernCoord(), to: dungeon.coord },
      { name: "dungeon", hours: dungeonHours, from: dungeon.coord, to: dungeon.coord },
      { name: "return", hours: travelHours, from: dungeon.coord, to: tavernCoord() },
      { name: "regenerate", hours: recoveryPhaseHours, from: tavernCoord(), to: tavernCoord() }
    ]
  };
  state.resources.food -= estimate.foodCost;
  state.operations.push(operation);
  addLog(`${automated ? "automation queued" : "run queued"}: ${operation.label}, food -${estimate.foodCost}`, "ok");
  return true;
}

function cloneEstimate(estimate) {
  return {
    ...estimate,
    rewards: { ...estimate.rewards },
    transcript: [...estimate.transcript],
    timeline: estimate.timeline ? estimate.timeline.map((event) => ({
      ...event,
      partyActors: event.partyActors.map((actor) => ({ ...actor })),
      enemyActors: event.enemyActors.map((actor) => ({ ...actor }))
    })) : []
  };
}

function queuedPartyHours(partyId) {
  return state.operations
    .filter((operation) => operation.partyId === partyId)
    .reduce((sum, operation) => sum + Math.max(0, operationTotalHours(operation) - operation.elapsed), 0);
}

function completeEstimate(operation) {
  const estimate = operation.estimate;
  const members = state.roster.filter((hero) => operation.memberIds.includes(hero.id));

  applyRewards(estimate.rewards);
  members.forEach((hero) => {
    const stats = heroStats(hero);
    hero.hp = stats.hpMax;
    if (estimate.rewards.xp) {
      gainXp(hero, estimate.rewards.xp);
    }
  });
  if (estimate.rewards.blueprint) {
    state.blueprints[estimate.rewards.blueprint] = true;
  }
  const templeLoot = templeLootBonus();
  if (Object.keys(templeLoot).length) {
    applyRewards(templeLoot);
    addLog(`temple resonance added ${formatReward(templeLoot)}`, "ok");
  }
  recordShardProgress(estimate);
  addLog(`${operation.label} returned; rewards ${formatReward(estimate.rewards)}`, "ok");
}

function templeLootBonus() {
  const bonuses = templeBonuses();
  const loot = {};
  [
    ["loot_hide", "hide"],
    ["loot_ore", "ore"],
    ["loot_wood", "wood"],
    ["loot_coin", "coin"]
  ].forEach(([bonusKey, resourceKey]) => {
    if (bonuses[bonusKey] > 0) {
      loot[resourceKey] = bonuses[bonusKey];
    }
  });
  return loot;
}

function recordShardProgress(estimate) {
  state.temple.dungeonVisits[estimate.dungeonId] = (state.temple.dungeonVisits[estimate.dungeonId] || 0) + 1;
  awardDueShards(estimate.dungeonId, "visit", state.temple.dungeonVisits[estimate.dungeonId]);
  if (estimate.success) {
    state.temple.bossVisits[estimate.dungeonId] = (state.temple.bossVisits[estimate.dungeonId] || 0) + 1;
    awardDueShards(estimate.dungeonId, "boss", state.temple.bossVisits[estimate.dungeonId]);
  }
}

function awardDueShards(dungeonId, dropType, counter) {
  Object.entries(SHARDS).forEach(([shardId, shard]) => {
    if (shard.dungeonId !== dungeonId || shard.dropType !== dropType) return;
    if (counter % shard.dropEvery !== 0) return;
    addShardXp(shardId, 1);
  });
}

function addShardXp(shardId, amount) {
  const shard = SHARDS[shardId];
  if (!shard) return;
  const current = state.temple.shardInventory[shardId]?.xp || 0;
  state.temple.shardInventory[shardId] = { xp: current + amount };
  if (current <= 0 && !isShardSocketed(shardId)) {
    placeShardInFirstFreeInventorySlot(shardId);
  }
  state.temple.selectedShardId = shardId;
  addLog(`${current > 0 ? "duplicate shard absorbed" : "new shard found"}: ${shard.name} xp ${current + amount}/${shard.xpToMax}`, "ok");
}

function advanceTime(hours, report) {
  for (let i = 0; i < hours; i += 1) {
    state.hour += 1;
    advanceWorkerCycles(1);
    advanceOperations(1);
    while (state.hour >= 24) {
      state.hour -= 24;
      state.day += 1;
      produceDailyResources(report);
    }
  }
  if (report) {
    addLog(`time advanced ${hours}h`, "ok");
  }
  state.visual.lastTickAt = performance.now();
  render();
}

function advanceOperations(hours) {
  const remaining = [];
  const completedPartyIds = [];
  state.operations.forEach((operation) => {
    operation.elapsed += hours;
    if (operation.elapsed >= operationTotalHours(operation)) {
      completeEstimate(operation);
      completedPartyIds.push(operation.partyId);
    } else {
      remaining.push(operation);
    }
  });
  state.operations = remaining;
  completedPartyIds.forEach((partyId) => ensureRepeatedPlanQueued(partyId));
}

function advanceWorkerCycles(hours) {
  workSites().forEach((site) => {
    state.workerProgress[site.id] = (state.workerProgress[site.id] || 0) + hours * (state.tavern.jobs[site.id] || 0);
    while (state.workerProgress[site.id] >= site.cycleHours) {
      state.workerProgress[site.id] -= site.cycleHours;
      applyRewards(site.output);
      addLog(`${site.name} delivery complete: ${formatReward(site.output)}`, "ok");
    }
  });
}

function operationTotalHours(operation) {
  return operation.phases.reduce((sum, phase) => sum + phase.hours, 0);
}

function currentOperationPhase(operation, hourFraction = 0) {
  const visualElapsed = Math.min(operationTotalHours(operation), operation.elapsed + hourFraction);
  if (visualElapsed < 0) {
    return {
      phase: { name: "queued", hours: Math.abs(visualElapsed), from: tavernCoord(), to: tavernCoord() },
      progress: 0,
      remaining: operationTotalHours(operation) - visualElapsed
    };
  }
  let cursor = 0;
  for (const phase of operation.phases) {
    const next = cursor + phase.hours;
    if (visualElapsed < next) {
      const phaseProgress = phase.hours <= 0 ? 1 : (visualElapsed - cursor) / phase.hours;
      return { phase, progress: Math.max(0, Math.min(1, phaseProgress)), remaining: operationTotalHours(operation) - visualElapsed };
    }
    cursor = next;
  }
  return { phase: operation.phases[operation.phases.length - 1], progress: 1, remaining: 0 };
}

function interpolateCoord(from, to, t) {
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t
  };
}

function normalizeTime() {
  while (state.hour >= 24) {
    state.hour -= 24;
    state.day += 1;
    produceDailyResources(false);
  }
}

function gainXp(hero, xp) {
  hero.xp += xp;
  while (hero.xp >= hero.level * 8) {
    hero.xp -= hero.level * 8;
    hero.level += 1;
    hero.skillPoints += 1;
    const stats = heroStats(hero);
    hero.hp = stats.hpMax;
    addLog(`${hero.name} reached level ${hero.level}; skill point available`, "ok");
  }
}

function advanceDay() {
  state.day += 1;
  state.hour = 0;
  produceDailyResources(true);
  const visitor = nextVisitor();
  if (visitor) {
    addLog(`new visitor queued: ${visitor.name} (${visitor.role})`, "ok");
  }
  render();
}

function produceDailyResources(report) {
  const food = 2 + Math.floor(state.tavern.fame / 3);
  state.resources.food += food;
  state.resources.coin += Math.max(1, Math.floor(state.tavern.population / 2));
  if (report) {
    addLog(`daily tavern income: +${food} food, +${Math.max(1, Math.floor(state.tavern.population / 2))} coin`, "ok");
  }
  ensureAllRepeatedPlansQueued();
}

function ensureAllRepeatedPlansQueued() {
  Object.keys(state.repeatedPlans).forEach((partyId) => ensureRepeatedPlanQueued(partyId));
}

function nextVisitor() {
  const recruitedIds = new Set(state.roster.map((hero) => hero.id));
  return VISITORS.find((visitor) => !recruitedIds.has(visitor.id));
}

function recruit(visitorId) {
  const visitor = VISITORS.find((item) => item.id === visitorId);
  if (!visitor) return;
  if (state.roster.length >= state.tavern.capacity) {
    addLog(`recruit blocked: tavern capacity ${state.tavern.capacity}`, "warn");
    render();
    return;
  }
  if (!canPay(visitor.cost)) {
    addLog(`recruit blocked: ${visitor.name} needs ${formatCost(visitor.cost)}`, "warn");
    render();
    return;
  }
  pay(visitor.cost);
  state.roster.push({
    id: visitor.id,
    name: visitor.name,
    role: visitor.role,
    level: 1,
    xp: 0,
    skillPoints: 1,
    race: visitor.race,
    primaryJob: visitor.primaryJob,
    secondaryJob: visitor.secondaryJob,
    learnedSkills: {},
    base: visitor.stats,
    hp: visitor.stats.hp,
    spriteIndex: visitor.spriteIndex,
    gear: []
  });
  addLog(`recruited ${visitor.name}; roster experimentation expanded`, "ok");
  render();
}

function setFocusedHero(heroId) {
  state.focusedHeroId = heroId;
  state.lastEstimate = null;
  addLog(`focused character set to ${focusedHero().name}`, "ok");
  render();
}

function toggleRosterView() {
  state.rosterView = state.rosterView === "detailed" ? "minimized" : "detailed";
  render();
}

function craft(id) {
  const blueprint = BLUEPRINTS[id];
  const hero = focusedHero();
  if (!state.blueprints[id]) {
    addLog(`craft blocked: blueprint ${blueprint.name} not discovered`, "warn");
    render();
    return;
  }
  if (!canPay(blueprint.cost)) {
    addLog(`craft blocked: ${blueprint.name} needs ${formatCost(blueprint.cost)}`, "warn");
    render();
    return;
  }
  if (hero.gear.includes(id)) {
    addLog(`craft skipped: ${hero.name} already has ${blueprint.name}`, "warn");
    render();
    return;
  }
  pay(blueprint.cost);
  hero.gear.push(id);
  state.crafted[id] = (state.crafted[id] || 0) + 1;
  state.lastEstimate = null;
  addLog(`crafted ${blueprint.name} for ${hero.name}`, "ok");
  render();
}

function upgradeTavern() {
  const cost = state.blueprints.bunkRoom ? BLUEPRINTS.bunkRoom.cost : { wood: 10, ore: 4 };
  if (!canPay(cost)) {
    addLog(`upgrade blocked: needs ${formatCost(cost)}`, "warn");
    render();
    return;
  }
  pay(cost);
  state.tavern.capacity += state.blueprints.bunkRoom ? 2 : 1;
  state.tavern.population += 1;
  addLog(`tavern upgraded: capacity ${state.tavern.capacity}, population ${state.tavern.population}`, "ok");
  render();
}

function assignWorker(job) {
  const other = job === "wood" ? "ore" : "wood";
  if (state.tavern.jobs[other] <= 0) {
    addLog(`assignment blocked: no ${other} worker to move`, "warn");
    render();
    return;
  }
  state.tavern.jobs[other] -= 1;
  state.tavern.jobs[job] += 1;
  addLog(`worker moved from ${other} to ${job}`, "ok");
  render();
}

function addParty() {
  const index = state.parties.length + 1;
  const party = {
    id: `party-${index}`,
    name: `Party ${index}`,
    memberIds: []
  };
  state.parties.push(party);
  state.selectedPartyId = party.id;
  populatePartySelect();
  addLog(`${party.name} formed`, "ok");
  render();
}

function selectParty(partyId) {
  state.selectedPartyId = partyId;
  state.lastEstimate = null;
  populatePartySelect();
  render();
}

function cancelPartyAction(partyId) {
  const party = state.parties.find((item) => item.id === partyId);
  if (!party) return;
  const removedOperations = state.operations.filter((operation) => operation.partyId === partyId).length;
  state.operations = state.operations.filter((operation) => operation.partyId !== partyId);
  const hadRepeatedPlan = Boolean(state.repeatedPlans[partyId]);
  delete state.repeatedPlans[partyId];
  party.memberIds.forEach((heroId) => {
    const hero = state.roster.find((item) => item.id === heroId);
    if (!hero) return;
    hero.hp = heroStats(hero).hpMax;
  });
  addLog(`${party.name} canceled: returned to town idle${removedOperations || hadRepeatedPlan ? "" : " (no active action)"}`, "warn");
  state.lastEstimate = null;
  render();
}

function togglePartyMember(partyId, heroId) {
  const status = characterState(heroId);
  if (status.state !== "Idle") {
    addLog(`party edit blocked: ${heroName(heroId)} is ${status.state}`, "warn");
    render();
    return;
  }
  const party = state.parties.find((item) => item.id === partyId);
  if (!party) return;
  if (party.memberIds.includes(heroId)) {
    party.memberIds = party.memberIds.filter((id) => id !== heroId);
    addLog(`${heroName(heroId)} removed from ${party.name}`, "warn");
  }
  state.lastEstimate = null;
  render();
}

function addFocusedHeroToCurrentParty(heroId = state.focusedHeroId) {
  const hero = state.roster.find((item) => item.id === heroId);
  const party = selectedParty();
  if (!hero || !party) return;
  const status = characterState(hero.id);
  if (status.state !== "Idle") {
    addLog(`party add blocked: ${hero.name} is ${status.state}`, "warn");
    render();
    return;
  }
  if (party.memberIds.includes(hero.id)) {
    addLog(`${hero.name} is already in ${party.name}`, "warn");
    render();
    return;
  }
  state.parties.forEach((item) => {
    item.memberIds = item.memberIds.filter((id) => id !== hero.id);
  });
  party.memberIds.push(hero.id);
  state.lastEstimate = null;
  addLog(`${hero.name} assigned to ${party.name}`, "ok");
  render();
}

function heroName(heroId) {
  return state.roster.find((hero) => hero.id === heroId)?.name || heroId;
}

function partyForHero(heroId) {
  return state.parties.find((party) => party.memberIds.includes(heroId));
}

function characterState(heroId) {
  const operation = state.operations.find((item) => item.memberIds.includes(heroId));
  if (!operation) {
    return { state: "Idle", party: partyForHero(heroId)?.name || "-" };
  }
  const phase = currentOperationPhase(operation).phase.name;
  const stateByPhase = {
    queued: "Queued",
    outbound: "Walking to dungeon",
    dungeon: "Fighting",
    return: "Walking home",
    regenerate: "Recovering"
  };
  return { state: stateByPhase[phase] || phase, party: operation.label };
}

function canPay(cost) {
  return Object.entries(cost).every(([key, value]) => (state.resources[key] || 0) >= value);
}

function pay(cost) {
  Object.entries(cost).forEach(([key, value]) => {
    state.resources[key] = (state.resources[key] || 0) - value;
  });
}

function mergeRewards(target, rewards = {}) {
  Object.entries(rewards).forEach(([key, value]) => {
    if (key === "blueprint") {
      target.blueprint = value;
      return;
    }
    target[key] = (target[key] || 0) + value;
  });
}

function applyRewards(rewards = {}) {
  Object.entries(rewards).forEach(([key, value]) => {
    if (key === "xp" || key === "blueprint") return;
    if (key === "fame") {
      state.tavern.fame += value;
      return;
    }
    state.resources[key] = (state.resources[key] || 0) + value;
  });
}

function formatCost(cost = {}) {
  return Object.entries(cost).map(([key, value]) => `${value} ${key}`).join(", ");
}

function addLog(text, type = "") {
  state.log.unshift({ text, type, stamp: `d${state.day} ${String(state.hour).padStart(2, "0")}:00` });
  state.log = state.log.slice(0, 80);
}

function render() {
  renderHeader();
  renderMap();
  renderVisitors();
  renderJobs();
  renderParties();
  renderRoster();
  renderDungeon();
  renderTemple();
  renderBlueprints();
  renderLog();
}

function renderHeader() {
  el.dayLabel.textContent = `day ${state.day}`;
  el.phaseLabel.textContent = `phase ${String(state.hour).padStart(2, "0")}:00`;
  el.runStateLabel.textContent = state.timeRunning ? "auto time" : state.lastEstimate ? "plan cached" : "manual";
  document.getElementById("autoTimeBtn").textContent = `auto time: ${state.timeRunning ? "on" : "off"}`;
  el.tavernStatus.textContent = `capacity ${state.roster.length}/${state.tavern.capacity} / fame ${state.tavern.fame}`;
  el.tavernResourceLine.textContent = resourceTitleLine();
  const party = selectedParty();
  el.partyStatus.textContent = `${state.roster.length} adventurer${state.roster.length === 1 ? "" : "s"} / selected ${party.name} (${party.memberIds.length})`;
  el.toggleRosterViewBtn.textContent = `view: ${state.rosterView}`;
}

function resourceTitleLine() {
  return [
    `coin ${state.resources.coin}`,
    `food ${state.resources.food}`,
    `wood ${state.resources.wood}`,
    `ore ${state.resources.ore}`,
    `hide ${state.resources.hide}`,
    `fame ${state.tavern.fame}`
  ].join(" / ");
}

function renderMap() {
  const poi = mapLocations();

  const routeHtml = poi
    .filter((item) => item.id !== "tavern")
    .map((item) => renderRoute(tavernCoord(), item.coord))
    .join("");
  const poiHtml = poi.map((item) => `
    <button class="map-poi ${item.type === "tavern" ? "tavern" : ""} ${item.id === state.selectedLocationId ? "selected" : ""}" data-location-id="${item.id}" style="left:${item.coord.x}px;top:${item.coord.y}px">
      ${item.name}
      <span class="map-label">${item.coord.x},${item.coord.y}</span>
    </button>
  `).join("");
  el.overlandMap.innerHTML = `<div id="mapWorld" class="map-world">${routeHtml}${poiHtml}<div id="mapActors" class="map-actors"></div></div>`;
  el.overlandMap.querySelectorAll("[data-location-id]").forEach((button) => {
    button.addEventListener("click", () => selectLocation(button.dataset.locationId));
  });
  applyMapTransform();
  renderMapActors(currentVisualHourFraction());
  renderLocationDetail();
  el.operationRows.innerHTML = renderOperationRows();
  el.poiRows.innerHTML = poi.filter((item) => item.id !== "tavern").map((item) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.coord.x}</td>
      <td>${item.coord.y}</td>
      <td>${distance(tavernCoord(), item.coord).toFixed(1)}</td>
    </tr>
  `).join("");
}

function mapStatusText() {
  return `${state.operations.length} party op${state.operations.length === 1 ? "" : "s"} / zoom ${state.mapView.zoom.toFixed(2)}x / world ${MAP_WORLD_SIZE}x${MAP_WORLD_SIZE}`;
}

function renderMapActors(hourFraction = 0) {
  const actorLayer = document.getElementById("mapActors");
  if (!actorLayer) return;
  const workerHtml = workSites().map((site) => {
    const count = state.tavern.jobs[site.id] || 0;
    if (count <= 0) return "";
    const coord = workerCoord(site.id, site, hourFraction);
    return `
      <div class="map-actor worker" title="${site.name} workers: ${count}" style="left:${coord.x}px;top:${coord.y}px"></div>
    `;
  }).join("");
  const operationHtml = state.operations.map((operation) => {
    const phaseState = currentOperationPhase(operation, hourFraction);
    const coord = interpolateCoord(phaseState.phase.from, phaseState.phase.to, phaseState.progress);
    const busy = phaseState.phase.from.x === phaseState.phase.to.x && phaseState.phase.from.y === phaseState.phase.to.y;
    return `
      <div class="map-actor party ${busy ? "busy" : ""}" title="${operation.label}: ${phaseState.phase.name}" style="left:${coord.x}px;top:${coord.y}px"></div>
    `;
  }).join("");
  actorLayer.innerHTML = workerHtml + operationHtml;
}

function selectLocation(locationId) {
  state.selectedLocationId = locationId;
  const location = selectedLocation();
  if (location.type === "dungeon") {
    el.dungeonSelect.value = location.id;
    populateStopNodes();
    state.lastEstimate = null;
  }
  render();
}

function renderLocationDetail() {
  const location = selectedLocation();
  const party = selectedParty();
  const partyReady = partyAssignmentReadiness(party);
  const lines = [
    `<div class="detail-title">${location.name}</div>`,
    location.titleImage ? `<img class="poi-title-image" src="${location.titleImage}" alt="${location.name}">` : "",
    `<div class="detail-line">type: ${location.type}</div>`,
    `<div class="detail-line">coord: ${location.coord.x},${location.coord.y}</div>`,
    `<div class="detail-line">distance from tavern: ${distance(tavernCoord(), location.coord).toFixed(1)}</div>`,
    `<div class="detail-line">${location.description}</div>`
  ];

  if (location.type === "work") {
    lines.push(`<div class="detail-line">output: ${formatReward(location.output)}</div>`);
    lines.push(`<div class="detail-line">assigned workers: ${state.tavern.jobs[location.id] || 0}</div>`);
  }

  if (location.type === "dungeon") {
    lines.push(`<div class="detail-line">selected party: ${party.name} (${party.memberIds.map(heroName).join(", ") || "empty"})</div>`);
    lines.push(`<div class="detail-line">party readiness: ${partyReady.message}</div>`);
    lines.push(`<button id="assignSelectedPartyBtn" ${partyReady.canQueue ? "" : "disabled"}>assign repeated route</button>`);
  }

  el.locationDetail.innerHTML = lines.join("");
  const assignButton = document.getElementById("assignSelectedPartyBtn");
  if (assignButton) {
    assignButton.addEventListener("click", assignSelectedPartyToSelectedDungeon);
  }
}

function assignSelectedPartyToSelectedDungeon() {
  const location = selectedLocation();
  if (location.type !== "dungeon") return;
  const party = selectedParty();
  const estimate = simulateRun({
    dungeon: location.dungeon,
    strategy: el.strategySelect.value,
    stopNode: el.stopNodeSelect.value,
    party
  });
  state.lastEstimate = estimate;
  state.repeatedPlans[party.id] = cloneEstimate(estimate);
  addLog(`repeated map assignment set: ${party.name} -> ${estimate.dungeonName}`, "ok");
  ensureRepeatedPlanQueued(party.id);
  render();
}

function renderRoute(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  return `<div class="map-route" style="left:${from.x}px;top:${from.y}px;width:${length}px;transform:rotate(${angle}deg)"></div>`;
}

function workerCoord(job, site, hourFraction = 0) {
  const cycle = site.cycleHours;
  const visualProgress = (state.workerProgress[job] || 0) + hourFraction * (state.tavern.jobs[job] || 0);
  const progress = cycle <= 0 ? 0 : (visualProgress % cycle) / cycle;
  const outbound = progress < 0.35;
  const working = progress >= 0.35 && progress < 0.65;
  const returning = progress >= 0.65;
  if (working) return site.coord;
  if (outbound) return interpolateCoord(tavernCoord(), site.coord, progress / 0.35);
  return interpolateCoord(site.coord, tavernCoord(), (progress - 0.65) / 0.35);
}

function renderOperationRows() {
  const repeatedOnlyRows = Object.values(state.repeatedPlans)
    .filter((estimate) => !state.operations.some((operation) => operation.partyId === estimate.partyId))
    .map((estimate) => `
      <tr>
        <td>${estimate.partyName}: ${estimate.dungeonName}</td>
        <td>repeated paused</td>
        <td>food ${state.resources.food}/${estimate.foodCost}</td>
      </tr>
    `);
  if (!state.operations.length && !repeatedOnlyRows.length) {
    return `<tr><td colspan="3">no party operations queued</td></tr>`;
  }
  const operationRows = state.operations.map((operation) => {
    const phaseState = currentOperationPhase(operation);
    const repeatTag = state.repeatedPlans[operation.partyId] ? " / repeated" : "";
    return `
      <tr>
        <td>${operation.label}</td>
        <td>${phaseState.phase.name}${repeatTag}</td>
        <td>${Math.ceil(phaseState.remaining)}h</td>
      </tr>
    `;
  });
  return operationRows.concat(repeatedOnlyRows).join("");
}

function distance(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function renderVisitors() {
  const recruitedIds = new Set(state.roster.map((hero) => hero.id));
  const rows = VISITORS.filter((visitor) => !recruitedIds.has(visitor.id)).slice(0, 3).map((visitor) => `
    <div class="visitor-card">
      ${renderPortrait(visitor, "card")}
      <div class="visitor-card-body">
        <div class="character-name">${visitor.name}</div>
        <div class="character-meta">${formatLabel(visitor.race)} / ${visitor.role}</div>
        <div class="character-meta">cost: ${formatCost(visitor.cost)}</div>
        <div class="character-stats">
          <span>hp ${visitor.stats.hp}</span>
          <span>atk ${visitor.stats.atk}</span>
          <span>def ${visitor.stats.def}</span>
          <span>utl ${visitor.stats.utility}</span>
        </div>
        <div class="row-actions"><button data-recruit="${visitor.id}">hire</button></div>
      </div>
    </div>
  `);
  el.visitorRows.innerHTML = rows.length ? rows.join("") : `<div class="location-detail">no visitors left in prototype queue</div>`;
  el.visitorRows.querySelectorAll("[data-recruit]").forEach((button) => {
    button.addEventListener("click", () => recruit(button.dataset.recruit));
  });
}

function renderJobs() {
  const workRows = workSites().map((site) => `
    <tr><td>${site.name}</td><td>${state.tavern.jobs[site.id] || 0}</td><td>${formatReward(site.output)} / ${site.cycleHours} worker-hours</td></tr>
  `).join("");
  el.jobRows.innerHTML = `${workRows}
    <tr><td>kitchen</td><td>base</td><td>${2 + Math.floor(state.tavern.fame / 3)} food / day</td></tr>
  `;
}

function renderParties() {
  populatePartySelect();
  el.partyRows.innerHTML = state.parties.map((party) => {
    const stats = partyStats(party);
    const busy = state.operations.find((operation) => operation.partyId === party.id);
    const isSelected = party.id === state.selectedPartyId;
    return `
      <tr class="${isSelected ? "selected-party-row" : ""}">
        <td><button data-cancel-party="${party.id}">cancel</button></td>
        <td class="party-select-cell" data-select-party="${party.id}">${party.name}</td>
        <td>${renderPartyMemberButtons(party)}</td>
        <td class="party-select-cell" data-select-party="${party.id}">${busy ? currentOperationPhase(busy).phase.name : "Idle"}<br>HP ${stats.hpCurrent}/${stats.hpMax} ATK ${stats.atk}</td>
      </tr>
    `;
  }).join("");
  el.partyRows.querySelectorAll("[data-select-party]").forEach((cell) => {
    cell.addEventListener("click", () => selectParty(cell.dataset.selectParty));
  });
  el.partyRows.querySelectorAll("[data-cancel-party]").forEach((button) => {
    button.addEventListener("click", () => cancelPartyAction(button.dataset.cancelParty));
  });
  el.partyRows.querySelectorAll("[data-toggle-member]").forEach((button) => {
    button.addEventListener("click", () => togglePartyMember(button.dataset.partyId, button.dataset.toggleMember));
  });

  const hero = focusedHero();
  const stats = heroStats(hero);
  const status = characterState(hero.id);
  const currentParty = selectedParty();
  const canAddToCurrentParty = status.state === "Idle" && !currentParty.memberIds.includes(hero.id);
  el.focusedCharacterBox.innerHTML = `
    <div class="detail-hero-head">
      ${renderPortrait(hero, "large")}
      <div>
        <div class="detail-title">${hero.name}</div>
        <div class="detail-line">${formatLabel(hero.race)} ${hero.role} / ${status.state}</div>
        <div class="detail-line">party: ${status.party}</div>
      </div>
    </div>
    <div class="detail-line">level: ${hero.level} (${hero.xp}/${hero.level * 8} xp), skill points: ${hero.skillPoints}</div>
    <div class="detail-line">race: ${formatLabel(hero.race)} / primary job: ${formatLabel(hero.primaryJob)} / secondary: ${hero.secondaryJob ? formatLabel(hero.secondaryJob) : "locked"}</div>
    <div class="detail-line">hp: ${hero.hp}/${stats.hpMax}</div>
    <div class="bar"><span style="width:${hpPercent(hero, stats)}%"></span></div>
    <div class="detail-line">atk ${stats.atk} / def ${stats.def} / utility ${stats.utility}</div>
    <div class="detail-line">travel +${stats.travelSpeed} / recovery -${stats.recoveryReduce} / food ${stats.foodCostReduce >= 0 ? "-" : "+"}${Math.abs(stats.foodCostReduce)}</div>
    <div class="detail-line">gear: ${hero.gear.length ? hero.gear.map((id) => BLUEPRINTS[id].name).join(", ") : "none"}</div>
    <div class="detail-line">atlas slot: ${hero.spriteIndex ?? 0}</div>
    <div class="row-actions">
      <button id="addFocusedToPartyBtn" ${canAddToCurrentParty ? "" : "disabled"}>add to current party</button>
    </div>
    <div class="skill-tree-panel">${renderSkillTrees(hero)}</div>
  `;
  document.getElementById("addFocusedToPartyBtn")?.addEventListener("click", () => addFocusedHeroToCurrentParty());
  el.focusedCharacterBox.querySelectorAll("[data-learn-skill]").forEach((button) => {
    button.addEventListener("click", () => learnSkill(hero.id, button.dataset.learnSkill));
  });
}

function renderSkillTrees(hero) {
  return availableSkillTreeIds(hero).map((treeId) => {
    const tree = SKILL_TREES[treeId];
    return `
      <div class="skill-tree">
        <div class="skill-tree-title">${tree.name}</div>
        ${tree.skillIds.map((skillId) => renderSkillButton(hero, skillId)).join("")}
      </div>
    `;
  }).join("");
}

function renderSkillButton(hero, skillId) {
  const definition = SKILLS[skillId];
  const rank = skillRank(hero, skillId);
  const state = canLearnSkill(hero, skillId);
  const requires = definition.requires.length ? `req: ${definition.requires.map((id) => SKILLS[id]?.name || id).join(" OR ")}` : "root";
  return `
    <button class="skill-node ${rank > 0 ? "learned" : ""}" data-learn-skill="${skillId}" ${state.ok ? "" : "disabled"} title="${requires}; ${state.reason}">
      <span>${definition.name}</span>
      <span>${definition.category} ${rank}/${definition.maxRank}</span>
    </button>
  `;
}

function formatLabel(value) {
  return String(value || "-").replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function renderPartyMemberButtons(party) {
  if (!party.memberIds.length) {
    return `<span class="character-meta">no members</span>`;
  }
  return party.memberIds.map((heroId) => {
    const status = characterState(heroId);
    const disabled = status.state !== "Idle";
    return `<button data-party-id="${party.id}" data-toggle-member="${heroId}" ${disabled ? "disabled" : ""}>-${heroName(heroId)}</button>`;
  }).join(" ");
}

function renderRoster() {
  const minimized = state.rosterView === "minimized";
  el.rosterRows.classList.toggle("minimized", minimized);
  el.rosterRows.innerHTML = state.roster.map((hero) => {
    const stats = heroStats(hero);
    const status = characterState(hero.id);
    const hpPct = hpPercent(hero, stats);
    if (minimized) {
      return `
        <button class="character-card compact ${hero.id === state.focusedHeroId ? "selected" : ""}" data-focus="${hero.id}" title="${hero.name} / ${status.state} / HP ${hero.hp}/${stats.hpMax}">
          ${renderPortrait(hero, "card")}
          <span class="compact-name">${hero.name}</span>
          <span class="compact-state">${compactStateLabel(status.state)}</span>
        </button>
      `;
    }
    return `
      <button class="character-card ${hero.id === state.focusedHeroId ? "selected" : ""}" data-focus="${hero.id}">
        ${renderPortrait(hero, "card")}
        <div class="character-card-body">
          <div class="character-name">${hero.name}</div>
          <div class="character-meta">${formatLabel(hero.race)} / ${hero.role} / ${status.state}</div>
          <div class="character-meta">party: ${status.party}</div>
          <div class="bar"><span style="width:${hpPct}%"></span></div>
          <div class="character-stats">
            <span>lv ${hero.level}</span>
            <span>hp ${hero.hp}/${stats.hpMax}</span>
            <span>atk ${stats.atk}</span>
            <span>def ${stats.def}</span>
            <span>utl ${stats.utility}</span>
          </div>
        </div>
      </button>
    `;
  }).join("");
  el.rosterRows.querySelectorAll("[data-focus]").forEach((button) => {
    button.addEventListener("click", () => setFocusedHero(button.dataset.focus));
  });
}

function compactStateLabel(stateLabel) {
  const labels = {
    "Idle": "ID",
    "Queued": "QU",
    "Walking to dungeon": "WD",
    "Fighting": "FG",
    "Walking home": "WH",
    "Recovering": "RC"
  };
  return labels[stateLabel] || stateLabel.slice(0, 2).toUpperCase();
}

function hpPercent(hero, stats = heroStats(hero)) {
  return Math.max(0, Math.min(100, (hero.hp / stats.hpMax) * 100));
}

function resetDungeonReplay(events = []) {
  stopReplayPlayback();
  state.dungeonReplay.events = events;
  state.dungeonReplay.cursor = 0;
}

function setReplayCursor(cursor, renderReplayOnly = false) {
  const max = Math.max(0, state.dungeonReplay.events.length - 1);
  state.dungeonReplay.cursor = Math.max(0, Math.min(max, cursor));
  if (state.dungeonReplay.cursor >= max) {
    stopReplayPlayback();
  }
  if (renderReplayOnly) {
    renderDungeonReplay();
  } else {
    render();
  }
}

function toggleReplayPlayback() {
  if (!state.dungeonReplay.events.length) return;
  if (state.dungeonReplay.playing) {
    stopReplayPlayback();
    render();
    return;
  }
  if (state.dungeonReplay.cursor >= state.dungeonReplay.events.length - 1) {
    state.dungeonReplay.cursor = 0;
  }
  state.dungeonReplay.playing = true;
  state.dungeonReplay.timer = window.setInterval(() => {
    if (state.dungeonReplay.cursor >= state.dungeonReplay.events.length - 1) {
      stopReplayPlayback();
      renderDungeonReplay();
      return;
    }
    state.dungeonReplay.cursor += 1;
    renderDungeonReplay();
  }, state.dungeonReplay.playbackMs);
  renderDungeonReplay();
}

function stopReplayPlayback() {
  state.dungeonReplay.playing = false;
  if (state.dungeonReplay.timer) {
    window.clearInterval(state.dungeonReplay.timer);
    state.dungeonReplay.timer = null;
  }
}

function cycleReplaySpeed() {
  const speeds = [900, 650, 350, 180];
  const index = speeds.indexOf(state.dungeonReplay.playbackMs);
  state.dungeonReplay.playbackMs = speeds[(index + 1) % speeds.length];
  if (state.dungeonReplay.playing) {
    stopReplayPlayback();
    toggleReplayPlayback();
    return;
  }
  renderDungeonReplay();
}

function replaySpeedLabel() {
  if (state.dungeonReplay.playbackMs >= 900) return "0.75x";
  if (state.dungeonReplay.playbackMs >= 650) return "1x";
  if (state.dungeonReplay.playbackMs >= 350) return "2x";
  return "4x";
}

function renderPortrait(hero, sizeClass) {
  return `<span class="char-portrait ${sizeClass}" style="${portraitStyle(hero.spriteIndex ?? 0)}"></span>`;
}

function portraitStyle(spriteIndex) {
  const safeIndex = Math.max(0, Math.min(ATLAS_COLUMNS * ATLAS_ROWS - 1, spriteIndex));
  const col = safeIndex % ATLAS_COLUMNS;
  const row = Math.floor(safeIndex / ATLAS_COLUMNS);
  const x = ATLAS_COLUMNS === 1 ? 0 : (col / (ATLAS_COLUMNS - 1)) * 100;
  const y = ATLAS_ROWS === 1 ? 0 : (row / (ATLAS_ROWS - 1)) * 100;
  return `background-position:${x}% ${y}%`;
}

function renderDungeon() {
  const dungeon = selectedDungeon();
  const reached = state.lastEstimate && state.lastEstimate.dungeonId === dungeon.id ? state.lastEstimate.reached : 0;
  const failedIndex = state.lastEstimate && !state.lastEstimate.success ? state.lastEstimate.reached : -1;
  el.nodeMap.innerHTML = dungeon.nodes.map((node, index) => `
    <div class="node ${index < reached ? "reached" : ""} ${index === failedIndex ? "failed" : ""}">
      <div class="node-title">${index + 1}. ${node.name}</div>
      <div class="node-meta">${node.type}</div>
      <div class="node-meta">reward: ${formatReward(node.reward)}</div>
    </div>
  `).join("");

  if (!state.lastEstimate) {
    el.estimateBox.textContent = "No cached estimate.\n\nRun simulate to preview deterministic combat, food cost, rewards, and recovery time.";
    renderDungeonReplay();
    return;
  }

  const estimate = state.lastEstimate;
  el.estimateBox.textContent = [
    `${estimate.dungeonName} / ${estimate.strategy}`,
    `party: ${estimate.partyName}`,
    `repeat: ${state.repeatedPlans[estimate.partyId] ? "repeated" : el.repeatSelect.value === "repeat" ? "ready to enable" : "manual"}`,
    `target nodes: ${estimate.totalNodes}`,
    `reached: ${estimate.reached}`,
    `success: ${estimate.success ? "yes" : "no"}`,
    `time: ${estimate.hours}h`,
    `food: -${estimate.foodCost}`,
    `hp: ${estimate.hpStart} -> ${estimate.hpEnd}`,
    `rewards: ${formatReward(estimate.rewards)}`,
    "",
    ...estimate.transcript
  ].join("\n");
  renderDungeonReplay();
}

function renderDungeonReplay() {
  const replay = state.dungeonReplay;
  const event = replay.events[replay.cursor] || null;
  const maxCursor = Math.max(0, replay.events.length - 1);
  el.replayTimelineSlider.max = String(maxCursor);
  el.replayTimelineSlider.value = String(Math.max(0, Math.min(maxCursor, replay.cursor)));
  el.replayTimelineSlider.disabled = !replay.events.length;
  el.replayStatus.textContent = replay.events.length
    ? `event ${replay.cursor + 1}/${replay.events.length} / ${replay.playing ? "playing" : "paused"}`
    : "no replay";
  ["replayFirstBtn", "replayPrevBtn", "replayPlayBtn", "replayNextBtn", "replayLastBtn", "replaySpeedBtn"].forEach((id) => {
    document.getElementById(id).disabled = !replay.events.length;
  });
  document.getElementById("replayPlayBtn").textContent = replay.playing ? "pause" : "play";
  document.getElementById("replaySpeedBtn").textContent = `speed ${replaySpeedLabel()}`;

  if (!event) {
    el.replayPartyActors.innerHTML = `<div class="replay-empty">no party snapshot</div>`;
    el.replayEnemyActors.innerHTML = `<div class="replay-empty">no enemy snapshot</div>`;
    el.replayActionIcon.textContent = "--";
    el.replayEventText.textContent = "simulate a run to inspect combat events";
    el.replayEventRows.innerHTML = "";
    return;
  }

  el.replayPartyActors.innerHTML = renderReplayActors(event.partyActors, event);
  el.replayEnemyActors.innerHTML = renderReplayActors(event.enemyActors, event);
  el.replayActionIcon.textContent = event.icon || "--";
  el.replayEventText.textContent = event.text;
  el.replayEventRows.innerHTML = replay.events.slice(0, replay.cursor + 1).slice(-12).map((item, index, list) => `
    <li class="${index === list.length - 1 ? "current" : ""}">
      <span class="tag">${item.icon}</span> ${item.text}
    </li>
  `).join("");
}

function renderReplayActors(actors, event) {
  if (!actors.length) {
    return `<div class="replay-empty">none</div>`;
  }
  return actors.map((actor) => {
    const pct = actor.maxHp > 0 ? Math.max(0, Math.min(100, actor.hp / actor.maxHp * 100)) : 0;
    const active = actor.id === event.actorId;
    const targeted = actor.id === event.targetId;
    return `
      <div class="replay-actor ${active ? "active" : ""} ${targeted ? "targeted" : ""}">
        ${actor.spriteIndex !== null ? renderReplayPortrait(actor.spriteIndex) : `<span class="enemy-portrait">${actor.name.slice(0, 2).toUpperCase()}</span>`}
        <div class="replay-actor-body">
          <div class="replay-actor-name">${actor.name}</div>
          <div class="bar"><span style="width:${pct}%"></span></div>
          <div class="shard-meta">hp ${actor.hp}/${actor.maxHp} / init ${actor.initiative} / spd ${actor.speed}</div>
        </div>
      </div>
    `;
  }).join("");
}

function renderReplayPortrait(spriteIndex) {
  return `<span class="char-portrait card replay-portrait" style="${portraitStyle(spriteIndex)}"></span>`;
}

function renderTemple() {
  const stone = activeTempleStoneDefinition();
  const stoneState = activeTempleStoneState();
  el.templeStatus.textContent = `${stone.name} / links active: ${stoneState.activeLines.length}/${stone.maxActiveLines} / ${stone.modifierText}`;
  renderTempleStoneButtons();
  el.templeMatrix.innerHTML = `
    <div class="temple-help">
      <div>drag shards onto colored sockets</div>
      <div>click a link to enable it; click active link to disable</div>
    </div>
    <svg class="temple-link-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      ${renderTempleLinks(stone)}
    </svg>
    ${stone.sockets.map((socket) => renderTempleSocket(socket, stone)).join("")}
  `;
  bindTempleBoardInteractions();
  el.shardInventoryRows.innerHTML = normalizedInventorySlots().map((shardId, index) => renderInventorySlot(index, shardId)).join("");
  bindShardTokenInteractions(el.shardInventoryRows);
  bindInventoryDrop();
  el.templeBuffRows.innerHTML = renderTempleBuffRows();
  renderShardDetail();
}

function renderTempleStoneButtons() {
  el.templeStoneButtons.innerHTML = Object.entries(TEMPLE_STONES).map(([stoneId, stone]) => `
    <button class="temple-stone-button ${stoneId === activeTempleStoneId() ? "active" : ""}" data-temple-stone="${stoneId}" ${stone.unlocked ? "" : "disabled"}>
      ${stone.name}
    </button>
  `).join("");
  el.templeStoneButtons.querySelectorAll("[data-temple-stone]").forEach((button) => {
    button.addEventListener("click", () => selectTempleStone(button.dataset.templeStone));
  });
}

function renderTempleSocket(socket, stone) {
  const socketId = templeSocketId(socket);
  const colorId = socket.colorId;
  const color = templeColor(colorId);
  const shardId = activeTempleStoneState().slots[socketId];
  const shard = SHARDS[shardId];
  const connected = activeTempleStoneState().activeLines.some((line) => line.a === socketId || line.b === socketId);
  const influence = shard ? activeInfluenceColors(socketId, shard, stone).map(colorName).join(", ") : "none";
  return `
    <div class="temple-socket ${connected ? "connected" : ""}" data-temple-slot="${socketId}" style="left:${socket.x}%;top:${socket.y}%;--socket-color:${color.hex}">
      <div class="temple-socket-title"><span class="temple-slot-color" style="background:${color.hex}"></span>${socket.label || color.name}</div>
      <div class="temple-socket-pad">
        ${shard ? renderShardToken(shardId, shard, { source: "socket", slotColor: colorId }) : `<span class="empty-socket">drop shard</span>`}
      </div>
      <div class="detail-line">influence: ${influence}</div>
    </div>
  `;
}

function renderTempleLinks(stone) {
  return stone.links.map(([aId, bId]) => {
    const a = templeSocketById(aId, stone);
    const b = templeSocketById(bId, stone);
    const aColor = templeColor(a.colorId);
    const bColor = templeColor(b.colorId);
    const active = isTempleLineActive(aId, bId);
    return `
      <line class="temple-link-hit" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" data-line-a="${aId}" data-line-b="${bId}"></line>
      <line class="temple-link ${active ? "active" : "inactive"}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" style="--line-a:${aColor.hex};--line-b:${bColor.hex}" data-line-a="${aId}" data-line-b="${bId}"></line>
    `;
  }).join("");
}

function renderInventorySlot(index, shardId) {
  const shard = SHARDS[shardId];
  const selected = shardId && state.temple.selectedShardId === shardId;
  return `
    <div class="shard-inventory-cell ${selected ? "selected" : ""} ${shard ? "" : "empty"}" data-inventory-slot="${index}">
      ${shard ? renderShardToken(shardId, shard, { source: "inventory", inventoryIndex: index }) : `<span class="empty-inventory-slot">${index + 1}</span>`}
      ${shard ? renderShardProgress(shardId, shard) : ""}
    </div>
  `;
}

function renderShardProgress(shardId, shard) {
  const xp = state.temple.shardInventory[shardId]?.xp || 0;
  const progress = Math.min(100, (xp / shard.xpToMax) * 100);
  return `
    <span class="shard-meta">xp ${xp}/${shard.xpToMax}</span>
    <span class="bar"><span style="width:${progress}%"></span></span>
  `;
}

function renderShardToken(shardId, shard, options = {}) {
  const found = options.found ?? hasShard(shardId);
  const draggable = found ? "true" : "false";
  const equipped = options.source === "socket";
  const selected = state.temple.selectedShardId === shardId;
  return `
    <button class="shard-token ${selected ? "selected" : ""} ${found ? "" : "unfound"} ${equipped ? "equipped" : ""}"
      data-select-shard="${shardId}"
      data-shard-token="${shardId}"
      data-token-source="${options.source || "inventory"}"
      ${options.slotColor ? `data-slot-color="${options.slotColor}"` : ""}
      ${options.inventoryIndex !== undefined ? `data-inventory-index="${options.inventoryIndex}"` : ""}
      draggable="${draggable}"
      title="${found ? shard.name : "unknown shard"}">
      <span class="shard-glyph">${shardGlyph(shardId)}</span>
      <span class="shard-dots">${shardColorDots(shard)}</span>
      <span class="shard-token-name">${found ? shard.name : "unknown"}</span>
    </button>
  `;
}

function normalizedInventorySlots() {
  const stoneState = activeTempleStoneState();
  if (!Array.isArray(stoneState.inventorySlots)) {
    stoneState.inventorySlots = [];
  }
  stoneState.inventorySlots = stoneState.inventorySlots.slice(0, TEMPLE_INVENTORY_SLOTS);
  while (stoneState.inventorySlots.length < TEMPLE_INVENTORY_SLOTS) {
    stoneState.inventorySlots.push(null);
  }
  const seen = new Set();
  stoneState.inventorySlots = stoneState.inventorySlots.map((shardId) => {
    if (!shardId || !hasShard(shardId) || isShardSocketed(shardId) || seen.has(shardId)) return null;
    seen.add(shardId);
    return shardId;
  });
  Object.keys(state.temple.shardInventory).forEach((shardId) => {
    if (!hasShard(shardId) || isShardSocketed(shardId) || seen.has(shardId)) return;
    const freeIndex = firstFreeInventorySlot();
    if (freeIndex >= 0) {
      stoneState.inventorySlots[freeIndex] = shardId;
      seen.add(shardId);
    }
  });
  return stoneState.inventorySlots;
}

function firstFreeInventorySlot() {
  return activeTempleStoneState().inventorySlots.findIndex((shardId) => !shardId);
}

function inventorySlotOf(shardId) {
  return activeTempleStoneState().inventorySlots.findIndex((entry) => entry === shardId);
}

function removeShardFromInventory(shardId) {
  activeTempleStoneState().inventorySlots = normalizedInventorySlots().map((entry) => entry === shardId ? null : entry);
}

function placeShardInFirstFreeInventorySlot(shardId) {
  normalizedInventorySlots();
  const freeIndex = firstFreeInventorySlot();
  if (freeIndex < 0) return false;
  activeTempleStoneState().inventorySlots[freeIndex] = shardId;
  return true;
}

function moveShardToInventorySlot(shardId, targetIndex) {
  const shard = SHARDS[shardId];
  if (!shard || !hasShard(shardId) || targetIndex < 0 || targetIndex >= TEMPLE_INVENTORY_SLOTS) return;
  const slots = normalizedInventorySlots();
  const sourceIndex = inventorySlotOf(shardId);
  const targetShardId = slots[targetIndex];
  if (sourceIndex === targetIndex) return;

  if (sourceIndex >= 0) {
    slots[sourceIndex] = targetShardId || null;
    slots[targetIndex] = shardId;
    state.temple.selectedShardId = shardId;
    render();
    return;
  }

  if (isShardSocketed(shardId)) {
    if (targetShardId) {
      addLog(`inventory move blocked: slot ${targetIndex + 1} is occupied`, "bad");
      render();
      return;
    }
    Object.entries(activeTempleStoneState().slots).forEach(([slotColor, equippedShardId]) => {
      if (equippedShardId === shardId) {
        activeTempleStoneState().slots[slotColor] = null;
      }
    });
    slots[targetIndex] = shardId;
    state.temple.selectedShardId = shardId;
    addLog(`${shard.name} returned to inventory slot ${targetIndex + 1}`, "warn");
    render();
  }
}

function isShardSocketed(shardId) {
  return Object.values(activeTempleStoneState().slots).includes(shardId);
}

function shardGlyph(shardId) {
  const glyphs = {
    cellarFang: "F",
    broodCrown: "B",
    copperSplinter: "C",
    wardPrism: "W",
    captainGear: "G"
  };
  return glyphs[shardId] || "?";
}

function shardColorDots(shard) {
  return TEMPLE_COLORS.map((color) => {
    const canSlot = shard.equipColors.includes(color.id);
    const affected = shard.affectedBy.includes(color.id);
    return `<span class="${canSlot ? "can-slot" : affected ? "affected" : ""}" style="--dot-color:${color.hex}"></span>`;
  }).join("");
}

function bindTempleBoardInteractions() {
  el.templeMatrix.querySelectorAll(".temple-link-hit").forEach((line) => {
    line.addEventListener("click", () => toggleTempleLine(line.dataset.lineA, line.dataset.lineB));
  });
  el.templeMatrix.querySelectorAll("[data-temple-slot]").forEach((slot) => {
    slot.addEventListener("dragover", (event) => {
      event.preventDefault();
      slot.classList.add("drop-target");
    });
    slot.addEventListener("dragleave", () => {
      slot.classList.remove("drop-target");
    });
    slot.addEventListener("drop", (event) => {
      event.preventDefault();
      slot.classList.remove("drop-target");
      const shardId = event.dataTransfer.getData("text/plain");
      equipShard(slot.dataset.templeSlot, shardId);
    });
  });
  bindShardTokenInteractions(el.templeMatrix);
}

function bindShardTokenInteractions(root) {
  root.querySelectorAll("[data-select-shard]").forEach((button) => {
    button.addEventListener("click", () => selectShard(button.dataset.selectShard));
  });
  root.querySelectorAll("[data-shard-token]").forEach((token) => {
    token.addEventListener("dragstart", (event) => {
      if (!hasShard(token.dataset.shardToken)) {
        event.preventDefault();
        return;
      }
      event.dataTransfer.setData("text/plain", token.dataset.shardToken);
      event.dataTransfer.setData("source", token.dataset.tokenSource || "");
      event.dataTransfer.setData("inventoryIndex", token.dataset.inventoryIndex || "");
      event.dataTransfer.effectAllowed = "move";
      token.classList.add("dragging");
    });
    token.addEventListener("dragend", () => {
      token.classList.remove("dragging");
    });
  });
}

function bindInventoryDrop() {
  el.shardInventoryRows.querySelectorAll("[data-inventory-slot]").forEach((cell) => {
    cell.addEventListener("dragover", (event) => {
      event.preventDefault();
      cell.classList.add("drop-target");
    });
    cell.addEventListener("dragleave", () => {
      cell.classList.remove("drop-target");
    });
    cell.addEventListener("drop", (event) => {
      event.preventDefault();
      cell.classList.remove("drop-target");
      const shardId = event.dataTransfer.getData("text/plain");
      moveShardToInventorySlot(shardId, Number(cell.dataset.inventorySlot));
    });
  });
}

function renderTempleBuffRows() {
  const bonuses = templeBonuses();
  const rows = Object.entries(bonuses)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => `<div class="temple-buff-line">${formatTempleEffectType(key)} +${value}</div>`);
  return rows.length ? rows.join("") : `<div class="temple-buff-line">no active shard buffs</div>`;
}

function renderShardDetail() {
  const shardId = state.temple.selectedShardId;
  const shard = SHARDS[shardId];
  const stone = activeTempleStoneDefinition();
  const stoneState = activeTempleStoneState();
  if (!shard) {
    el.shardDetailBox.innerHTML = `
      <div class="detail-title">${stone.name}</div>
      <div class="detail-line">links: ${stoneState.activeLines.length}/${stone.maxActiveLines}</div>
      <div class="detail-line">modifier: ${stone.modifierText}</div>
      <div class="detail-line">select a shard</div>
    `;
    return;
  }
  const xp = state.temple.shardInventory[shardId]?.xp || 0;
  const found = xp > 0;
  const lines = [
    `<div class="detail-title">${stone.name}</div>`,
    `<div class="detail-line">links: ${stoneState.activeLines.length}/${stone.maxActiveLines}</div>`,
    `<div class="detail-line">modifier: ${stone.modifierText}</div>`,
    `<div class="detail-line">selected shard:</div>`,
    `<div class="detail-title">${found ? shard.name : "Unknown Shard"}</div>`,
    `<div class="detail-line">state: ${found ? "found" : "not found"}</div>`,
    `<div class="detail-line">source: ${shard.source}</div>`,
    `<div class="detail-line">progress: ${xp}/${shard.xpToMax}</div>`,
    `<div class="detail-line">can slot: ${shard.equipColors.map(colorName).join(", ")}</div>`,
    `<div class="detail-line">affected by: ${shard.affectedBy.map(colorName).join(", ")}</div>`,
    `<div class="detail-line">effects by color: ${Object.entries(shard.colorEffects).map(([colorId, effects]) => `${colorName(colorId)} ${formatTempleEffects(shardId, effects)}`).join(" / ")}</div>`,
    `<div class="detail-line">dungeon counter: visits ${state.temple.dungeonVisits[shard.dungeonId] || 0}, boss ${state.temple.bossVisits[shard.dungeonId] || 0}</div>`
  ];
  el.shardDetailBox.innerHTML = lines.join("");
}

function formatTempleEffects(shardId, effects = []) {
  return effects.map((effect) => `${formatTempleEffectType(effect.type)} +${shardEffectValue(shardId, effect)} (${effect.min}-${effect.max})`).join(", ") || "none";
}

function formatTempleEffectType(type) {
  return String(type).replace(/_/g, " ");
}

function colorName(colorId) {
  return templeColor(colorId).name;
}

function templeColor(colorId) {
  return TEMPLE_COLORS.find((color) => color.id === colorId) || { id: colorId, name: colorId, hex: "#d3ddce" };
}

function selectTempleStone(stoneId) {
  const stone = TEMPLE_STONES[stoneId];
  if (!stone || !stone.unlocked) return;
  state.temple.activeStoneId = stoneId;
  activeTempleStoneState();
  addLog(`temple stone selected: ${stone.name}`, "ok");
  render();
}

function selectShard(shardId) {
  state.temple.selectedShardId = shardId;
  render();
}

function equipShard(socketId, shardId) {
  const stone = activeTempleStoneDefinition();
  const stoneState = activeTempleStoneState();
  const colorId = templeSocketColorId(socketId, stone);
  if (!shardId) {
    stoneState.slots[socketId] = null;
    addLog(`${templeSocketById(socketId, stone)?.label || colorName(colorId)} socket cleared`, "warn");
    render();
    return;
  }
  const shard = SHARDS[shardId];
  if (!shard || !hasShard(shardId) || !shard.equipColors.includes(colorId)) {
    addLog(`temple equip blocked: ${shard?.name || shardId} cannot slot into ${colorName(colorId)}`, "bad");
    render();
    return;
  }
  normalizedInventorySlots();
  const replacedShardId = stoneState.slots[socketId];
  const sourceInventoryIndex = inventorySlotOf(shardId);
  if (replacedShardId && replacedShardId !== shardId && sourceInventoryIndex < 0 && firstFreeInventorySlot() < 0) {
    addLog(`temple equip blocked: no free inventory slot for ${SHARDS[replacedShardId]?.name || replacedShardId}`, "bad");
    render();
    return;
  }
  removeShardFromInventory(shardId);
  Object.entries(stoneState.slots).forEach(([otherSocketId, equippedShardId]) => {
    if (equippedShardId === shardId && otherSocketId !== socketId) {
      stoneState.slots[otherSocketId] = null;
    }
  });
  if (replacedShardId && replacedShardId !== shardId) {
    placeShardInFirstFreeInventorySlot(replacedShardId);
  }
  stoneState.slots[socketId] = shardId;
  state.temple.selectedShardId = shardId;
  addLog(`temple socket ${templeSocketById(socketId, stone)?.label || colorName(colorId)} equipped ${shard.name}`, "ok");
  render();
}

function isTempleLineActive(a, b) {
  return activeTempleStoneState().activeLines.some((line) => (line.a === a && line.b === b) || (line.a === b && line.b === a));
}

function toggleTempleLine(a, b) {
  const stone = activeTempleStoneDefinition();
  const stoneState = activeTempleStoneState();
  if (isTempleLineActive(a, b)) {
    stoneState.activeLines = stoneState.activeLines.filter((line) => !((line.a === a && line.b === b) || (line.a === b && line.b === a)));
    addLog(`temple line disabled: ${templeSocketLabel(a, stone)} / ${templeSocketLabel(b, stone)}`, "warn");
  } else {
    stoneState.activeLines.push({ a, b });
    while (stoneState.activeLines.length > stone.maxActiveLines) {
      stoneState.activeLines.shift();
    }
    addLog(`temple line enabled: ${templeSocketLabel(a, stone)} / ${templeSocketLabel(b, stone)}`, "ok");
  }
  render();
}

function templeSocketLabel(socketId, stone = activeTempleStoneDefinition()) {
  const socket = templeSocketById(socketId, stone);
  return socket?.label || colorName(socket?.colorId || socketId);
}

function formatReward(reward = {}) {
  return Object.entries(reward).map(([key, value]) => {
    if (key === "blueprint") return `blueprint:${BLUEPRINTS[value]?.name || value}`;
    return `${value} ${key}`;
  }).join(", ") || "none";
}

function renderBlueprints() {
  el.blueprintRows.innerHTML = Object.entries(BLUEPRINTS).map(([id, blueprint]) => {
    const unlocked = Boolean(state.blueprints[id]);
    return `
      <div class="blueprint ${unlocked ? "" : "locked"}">
        <div class="node-title">${blueprint.name}</div>
        <div>state: ${unlocked ? "unlocked" : "locked"}</div>
        <div>source: ${blueprint.source}</div>
        <div>cost: ${formatCost(blueprint.cost)}</div>
        <div>${blueprint.effect}</div>
      </div>
    `;
  }).join("");
}

function renderLog() {
  el.logRows.innerHTML = state.log.map((entry) => `
    <li class="${entry.type}"><span class="tag">${entry.stamp}</span> ${entry.text}</li>
  `).join("");
}
