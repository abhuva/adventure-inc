# Continent Expansion Implementation Plan

## Purpose

Plan the technical migration from the current single-continent prototype into a multi-continent expansion system.

The design target is documented in `docs/continent-expansion-design.md`.

The implementation should be staged. The current codebase assumes one global `state.tavern`, `state.resources`, `state.roster`, `state.operations`, `state.progression`, `state.workshop`, and `state.mapView`. A direct rewrite would be risky. The safer path is to introduce continent boundaries, route reads through an active-continent facade, then move systems behind that boundary incrementally.

## Current Constraints

The current app has a single active world layer:

```js
state.tavern
state.tavernVisitors
state.settlement
state.resources
state.roster
state.parties
state.operations
state.repeatedPlans
state.progression
state.workshop
state.mapView
state.mapWorld
```

Many app adapters and UI renderers read those fields directly.

Important existing owners:

- `src/app/appState.js`: creates initial global state.
- `src/app/stateNormalizer.js`: fills backward-compatible defaults.
- `src/app/saveLoad.js`: serializes top-level state keys.
- `src/app/appQueries.js` and `src/app/appSelectionFacade.js`: centralize many app-level reads.
- `src/app/timeCommandHandlers.js`: advances clock, production, operations, day rollover, and repeated-plan resume.
- `src/app/rosterRenderAdapter.js`, `src/app/mapRenderAdapter.js`, and `src/app/dungeonRenderAdapter.js`: render current management surfaces.
- `src/game/time/dailyProductionRuntime.js`, `src/game/dungeon/operationRuntime.js`, and `src/game/roster/visitorQueue.js`: pure-ish deterministic update helpers that can eventually run in catch-up.

## Target State Shape

Long-term shape:

```js
state.world = {
  activeContinentId: "old_marches",
  unlockedContinentIds: ["old_marches"],
  lastGlobalUpdate: { day: 1, hour: 0 },
  global: {
    heroes: {},
    heroOrder: [],
    transfers: [],
    memorial: [],
    meta: {},
    temple: {}
  },
  continents: {
    old_marches: {
      id: "old_marches",
      name: "Old Marches",
      rulesId: "old_marches",
      lastUpdated: { day: 1, hour: 0 },
      tavern: {},
      tavernVisitors: {},
      settlement: {},
      resources: {},
      parties: [],
      operations: [],
      repeatedPlans: {},
      progression: {},
      workshop: {},
      selectedLocationId: "tavern",
      mapContextMenu: null,
      mapView: {},
      mapWorld: {},
      log: []
    }
  }
}
```

First migration can use a compatibility layer instead of immediately moving every field.

## Phase 1: Static Design Data

Add continent and route data modules without changing runtime behavior.

New files:

- `src/game/continents/continentData.js`
- `src/game/continents/continentRules.js`
- `src/game/continents/transferRoutes.js`

Initial data:

- `old_marches`: current default rules.
- `ash_coast`: locked, no implementation impact yet.
- `black_reef`: locked, fatal route example for preview tests.
- `old_marches_to_ash_coast`: safe first Expedition route.

Route data example:

```js
{
  id: "old_marches_to_ash_coast",
  label: "Ash Coast Charter",
  poiId: "expedition",
  originContinentId: "old_marches",
  destinationContinentId: "ash_coast",
  durationHours: 18 * 24,
  capacity: "party",
  cost: { food: 40, coin: 120, planks: 20 },
  hazards: []
}
```

Fatal route example:

```js
{
  id: "ash_coast_to_black_reef",
  originContinentId: "ash_coast",
  destinationContinentId: "black_reef",
  durationHours: 30 * 24,
  capacity: 5,
  cost: { food: 80, coin: 200, planks: 40 },
  hazards: [
    { type: "arrival_loss_choice", count: 1, label: "Black Strait" }
  ]
}
```

Validation:

- data tests for route IDs, valid continent references, positive duration/capacity, and deterministic hazards.

## Phase 2: Expedition POI Unlock And Map Routing

Add the first visible gameplay trigger: an `Expedition` POI on the Map.

Prototype unlock:

- unlock after day 7

Later unlock options:

- boss clear
- fame threshold
- charter blueprint
- route discovery

Implementation notes:

- Extend POI data with an `expedition` POI or add a generated POI from continent route data.
- Add progression state for unlocked expedition POIs/routes.
- Add day-7 prototype unlock in the same world progression style as existing location unlocks.
- Map side-panel detail should recognize `type: "expedition"`.
- Clicking the Expedition POI shows route info in the Map side panel.
- The Map side panel includes a `run` action for the expedition route.
- The `run` action switches to the new Expedition tab with that route selected.

