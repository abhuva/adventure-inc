import { normalizeProgressionGraph } from "../progression/progressionGraphModel.js";

export const WORKSHOP_RECIPES = {
  rations: {
    id: "rations",
    name: "Rations",
    category: "provisions",
    input: {},
    output: { food: 2 },
    workRequired: 6,
    xpPerCraft: 1,
    description: "Prepared provisions for dungeon departures.",
    levelUnlocks: [
      { level: 2, label: "Batch Prep", detail: "+1 food output", output: { food: 1 } },
      { level: 4, label: "Pantry Routine", detail: "-25% work required", workRequiredPct: -25 },
      { level: 7, label: "Travel Packs", detail: "+2 food output", output: { food: 2 } }
    ]
  },
  planks: {
    id: "planks",
    name: "Planks",
    category: "processed",
    input: { wood: 3 },
    output: { planks: 1 },
    workRequired: 8,
    xpPerCraft: 1,
    description: "Processed wood used by later workshop crafts.",
    levelUnlocks: [
      { level: 2, label: "Reduced Cost", detail: "-1 wood input", input: { wood: -1 } },
      { level: 4, label: "Batch Cutting", detail: "+1 plank output", output: { planks: 1 } },
      { level: 7, label: "Measured Cuts", detail: "-25% work required", workRequiredPct: -25 }
    ]
  },
  simpleFurniture: {
    id: "simpleFurniture",
    name: "Simple Furniture",
    category: "happiness",
    input: { planks: 2 },
    output: { comfort_goods: 10 },
    workRequired: 12,
    xpPerCraft: 1,
    description: "Comfort goods produced for future settlement comfort systems.",
    levelUnlocks: [
      { level: 2, label: "Better Joinery", detail: "+5 comfort output", output: { comfort_goods: 5 } },
      { level: 4, label: "Efficient Frames", detail: "-1 plank input", input: { planks: -1 } },
      { level: 7, label: "Workshop Jigs", detail: "-25% work required", workRequiredPct: -25 }
    ]
  },
  trainingBow: {
    id: "trainingBow",
    name: "Training Bow",
    category: "combat",
    input: { planks: 20, hide: 4 },
    output: { training_bow: 1 },
    workRequired: 48,
    xpPerCraft: 1,
    description: "A slow combat craft prototype that produces a real stock item.",
    levelUnlocks: [
      { level: 2, label: "Hide Templates", detail: "-1 hide input", input: { hide: -1 } },
      { level: 4, label: "Bow Forms", detail: "-25% work required", workRequiredPct: -25 },
      { level: 7, label: "Paired Stock", detail: "+1 bow output", output: { training_bow: 1 } }
    ]
  }
};

export const WOOD_WORKSHOP_GRAPH = normalizeProgressionGraph({
  id: "woodWorkshop",
  name: "Production Upgrades",
  type: "buildingUpgradeTree",
  nodes: {
    sharperSaws: {
      name: "Sharper Saws",
      category: "resource",
      icon: "SAW",
      maxRank: 3,
      requires: [],
      effects: [{ type: "workshop_speed_pct", valuePerRank: 10 }],
      x: 0,
      y: 0
    },
    workerBenches: {
      name: "Worker Benches",
      category: "utility",
      icon: "BN",
      maxRank: 3,
      requires: ["sharperSaws"],
      effects: [{ type: "workshop_slot_add", valuePerRank: 1 }],
      x: 1,
      y: 1
    },
    comfortPatterns: {
      name: "Comfort Patterns",
      category: "resource",
      icon: "CF",
      maxRank: 3,
      requires: ["sharperSaws"],
      effects: [{ type: "comfort_output_pct", valuePerRank: 15 }],
      x: 0,
      y: 1
    },
    researchDesk: {
      name: "Research Desk",
      category: "utility",
      icon: "RD",
      maxRank: 3,
      requires: ["workerBenches"],
      effects: [{ type: "workshop_research_speed_pct", valuePerRank: 15 }],
      x: 2,
      y: 2
    }
  }
});
