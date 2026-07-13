# AI_CONTEXT.md

## Purpose

Fast handoff context for agents working in this repo. Read this before changing code.

## Product Intent

`adventure-inc` is a deterministic idle/incremental RPG-management prototype. The player starts with a tavern that attracts adventurers, recruits and develops a roster, sends parties into deterministic dungeon plans, converts solved plans into automation, and grows the tavern into a wider settlement economy.

The design intentionally rejects random drops, random stat rolls, and RNG combat. The strategic challenge should come from planning, resource constraints, build choices, blueprint unlocks, and deterministic puzzle-like dungeon resolution.

## Current Architecture Baseline

- Entry point: `index.html` loads `src/main.js` as an ES module.
- Styling: `styles.css`.
- Compatibility entry shim: `src/app.js` starts the app and intentionally stays small.
- App composition owner: `src/app/adventureIncApp.js` wires data, state, command adapters, render adapters, browser APIs, bootstrap, and controls.
- Initial state owner: `src/app/appState.js` exposes `createInitialState()`.
- App runtime context owner: `src/app/appRuntimeContext.js` creates the initial state, browser auto-time runtime, loaded-data context, DOM element bag, and app resource runtime.
- App bootstrap setup owner: `src/app/appBootstrapSetup.js` composes DOM element binding with startup registration.
- App callback registry owner: `src/app/appCallbackRegistry.js` centralizes late-bound app-level callbacks passed across command, render, bootstrap, and interaction adapters.
- Bootstrap owner: `src/app/bootstrap.js` owns DOMContentLoaded startup sequencing and the requestAnimationFrame map actor refresh loop through injected browser/data/render dependencies.
- Required DOM element contract lives in `src/app/domElements.js`.
- App config owner: `src/app/appConfig.js` owns stable prototype UI/runtime constants such as character-atlas dimensions, map world/zoom defaults, Temple inventory slots, and replay default speed.
- Control binding owner: `src/app/controlBindings.js` wires static DOM controls to injected app command handlers.
- App control setup owner: `src/app/appControlSetup.js` composes the static control-binding handler map from shell, dungeon, party, replay, roster/tavern, and time command owners.
- App data context owner: `src/app/appDataContext.js` owns loaded POI data storage for bootstrap writes and query reads.
- App query owner: `src/app/appQueries.js` centralizes app-level reads for POI-derived collections, selected dungeon/location/party, focused hero, party members/stats/readiness, operation phase projection, and roster status labels.
- App query setup owner: `src/app/appQuerySetup.js` composes loaded POI data, Temple query reads, and the app selection facade.
- App selection facade owner: `src/app/appSelectionFacade.js` composes app queries with roster skill progression projections so UI/app adapters receive one small read surface.
- App utility callback owner: `src/app/appUtilityCallbacks.js` owns app-level log insertion, reward formatting, Temple progression/loot callbacks, and replay timer API creation.
- App render coordinator owner: `src/app/appRenderHandlers.js` owns top-level render ordering and focused render pass delegation across header, map, roster, dungeon, Temple, and systems adapters.
- App shell command owner: `src/app/appShellCommandHandlers.js` coordinates UI-only shell commands: clear log, top-tab activation, map-side-tab activation, and dungeon/party select-change estimate invalidation.
- Browser timer adapter owner: `src/app/browserTimerAdapters.js` binds browser `window`/`performance` APIs into auto-time and replay timer interfaces.
- App map interaction setup owner: `src/app/appMapInteractionSetup.js` maps app state/config/render callbacks into overland map pointer and wheel bindings.
- Dungeon command adapter owner: `src/app/dungeonCommandHandlers.js` coordinates dungeon simulation, cached estimate replay replacement, commit scheduling, repeated-plan automation, repeated queue attempts, operation completion logging, and injected reward/XP/Temple callbacks.
- Map command adapter owner: `src/app/mapCommandHandlers.js` coordinates map-location selection, dungeon-control sync, estimate invalidation for selected dungeon POIs, and map-side repeated dungeon assignment setup/queueing.
- Replay command adapter owner: `src/app/replayCommandHandlers.js` coordinates replay cursor/playback/speed commands, browser timer injection, full render vs replay-only render decisions, and replay speed labels.
- Roster/tavern command adapter owner: `src/app/rosterTavernCommandHandlers.js` coordinates recruit, focus, roster-view toggle, crafting, tavern upgrade, worker assignment wrappers, log messages, and renders.
- Party command adapter owner: `src/app/partyCommandHandlers.js` coordinates party command wrappers, log messages, party-select refresh, and renders.
- Select-control owner: `src/app/selectControls.js` owns app-level dungeon, stop-node, and party select population.
- Time command adapter owner: `src/app/timeCommandHandlers.js` coordinates auto-time toggling, hour advancement, worker deliveries, operation ticking/completion, daily production, repeated-plan resume checks, log messages, and renders.
- Header render adapter owner: `src/app/headerRenderAdapter.js` coordinates global title-row rendering with current state, selected party, and the auto-time control lookup.
- Systems render adapter owner: `src/app/systemsRenderAdapter.js` coordinates Systems/log panel rendering with blueprint definitions, unlocked blueprint state, and deterministic log entries.
- Log runtime owner: `src/app/logRuntime.js` owns deterministic log entry stamping, newest-first insertion, cap enforcement, and clearing.
- Command message owner: `src/app/commandMessages.js` converts selected command results into log message descriptors for app-level handlers, including first roster skill/tavern/time/progression/party/dungeon/map/Temple command wrappers.
- Plan invalidation owner: `src/app/planInvalidation.js` centralizes cached dungeon estimate clearing/setting and replay reset coupling.
- Roster progression adapter owner: `src/app/rosterProgressionHandlers.js` coordinates app-level skill-learning logs/renders and XP level-up logs around pure roster progression helpers.
- Select-control adapter owner: `src/app/selectControlAdapter.js` coordinates app-state-aware population of dungeon, stop-node, and party select controls.
- Temple interaction owner: `src/app/templeInteractions.js` wires Temple board link clicks, shard token click/drag, socket drops, and inventory drops to injected handlers.
- Temple app query owner: `src/app/templeAppQueries.js` centralizes app-level Temple reads for active stone definitions, active bonuses, shard ownership, color labels, and loot-bonus projection.
- Temple command adapter owner: `src/app/templeCommandHandlers.js` coordinates Temple shard XP placement/logging, stone/shard selection, inventory moves, socket equipment, line toggles, and renders.
- Temple progression adapter owner: `src/app/templeProgressionHandlers.js` coordinates dungeon visit/boss shard progression awards with Temple shard XP command handling.
- Temple render adapter owner: `src/app/templeRenderAdapter.js` coordinates Temple panel rendering with active stone state, normalized per-stone inventory slots, active bonuses, shard effect scaling, line activity checks, and injected Temple command callbacks.
- Core helpers live under `src/core/`.
- POI loading and validation live under `src/data/`.
- POI read selectors and map-location composition live in `src/data/poiSelectors.js`.
- Worker route marker interpolation lives in `src/game/map/mapActorRuntime.js`.
- Map pan/zoom/drag view-state math lives in `src/game/map/mapViewRuntime.js`; DOM pointer capture and map event registration live in `src/app/mapInteractions.js`.
- Map render adapter owner: `src/app/mapRenderAdapter.js` coordinates overland map panel rendering, map transform/status text, actor-layer refresh, selected-location detail refresh, map-distance formatting, and worker marker coordinates.
- Roster render adapter owner: `src/app/rosterRenderAdapter.js` coordinates Tavern visitor rendering, Population job rendering, party/focused-character panel rendering, roster card rendering, and shared atlas portrait helpers.
- Dungeon render adapter owner: `src/app/dungeonRenderAdapter.js` coordinates Dungeon planner and replay-only rendering with selected dungeon, cached estimate, repeated plans, repeat mode, reward formatting, replay speed labels, and roster portrait styling.
- Roster static data and stat rules live under `src/game/roster/`.
- Roster mutation helpers for visitor recruitment, focused hero selection, and skill learning live in `src/game/roster/rosterCommands.js`.
- Crafting helpers live in `src/game/roster/craftingCommands.js`.
- Skill availability/progression checks live in `src/game/roster/skillProgression.js`.
- Hero XP and level-up mutation lives in `src/game/roster/leveling.js`.
- Party read selectors, hero-name fallback, character status derivation, and party stat aggregation live in `src/game/party/partySelectors.js`.
- Party mutation helpers live in `src/game/party/partyCommands.js`.
- Blueprint static data lives under `src/game/blueprints/`.
- Temple static data lives under `src/game/temple/templeData.js`.
- Temple state normalization/socket helpers live in `src/game/temple/templeState.js`.
- Temple bonus resolution lives in `src/game/temple/templeBonuses.js`.
- Temple command helpers for stone/shard selection, inventory movement, socket equipment, and line toggling live in `src/game/temple/templeCommands.js`.
- Shard visit/boss counter progression and XP mutation helpers live in `src/game/temple/shardProgression.js`.
- Combat actor creation, node resolution, deterministic combat timeline scheduling, and recovery-hour calculation live under `src/game/combat/combatTimeline.js`.
- Combat action selection and enemy action helpers live in `src/game/combat/combatActions.js`.
- Combat replay event snapshots live in `src/game/combat/combatReplayModel.js`.
- Dungeon run simulation lives in `src/game/dungeon/dungeonRunSimulator.js`.
- Dungeon operation value/scheduling helpers live in `src/game/dungeon/dungeonOperationModel.js`.
- Dungeon operation completion mutation lives in `src/game/dungeon/dungeonCompletion.js`.
- Dungeon operation elapsed-time ticking lives in `src/game/dungeon/operationRuntime.js`.
- Repeated-plan automation decisions live in `src/game/dungeon/repeatedPlanAutomation.js`.
- Dungeon combat replay runtime controls live in `src/game/dungeon/replayRuntime.js`; it owns replay cursor clamping, reset/stop/start/toggle, speed cycling, and speed labels with injected timer APIs for browser/runtime use.
- Resource runtime owner: `src/app/resourceRuntime.js` adapts app state to generic resource affordability, payment, and reward mutation helpers.
- Generic resource costs/reward application and Temple loot projection live in `src/game/resources/resourceRewards.js`.
- Tavern upgrade and worker assignment helpers live in `src/game/tavern/tavernCommands.js`.
- Game clock/day rollover, daily tavern income, and worker-cycle delivery helpers live in `src/game/time/gameClock.js`.
- Auto-time interval ownership and visual tick interpolation helpers live in `src/game/time/autoTimeRuntime.js`; app composition injects browser timer APIs.
- Hour-step advancement sequencing lives in `src/game/time/timeAdvanceRuntime.js`; app command adapters own side-effect callbacks for workers, operations, daily income, logs, and rendering.
- Daily production mutation and repeated-plan resume candidate selection live in `src/game/time/dailyProductionRuntime.js`; app command adapters own logging and queue attempts.
- Save/load owner: `src/app/saveLoad.js` creates versioned schema `1` payloads, restores supported payloads, and excludes transient runtime state such as replay timers.
- Basic DOM lookup and event binding helpers live in `src/ui/dom.js`.
- Tab activation class toggling lives in `src/ui/tabRuntime.js` for top-level tabs and Map side-panel local tabs.
- Top-level render ordering lives in `src/ui/renderApp.js`; `src/app.js` still provides the individual render adapters and invokes the orchestrator.
- Select option rendering helpers live in `src/ui/selectView.js` for dungeon, stop-node, and party selects.
- Dungeon panel DOM rendering lives in `src/ui/dungeonPanel.js`; pure Dungeon node/estimate/replay row HTML remains in `src/ui/dungeonView.js`, and replay controls remain in `src/ui/dungeonReplayPanel.js`.
- Dungeon replay panel DOM rendering lives in `src/ui/dungeonReplayPanel.js`; pure replay row/empty-state HTML remains in `src/ui/dungeonView.js`.
- Party/focused-character panel DOM rendering lives in `src/ui/partyPanel.js`; pure party, skill-tree, and focused-character HTML remains in `src/ui/rosterView.js`.
- Roster card panel DOM rendering lives in `src/ui/rosterPanel.js`; pure roster/card HTML remains in `src/ui/rosterView.js`.
- Map panel DOM rendering lives in `src/ui/mapPanel.js`; pure Map side-panel HTML remains in `src/ui/mapSideView.js`, and pure Map world/route/actor HTML remains in `src/ui/mapWorldView.js`.
- Systems panel DOM rendering lives in `src/ui/systemsPanel.js`; pure blueprint/log row HTML remains in `src/ui/blueprintView.js` and `src/ui/logView.js`.
- Temple panel DOM rendering lives in `src/ui/templePanel.js`; pure Temple board/shard/detail HTML remains in `src/ui/templeView.js`, and drag/drop binding remains in `src/app/templeInteractions.js`.
- First extracted UI render helpers live under `src/ui/`: `headerView.js` owns the global title/status row, `rewardText.js` owns reward formatting, `blueprintView.js` owns blueprint-row HTML, `logView.js` owns deterministic log-row HTML, `populationView.js` owns Population job rows, `tavernView.js` owns the Tavern visitor queue, `dungeonView.js` owns Dungeon node/estimate/replay HTML builders, `mapSideView.js` owns Map side-panel selected-location, operation, and POI table HTML, `mapWorldView.js` owns Map route/POI/world/actor marker HTML builders, `rosterView.js` owns Roster/party/skill/focused-character HTML builders, and `templeView.js` owns Temple board, stone, socket, shard token, inventory, buff, and detail HTML builders.
- No dependencies, build step, bundler, framework, or persistence layer currently exists.
- POI data lives in `assets/data/poi.json` and is loaded with `fetch()` during startup through `loadPoiData()`.
- State is held in one in-memory `state` object created by `createInitialState()`.
- Rendering is DOM-driven through explicit `render*()` functions.
- App render adapters orchestrate full rendering through `src/app/appRenderHandlers.js` and `src/ui/renderApp.js`.
- The simulation is deterministic and advances through explicit hour ticks. Time can be stepped manually or run through the auto-time toggle.
- Map movement is presentation-only interpolated with `requestAnimationFrame` between hourly ticks; gameplay rewards and operation completion still happen only on deterministic hour advancement.
- The main UI uses seven top tabs: Map, Tavern, Population, Roster, Dungeon, Temple, and Systems.

