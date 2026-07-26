import assert from "node:assert/strict";
import test from "node:test";

import { blueprintRowsHtml } from "../src/ui/blueprintView.js";
import {
  dungeonEstimateText,
  dungeonNodeGraphHtml,
  dungeonNodeMapHtml,
  replayActorRowsHtml,
  replayEmptyState,
  replayEventRowsHtml
} from "../src/ui/dungeonView.js";
import { resourceTitleLine } from "../src/ui/headerView.js";
import { logRowsHtml } from "../src/ui/logView.js";
import {
  locationDetailHtml,
  operationRowsHtml,
  poiRowsHtml
} from "../src/ui/mapSideView.js";
import {
  mapActorsHtml,
  mapPoiButtonHtml,
  mapRouteHtml,
  mapWorldHtml,
  partyActorHtml
} from "../src/ui/mapWorldView.js";
import { populationJobRowsHtml, populationResourceRowsHtml, renderPopulationJobs } from "../src/ui/populationView.js";
import { progressionGraphHtml } from "../src/ui/progressionGraphView.js";
import {
  compactStateLabel,
  focusedCharacterHtml,
  hpPercent,
  partyMemberButtonsHtml,
  partyRowsHtml,
  portraitHtml,
  portraitStyle,
  rosterCardsHtml,
  skillButtonHtml,
  skillTreesHtml
} from "../src/ui/rosterView.js";
import { tavernUpgradeButtonHtml, visitorDetailHtml, visitorQueueHtml } from "../src/ui/tavernView.js";
import { formatReward } from "../src/ui/rewardText.js";
import {
  formatTempleEffectType,
  inventorySlotHtml,
  shardColorDotsHtml,
  shardDetailHtml,
  shardProgressHtml,
  shardTokenHtml,
  templeBoardHtml,
  templeBuffRowsHtml,
  templeLinksHtml,
  templeSocketHtml,
  templeStatusText,
  templeStoneButtonsHtml
} from "../src/ui/templeView.js";

test("resourceTitleLine formats global resources", () => {
  const text = resourceTitleLine({
    resources: {
      coin: 12,
      food: 8,
      wood: 5,
      ore: 3,
      hide: 2
    },
    tavern: {
      fame: 9
    }
  });

  assert.equal(text, "coin 12 / fame 9");
});

test("populationResourceRowsHtml renders gathered resources", () => {
  const html = populationResourceRowsHtml({
    food: 8,
    wood: 5,
    ore: 3,
    hide: 2,
    planks: 1,
    comfort_goods: 4,
    training_bow: 6
  });

  assert.match(html, /<td>food<\/td>\s*<td>8<\/td>/);
  assert.match(html, /<td>wood<\/td>\s*<td>5<\/td>/);
  assert.match(html, /<td>ore<\/td>\s*<td>3<\/td>/);
  assert.match(html, /<td>hide<\/td>\s*<td>2<\/td>/);
  assert.match(html, /<td>planks<\/td>\s*<td>1<\/td>/);
  assert.match(html, /<td>comfort<\/td>\s*<td>4<\/td>/);
  assert.match(html, /<td>bows<\/td>\s*<td>6<\/td>/);
});

test("formatReward resolves blueprint names", () => {
  const text = formatReward(
    {
      coin: 7,
      blueprint: "iron_blade"
    },
    {
      iron_blade: {
        name: "Iron Blade"
      }
    }
  );

  assert.equal(text, "7 coin, blueprint:Iron Blade");
});

test("formatReward reports empty rewards as none", () => {
  assert.equal(formatReward({}), "none");
});

test("blueprintRowsHtml renders locked and unlocked blueprint state", () => {
  const html = blueprintRowsHtml(
    {
      iron_blade: {
        name: "Iron Blade",
        source: "Old Mine",
        cost: { ore: 2 },
        effect: "+2 attack"
      },
      ward_charm: {
        name: "Ward Charm",
        source: "Old Barracks",
        cost: { hide: 1 },
        effect: "+5 hp"
      }
    },
    {
      iron_blade: true
    }
  );

  assert.match(html, /Iron Blade/);
  assert.match(html, /state: unlocked/);
  assert.match(html, /Ward Charm/);
  assert.match(html, /state: locked/);
  assert.match(html, /cost: 2 ore/);
});

test("logRowsHtml renders typed log entries", () => {
  const html = logRowsHtml([
    {
      type: "ok",
      stamp: "d1 00:00",
      text: "ready"
    }
  ]);

  assert.match(html, /class="ok"/);
  assert.match(html, /d1 00:00/);
  assert.match(html, /ready/);
});

