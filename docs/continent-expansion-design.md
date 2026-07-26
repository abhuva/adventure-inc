# Continent Expansion Design

## Intent

Continent expansion is the long-term growth mechanic that replaces a traditional linear prestige reset.

The player does not abandon the old game board. Instead, they unlock additional continents that remain available in parallel. Each continent is a semi-independent operational layer with its own map, local economy, dungeons, settlement state, and rule modifiers. The player can switch the focused continent, manage that continent live, and later return to another continent where deterministic catch-up applies the time that passed while it was unfocused.

This keeps the expansion fantasy intact:

- the company grows from one tavern into a network of continental branches
- old continents stay valuable instead of becoming deleted prestige layers
- new continents can change the rules without invalidating previous progress
- transferring adventurers between continents becomes a strategic logistics decision
- dangerous travel can be the rare place where permanent adventurer loss exists

The feature must preserve the project's deterministic philosophy. No continent rule, catch-up result, transfer outcome, or adventurer loss should depend on randomness.

## Core Model

The world contains multiple unlocked continents.

At any moment, one continent is focused. The focused continent:

- advances through the ordinary live tick path
- renders the active Map, Tavern, Population, Roster, Dungeon, Temple, and Systems views
- receives direct player commands
- drives visible workers, party markers, and current local operations

Unfocused continents do not update every realtime tick. Instead, each continent records when it was last updated. When the player focuses that continent again, the game calculates elapsed time away and runs deterministic catch-up for that continent.

This is closer to a portfolio-management model than a reset:

```txt
World
- Old Marches: focused or idle catch-up, starter rules
- Ash Coast: focused or idle catch-up, harsher dungeons and training needs
- Black Reef: focused or idle catch-up, fatal sea route access
```

## Local And Global Ownership

Most tangible state should be local to a continent.

Local continent state:

- map visibility and map view
- POI data selection or continent map ID
- tavern state and visitor queue
- settlement workforce, work sites, and workshop state
- local resources such as food, wood, ore, hide, planks, comfort goods, and training bows
- local dungeons, dungeon conquest, dungeon mastery, and active/repeated dungeon plans
- local party groups and active operations
- local rule modifiers
- local logs or summarized continent report entries

Global world state:

- unlocked continent IDs
- active/focused continent ID
- global hero registry
- hero stationing and transfer status
- expedition routes between continents
- global knowledge or meta unlocks
- memorial records for permanently lost adventurers
- possibly Temple shard ownership, depending on later balance decisions

The likely hero model is global heroes with a current assignment:

```js
hero.location = {
  type: "continent",
  continentId: "old_marches"
}
```

or, during travel:

```js
hero.location = {
  type: "transfer",
  transferId: "transfer_12"
}
```

This keeps hero identity stable across the whole game while preventing the same hero from being used on multiple continents at once.

## Continent Rules

Each continent can alter the rules of play. A continent rule profile should be explicit and inspectable.

Example rule fields:

```js
{
  id: "ash_coast",
  name: "Ash Coast",
  dungeonDifficultyMultiplier: 1.5,
  freshRecruitDungeonPenalty: true,
  trainingRequired: true,
  travelTimeMultiplier: 1.25,
  foodCostAdd: 1,
  workshopRecipeOverrides: {},
  visitorPoolId: "ash_coast",
  availableBuildings: ["camp", "trainingGrounds", "workshop"]
}
```

Possible continent identities:

- **Old Marches**: starter rules, suitable first dungeon, ordinary visitor onboarding.
- **Ash Coast**: no suitable starting dungeon, fresh recruits need Training Grounds before dungeon work, higher food pressure.
- **Iron Dominion**: ore rich, wood poor, equipment crafting matters more.
- **Glass Steppe**: long travel distances, scouts and travel-speed builds become stronger.
- **Black Reef**: dangerous sea approach, route has deterministic permanent-loss travel events.
- **Sunken Crown**: utility checks and Temple shard setups matter more than raw combat.

Different rules should not simply increase numbers. They should change what decisions matter.

## No-Reset Expansion

Unlocking a continent should not erase previous continents.

Instead:

1. The current continent reaches an unlock milestone.
2. The player unlocks a route or charter to a new continent.
3. The new continent appears in a continent switcher.
4. The player establishes an initial foothold.
5. The player may switch between old and new continents.

Old continents remain useful as:

- resource bases
- training centers
- safer recruitment zones
- shard or blueprint farms
- staging areas for future transfers
- stable automation boards

New continents provide:

- different local rules
- harder dungeons
- unique visitors
- unique resources or blueprints
- new route hazards
- new long-term progression goals

## First Unlock: Expedition POI

The first player-facing entry point should be an `Expedition` POI on the Map.