## Current Gameplay Slice

- Tavern state:
  - capacity
  - fame
  - daily food/coin income
  - visitor queue with atlas-backed hire cards
- Population state:
  - population
  - worker assignment for wood and ore
  - deterministic worker cycles for wood and ore deliveries
- Resources:
  - coin
  - food
  - wood
  - ore
  - hide
- Roster:
  - starting founder adventurer
  - deterministic visitor queue with 48 recruitable adventurers
  - recruit costs
  - focused character selection for training and crafting
  - party groups with explicit member assignment
  - selected party for dungeon planning
  - 7x7 character atlas slots from `assets/chars-atlas.png`; founder uses slot `0`, recruitable visitors use slots `1..48`
  - levels, XP, skill points
  - race, primary job, secondary job placeholder, and learned skill ranks
  - focused-character sidebar skill trees for race and primary job
  - deterministic skill effects feeding derived HP, ATK, DEF, utility, travel speed, recovery time, and food cost
- Dungeons:
  - Rat Cellar
  - Old Copper Mine
  - Old Barracks
  - fixed travel time and food cost
  - fixed node sequence
  - hazard, utility-check, and combat nodes
  - deterministic enemy scripts
  - per-actor deterministic combat simulation for replay timelines
- Strategies:
  - balanced
  - burst
  - guarded