test("populationJobRowsHtml renders work sites and settlement workforce output", () => {
  const html = populationJobRowsHtml({
    state: {
      tavern: {
        fame: 7,
        jobs: {
          wood: 3,
          workshop: 1,
          research: 0
        }
      },
      settlement: {
        availableWorkers: 5,
        hiredWorkers: 5,
        happiness: 75,
        wagePerWorker: 1,
        productionMultiplier: 1
      }
    },
    tavern: {
      fame: 7,
      jobs: {
        wood: 3
      }
    },
    workSites: [
      {
        id: "wood",
        name: "North Woodlot",
        output: { wood: 2 },
        cycleHours: 4
      }
    ],
    blueprints: {}
  });

  assert.match(html, /North Woodlot/);
  assert.match(html, /<td>3\/2<\/td>/);
  assert.match(html, /2 wood \/ 4 worker-hours/);
  assert.match(html, /production/);
  assert.match(html, /hired workers/);
  assert.match(html, /upkeep 5 coin\/day \/ production x1/);
});

test("renderPopulationJobs preserves focused workshop recipe select", () => {
  const activeSelect = {
    matches: (selector) => selector === "[data-workshop-recipe-slot]"
  };
  const slotClassState = new Set(["workshop-slot", "unmanned"]);
  const slotEl = {
    classList: {
      toggle(name, enabled) {
        if (enabled) slotClassState.add(name);
        else slotClassState.delete(name);
      }
    }
  };
  const slotStateEl = { textContent: "" };
  const recipeNameEl = { innerHTML: "" };
  const meterEl = { style: { width: "0%" } };
  const detailEl = { textContent: "" };
  const queryMap = {
    '[data-workshop-slot="0"]': slotEl,
    '[data-workshop-slot-state="0"]': slotStateEl,
    '[data-workshop-slot-recipe-name="0"]': recipeNameEl,
    '[data-workshop-slot-meter="0"]': meterEl,
    '[data-workshop-slot-detail="0"]': detailEl
  };
  const el = {
    jobRows: {
      innerHTML: "",
      querySelectorAll: () => []
    },
    workshopStatus: {
      textContent: ""
    },
    workshopSlots: {
      innerHTML: "stable slots",
      ownerDocument: {
        activeElement: activeSelect
      },
      contains: (element) => element === activeSelect,
      querySelector: (selector) => queryMap[selector] || null,
      querySelectorAll: () => []
    },
    workshopResearch: {
      innerHTML: ""
    },
    workshopUpgradeGraph: {
      innerHTML: "",
      querySelectorAll: () => []
    }
  };
  renderPopulationJobs(el, {
    state: {
      tavern: { jobs: { wood: 1, ore: 0, workshop: 1, research: 0 } },
      settlement: { availableWorkers: 3, hiredWorkers: 3, happiness: 80, wagePerWorker: 1 },
      workshop: {
        slots: [{ recipeId: "planks", progress: 0 }],
        recipeXp: {},
        researchProgress: 0,
        progression: { points: {}, availablePoints: 0 }
      }
    },
    workSites: [{ id: "wood", name: "North Woodlot", output: { wood: 2 }, cycleHours: 4 }],
    blueprints: {}
  });

  assert.equal(el.workshopSlots.innerHTML, "stable slots");
  assert.equal(slotStateEl.textContent, "manned");
  assert.match(recipeNameEl.innerHTML, /Target: Planks L1/);
  assert.match(recipeNameEl.innerHTML, /recipe-hover/);
  assert.match(recipeNameEl.innerHTML, /recipe-xp-panel/);
  assert.equal(meterEl.style.width, "0%");
  assert.match(detailEl.textContent, /0\/8 work/);
  assert.equal(slotClassState.has("manned"), true);
  assert.equal(slotClassState.has("unmanned"), false);
  assert.match(el.jobRows.innerHTML, /North Woodlot/);
  assert.match(el.workshopResearch.innerHTML, /Research/);
});

test("renderPopulationJobs renders recipe XP hover panel", () => {
  const el = {
    jobRows: {
      innerHTML: "",
      querySelectorAll: () => []
    },
    workshopStatus: {
      textContent: ""
    },
    workshopSlots: {
      innerHTML: "",
      ownerDocument: {
        activeElement: null
      },
      contains: () => false,
      querySelectorAll: () => []
    },
    workshopResearch: {
      innerHTML: ""
    },
    workshopUpgradeGraph: {
      innerHTML: "",
      querySelectorAll: () => []
    }
  };
  renderPopulationJobs(el, {
    state: {
      tavern: { jobs: { wood: 0, ore: 0, workshop: 1, research: 0 } },
      settlement: { availableWorkers: 3, hiredWorkers: 3, wagePerWorker: 1 },
      workshop: {
        slots: [{ recipeId: "planks", progress: 0 }],
        recipeXp: { planks: 36 },
        researchProgress: 0,
        progression: { points: {}, availablePoints: 0 }
      }
    },
    workSites: [],
    blueprints: {}
  });

  assert.match(el.workshopSlots.innerHTML, /recipe-xp-panel/);
  assert.match(el.workshopSlots.innerHTML, /Planks L7/);
  assert.match(el.workshopSlots.innerHTML, /XP 36/);
  assert.match(el.workshopSlots.innerHTML, /Reduced Cost/);
  assert.match(el.workshopSlots.innerHTML, /Batch Cutting/);
  assert.match(el.workshopSlots.innerHTML, /Measured Cuts/);
  assert.match(el.workshopSlots.innerHTML, /Cost: 2 wood/);
  assert.match(el.workshopSlots.innerHTML, /Output: 2 planks/);
});