For testing, this POI can unlock after day 7. Later it can unlock from an authored milestone such as a boss clear, fame threshold, charter blueprint, or map discovery.

The `Expedition` POI is not a dungeon. It represents the route, dock, charter office, caravan post, or staging ground that lets the tavern send adventurers toward another continent.

Map behavior:

1. The `Expedition` POI appears on the current continent's map once unlocked.
2. Clicking the POI shows normal Map side-panel information.
3. The info panel includes a `run` action.
4. `run` does not schedule a dungeon operation.
5. `run` switches to a dedicated `Expedition` tab.

The Map side-panel should show:

- expedition name
- destination continent
- route duration
- resource cost
- party/adventurer capacity
- known hazards or `none`
- whether permanent loss is involved
- a `run` button that routes to the Expedition tab

The first test route can be safe:

```txt
Expedition: Ash Coast Charter
Unlock: day 7 for prototype
Origin: Old Marches
Destination: Ash Coast
Duration: 18 days
Cost: 40 food, 120 coin, 20 planks
Capacity: one party
Known hazards: none
```

## Expedition Tab

The `Expedition` tab is the launch surface for continent travel.

It should show all route information before the player commits:

- origin continent
- destination continent
- selected party
- selected adventurers
- travel duration
- resource costs
- route capacity
- known hazards
- deterministic arrival effects
- permanent-loss warning if relevant

The first version can select a party rather than individual heroes. This fits the current party-based UI and makes it clear which adventurers leave together.

The `start expedition` button:

1. validates the selected party
2. validates resources
3. pays the local origin cost
4. creates a transfer operation
5. removes those adventurers from normal local use
6. changes their visible state to traveling or in expedition
7. removes them from current continent roster views, party assignment, dungeon planning, crafting, and training

The underlying hero data is not deleted. Heroes move into transfer state until arrival.

## Expedition Arrival

When an expedition reaches the destination continent, the player receives a popup.

For a safe first route:

```txt
Ash Coast reached.
Your expedition has made landfall.

[Switch to Ash Coast] [Stay in Old Marches]
```

If the player switches, the destination continent becomes focused and catch-up/switch rules apply.

If the player stays, the destination continent remains available in the continent switcher. The arrived heroes are stationed on the destination continent and are no longer available on the origin continent.

For a fatal route, arrival may first require resolving the loss choice before the switch/stay prompt fully resolves.

Arrival popup rules:

- deterministic arrival state is known from the transfer
- no random event selection
- switch/stay is a UI focus choice, not a gameplay reroll
- arrived heroes are stationed at destination regardless of the focus choice
- if destination was locked, arrival unlocks it

## Continent Tab

After at least two continents are available, the player can switch focus from a dedicated `Continent` tab.

The Continent tab should expose:

- current focused continent
- continent overview map using `assets/continent-bg.png`
- clickable continent markers for known and locked continents
- summary of selected continent
- time since selected continent was last focused
- local resource summary
- local operation summary
- known rule modifiers
- `switch`/`cancel` context menu near the click point for unlocked non-focused continents

Selecting a marker alone should not switch continents. It updates the right-side detail panel. If the selected continent is unlocked and not currently focused, the marker click also opens a context menu where `switch` performs the focus change.

Switch behavior:

1. Player clicks an unlocked non-focused continent marker.
2. Player clicks `switch` in the context menu.
3. Current continent stores its last-updated timestamp.
4. Target continent calculates time away.
5. Target continent catch-up applies.
6. The target continent becomes focused.
7. A catch-up report is shown.

This keeps switching explicit and prevents accidental refocus when inspecting other continents or locked future destinations.

## Catch-Up For Unfocused Continents

Inactive continents should not run the full live render/timer path. On refocus, they use deterministic catch-up.

Catch-up inputs:

- continent state
- elapsed hours since last update
- continent rule profile
- global hero transfer state
- route operations arriving or leaving that continent

Catch-up outputs:

- updated resources
- completed worker cycles
- completed party operations
- repeated plans queued or paused
- day rollovers and upkeep effects
- visitor queue refreshes
- hero XP/level changes
- summarized report lines

The catch-up report should be player-readable:

```txt
Ash Coast, 18 days away
+96 wood, +24 ore, +38 food
3 dungeon runs completed
1 repeated plan paused: food 1/4
Mira reached level 4
2 visitors left, 1 visitor arrived
```

Catch-up should be deterministic, but it does not need to produce full combat replay timelines for every completed run. It can apply the same scheduled operation outcomes already known from cached estimates and repeated plans.

## Adventurer Transfers

Moving adventurers between continents is an explicit transfer operation, not free reassignment.

A transfer defines:

- origin continent
- destination continent
- selected adventurers
- travel duration
- resource cost
- route capacity
- cargo rules, if any
- known hazards
- known permanent-loss requirements, if any