- Progression:
  - fixed rewards
  - XP
  - fame
  - blueprints
  - deterministic crafting
- Temple:
  - selectable Ritual Stones: Triangle, Square, and Hourglass
  - each stone owns its own sockets, active links, inventory slot positions, and stone-level modifier
  - shard ownership, shard XP, and dungeon shard counters are global
  - only the currently selected stone applies effects
  - current colors are Ember, Verdant, and Azure
  - one shard per socket; the same shard cannot be equipped twice
  - Temple UI is board-style: shards are drag/drop tokens, sockets are drop targets, and board links are clickable toggles
  - all possible links for the selected stone render on the board; each stone has its own active-line capacity
  - Triangle has 1 active line and fight effects +10%
  - Square has 2 active lines and Verdant/Azure effects +15%
  - Hourglass has 1 active line, loot effects +20%, and fight effects -10%
  - bottom shard inventory is an explicit free-form `2x10` slot grid
  - dragging between inventory slots moves or swaps shard positions
  - dragging an equipped shard back to an empty bottom inventory slot unequips it
  - every shard effect is tied to a specific color through `colorEffects`; no shard effect is unconditional
  - an effect applies only when its color is active for the shard through the socket color or active connection
  - shard definitions currently live in `src/game/temple/templeData.js`
  - one starter shard is seeded so the Temple tab has an immediate example setup
  - shard drops are deterministic counters, not random rolls
  - dungeon `visit` counters increment when an operation completes
  - dungeon `boss` counters increment only on full successful runs
  - duplicate shards add shard XP toward each shard's `xpToMax`
  - active shard effects currently feed `partyStats()` and extra deterministic loot on completed operations