New or changed owners:

- `assets/data/poi.json` or a route-derived POI owner
- `src/game/progression/worldProgression.js`
- `src/data/poiSelectors.js`
- `src/ui/mapSideView.js`
- `src/app/mapCommandHandlers.js`
- `src/app/appShellCommandHandlers.js`

Validation:

- POI validation accepts expedition POI type.
- day-7 unlock exposes Expedition POI.
- Map side detail renders expedition route cost/duration/capacity/hazards.
- Expedition `run` switches to Expedition tab and selects the route.

## Phase 3: Expedition Tab Skeleton

Add a new top-level `Expedition` tab.

Initial UI:

- selected route title
- origin continent
- destination continent
- party select
- selected party member list
- travel duration
- resource cost
- route capacity
- known hazards
- validation/readiness text
- `start expedition` button

The first version should use party selection, not individual hero selection, because current UI and operation planning already center on parties.

New IDs/surfaces:

- top tab button: `expedition`
- tab panel: `data-tab-panel="expedition"`
- route detail box
- expedition party select or reuse selected party state
- start button

New owners:

- `src/app/expeditionCommandHandlers.js`
- `src/app/expeditionRenderAdapter.js`
- `src/ui/expeditionView.js`
- optional `src/ui/expeditionPanel.js`

Validation:

- DOM element contract includes Expedition surfaces.
- tab activation includes Expedition.
- Expedition render shows selected route and selected party.
- start button is disabled or explains why when invalid.

## Phase 4: World Shell And Compatibility Facade

Add a world shell while keeping the current top-level fields authoritative.

Add:

- `state.world.activeContinentId`
- `state.world.unlockedContinentIds`
- `state.world.global.transfers`
- `state.world.global.memorial`

Add helper module:

- `src/game/continents/continentState.js`

Initial helpers:

```js
activeContinentId(state)
activeContinentRules(state, rules)
ensureWorldState(state)
worldTimeStamp(state)
```

At this phase, `activeContinent(state)` may simply return a compatibility object backed by current top-level state.

Reason: UI can begin showing active continent labels and route previews without moving all game systems.

Validation:

- app-state independence tests
- normalizer tests for missing `world`
- save/load tests for `world`

## Phase 5: Start Expedition Transfer

Implement the first safe expedition transfer.

Command:

```js
startExpedition(state, routeId, partyId)
```

Start validation:

- route exists and is unlocked
- party exists on origin continent
- party has at least one member
- all party members are idle
- origin continent can pay route cost
- route capacity accepts the selected party
- route has no unresolved fatal confirmation, if fatal

Effects:

- pay local origin cost
- create transfer state
- mark each party member as `location.type = "transfer"` or equivalent compatibility state
- remove party members from origin continent party use
- clear invalid selected/focused hero if needed
- invalidate dungeon estimates that used transferred heroes
- log expedition launch

Transfer state:

```js
{
  id: "transfer_1",
  routeId: "old_marches_to_ash_coast",
  originContinentId: "old_marches",
  destinationContinentId: "ash_coast",
  partyId: "party-1",
  heroIds: ["ada", "mira"],
  elapsedHours: 0,
  durationHours: 432,
  status: "traveling"
}
```

Important first-slice compatibility:

- If global hero stationing is not fully migrated yet, add a minimal `state.heroLocations` or `state.world.global.heroLocations` map.
- Roster, party, dungeon, crafting, and training queries should filter out heroes whose location is transfer.
- Character state can show `Traveling`.

Validation:

- start pays route cost
- start rejects busy party members
- start rejects insufficient resources
- transferred heroes disappear from active roster list
- transferred heroes cannot be selected for dungeon/crafting/party assignment
- transfer state stores exact route/hero/duration data

## Phase 6: Expedition Travel And Arrival Popup

Transfers advance through time.

First implementation can advance transfer timers through the active continent's normal time advancement path. Later, transfer timers should be global because transfers exist between continents.

On arrival:

- mark transfer as arrived
- unlock destination continent if needed
- station arriving heroes at destination
- show an arrival popup

Safe-route popup:

```txt
Ash Coast reached.
Your expedition has made landfall.

[Switch to Ash Coast] [Stay in Old Marches]
```

Popup actions:

- `switch`: focus the destination continent
- `stay`: keep current continent focused

The switch/stay choice is only a focus choice. It does not change the deterministic arrival outcome.

New owners:

- transfer timer runtime
- arrival event/popup view
- arrival command handlers

Validation:

- transfer completes at exact duration
- destination unlocks on arrival
- heroes station at destination on arrival
- popup renders switch/stay actions
- stay keeps current focus
- switch sets destination focus