Example:

```txt
Old Marches -> Ash Coast
Duration: 18 days
Cost: 40 food, 120 coin, 20 planks
Capacity: 4 adventurers
Known hazard: hard sea passage
Loss: none
```

Dangerous example:

```txt
Ash Coast -> Black Reef
Duration: 30 days
Cost: 80 food, 200 coin, 40 planks
Capacity: 5 adventurers
Known hazard: Black Strait
Loss rule: one traveler must be permanently lost on arrival
Secondary effect: lowest Resolve survivor arrives Injured for 20 days
```

Transfers should lock selected adventurers until arrival. They cannot run dungeons, train, craft, or be assigned to parties while traveling.

## Deterministic Travel Risk

Travel is the only currently planned place where adventurers can be permanently lost.

This loss must be:

- known before confirmation
- deterministic
- non-random
- clearly labeled as permanent
- tied to a route or continent rule
- resolved through player choice when possible
- recorded in a memorial/history log

The player may intentionally bring a weak or disposable adventurer to satisfy a known loss. That is acceptable if it has meaningful cost:

- every traveler consumes route capacity
- every traveler increases supply cost
- some routes require minimum level, role, or stat thresholds
- dangerous roles may require specific jobs or builds
- bringing a disposable adventurer means not bringing a useful one
- losing adventurers may affect fame, trust, or memorial history later

The design should not prevent cold optimization, but it should make the choice visible and expensive.

## Loss Patterns

Possible deterministic loss rules:

### Required Loss Choice

The route says one traveler will die. On arrival, the player chooses who is permanently deleted from the convoy.

This is the clearest first version.

```txt
Known event: Black Reef Shipwreck
On arrival, choose 1 traveler to permanently lose.
```

### Assigned Hazard Role

The player assigns travelers to known travel roles.

Example:

```txt
Storm Vanguard: lost unless DEF >= 12
Navigator: reduces travel by 8 days if utility >= 8
Quartermaster: prevents cargo loss if resolve >= 10
```

This makes character builds matter during transfer.

### Threshold Survival

The route deterministically picks a consequence from party stats.

Example:

```txt
Lowest Resolve traveler is lost unless total convoy Resolve >= 60.
```

This is inspectable if the preview shows exactly who would be lost.

### Calamity Choice

On arrival, the player chooses one known consequence:

- lose 1 traveler
- abandon cargo
- strand the expedition for 30 days
- pay a large rescue cost

This keeps danger high while allowing alternatives to permanent deletion.

## Arrival Loss Event

For emotional impact, fatal routes should usually resolve the loss on arrival rather than at departure.

Before launch:

```txt
PERMANENT LOSS WARNING
The Black Strait always claims one traveler.
On arrival, you must choose one adventurer from this convoy to delete permanently.
```

On arrival:

```txt
The ship breaks on Black Reef.
One survivor cannot be saved.
Choose who is lost.
```

Until the loss is resolved:

- arriving travelers remain blocked
- destination continent may be blocked from normal commands
- the player must choose a loss or a listed deterministic alternative
- no random selection happens

## Memorials

Permanent deletion should leave a record.

Example:

```js
{
  heroId: "mira",
  heroName: "Mira",
  level: 7,
  cause: "Lost crossing the Black Strait",
  day: 142,
  originContinentId: "ash_coast",
  destinationContinentId: "black_reef"
}
```

The memorial supports player familiarity and makes loss legible instead of feeling like a missing roster entry.

## Training-First Continents

Some continents may have no suitable starter dungeon.

This should not create a dead start. It shifts the opening loop:

1. Establish a local camp.
2. Use carried veterans to unlock first foothold sites.
3. Recruit local adventurers.
4. Train fresh recruits in Training Grounds or a gym.
5. Produce food and equipment locally.
6. Enter the harder baseline dungeons once recruits meet readiness thresholds.

The Training Grounds can become a core continent-specific building:

- consumes food/coin/training bows
- grants deterministic XP or training progress
- may unlock job/race skill access
- prepares low-level recruits for dungeons that would otherwise be too hard

Veterans from earlier continents become a head start, not a complete bypass.

## UI Contract

Future UI should expose:

- continent switcher
- focused continent label
- inactive continent summaries
- catch-up report on return
- route/transfer planner
- transfer preview with cost, duration, capacity, and deterministic hazards
- permanent-loss warning before fatal transfers
- arrival event UI for loss choice
- memorial/history view

The UI should stay dense and inspectable. Dangerous route text must be plain and explicit.

## Non-Goals For First Slice

- No random travel events.
- No background realtime simulation for every continent.
- No free instant hero transfer between continents.
- No permanent dungeon death.
- No automatic deletion of adventurers without a visible deterministic rule.
- No full multi-continent content set before the state model is proven.