- Automation:
  - the player simulates a plan first
  - the cached estimate can be queued manually
  - repeat mode is binary: manual or repeated
  - repeated mode stores an endless deterministic plan for a party
  - same-party repeated operations serialize through a queued phase
  - rewards are applied when the party operation completes its travel, dungeon, return, and regeneration phases
  - repeated plans pause when required resources are unavailable and resume after production if possible
- Combat replay:
  - `simulateRun()` runs instantly and produces both the final estimate and a structured replay timeline
  - `state.dungeonReplay` owns replay cursor, playback speed, play/pause timer, and event list
  - replay has a full-width timeline slider where each slider step is one event
  - autoplay advances the cursor on a UI timer and redraws only the replay panel
  - replay playback is inspection-only; it does not call `advanceTime()` and does not mutate gameplay state
  - party combat actors are built from current roster members and `heroStats()`
  - actors use deterministic initiative and speed; the scheduler picks the lowest `nextActionAt`, then highest initiative, then party before enemy, then stable ID
  - current party actions are strategy-driven: balanced heal, guarded Guard Stance, burst high-power attack, fallback basic attack
  - enemy actions follow the enemy node script
- Overland map:
  - POI source data is `assets/data/poi.json`
  - map background is a real `1024x1024` world layer using `assets/map-bg.png`, not a CSS cover backdrop
  - tavern and POIs have fixed pixel world coordinates; `50,50` means near the top-left corner of the 1024 map
  - the viewport supports drag panning and cursor-centered wheel zoom
  - work sites and dungeons render as simple labeled POIs
  - POI labels are clickable and populate the selected-location side panel
  - dungeon POIs expose an `assign repeated route` action from the map panel
  - worker markers travel between tavern and work sites
  - party markers travel to dungeon POIs, pulse while busy, and return to the tavern

