export function createInitialState({ templeInventorySlots = 20, replayDefaultMs = 650 } = {}) {
  return {
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
}