test("visitorQueueHtml renders unrecruited visitors with portrait callback", () => {
  const html = visitorQueueHtml({
    state: {
      day: 3,
      tavernVisitors: {
        visitors: {
          visitor_1: { state: "present", nextChangeDay: 8 }
        }
      }
    },
    visitors: [
      {
        id: "founder",
        name: "Already Here",
        race: "human",
        role: "guard",
        cost: { coin: 1 },
        stats: { hp: 10, atk: 2, def: 1, utility: 1 }
      },
      {
        id: "visitor_1",
        name: "Dani",
        race: "half_elf",
        role: "scout",
        cost: { coin: 5, food: 2 },
        stats: { hp: 9, atk: 3, def: 1, utility: 4 }
      }
    ],
    roster: [{ id: "founder" }],
    portraitHtml: (visitor, sizeClass) => `<i>${visitor.id}:${sizeClass}</i>`
  });

  assert.doesNotMatch(html, /Already Here/);
  assert.match(html, /Dani/);
  assert.match(html, /Half_elf \/ scout/);
  assert.match(html, /tier 0 \/ fame 0 \/ 5d left/);
  assert.match(html, /cost: 5 coin, 2 food/);
  assert.match(html, /data-visitor-info="visitor_1"/);
  assert.match(html, /visitor_1:card/);
});

test("tavernUpgradeButtonHtml renders current effect and next cost", () => {
  const html = tavernUpgradeButtonHtml({
    state: {
      blueprints: {},
      tavern: {
        capacity: 3,
        population: 0,
        visitorSeats: 3
      }
    },
    blueprints: {
      bunkRoom: {
        cost: { wood: 20, ore: 8 }
      }
    }
  });

  assert.match(html, /upgrade tavern/);
  assert.match(html, /Tavern Level 1/);
  assert.match(html, /Current effect: adventurer capacity 3, worker population 0, visitor seats 3/);
  assert.match(html, /Next effect: \+1 adventurer capacity, \+1 worker population/);
  assert.match(html, /Upgrade cost: 10 wood, 4 ore/);
  assert.match(html, /common room/);
});

test("tavernUpgradeButtonHtml uses bunk room upgrade when unlocked", () => {
  const html = tavernUpgradeButtonHtml({
    state: {
      blueprints: { bunkRoom: true },
      tavern: {
        capacity: 5,
        population: 2,
        visitorSeats: 3
      }
    },
    blueprints: {
      bunkRoom: {
        cost: { wood: 20, ore: 8 }
      }
    }
  });

  assert.match(html, /Tavern Level 3/);
  assert.match(html, /Next effect: \+2 adventurer capacity, \+1 worker population/);
  assert.match(html, /Upgrade cost: 20 wood, 8 ore/);
  assert.match(html, /Bunk plans/);
});