## Important Runtime Rules

- `Math.random()` should not be introduced for gameplay.
- `simulateDungeonRun()` in `src/game/dungeon/dungeonRunSimulator.js` is the central deterministic planner and also produces combat replay timelines. `src/app/dungeonCommandHandlers.js` keeps the state-aware simulate adapter.
- `partyStats()` aggregates member stats for the current first-slice party combat model.
- `resolveNode()` from `src/game/combat/combatTimeline.js` dispatches hazard/check/combat node rules.
- `resolveCombat()` is internal to `src/game/combat/combatTimeline.js` and owns deterministic actor-timeline combat for inspection replay and final estimate output while action choice lives in `src/game/combat/combatActions.js`.
- `scheduleEstimate()` in `src/app/dungeonCommandHandlers.js` is the mutation adapter that turns a cached estimate into a queued operation and pays food up front. Validation and operation construction are delegated to `src/game/dungeon/dungeonOperationModel.js`.
- `scheduleEstimate()` queues a party operation and pays food up front.
- Manual Dungeon Planner assignments stop that party's repeated plan before queueing the new assignment; active operations are not cancelled.
- Map-side dungeon assignment creates/replaces a repeated route for the selected party and queues it through `ensureRepeatedPlanQueued()`.
- Party assignments require a non-empty party, sufficient food, and if no current operation exists the party must be in town and fully healed. If the party is already on an operation, the new assignment queues behind it and starts after recovery.
- `repeatedPlans` stores one endless automation plan per party.
- `ensureRepeatedPlanQueued()` in `src/app/dungeonCommandHandlers.js` is the mutation/log adapter; repeated-plan queue decisions are delegated to `src/game/dungeon/repeatedPlanAutomation.js`.
- Time advancement integration lives in `src/app/timeCommandHandlers.js`. Clock/day/worker rules are delegated to `src/game/time/gameClock.js`.
- `currentOperationPhase()` from `src/game/dungeon/dungeonOperationModel.js` resolves queued/outbound/dungeon/return/regeneration phase state for map rendering.
- `characterState()` derives visible roster state from scheduled party operations: Idle, Queued, Walking to dungeon, Fighting, Walking home, or Recovering.
- `applyRewards()` separates inventory resources from progression values like fame, XP, and blueprints.
- `heroStats()` from `src/game/roster/heroStats.js` is the current derived-stat owner and includes level, build, and gear.
- `templeBonuses()` from `src/game/temple/templeBonuses.js` resolves equipped shard color effects from the selected Ritual Stone's active socket/line influence colors, then applies stone modifiers. `partyStats()` consumes party-facing Temple bonuses.
- Operation completion log/reward coordination lives in `src/app/dungeonCommandHandlers.js`; operation completion state mutation is delegated to `src/game/dungeon/dungeonCompletion.js`.
- `recordShardProgress()` in `src/game/temple/shardProgression.js` owns deterministic shard visit/boss counters.
- Character `base.hp` is level-1 max HP. Level scaling starts at level 2, so newly created level-1 characters are fully healed when `hp === base.hp`.

