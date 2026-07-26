import { createInitialEventState } from "../game/events/eventRuntime.js";
import { createInitialWorldProgressionState } from "../game/progression/worldProgression.js";

export function createInitialState({ templeInventorySlots = 20, replayDefaultMs = 650 } = {}) {
  return {
    day: 1,
    hour: 0,
    timeRunning: true,
    events: createInitialEventState(),
    progression: createInitialWorldProgressionState(),
    tavern: {
      capacity: 3,
      visitorSeats: 3,
      fame: 0,
      population: 0,
      jobs: { wood: 0, ore: 0, workshop: 0, research: 0 }
    },
    tavernVisitors: {
      refreshedDay: null,
      visitors: {}
    },
    settlement: {
      housingCapacity: 5,
      wagePerWorker: 1,
      happiness: 80,
      availableWorkers: 3,
      hiredWorkers: 3,
      productionMultiplier: 1,
      workSiteUpgrades: { wood: 0, ore: 0 }
    },
    resources: {
      coin: 10,
      food: 6,
      wood: 8,
      ore: 4,
      hide: 0,
      planks: 0,
      comfort_goods: 0,
      training_bow: 0
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
        base: { hp: 42, atk: 7, def: 2, utility: 1, resolve: 12 },
        hp: 42,
        spriteIndex: 0,
        gear: []
      }
    ],
    focusedHeroId: "ada",
    selectedTavernVisitorId: null,
    activeTavernDetailTab: "info",
    activeRosterDetailTab: "info",
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
      playbackMs: replayDefaultMs,
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
          inventorySlots: Array(templeInventorySlots).fill(null)
        },
        square: {
          slots: { ember: null, verdant: null, azure: null, ember2: null },
          activeLines: [],
          inventorySlots: Array(templeInventorySlots).fill(null)
        },
        hourglass: {
          slots: { ember: null, verdant: null, azure: null, verdant2: null, ember2: null },
          activeLines: [],
          inventorySlots: Array(templeInventorySlots).fill(null)
        }
      },
      dungeonVisits: {},
      bossVisits: {}
    },
    lastEstimate: null,
    repeatedPlans: {},
    activeTab: "map",
    selectedLocationId: "tavern",
    mapContextMenu: null,
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
    mapWorld: {
      width: 1024,
      height: 1024,
      backgroundImage: "assets/map-bg.png"
    },
    operations: [],
    workerProgress: { wood: 0, ore: 0 },
    workshop: {
      slots: [{ recipeId: "rations", targetRecipeId: "rations", activeRecipeId: "rations", autoInputs: false, progress: 0 }],
      recipeXp: {},
      researchProgress: 0,
      progression: { points: {}, availablePoints: 0 }
    },
    visual: {
      lastTickAt: 0,
      tickMs: 750
    },
    log: []
  };
}