test("visitorDetailHtml renders selected visitor info and read-only skills", () => {
  const html = visitorDetailHtml({
    visitor: {
      id: "visitor_1",
      name: "Dani",
      race: "half_elf",
      role: "scout",
      cost: { coin: 5, food: 2 },
      availabilityTier: 1,
      fameThreshold: 3,
      stayDays: 4
    },
    state: {
      day: 4,
      tavernVisitors: {
        visitors: {
          visitor_1: { state: "present", nextChangeDay: 9 }
        }
      }
    },
    hero: {
      id: "visitor_1",
      name: "Dani",
      race: "half_elf",
      role: "scout",
      primaryJob: "scout",
      secondaryJob: null,
      level: 1,
      xp: 0,
      skillPoints: 1,
      hp: 9,
      learnedSkills: {},
      spriteIndex: 2
    },
    stats: {
      hpMax: 9,
      atk: 3,
      def: 1,
      utility: 4,
      resolve: 10,
      travelSpeed: 0,
      recoveryReduce: 0,
      foodCostReduce: 0
    },
    atlas: { columns: 7, rows: 7 },
    activeTab: "skill1",
    availableSkillTreeIds: () => ["half_elf"],
    skillTrees: { half_elf: { name: "Half Elf", skillIds: ["root"] } },
    skills: { root: { name: "Root", category: "utility", maxRank: 1, requires: [], effects: [] } },
    skillRank: () => 0,
    canLearnSkill: () => ({ ok: false, reason: "hire first" })
  });

  assert.match(html, /detail-title">Dani/);
  assert.match(html, /hire cost: 5 coin, 2 food/);
  assert.match(html, /5d left/);
  assert.match(html, /data-tavern-detail-panel="info"/);
  assert.match(html, /data-tavern-detail-panel="skill1"/);
  assert.match(html, /skill-tree-title">Half Elf/);
  assert.match(html, /hire first/);
});

test("visitorQueueHtml reports when no visitors are waiting", () => {
  const html = visitorQueueHtml({
    visitors: [
      {
        id: "visitor_1",
        name: "Dani",
        race: "human",
        role: "scout",
        cost: {},
        stats: { hp: 9, atk: 3, def: 1, utility: 4 }
      }
    ],
    roster: [{ id: "visitor_1" }],
    portraitHtml: () => ""
  });

  assert.match(html, /no visitors waiting today/);
});

test("dungeonNodeMapHtml marks reached and failed nodes", () => {
  const html = dungeonNodeMapHtml({
    dungeon: {
      nodes: [
        { name: "Gate", type: "combat", reward: { coin: 1 } },
        { name: "Cellar", type: "hazard", reward: {} }
      ]
    },
    reached: 1,
    failedIndex: 1,
    rewardText: (reward) => Object.keys(reward).join(",") || "none"
  });

  assert.match(html, /1\. Gate/);
  assert.match(html, /class="node reached/);
  assert.match(html, /2\. Cellar/);
  assert.match(html, /failed/);
});

test("dungeonNodeGraphHtml renders branching route targets", () => {
  const html = dungeonNodeGraphHtml({
    dungeon: {
      routes: [
        { id: "main", name: "Main", default: true, nodeIds: ["entry", "rats", "boss"] },
        { id: "crawl", name: "Smuggler Crawl", nodeIds: ["entry", "smuggler", "cache"] }
      ],
      nodes: [
        { id: "entry", name: "Entry", type: "hazard", resolveCost: 2, reward: {} },
        { id: "rats", name: "Rat Pack", type: "combat", resolveCost: 3, reward: {} },
        { id: "boss", name: "Boss", type: "boss", resolveCost: 5, reward: {} },
        { id: "smuggler", name: "Smuggler Crawl", type: "check", resolveCost: 3, reward: {} },
        { id: "cache", name: "Cache", type: "check", resolveCost: 2, reward: {} }
      ]
    },
    selectedTargetNodeId: "smuggler",
    estimate: {
      routeNodeIds: ["entry", "smuggler"],
      reached: 1,
      success: false
    },
    rewardText: () => "none"
  });

  assert.match(html, /dungeon-route-graph/);
  assert.match(html, /Smuggler Crawl/);
  assert.match(html, /data-dungeon-target-node="smuggler"/);
  assert.match(html, /selected/);
  assert.match(html, /dungeon-route-link in-path/);
  assert.match(html, /failed/);
});

test("dungeonEstimateText renders empty and completed estimate states", () => {
  assert.match(dungeonEstimateText({ estimate: null }), /No cached estimate/);

  const text = dungeonEstimateText({
    estimate: {
      dungeonName: "Rat Cellar",
      strategy: "balanced",
      partyName: "Alpha",
      totalNodes: 3,
      reached: 3,
      success: true,
      hours: 8,
      foodCost: 2,
      hpStart: 20,
      hpEnd: 12,
      rewardText: "4 coin",
      transcript: ["hit rat"]
    },
    repeated: false,
    repeatMode: "repeat"
  });

  assert.match(text, /Rat Cellar \/ balanced/);
  assert.match(text, /repeat: ready to enable/);
  assert.match(text, /success: yes/);
  assert.match(text, /rewards: 4 coin/);
  assert.match(text, /hit rat/);
});

test("replayActorRowsHtml renders portraits, enemy initials, and targeting classes", () => {
  const html = replayActorRowsHtml({
    actors: [
      {
        id: "hero_1",
        name: "Dani",
        hp: 5,
        maxHp: 10,
        initiative: 8,
        speed: 4,
        spriteIndex: 2
      },
      {
        id: "rat_1",
        name: "Rat",
        hp: 2,
        maxHp: 4,
        initiative: 3,
        speed: 2,
        spriteIndex: null
      }
    ],
    event: {
      actorId: "hero_1",
      targetId: "rat_1"
    },
    portraitHtml: (index) => `<i>portrait ${index}</i>`
  });

  assert.match(html, /active/);
  assert.match(html, /targeted/);
  assert.match(html, /portrait 2/);
  assert.match(html, /RA/);
  assert.match(html, /width:50%/);
});

test("replayEventRowsHtml returns recent events and marks current", () => {
  const events = Array.from({ length: 14 }, (_, index) => ({
    icon: "!",
    text: `event ${index}`
  }));
  const html = replayEventRowsHtml(events, 13);

  assert.doesNotMatch(html, /event 0/);
  assert.match(html, /event 13/);
  assert.match(html, /class="current"/);
});

test("replayEmptyState returns no-replay placeholders", () => {
  const empty = replayEmptyState();

  assert.match(empty.partyActorsHtml, /no party snapshot/);
  assert.match(empty.enemyActorsHtml, /no enemy snapshot/);
  assert.equal(empty.actionIcon, "--");
  assert.match(empty.eventText, /simulate a run/);
  assert.equal(empty.eventRowsHtml, "");
});

test("locationDetailHtml renders work-site details", () => {
  const html = locationDetailHtml({
    location: {
      id: "north_woodlot",
      name: "North Woodlot",
      type: "work",
      coord: { x: 120, y: 240 },
      description: "trees and paths",
      output: { wood: 2 }
    },
    party: { name: "Alpha", memberIds: [] },
    partyReady: { canQueue: true, message: "ready" },
    tavernCoord: { x: 100, y: 200 },
    distanceText: () => "44.7",
    rewardText: () => "2 wood",
    heroName: () => "",
    assignedWorkers: 3
  });

  assert.match(html, /North Woodlot/);
  assert.match(html, /type: work/);
  assert.match(html, /distance from tavern: 44.7/);
  assert.match(html, /output: 2 wood/);
  assert.match(html, /assigned workers: 3/);
});

test("locationDetailHtml renders work-site upgrade controls", () => {
  const html = locationDetailHtml({
    location: {
      id: "wood",
      name: "North Woodlot",
      type: "work",
      coord: { x: 120, y: 240 },
      description: "trees and paths",
      output: { wood: 2 }
    },
    party: { name: "Alpha", memberIds: [] },
    partyReady: { canQueue: true, message: "ready" },
    tavernCoord: { x: 100, y: 200 },
    distanceText: () => "44.7",
    rewardText: () => "2 wood",
    heroName: () => "",
    assignedWorkers: 3,
    workSiteUpgrade: {
      level: 1,
      maxWorkers: 4,
      costText: "400 wood, 100 coin"
    }
  });

  assert.match(html, /upgrade: level 1/);
  assert.match(html, /workplaces: 3\/4/);
  assert.match(html, /next upgrade: 400 wood, 100 coin/);
  assert.match(html, /data-upgrade-work-site="wood"/);
});

test("locationDetailHtml renders dungeon assignment state", () => {
  const html = locationDetailHtml({
    location: {
      id: "rat_cellar",
      name: "Rat Cellar",
      type: "dungeon",
      coord: { x: 300, y: 330 },
      description: "rats below the tavern",
      titleImage: "assets/rat-cellar-01.png"
    },
    party: { name: "Alpha", memberIds: ["hero_1"] },
    partyReady: { canQueue: false, message: "party must be healed" },
    tavernCoord: { x: 100, y: 200 },
    distanceText: () => "238.5",
    rewardText: () => "",
    heroName: (id) => id === "hero_1" ? "Dani" : id
  });

  assert.match(html, /Rat Cellar/);
  assert.match(html, /poi-title-image/);
  assert.match(html, /selected party: Alpha \(Dani\)/);
  assert.match(html, /party readiness: party must be healed/);
  assert.match(html, /click dungeon on map to run/);
  assert.doesNotMatch(html, /assign repeated route/);
});

test("operationRowsHtml renders active and paused repeated operations", () => {
  const html = operationRowsHtml({
    operations: [
      {
        partyId: "party_alpha",
        label: "Alpha: Rat Cellar"
      }
    ],
    repeatedPlans: {
      party_alpha: { partyId: "party_alpha" },
      party_beta: {
        partyId: "party_beta",
        partyName: "Beta",
        dungeonName: "Old Mine",
        foodCost: 4
      }
    },
    resources: { food: 2 },
    currentOperationPhase: () => ({
      phase: { name: "return" },
      remaining: 3.2
    })
  });

  assert.match(html, /Alpha: Rat Cellar/);
  assert.match(html, /return \/ repeated/);
  assert.match(html, /4h/);
  assert.match(html, /Beta: Old Mine/);
  assert.match(html, /repeated paused/);
  assert.match(html, /food 2\/4/);
});

test("operationRowsHtml reports empty operations", () => {
  assert.match(
    operationRowsHtml({
      operations: [],
      repeatedPlans: {},
      resources: { food: 0 },
      currentOperationPhase: () => null
    }),
    /no party operations queued/
  );
});

test("poiRowsHtml renders non-tavern coordinate rows", () => {
  const html = poiRowsHtml({
    poi: [
      { id: "tavern", name: "Tavern", coord: { x: 100, y: 100 } },
      { id: "mine", name: "Mine", coord: { x: 200, y: 300 } }
    ],
    tavernCoord: { x: 100, y: 100 },
    distanceText: () => "223.6"
  });

  assert.doesNotMatch(html, /<td>Tavern<\/td>/);
  assert.match(html, /<td>Mine<\/td>/);
  assert.match(html, /<td>200<\/td>/);
  assert.match(html, /223.6/);
});

test("mapRouteHtml renders route geometry from two coordinates", () => {
  const html = mapRouteHtml({ x: 0, y: 0 }, { x: 3, y: 4 });

  assert.match(html, /class="map-route"/);
  assert.match(html, /width:5px/);
  assert.match(html, /transform:rotate/);
});

test("mapPoiButtonHtml marks tavern and selected POIs", () => {
  const html = mapPoiButtonHtml({
    id: "tavern",
    name: "Tavern",
    type: "tavern",
    coord: { x: 500, y: 500 }
  }, "tavern");

  assert.match(html, /map-poi tavern selected/);
  assert.match(html, /data-location-id="tavern"/);
  assert.match(html, /500,500/);
});

test("mapWorldHtml renders routes, POIs, and actor layer", () => {
  const html = mapWorldHtml({
    tavernCoord: { x: 100, y: 100 },
    selectedLocationId: "mine",
    mapWorld: { width: 2048, height: 1536, backgroundImage: "assets/map-bg.png" },
    poi: [
      { id: "tavern", name: "Tavern", type: "tavern", coord: { x: 100, y: 100 } },
      { id: "mine", name: "Mine", type: "work", coord: { x: 200, y: 100 } }
    ]
  });

  assert.match(html, /id="mapWorld"/);
  assert.match(html, /--map-world-height:1536px/);
  assert.match(html, /class="map-route"/);
  assert.match(html, /data-location-id="mine"/);
  assert.match(html, /id="mapActors"/);
});

test("mapWorldHtml renders dungeon context menu", () => {
  const html = mapWorldHtml({
    tavernCoord: { x: 100, y: 100 },
    selectedLocationId: "cellar",
    mapWorld: { width: 2048, height: 1536, backgroundImage: "assets/map-bg.png" },
    contextMenu: { locationId: "cellar", x: 44, y: 55 },
    poi: [
      { id: "tavern", name: "Tavern", type: "tavern", coord: { x: 100, y: 100 } },
      { id: "cellar", name: "Rat Cellar", type: "dungeon", coord: { x: 200, y: 100 } }
    ]
  });

  assert.match(html, /class="map-context-menu"/);
  assert.match(html, /left:44px;top:55px/);
  assert.match(html, /data-map-context-action="run"/);
  assert.match(html, /data-map-context-action="cancel"/);
});

test("partyActorHtml marks busy party phases", () => {
  const html = partyActorHtml({
    operation: { label: "Alpha: Rat Cellar" },
    phaseState: {
      phase: {
        name: "dungeon",
        from: { x: 10, y: 10 },
        to: { x: 10, y: 10 }
      }
    },
    coord: { x: 10, y: 10 }
  });

  assert.match(html, /map-actor party busy/);
  assert.match(html, /Alpha: Rat Cellar: dungeon/);
});

test("mapActorsHtml renders party actors without worker markers", () => {
  const html = mapActorsHtml({
    operations: [
      { label: "Alpha", partyId: "party_alpha" }
    ],
    currentOperationPhase: () => ({
      phase: {
        name: "return",
        from: { x: 0, y: 0 },
        to: { x: 10, y: 0 }
      },
      progress: 0.5
    }),
    interpolateCoord: (from, to, progress) => ({
      x: from.x + (to.x - from.x) * progress,
      y: from.y + (to.y - from.y) * progress
    })
  });

  assert.doesNotMatch(html, /map-actor worker/);
  assert.match(html, /map-actor party/);
  assert.match(html, /left:5px;top:0px/);
});

test("portraitStyle and portraitHtml resolve atlas positions", () => {
  assert.equal(portraitStyle(0, { columns: 7, rows: 7 }), "background-position:0% 0%");
  assert.equal(portraitStyle(48, { columns: 7, rows: 7 }), "background-position:100% 100%");
  assert.match(
    portraitHtml({ spriteIndex: 8 }, "card", { columns: 7, rows: 7 }),
    /char-portrait card/
  );
});

test("compactStateLabel and hpPercent format roster status", () => {
  assert.equal(compactStateLabel("Walking to dungeon"), "WD");
  assert.equal(compactStateLabel("Unknown"), "UN");
  assert.equal(hpPercent({ hp: 5 }, { hpMax: 10 }), 50);
  assert.equal(hpPercent({ hp: 15 }, { hpMax: 10 }), 100);
});

test("partyMemberButtonsHtml renders idle and busy members", () => {
  const html = partyMemberButtonsHtml({
    party: {
      id: "party_alpha",
      memberIds: ["hero_1", "hero_2"]
    },
    characterState: (heroId) => ({
      state: heroId === "hero_1" ? "Idle" : "Fighting"
    }),
    heroName: (heroId) => heroId === "hero_1" ? "Dani" : "Rook"
  });

  assert.match(html, /data-toggle-member="hero_1"/);
  assert.match(html, />-Dani<\/button>/);
  assert.match(html, /data-toggle-member="hero_2" disabled/);
});

test("partyRowsHtml renders selected party state and stats", () => {
  const html = partyRowsHtml({
    parties: [
      {
        id: "party_alpha",
        name: "Alpha",
        memberIds: ["hero_1"]
      }
    ],
    selectedPartyId: "party_alpha",
    operations: [
      {
        partyId: "party_alpha"
      }
    ],
    partyStats: () => ({
      hpCurrent: 5,
      hpMax: 10,
      atk: 3
    }),
    currentOperationPhase: () => ({
      phase: {
        name: "dungeon"
      }
    }),
    characterState: () => ({ state: "Idle" }),
    heroName: () => "Dani"
  });

  assert.match(html, /selected-party-row/);
  assert.match(html, /data-cancel-party="party_alpha"/);
  assert.match(html, /dungeon<br>HP 5\/10 ATK 3/);
});

test("skillButtonHtml and skillTreesHtml render learnable skill state", () => {
  const hero = { learnedSkills: { root: 1 } };
  const skills = {
    root: {
      name: "Root",
      category: "fight",
      maxRank: 3,
      requires: [],
      effects: [{ type: "atk_add", valuePerRank: 2 }]
    },
    child: {
      name: "Child",
      category: "utility",
      maxRank: 1,
      requires: ["root"],
      effects: [{ type: "utility_add", valuePerRank: 1 }],
      costPerRank: 2
    }
  };

  const button = skillButtonHtml({
    hero,
    skillId: "root",
    skills,
    skillRank: () => 1,
    canLearnSkill: () => ({ ok: true, reason: "available" })
  });

  assert.match(button, /skill-node learned/);
  assert.match(button, /data-learn-skill="root"/);
  assert.match(button, /fight 1\/3/);
  assert.match(button, /skill-detail-panel/);
  assert.match(button, /Attack/);
  assert.match(button, /\+2 -> \+4/);

  const tree = skillTreesHtml({
    hero,
    availableSkillTreeIds: () => ["human"],
    skillTrees: {
      human: {
        name: "Human",
        skillIds: ["root", "child"]
      }
    },
    skills,
    skillRank: () => 0,
    canLearnSkill: () => ({ ok: false, reason: "blocked" })
  });

  assert.match(tree, /skill-tree-title">Human/);
  assert.match(tree, /disabled/);
  assert.match(tree, /skill-detail-panel/);
  assert.match(tree, /Cost: 2 skill points/);
  assert.match(tree, /State: blocked/);
});

test("progressionGraphHtml marks right-side node details to open left", () => {
  const html = progressionGraphHtml({
    graph: {
      nodes: {
        left: {
          id: "left",
          name: "Left",
          category: "utility",
          maxRank: 1,
          x: 0,
          y: 0
        },
        right: {
          id: "right",
          name: "Right",
          category: "utility",
          maxRank: 1,
          x: 1,
          y: 0
        }
      },
      links: [{ from: "left", to: "right" }]
    },
    state: { points: {} },
    canSpendNode: () => ({ ok: true, reason: "available" }),
    nodeDetailHtml: () => '<span class="skill-detail-panel">Detail</span>'
  });

  assert.match(html, /progression-node-wrap detail-left/);
  assert.match(html, /left:88%;top:12%;/);
});

test("rosterCardsHtml renders detailed and minimized character cards", () => {
  const hero = {
    id: "hero_1",
    name: "Dani",
    race: "human",
    role: "guard",
    level: 2,
    hp: 8,
    spriteIndex: 1
  };
  const stats = {
    hpMax: 10,
    atk: 3,
    def: 2,
    utility: 1
  };
  const detailed = rosterCardsHtml({
    roster: [hero],
    focusedHeroId: "hero_1",
    minimized: false,
    heroStats: () => stats,
    characterState: () => ({ state: "Idle", party: "Alpha" }),
    atlas: { columns: 7, rows: 7 }
  });

  assert.match(detailed, /character-card selected/);
  assert.match(detailed, /Dani/);
  assert.match(detailed, /hp 8\/10/);

  const minimized = rosterCardsHtml({
    roster: [hero],
    focusedHeroId: "none",
    minimized: true,
    heroStats: () => stats,
    characterState: () => ({ state: "Walking home", party: "Alpha" }),
    atlas: { columns: 7, rows: 7 }
  });

  assert.match(minimized, /character-card compact/);
  assert.match(minimized, /compact-state">WH/);
});

test("focusedCharacterHtml renders selected character detail and add-party state", () => {
  const html = focusedCharacterHtml({
    hero: {
      id: "hero_1",
      name: "Dani",
      race: "human",
      role: "guard",
      primaryJob: "guard",
      secondaryJob: null,
      level: 2,
      xp: 5,
      skillPoints: 1,
      hp: 8,
      gear: ["iron_blade"],
      spriteIndex: 3
    },
    stats: {
      hpMax: 10,
      atk: 4,
      def: 2,
      utility: 1,
      travelSpeed: 1,
      recoveryReduce: 0,
      foodCostReduce: 1
    },
    status: {
      state: "Idle",
      party: "none"
    },
    currentParty: {
      memberIds: []
    },
    blueprints: {
      iron_blade: {
        name: "Iron Blade"
      }
    },
    atlas: {
      columns: 7,
      rows: 7
    },
    skillTreeHtml: "<button>skill</button>"
  });

  assert.match(html, /detail-title">Dani/);
  assert.match(html, /data-roster-detail-panel="info"/);
  assert.match(html, /data-roster-detail-panel="skill1"/);
  assert.match(html, /data-roster-detail-panel="skill2"/);
  assert.match(html, /level: 2 \(5\/16 xp\)/);
  assert.match(html, /gear: Iron Blade/);
  assert.match(html, /craft iron blade/);
  assert.match(html, /add to current party/);
  assert.doesNotMatch(html, /addFocusedToPartyBtn" disabled/);
});

test("temple status and stone buttons render active/unlocked states", () => {
  assert.equal(
    templeStatusText(
      { name: "Triangle", maxActiveLines: 1, modifierText: "fight +10%" },
      { activeLines: [{ a: "red", b: "blue" }] }
    ),
    "Triangle / links active: 1/1 / fight +10%"
  );

  const html = templeStoneButtonsHtml({
    stones: {
      triangle: { name: "Triangle", unlocked: true },
      square: { name: "Square", unlocked: false }
    },
    activeStoneId: "triangle"
  });

  assert.match(html, /temple-stone-button active/);
  assert.match(html, /data-temple-stone="square" disabled/);
});

test("temple board, links, and sockets render board elements", () => {
  const stone = {
    boardClass: "altar-triangle",
    sockets: [
      { id: "ember", colorId: "red", label: "Ember", x: 10, y: 20 }
    ],
    links: [["ember", "azure"]]
  };
  const links = templeLinksHtml({
    stone,
    socketById: (id) => id === "ember"
      ? { colorId: "red", x: 10, y: 20 }
      : { colorId: "blue", x: 50, y: 60 },
    colorById: (id) => ({ hex: id === "red" ? "#f00" : "#00f" }),
    isLineActive: () => true
  });
  const socket = templeSocketHtml({
    socket: stone.sockets[0],
    socketId: "ember",
    color: { name: "Red", hex: "#f00" },
    shardId: null,
    shard: null,
    connected: true,
    influence: "none",
    shardTokenHtml: () => ""
  });
  const board = templeBoardHtml({
    stone,
    linksHtml: links,
    socketsHtml: () => socket
  });

  assert.match(links, /temple-link active/);
  assert.match(socket, /temple-socket connected/);
  assert.match(socket, /drop shard/);
  assert.match(board, /drag shards onto colored sockets/);
  assert.match(board, /temple-board-surface altar-triangle/);
  assert.match(board, /temple-link-layer/);
});

test("shard token, dots, progress, and inventory slot render shard state", () => {
  const shard = {
    name: "Fang",
    equipColors: ["red"],
    affectedBy: ["red", "blue"],
    xpToMax: 20
  };
  const dots = shardColorDotsHtml(shard, [
    { id: "red", hex: "#f00" },
    { id: "blue", hex: "#00f" },
    { id: "green", hex: "#0f0" }
  ]);
  const token = shardTokenHtml({
    shardId: "fang",
    shard,
    found: true,
    selected: true,
    glyph: "F",
    colorDotsHtml: dots,
    options: { source: "socket", slotColor: "red" }
  });
  const progress = shardProgressHtml({ xp: 10, xpToMax: 20 });
  const slot = inventorySlotHtml({
    index: 0,
    shardId: "fang",
    shard,
    selected: true,
    shardTokenHtml: () => token,
    shardProgressHtml: () => progress
  });

  assert.match(dots, /can-slot/);
  assert.match(dots, /affected/);
  assert.match(token, /shard-token selected/);
  assert.match(token, /equipped/);
  assert.match(progress, /xp 10\/20/);
  assert.match(progress, /width:50%/);
  assert.match(slot, /shard-inventory-cell selected/);
});

test("templeBuffRowsHtml renders active buffs and empty state", () => {
  assert.match(
    templeBuffRowsHtml({ bonuses: { fight_attack: 3, loot_bonus: 0 } }),
    /fight attack \+3/
  );
  assert.match(
    templeBuffRowsHtml({ bonuses: {} }),
    /no active shard buffs/
  );
});

test("shardDetailHtml renders stone and selected shard details", () => {
  const stone = { name: "Triangle", maxActiveLines: 1, modifierText: "fight +10%" };
  const stoneState = { activeLines: [] };

  assert.match(
    shardDetailHtml({
      shardId: null,
      shard: null,
      stone,
      stoneState,
      xp: 0,
      colorName: (id) => id,
      formatEffects: () => "",
      dungeonVisits: {},
      bossVisits: {}
    }),
    /select a shard/
  );

  const html = shardDetailHtml({
    shardId: "fang",
    shard: {
      name: "Fang",
      source: "Rat Cellar",
      xpToMax: 20,
      equipColors: ["red"],
      affectedBy: ["red", "blue"],
      colorEffects: {
        red: [{ type: "fight_attack", min: 1, max: 3 }]
      },
      dungeonId: "rat_cellar"
    },
    stone,
    stoneState: { activeLines: [{ a: "red", b: "blue" }] },
    xp: 5,
    colorName: (id) => id.toUpperCase(),
    formatEffects: () => "fight attack +2 (1-3)",
    dungeonVisits: { rat_cellar: 7 },
    bossVisits: { rat_cellar: 1 }
  });

  assert.match(html, /Fang/);
  assert.match(html, /state: found/);
  assert.match(html, /can slot: RED/);
  assert.match(html, /RED fight attack \+2/);
  assert.match(html, /visits 7, boss 1/);
});

test("formatTempleEffectType replaces underscores", () => {
  assert.equal(formatTempleEffectType("fight_attack"), "fight attack");
});