## UI Contract

- The UI is intentionally dense and operational.
- Keep panels table-driven and compact.
- Avoid large illustrated cards or landing-page sections.
- Use square controls and monospace typography.
- Keep logs visible because deterministic outcomes must be inspectable.
- Combat can stay text/log based until mechanics justify a richer visualization.
- Top-level screens should stay tabbed rather than rendering all panels at once.
- The Map tab is a visualization surface, not the primary management interface.
- Map POI labels should remain actionable affordances for location details and first-order assignments.
- Map layout is a 2/3 left map panel plus 1/3 right side panel. Clicking a location updates the right side panel.
- The Map right side panel has local tabs: `Info` for selected location details and `Operations` for active operations plus POI coordinate tables.
- The roster should use State, Party, and Focus concepts rather than a single Active character toggle.
- Roster character presentation uses clickable portrait cards backed by `assets/chars-atlas.png`; clicking a card updates the focused-character sidebar.
- Roster supports `detailed` and `minimized` card modes. Minimized mode keeps cards close to icon-sized while remaining clickable for sidebar focus.
- Roster layout is a 2/3 main panel plus 1/3 selected-character side panel. The main panel is split into party groups on the left and character grid on the right.
- Party rows show only actual members as `-name` remove buttons. Adding/moving a character into the selected party is done from the focused-character sidebar with `add to current party`.
- Party selection is done by clicking the party or state cell, not a Use button. The selected party row gets a yellow outline.
- Party rows have a Command column with `cancel`, which clears queued/running operations and repeated plans for that party, restores members to full HP at town, and grants no rewards.
- Tavern visitor candidates use the same `assets/chars-atlas.png` portrait-card treatment as roster characters.
- Resource totals render as one compact line in the global title bar next to day/phase/time mode, so they stay visible across tabs.
- The Population tab owns population and wood/ore work distribution.
- The Tavern tab uses `assets/tavern-bg.png` as a fullscreen background with readable management panels layered over it.
- The Roster tab uses `assets/roster-bg.png` as a fullscreen background with the same readable panel overlay treatment.
- The Dungeon tab uses `assets/dungeons-bg.png` as a fullscreen background with the same readable panel overlay treatment.
- The Dungeon tab includes a Combat Replay panel. Replay controls inspect the last simulated timeline only and are independent from game-time automation.
- The Temple tab is a board-style management surface: Ritual Stone selector buttons, Temple Matrix with clickable links, bottom shard inventory rows, and selected Shard Info side panel.
- The Map tab uses `assets/map-bg.png` as the actual overland map surface inside a transformed `.map-world`; POIs, route lines, workers, and party markers use the same pixel world coordinates.