## Phase 7: Continent Tab

Add a dedicated `Continent` top-level tab after at least two continents are available.

Initial UI:

- focused continent label
- dropdown of unlocked continents
- selected continent summary
- selected continent rules
- time away
- resource/operation summary
- `switch/focus` button

The dropdown should not switch by itself. Only `switch/focus` performs the focus change.

New owners:

- `src/app/continentCommandHandlers.js`
- `src/app/continentRenderAdapter.js`
- `src/ui/continentView.js`

Validation:

- Continent tab renders unlocked continents.
- Dropdown selection updates preview only.
- Switch button changes focus.
- Switching to the current continent is no-op.

## Phase 8: Move Continent-Local State Behind Active Continent

Introduce real continent objects and move state in controlled groups.

Recommended order:

1. Map/UI state:
   - `selectedLocationId`
   - `mapContextMenu`
   - `mapView`
   - `mapWorld`
2. Economy/settlement:
   - `resources`
   - `tavern`
   - `tavernVisitors`
   - `settlement`
   - `workshop`
   - `workerProgress`
3. Dungeons/automation:
   - `operations`
   - `repeatedPlans`
   - `progression`
   - `lastEstimate`
4. Parties:
   - `parties`
   - `selectedPartyId`
5. Roster:
   - keep global heroes, but expose active-continent roster through stationing.

During migration, use adapter helpers:

```js
activeResources(state)
activeTavern(state)
activeWorkshop(state)
activeOperations(state)
activeProgression(state)
activeParties(state)
```

Then update app adapters gradually to use helper reads.

Do not change every pure game helper immediately. Prefer passing active continent slices into existing helpers.

Validation:

- save/load compatibility tests
- app query tests for active continent reads
- time command tests for active continent-only mutation
- map render tests with active continent map state
- dungeon command tests with active continent operations/progression

## Phase 9: Fully Initialize Ash Coast

Add the first real second continent: `ash_coast`.

Unlock condition options:

- clear Rat Cellar boss
- clear Old Copper Mine branches
- reach a fame threshold
- craft an Expedition Charter

For prototype, use a simple explicit unlock command or milestone.

Ash Coast initial local state:

- starter camp
- local resources with small supplies
- no easy starter dungeon
- Training Grounds available or unlockable early
- local dungeons have higher baseline difficulty
- local visitor pool may start small

Rules:

```js
{
  trainingRequired: true,
  dungeonDifficultyMultiplier: 1.5,
  freshRecruitDungeonPenalty: true,
  foodCostAdd: 1
}
```

Validation:

- unlock command tests
- second continent initial-state tests
- active continent switching tests
- local resources do not bleed between continents

## Phase 10: Deterministic Catch-Up

Implement catch-up for unfocused continents.

New owner:

- `src/game/continents/continentCatchUp.js`

Inputs:

```js
catchUpContinent({
  continent,
  hoursAway,
  rules,
  callbacks
})
```

First catch-up scope:

- worker cycles
- workshop production/research
- day rollover upkeep
- visitor refreshes
- active operation completion
- repeated-plan resume attempts

Avoid full replay generation during catch-up.

Output:

```js
{
  hoursApplied,
  resourceDeltas,
  completedOperations,
  repeatedPlansPaused,
  visitorChanges,
  heroLevelUps,
  logLines
}
```

Switch flow:

1. Player chooses target continent.
2. Current continent records current timestamp.
3. Target continent calculates hours away.
4. Catch-up mutates target continent.
5. App sets `activeContinentId`.
6. App renders catch-up summary.

Validation:

- catch-up applies same production as hourly advancement for equivalent hours
- catch-up completes operations deterministically
- catch-up does not mutate non-target continents
- catch-up summarizes paused repeated plans

## Phase 11: Hero Stationing

Move from local roster arrays to global hero registry plus stationing.

Target:

```js
state.world.global.heroes[heroId]
state.world.global.heroOrder
```

Hero location:

```js
{ type: "continent", continentId: "old_marches" }
{ type: "transfer", transferId: "transfer_1" }
{ type: "memorial", memorialId: "memorial_1" }
```

Active roster query:

```js
heroesOnContinent(state, activeContinentId)
```

Transfer in-progress heroes should be unavailable to parties, crafting, training, and dungeons.

Validation:

- party selectors ignore transferred heroes
- character state reports `Traveling`
- focused hero normalizes if hero leaves active continent
- save/load preserves hero location

## Phase 12: Generalized Transfer Operations

Generalize the first Expedition transfer into a reusable transfer planner and runtime.

New owner:

- `src/game/continents/transferCommands.js`
- `src/game/continents/transferRuntime.js`

Commands:

```js
previewTransfer(state, routeId, heroIds)
startTransfer(state, routeId, heroIds, options)
advanceTransfers(state, hours)
completeTransfer(state, transferId)
```

Start validation:

- route exists
- origin/destination unlocked as required
- selected heroes are stationed on origin
- selected hero count within capacity
- origin continent can pay cost
- selected heroes are idle
- fatal route warnings acknowledged

Transfer state:

```js
{
  id: "transfer_1",
  routeId: "ash_coast_to_black_reef",
  originContinentId: "ash_coast",
  destinationContinentId: "black_reef",
  heroIds: ["mira", "teo", "brann"],
  elapsedHours: 0,
  durationHours: 720,
  hazards: [...],
  status: "traveling"
}
```

Validation:

- transfer pays local origin cost
- heroes become unavailable
- transfer completes after exact duration
- safe route stations heroes at destination
- route preview reports duration, cost, capacity, and hazards

## Phase 13: Fatal Route Resolution And Memorial

Implement deterministic permanent loss.

Fatal transfer arrival state:

```js
{
  status: "awaiting_loss_choice",
  pendingLoss: {
    count: 1,
    eligibleHeroIds: ["mira", "teo", "brann"],
    cause: "Lost crossing the Black Strait"
  }
}
```

The player must choose the lost hero before the arriving transfer fully resolves.

Command:

```js
resolveTransferLoss(state, transferId, lostHeroIds)
```

Effects:

- move lost hero to memorial state
- remove from active parties
- clear gear or mark gear lost, depending on later item rules
- record memorial entry
- station survivors at destination
- log outcome

Validation:

- cannot resolve with wrong count
- cannot choose a hero outside the transfer
- lost hero is removed from usable roster
- survivors arrive
- memorial record includes hero name, level, route/cause, day, origin, and destination
- no random loss selection exists

## Phase 14: Training Grounds For Hard Continents

Add the first continent-specific building that solves the "no starter dungeon" problem.

New owner:

- `src/game/training/trainingGroundsData.js`
- `src/game/training/trainingGroundsRuntime.js`
- `src/game/training/trainingGroundsCommands.js`

First rules:

- consumes local food/coin/training bows
- assigns idle local adventurers to training
- grants deterministic XP or training progress per day
- can require a trainer/veteran for higher tiers
- unlocks local readiness for hard dungeons

UI placement:

- Population tab local subtab or new Training tab
- hero detail can show training eligibility
- dungeon readiness can explain training requirement

Validation:

- training consumes local resources
- training advances only focused continent live, or through catch-up when unfocused
- trained heroes meet Ash Coast starter dungeon readiness

## Migration And Save Compatibility

This feature will likely require a save schema migration.

Recommended approach:

1. Keep schema version `1` while adding no-op `world` shell defaults.
2. Once top-level state moves into `world.continents`, bump save schema to `2`.
3. Implement migration from old top-level state to `old_marches` continent.
4. Keep transient runtime fields excluded as today.

Migration function:

```js
migrateV1ToV2(payload)
```

It should:

- create `world`
- move current local state into `world.continents.old_marches`
- move roster into global hero registry or keep compatibility until Phase 7
- set `activeContinentId = "old_marches"`
- preserve logs and UI selections where possible

## Testing Strategy

Use pure unit tests heavily. The feature is stateful, so tests should prove isolation and determinism.

Core test groups:

- continent data validation
- world state normalization
- active continent selectors
- save/load migration
- switch command and catch-up
- local resource isolation
- local operation isolation
- hero stationing
- transfer preview/start/complete
- fatal transfer loss resolution
- memorial records
- training grounds progression

No random tests should be needed.

## First Deliverable Recommendation

The first implemented slice should avoid fatal loss and full state migration.

Recommended first deliverable:

1. Add continent/route data.
2. Add day-7 Expedition POI unlock.
3. Add Expedition Map side-panel route info.
4. Add Expedition tab skeleton and route selection.
5. Add tests for route data, POI unlock, Map routing, and Expedition tab rendering.

Second deliverable:

1. Add world shell.
2. Start safe expedition transfer from selected party.
3. Hide traveling heroes from current continent roster/party/dungeon use.
4. Complete transfer and show arrival popup with switch/stay.

Third deliverable:

1. Add Continent tab.
2. Add manual focus switching.
3. Initialize Ash Coast as a real continent.
4. Split the first local state group behind active continent.

Fourth deliverable:

1. Add catch-up for inactive continents.
2. Generalize transfer route system.
3. Add fatal route preview, arrival loss choice, and memorial.
