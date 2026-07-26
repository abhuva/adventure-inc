export const EVENT_TRIGGERS = {
  GAME_STARTED: "game.started",
  TAB_TAVERN: "tab.tavern",
  TAB_POPULATION: "tab.population",
  TAB_ROSTER: "tab.roster",
  TAB_DUNGEON: "tab.dungeon",
  FIRST_RECRUIT: "roster.first_recruit",
  FIRST_DUNGEON_SIMULATED: "dungeon.first_simulated",
  FIRST_RUN_QUEUED: "dungeon.first_queued",
  FIRST_OPERATION_RETURNED: "dungeon.first_returned",
  SECOND_DUNGEON_REVEALED: "dungeon.second_revealed",
  FIRST_ITEM_CRAFTED: "craft.first_item"
};

export const FIRST_STEP_EVENTS = [
  {
    id: "tutorial.tavern_charter",
    trigger: EVENT_TRIGGERS.GAME_STARTED,
    title: "Tavern Charter",
    category: "Tutorial",
    priority: 100,
    once: true,
    presentation: { level: "blocking", time: "pause" },
    body: [
      "The charter is not much yet: a rented common room, a leaking cellar door, and you, the founder, still wearing travel dust.",
      "Before anyone trusts this place, clear the rat nest under the old stores. Choose Alpha on the Map, click Rat Cellar, and run the first route."
    ],
    actions: [
      { id: "open-map", label: "open map", kind: "tab", tabId: "map" },
      { id: "close", label: "continue", kind: "close" }
    ]
  },
  {
    id: "tutorial.dungeon_first_visit",
    trigger: EVENT_TRIGGERS.TAB_DUNGEON,
    title: "Reading The Run",
    category: "Tutorial",
    priority: 85,
    once: true,
    presentation: { level: "blocking", time: "pause" },
    body: [
      "The Dungeon board shows what happened: main stats, how deep the party reached, and the time/combat log.",
      "Strategy changes recalculate the next attempt immediately. A party on a repeated route keeps working from the newest plan once it can queue again."
    ],
    actions: [
      { id: "close", label: "continue", kind: "close" }
    ]
  },
  {
    id: "tutorial.tavern_first_visit",
    trigger: EVENT_TRIGGERS.TAB_TAVERN,
    title: "Recruitment Desk",
    category: "Tutorial",
    priority: 80,
    once: true,
    presentation: { level: "blocking", time: "pause" },
    body: [
      "A cleared cellar makes the tavern look less doomed. That is enough for travelers to listen.",
      "Visitors now come and go as the tavern's fame reaches them. Hire one adventurer, then build them into a second party on the Roster board."
    ],
    actions: [
      { id: "close", label: "continue", kind: "close" }
    ]
  },
  {
    id: "tutorial.first_recruit",
    trigger: EVENT_TRIGGERS.FIRST_RECRUIT,
    title: "Roster Expanded",
    category: "Tutorial",
    priority: 75,
    once: true,
    presentation: { level: "blocking", time: "pause" },
    body: [
      "Each adventurer has explicit state, party membership, levels, skill points, and gear.",
      "Party composition is part of the puzzle. Select a party, focus a character, and move idle adventurers into the group you want to test."
    ],
    actions: [
      { id: "open-roster", label: "open roster", kind: "tab", tabId: "roster" },
      { id: "close", label: "continue", kind: "close" }
    ]
  },
  {
    id: "tutorial.roster_first_visit",
    trigger: EVENT_TRIGGERS.TAB_ROSTER,
    title: "Party Board",
    category: "Tutorial",
    priority: 70,
    once: true,
    presentation: { level: "blocking", time: "pause" },
    body: [
      "Parties are explicit groups. Characters show whether they are idle, queued, walking, fighting, or recovering.",
      "Make a new party, focus the recruit, add them to that party, then return to the Map and send the new group after the rats."
    ],
    actions: [
      { id: "open-map", label: "open map", kind: "tab", tabId: "map" },
      { id: "close", label: "continue", kind: "close" }
    ]
  },
  {
    id: "tutorial.population_first_visit",
    trigger: EVENT_TRIGGERS.TAB_POPULATION,
    title: "Hands For The House",
    category: "Tutorial",
    priority: 65,
    once: true,
    presentation: { level: "blocking", time: "pause" },
    body: [
      "Now the tavern needs more than brave feet. Wood, ore, and workshop labor turn small victories into permanent growth.",
      "The woodlot and ore cut are now marked on the Map. Assign workers, feed the workshop, and let the settlement start carrying some weight."
    ],
    actions: [
      { id: "close", label: "continue", kind: "close" }
    ]
  },
  {
    id: "tutorial.first_simulation",
    trigger: EVENT_TRIGGERS.FIRST_DUNGEON_SIMULATED,
    title: "Estimate Recorded",
    category: "Tutorial",
    priority: 60,
    once: true,
    presentation: { level: "blocking", time: "pause" },
    body: [
      "The estimate is now cached. Inspect the replay, compare strategy, and watch how far Resolve carries the party.",
      "Previewed plans do not award anything. Only a scheduled operation that returns to the tavern applies rewards."
    ],
    actions: [
      { id: "close", label: "continue", kind: "close" }
    ]
  },
  {
    id: "tutorial.first_run_queued",
    trigger: EVENT_TRIGGERS.FIRST_RUN_QUEUED,
    title: "Operation Queued",
    category: "Tutorial",
    priority: 55,
    once: true,
    presentation: { level: "blocking", time: "pause" },
    body: [
      "The plan is now a scheduled operation. Food was paid up front; rewards apply only when the party returns.",
      "The Map screen shows travel, dungeon, return, and recovery phases as deterministic hour ticks. If the route is repeated, the party will try again while supplies allow."
    ],
    actions: [
      { id: "open-map", label: "open map", kind: "tab", tabId: "map" },
      { id: "close", label: "continue", kind: "close" }
    ]
  },
  {
    id: "tutorial.first_return",
    trigger: EVENT_TRIGGERS.FIRST_OPERATION_RETURNED,
    title: "Result Applied",
    category: "Tutorial",
    priority: 50,
    once: true,
    presentation: { level: "blocking", time: "pause" },
    body: [
      "The returned operation applied fixed rewards, XP, fame, and Rat Cellar mastery.",
      "Next, open the Tavern and hire help. A second party can work the cellar while the founder pushes deeper."
    ],
    actions: [
      { id: "close", label: "continue", kind: "close" }
    ]
  },
  {
    id: "tutorial.temple_revealed",
    trigger: EVENT_TRIGGERS.SECOND_DUNGEON_REVEALED,
    title: "Stone Under Stone",
    category: "Tutorial",
    priority: 48,
    once: true,
    presentation: { level: "blocking", time: "pause" },
    body: [
      "The Rat Cellar is no longer the whole map. Deeper ruins wake older systems.",
      "The Temple is where dungeon resonance becomes long-term party power. Use it after the next dungeon starts feeding shards and mastery."
    ],
    actions: [
      { id: "open-temple", label: "open temple", kind: "tab", tabId: "temple" },
      { id: "close", label: "continue", kind: "close" }
    ]
  },
  {
    id: "tutorial.first_craft",
    trigger: EVENT_TRIGGERS.FIRST_ITEM_CRAFTED,
    title: "Known Craft",
    category: "Tutorial",
    priority: 45,
    once: true,
    presentation: { level: "blocking", time: "pause" },
    body: [
      "Crafting consumes known inputs and produces known gear. Item stats do not roll.",
      "This keeps build experiments inspectable: when estimates change, the cause is visible in roster, skill, gear, route, or strategy choices."
    ],
    actions: [
      { id: "close", label: "continue", kind: "close" }
    ]
  }
];