## Current Non-Goals

- Versioned save/load exists in `src/app/saveLoad.js`; browser/localStorage UI is not wired yet.
- Multi-character party combat is aggregate-stat based only; per-character tactics and damage allocation are not implemented yet.
- No building-specific incremental mechanics beyond basic tavern production.
- No map or graphical dungeon view yet.
- No item affixes, random drops, or randomized crafting.
- No background real-time idle loop yet.
- No freeform map navigation or graphical terrain yet.
- No backend.

## Likely Next Systems

1. Extract gameplay data into data files or owner modules once rules grow beyond the first slice.
2. Wire save/load UI or localStorage if persistence becomes a player-facing requirement.
3. Expand per-character combat from prototype strategy actions into authored skill/action-plan data.
4. Add building modules where each building has a distinct incremental mechanic.
5. Add skill refund/respec and secondary-job multiclass selection.
6. Add action-plan editing per character instead of three global strategy presets.
7. Add automation scheduling that shows travel, dungeon, return, and regeneration phases.

## Design Docs

- `docs/adventurer-skill-design.md`: race/job/multiclass model, deterministic skill categories, tree rules, and first implementation slice.
- `docs/temple-shard-design.md`: Temple board, shard slot/influence rules, deterministic shard drops, shard XP, and first implementation status.
- `docs/dungeon-combat-replay-design.md`: deterministic actor-timeline combat resolver and inspection-only replay UI.

## Verification

Current quick validation:

```powershell
npm run check:js
npm test
```

Last validation result:

- `npm run check:js`: passed, checked 105 JavaScript files.
- `npm test`: passed, 279/279 tests.

Manual browser smoke test:

- open `index.html`
- switch through the seven tabs
- enable and disable auto time
- simulate Rat Cellar
- commit or automate the result and watch the party operation on the Map tab
- advance hours/days
- recruit a visitor
- unlock a blueprint
- craft gear when resources allow

## Change Rules

- Preserve existing user changes.
- Keep dependencies minimal.
- Prefer small deterministic systems with readable state transitions.
- Keep `AI_CONTEXT.md` aligned when changing architecture, ownership, UI contracts, automation, dungeon resolution, save/load, or major gameplay behavior.
