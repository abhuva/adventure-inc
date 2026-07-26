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
- App config owner: `src/app/appConfig.js` owns stable prototype UI/runtime constants such as character-atlas dimensions, map background fallback path/dimensions, map zoom defaults, Temple inventory slots, and replay default speed.
- Control binding owner: `src/app/controlBindings.js` wires static DOM controls to injected app command handlers.
- App control setup owner: `src/app/appControlSetup.js` composes the static control-binding handler map from shell, dungeon, party, replay, roster/tavern, and time command owners.
- App data context owner: `src/app/appDataContext.js` owns loaded POI data storage for bootstrap writes and query reads.
- App query owner: `src/app/appQueries.js` centralizes app-level reads for POI-derived collections, selected dungeon/location/party, focused hero, party members/stats/readiness, operation phase projection, and roster status labels.
- App query setup owner: `src/app/appQuerySetup.js` composes loaded POI data, Temple query reads, and the app selection facade.
- App selection facade owner: `src/app/appSelectionFacade.js` composes app queries with roster skill progression projections so UI/app adapters receive one small read surface.
- App utility callback owner: `src/app/appUtilityCallbacks.js` owns app-level log insertion, reward formatting, Temple progression/loot callbacks, and replay timer API creation.
- App render coordinator owner: `src/app/appRenderHandlers.js` owns top-level render ordering and focused render pass delegation across header, map, roster, dungeon, Temple, and systems adapters.
- App shell command owner: `src/app/appShellCommandHandlers.js` coordinates UI-only shell commands: clear log, top-tab activation, map-side-tab activation, Tavern/Roster/Map local detail-tab activation, and dungeon/party select-change estimate invalidation.
- First-step encounter command owner: `src/app/eventCommandHandlers.js` coordinates tutorial encounter triggering, close actions, tab-routing actions, and auto-time pause/resume behavior around blocking encounters.
- Browser timer adapter owner: `src/app/browserTimerAdapters.js` binds browser `window`/`performance` APIs into auto-time and replay timer interfaces.
- App map interaction setup owner: `src/app/appMapInteractionSetup.js` maps app state/config/render callbacks into overland map pointer and wheel bindings. It must pass `state.mapView` as a getter, not a captured object, because autosave restore replaces `state.mapView` during startup.
- Dungeon command adapter owner: `src/app/dungeonCommandHandlers.js` coordinates dungeon simulation, cached estimate replay replacement, commit scheduling, repeated-plan automation, repeated queue attempts, operation completion logging, and injected reward/XP/Temple callbacks.
- Map command adapter owner: `src/app/mapCommandHandlers.js` coordinates map-location selection, transient dungeon context-menu state, Dungeon control sync, estimate invalidation for selected dungeon POIs, full repeated run setup, immediate simulation, first queue attempt, and Dungeon-tab routing.
- Replay command adapter owner: `src/app/replayCommandHandlers.js` coordinates replay cursor/playback/speed commands, browser timer injection, full render vs replay-only render decisions, and replay speed labels.
- Roster/tavern command adapter owner: `src/app/rosterTavernCommandHandlers.js` coordinates recruit, selected Tavern visitor inspection, focus, roster-view toggle, crafting, tavern upgrade, worker hiring/assignment, workshop recipe/upgrades, log messages, and renders.
- Party command adapter owner: `src/app/partyCommandHandlers.js` coordinates party command wrappers, log messages, party-select refresh, and renders.
- Select-control owner: `src/app/selectControls.js` owns app-level dungeon, stop-node, and party select population.
- Time command adapter owner: `src/app/timeCommandHandlers.js` coordinates auto-time toggling, hour advancement, worker deliveries, operation ticking/completion, daily production, repeated-plan resume checks, log messages, and renders.
- Header render adapter owner: `src/app/headerRenderAdapter.js` coordinates global title-row rendering with current state, selected party, and the auto-time control lookup.
- Systems render adapter owner: `src/app/systemsRenderAdapter.js` coordinates Systems blueprint rendering with blueprint definitions and unlocked blueprint state.
- Log runtime owner: `src/app/logRuntime.js` owns deterministic log entry stamping, newest-first insertion, cap enforcement, and clearing.
- Command message owner: `src/app/commandMessages.js` converts selected command results into log message descriptors for app-level handlers, including first roster skill/tavern/time/progression/party/dungeon/map/Temple command wrappers.
- Encounter definitions live in `src/game/events/eventDefinitions.js`; pure encounter queue, seen-state, active-event, and normalization rules live in `src/game/events/eventRuntime.js`.
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
- POI source data remains complete, but visible dungeons/work sites/map locations are filtered through `state.progression.unlockedLocations`.
- Worker route marker interpolation lives in `src/game/map/mapActorRuntime.js`.
- Map pan/zoom/drag view-state math lives in `src/game/map/mapViewRuntime.js`; DOM pointer capture and map event registration live in `src/app/mapInteractions.js`. Map interactions resolve the current map view through an injected getter so drag/zoom still work after save restore replaces map-view state. Map background dimensions are loaded from `assets/map-bg.png` at bootstrap through `src/app/mapBackgroundRuntime.js`; POI coordinates are source-image pixel coordinates, and the `.map-world` DOM uses CSS variables for the loaded image width/height instead of a fixed `1024x1024` size.
- Map render adapter owner: `src/app/mapRenderAdapter.js` coordinates overland map panel rendering, map transform/status text, actor-layer refresh, selected-location detail refresh, map-distance formatting, and worker marker coordinates.
- Roster render adapter owner: `src/app/rosterRenderAdapter.js` coordinates Tavern visitor queue/detail rendering, Population job rendering, party/focused-character panel rendering, roster card rendering, and shared atlas portrait helpers.
- Dungeon render adapter owner: `src/app/dungeonRenderAdapter.js` coordinates Dungeon planner and replay-only rendering with selected dungeon, cached estimate, repeated plans, repeat mode, reward formatting, replay speed labels, and roster portrait styling.
- Roster static data and stat rules live under `src/game/roster/`.
- Roster mutation helpers for visitor recruitment, focused hero selection, and skill learning live in `src/game/roster/rosterCommands.js`.
- Tavern visitor availability cycles live in `src/game/roster/visitorQueue.js`; visitor data owns fame thresholds, availability tiers, stay days, and away days. Runtime clamps present stay durations to at least 5 days.
- Crafting helpers live in `src/game/roster/craftingCommands.js`.
- Generic node-based progression graph helpers live under `src/game/progression/` and own graph normalization, root/connected-node unlock checks, effect aggregation, and generic spend/refund mutations.
- World progression gates live in `src/game/progression/worldProgression.js`; it owns initial visible locations, population location reveals, dungeon clear counters, and the Rat Cellar 50-clear fallback unlock for Old Copper Mine. Old Barracks now unlocks through Old Copper Mine boss conquest.
- Skill availability/progression checks live in `src/game/roster/skillProgression.js`, which adapts character race/job skill data onto the generic progression graph rules, including optional per-rank node costs.
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
- Dungeon route graph helpers live in `src/game/dungeon/dungeonGraphModel.js`; named routes, default routes, explicit planned paths, click-to-plan/truncate behavior, graph link/layout projection, node lookup, effective Resolve costs, active modifiers, and unique boss detection are normalized there.
- Dungeon conquest completion effects live in `src/game/dungeon/dungeonConquest.js`; scheduled operation completion applies persistent node clears, modifier disables, node unlocks, location unlocks, feature flags, and node Resolve cost adjustments there.
- Dungeon mastery progression lives in `src/game/dungeon/dungeonMastery.js`; it reuses generic progression graph rules for dungeon-specific XP/points and deterministic first-slice auto-unlocks.
- Dungeon operation value/scheduling helpers live in `src/game/dungeon/dungeonOperationModel.js`.
- Dungeon operation completion mutation lives in `src/game/dungeon/dungeonCompletion.js`.
- Dungeon operation elapsed-time ticking lives in `src/game/dungeon/operationRuntime.js`.
- Repeated-plan automation decisions live in `src/game/dungeon/repeatedPlanAutomation.js`.
- Dungeon combat replay runtime controls live in `src/game/dungeon/replayRuntime.js`; it owns replay cursor clamping, reset/stop/start/toggle, speed cycling, and speed labels with injected timer APIs for browser/runtime use.
- Resource runtime owner: `src/app/resourceRuntime.js` adapts app state to generic resource affordability, payment, and reward mutation helpers.
- Generic resource costs/reward application and Temple loot projection live in `src/game/resources/resourceRewards.js`.
- Tavern upgrade helpers live in `src/game/tavern/tavernCommands.js`; worker assignment delegates to `src/game/settlement/workforceModel.js`.
- Settlement workforce ownership lives under `src/game/settlement/`: `workforceModel.js` owns the three-worker minimum, direct coin-based hiring, worker assignment, fixed `1 coin/day` upkeep compatibility fields, and the production-multiplier read; `workSiteUpgrades.js` owns wood/ore location upgrade levels, doubling upgrade costs, and workplace caps; `happinessRuntime.js` owns daily upkeep payment and the unpaid `x0.5` production penalty.
- Production Workshop ownership lives under `src/game/workshop/`: `workshopData.js` defines recipes, per-recipe level unlocks, and the building progression graph; `workshopRecipeProgression.js` owns recipe XP/level thresholds/unlock state/effective recipe values; `workshopRuntime.js` advances production/research, derives bonuses, resolves per-slot auto-input prerequisite crafting from target recipe to temporary active recipe, and treats workshop workers above active station count as `+5%` speed assistants; `workshopCommands.js` exposes recipe, auto-input, and upgrade-node mutations. Renewable food is produced by the `rations` recipe, not by passive tavern income.
- `src/app/stateNormalizer.js` fills backward-compatible settlement/workshop/resource defaults after startup and save restore.
- Game clock/day rollover and worker-cycle delivery helpers live in `src/game/time/gameClock.js`; day rollover no longer grants passive food or coin.
- Auto-time interval ownership and visual tick interpolation helpers live in `src/game/time/autoTimeRuntime.js`; app composition injects browser timer APIs. Bootstrap starts auto-time by default after POI/autosave load and the first render.
- Hour-step advancement sequencing lives in `src/game/time/timeAdvanceRuntime.js`; app command adapters own side-effect callbacks for workers, operations, day rollover upkeep/refresh, logs, and rendering.
- Daily production mutation and repeated-plan resume candidate selection live in `src/game/time/dailyProductionRuntime.js`; app command adapters own logging and queue attempts.
- Save/load owner: `src/app/saveLoad.js` creates versioned schema `1` payloads, restores supported payloads, persists first-step encounter seen/queue state plus Tavern/Roster UI detail selections, and excludes transient runtime state such as replay timers and derived map background dimensions. Browser local persistence owner: `src/app/localSaveRuntime.js` saves to `localStorage` key `adventure-inc:save:v1`, loads once during bootstrap after POI data, debounces autosaves from render/tick paths, and supports Systems `save now` / `reset local save`.
- Basic DOM lookup and event binding helpers live in `src/ui/dom.js`.
- Tab activation class toggling lives in `src/ui/tabRuntime.js` for top-level tabs and Map, Tavern, Roster, Dungeon, and Population local tabs.
- Top-level render ordering lives in `src/ui/renderApp.js`; `src/app.js` still provides the individual render adapters and invokes the orchestrator.
- Routine auto-time ticks must use the scoped `renderTimeTick()` path instead of full `render()`. Full tick renders can replace clicked DOM between pointerdown/click and cause intermittent missed clicks in Roster, Map assignment, and similar panels. Stable high-interaction surfaces should prefer delegated handlers on persistent parent containers. Quiet day rollovers pass `dayRolledOver` into scoped rendering so the active Tavern tab refreshes visitor cards when availability changes.
- Select option rendering helpers live in `src/ui/selectView.js` for dungeon, stop-node, and party selects.
- Dungeon panel DOM rendering lives in `src/ui/dungeonPanel.js`; pure Dungeon node/estimate/replay row HTML remains in `src/ui/dungeonView.js`, including the quick stats/transcript estimate inspector, and replay controls remain in `src/ui/dungeonReplayPanel.js`.
- Dungeon replay panel DOM rendering lives in `src/ui/dungeonReplayPanel.js`; pure replay row/empty-state HTML remains in `src/ui/dungeonView.js`.
- Party/focused-character panel DOM rendering lives in `src/ui/partyPanel.js`; pure party, character skill tree, skill hover detail panels, and focused-character HTML remains in `src/ui/rosterView.js`. Generic node graph HTML rendering lives in `src/ui/progressionGraphView.js`.
- Roster card panel DOM rendering lives in `src/ui/rosterPanel.js`; pure roster/card HTML remains in `src/ui/rosterView.js`.
- Map panel DOM rendering lives in `src/ui/mapPanel.js`; it also renders deterministic log rows into the Map side-panel Log tab. Pure Map side-panel HTML remains in `src/ui/mapSideView.js`, and pure Map world/route/actor/context-menu HTML remains in `src/ui/mapWorldView.js`.
- Systems panel DOM rendering lives in `src/ui/systemsPanel.js`; pure blueprint row HTML remains in `src/ui/blueprintView.js`, and pure log row HTML remains in `src/ui/logView.js` for the Map Log tab.
- Temple panel DOM rendering lives in `src/ui/templePanel.js`; pure Temple board/shard/detail HTML remains in `src/ui/templeView.js`, and drag/drop binding remains in `src/app/templeInteractions.js`.
- First extracted UI render helpers live under `src/ui/`: `headerView.js` owns the global title/status row, `encounterView.js` owns first-step encounter HTML, `encounterPanel.js` owns encounter overlay rendering/action delegation, `rewardText.js` owns reward formatting, `blueprintView.js` owns blueprint-row HTML, `logView.js` owns deterministic log-row HTML, `populationView.js` owns Population job rows and the gathered-resource side panel, `tavernView.js` owns the Tavern upgrade hover panel, visitor queue, and read-only visitor detail/skill panels, `dungeonView.js` owns Dungeon node/estimate/replay HTML builders, `mapSideView.js` owns Map side-panel selected-location, operation, and POI table HTML, `mapWorldView.js` owns Map route/POI/world/actor marker HTML builders, `rosterView.js` owns Roster/party/skill/focused-character HTML builders, and `templeView.js` owns Temple board, stone, socket, shard token, inventory, buff, and detail HTML builders.
- No dependencies, build step, bundler, or framework currently exists. Browser persistence is local-only through `localStorage`; there is no cloud/account backend.
- POI data lives in `assets/data/poi.json` and is loaded with `fetch()` during startup through `loadPoiData()`.
- State is held in one in-memory `state` object created by `createInitialState()`.
- `state.progression` owns world unlocks, dungeon clear counts, dungeon mastery state, and unique boss clears.
- Rendering is DOM-driven through explicit `render*()` functions.
- App render adapters orchestrate full rendering through `src/app/appRenderHandlers.js` and `src/ui/renderApp.js`.
- The simulation is deterministic and advances through explicit hour ticks. Time can be stepped manually; auto-time starts by default on bootstrap and can be toggled off from the title row.
- Map movement is presentation-only interpolated with `requestAnimationFrame` between hourly ticks; gameplay rewards and operation completion still happen only on deterministic hour advancement.
- The main UI uses seven top tabs: Map, Tavern, Population, Roster, Dungeon, Temple, and Systems.
- A compact centered encounter overlay introduces first-step mechanics. It uses the same dense dev-tool visual language and does not replace the Systems log.
- The first tutorial flow is dungeon-first: founder/tavern charter, Rat Cellar map run, Dungeon readout, Tavern recruitment, Roster party setup, then Population/Workshop. Temple onboarding is delayed until the second dungeon reveal.

## Current Gameplay Slice

- Tavern state:
  - capacity
  - fame
  - no passive daily food/coin income
  - visitor queue with fame-gated atlas-backed hire cards
- Population state:
  - minimum workforce of 3 workers
  - direct worker hiring through an exponentially rising coin cost
  - worker assignment for wood, ore, workshop production, and workshop research
  - deterministic worker cycles for wood and ore deliveries
  - fixed daily upkeep of `1 coin` per worker
  - unpaid upkeep keeps all workers but applies a `x0.5` multiplier to worker-site, workshop, and research production
- Production Workshop:
  - one or more recipe stations with deterministic worker-hour progress
  - `rations` recipe produces food from worker-hours
  - one workshop worker mans one station, assigned from first station to last
  - workshop workers above station count become assistants and add `+5%` speed each; fractional progress is stored directly on the slot
  - station slots store a player target recipe plus a temporary active recipe; `auto inputs` can route through known prerequisite recipes and resets progress when the active recipe changes
  - recipes for planks, simple furniture/comfort goods, and training bows
  - each recipe gains deterministic XP on craft, levels through square XP thresholds, and applies item-specific unlocks to effective cost/output/work values
  - Population workshop item labels include level and expose a hover panel for XP, current effective stats, and unlock milestones
  - research workers fill a bar that grants workshop upgrade points
  - workshop upgrades use the generic progression graph system
  - implementation details are documented in `docs/workforce-workshop-system.md`
- Resources:
  - coin
  - food
  - wood
  - ore
  - hide
- Roster:
  - starting founder adventurer
  - deterministic visitor queue with 48 recruitable adventurers
  - fame-gated visitor tiers and deterministic present/away cycles
  - recruit costs
  - focused character selection for training and crafting
  - party groups with explicit member assignment
  - selected party for dungeon planning
  - 7x7 character atlas slots from `assets/chars-atlas.png`; founder uses slot `0`, recruitable visitors use slots `1..48`
  - levels, XP, skill points
  - race, primary job, secondary job placeholder, and learned skill ranks
  - focused-character sidebar skill trees for race and primary job, rendered as node graphs
  - deterministic skill effects feeding derived HP, ATK, DEF, utility, Resolve, travel speed, recovery time, and food cost
  - every race tree includes a three-node connected Resolve progression spine; deeper Resolve ranks cost more skill points per rank through `costPerRank`
- Dungeons:
  - Rat Cellar
  - Old Copper Mine
  - Old Barracks
  - fixed travel time and food cost
  - named route graphs over deterministic nodes
  - Old Copper Mine is combat-heavy by design: one opening check, one flooded-branch hazard, one relief node, and combat for the rest of the non-boss route pressure
  - clickable Dungeon-tab route graph targeting for choosing an end node/path
  - explicit click-planned paths that can be added/truncated by graph node clicks
  - persistent conquest state for cleared nodes, unlocked nodes, disabled modifiers, and Resolve cost adjustments
  - modifier nodes/effects that can buff enemies, hazards, checks, or Resolve costs until disabled
  - relief nodes that can reduce future Resolve pressure
  - hazard, utility-check, and combat nodes
  - miniboss nodes that can unlock functionality or disable modifiers
  - boss nodes can be unique one-time clears
  - conditional conquest effects can reveal a location only after a required set of nodes has been cleared
  - node Resolve costs can make individual heroes withdraw before deeper nodes
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
  - Map `run` creates/replaces the selected party's repeated plan, queues the first run when possible, and switches to the Dungeon tab with an immediate simulation
  - Dungeon graph path changes immediately resimulate and update the stored repeated estimate for future queue attempts when the path is legal
  - Dungeon strategy changes immediately resimulate and replace that party's repeated plan for future queue attempts without mutating an already active operation
  - same-party repeated operations serialize through a queued phase
  - rewards are applied when the party operation completes its travel, dungeon, return, and regeneration phases
  - repeated plans pause when required resources are unavailable and resume after production if possible
- First-step encounters:
  - authored tutorial definitions trigger on startup, key tab visits, first recruit, first dungeon simulation, first queued run, first operation return, second dungeon reveal, and first crafted item
  - blocking encounters pause auto-time and restore the previous running state when the encounter queue closes
  - encounter actions can close the modal or switch to an existing top tab through shell commands
  - seen/queue state is stored in normal save payloads
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
  - starts with only Tavern and Rat Cellar visible
  - work sites reveal when Population is introduced
  - Old Copper Mine unlocks after 50 successful Rat Cellar clears or Rat Cellar boss conquest
  - Old Barracks unlocks after all three Old Copper Mine branch bosses are cleared
  - visible work sites and dungeons render as simple labeled POIs
  - POI labels are clickable and populate the selected-location side panel
  - the Map toolbar is compact and only shows inline `Selected Party` plus the party select synchronized with the Dungeon selected party
  - dungeon POIs open a small context menu at the clicked position with `run` and `cancel`
  - `run` schedules the selected party now as a full repeated route, performs the first simulation, and switches to the Dungeon tab for inspection
  - worker markers travel between tavern and work sites
  - party markers travel to dungeon POIs, pulse while busy, and return to the tavern

## Important Runtime Rules

- `Math.random()` should not be introduced for gameplay.
- `simulateDungeonRun()` in `src/game/dungeon/dungeonRunSimulator.js` is the central deterministic planner and also produces combat replay timelines. `src/app/dungeonCommandHandlers.js` keeps the state-aware simulate adapter.
- `simulateDungeonRun()` resolves the selected named route, applies node Resolve costs after each completed node, removes withdrawn heroes from deeper nodes, and preserves rewards from completed nodes on partial routes.
- `partyStats()` aggregates member stats for the current first-slice party combat model.
- `resolveNode()` from `src/game/combat/combatTimeline.js` dispatches hazard/check/combat node rules.
- `resolveCombat()` is internal to `src/game/combat/combatTimeline.js` and owns deterministic actor-timeline combat for inspection replay and final estimate output while action choice lives in `src/game/combat/combatActions.js`.
- `scheduleEstimate()` in `src/app/dungeonCommandHandlers.js` is the mutation adapter that turns a cached estimate into a queued operation and pays food up front. Validation and operation construction are delegated to `src/game/dungeon/dungeonOperationModel.js`.
- `scheduleEstimate()` queues a party operation and pays food up front.
- Manual Dungeon Planner assignments stop that party's repeated plan before queueing the new assignment; active operations are not cancelled.
- Map-side dungeon `run` creates/replaces a full-route repeated plan for the selected party, simulates immediately, switches to the Dungeon tab, and queues through `ensureRepeatedPlanQueued()`.
- Dungeon graph planning uses stop values shaped as `path:<nodeId>,<nodeId>`, resolves a legal deterministic path through `dungeonRouteForStop()`, and follows the same repeated-plan update semantics as strategy changes. Legacy `node:<nodeId>` target values still work from the Info select.
- Dungeon completion applies conquest effects from reached nodes, even when a later planned node fails. Preview simulation reads conquest state but never mutates it.
- Completed successful dungeon operations increment dungeon clear counters. Rat Cellar clear 50 reveals Old Copper Mine as a fallback. Old Barracks is revealed by clearing all three Old Copper Mine branch bosses.
- `dungeonXp` is progression-only and feeds dungeon mastery; it is ignored by generic resource reward application.
- Dungeon strategy changes call resimulation immediately; if the selected party has a repeated plan, the stored repeated estimate is replaced for future queue attempts while active operations remain unchanged.
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
- Map dungeon POIs should launch via the context menu, not a side-panel assignment button.
- Map layout is a 2/3 left map panel plus 1/3 right side panel. Clicking a location updates the right side panel.
- The Map right side panel has local tabs: `Info` for selected location details, `Operations` for active operations plus POI coordinate tables, `Log` for deterministic log inspection/clearing, and `Dev` for time controls.
- The roster should use State, Party, and Focus concepts rather than a single Active character toggle.
- Roster character presentation uses clickable portrait cards backed by `assets/chars-atlas.png`; clicking a card updates the focused-character sidebar.
- Roster supports `detailed` and `minimized` card modes. Minimized mode keeps cards close to icon-sized while remaining clickable for sidebar focus.
- Roster layout is a 2/3 main panel plus 1/3 selected-character side panel. The main panel is split into party groups on the left and character grid on the right.
- The selected-character side panel starts with local tabs instead of a title label: `info` for stats, gear, crafting, and add-to-party actions; `skill 1` and `skill 2` for the first two available character skill trees.
- Roster skill graph nodes expose hover detail panels with flavor text, rank/cost/requirement state, and current-to-next effect deltas. Cost reflects the node's `costPerRank`.
- Party rows show only actual members as `-name` remove buttons. Adding/moving a character into the selected party is done from the focused-character sidebar with `add to current party`.
- Party selection is done by clicking the party or state cell, not a Use button. The selected party row gets a yellow outline.
- Party rows have a Command column with `cancel`, which clears queued/running operations and repeated plans for that party, restores members to full HP at town, and grants no rewards.
- Tavern visitor candidates use the same `assets/chars-atlas.png` portrait-card treatment as roster characters.
- Tavern visitors are fame-gated and cycle through `present` and `away` states. The Tavern tab can show fewer than three visitors when fame is low or eligible visitors are away. Visitor cards show days left from the current `nextChangeDay`.
- The Tavern tab is a 2/3 visitor queue plus 1/3 right detail panel. Visitor cards have `hire` and `info` actions; `info` selects the visitor for the right panel.
- The Tavern `upgrade tavern` button renders a workshop-style hover panel showing current tavern level/effect, next effect, upgrade cost, and flavor text.
- The Tavern right detail panel starts with local tabs: `info`, `skill 1`, and `skill 2`. It previews selected visitor stats and read-only skill trees using the same skill graph surface as Roster.
- The global title bar is intentionally compact: `Adventure-Inc`, day, phase, time mode, coin, and fame.
- The Population tab has second-row local tabs: `population` for worker hiring/assignment and labor notes, `workshop` for recipe stations and recipe XP hover panels, and `upgrades` for research progress plus the workshop upgrade graph.
- The Population tab has a persistent right side panel visible across all three local tabs. It displays gathered settlement goods: food, wood, ore, hide, planks, comfort, and bows.
- The Tavern tab uses `assets/tavern-bg.png` as a fullscreen background with readable management panels layered over it.
- The Roster tab uses `assets/roster-bg.png` as a fullscreen background with the same readable panel overlay treatment.
- The Dungeon tab uses `assets/dungeons-bg.png` as a fullscreen background with the same readable panel overlay treatment.
- The Dungeon tab has a second-row local tab bar directly under the primary tabs. `dungeon` shows a 2/3 + 1/3 workspace: the left 2/3 is split 50/50 between full-height route graph and full-height Combat Replay, and the right 1/3 shows clicked-node info. `info` shows party/dungeon/strategy/target/repeat controls and the run estimate.
- The Dungeon tab includes a Combat Replay panel. Replay controls inspect the last simulated timeline only and are independent from game-time automation.
- The Dungeon tab replay omits the scrolling event log in the main UI; the current replay event text and timeline slider are the inspection surface.
- The Dungeon tab route surface is a compact conquest graph, not a flat room list. Clicking graph nodes builds or truncates a legal planned path and reruns the deterministic estimate; clicking locked/unreachable nodes selects them for the info drawer without replacing the current plan.
- The Dungeon tab estimate area should prioritize quick party/dungeon/strategy/result/node/time/food/HP/reward stats plus the time/combat transcript.
- Dungeon estimates include route and Resolve information.
- The Temple tab is a board-style management surface: Ritual Stone selector buttons, Temple Matrix with clickable links, bottom shard inventory rows, and selected Shard Info side panel.
- The Map tab uses `assets/map-bg.png` as the actual overland map surface inside a transformed `.map-world`; POIs, route lines, workers, and party markers use the same pixel world coordinates.

## Current Non-Goals

- Versioned save/load exists in `src/app/saveLoad.js`; browser/localStorage autosave is wired through `src/app/localSaveRuntime.js`.
- Multi-character party combat is aggregate-stat based only; per-character tactics and damage allocation are not implemented yet.
- No building-specific incremental mechanics beyond the first Production Workshop slice.
- Dungeon visuals support graph path planning, locked edges, active modifiers, cleared nodes, and a selected-node info drawer. Named saved plans and per-node party setup are not implemented yet.
- No item affixes, random drops, or randomized crafting.
- No background real-time idle loop yet.
- No freeform map navigation or graphical terrain yet.
- No backend.

## Likely Next Systems

1. Extract gameplay data into data files or owner modules once rules grow beyond the first slice.
2. Add export/import save files if backups or manual save sharing become a requirement.
3. Expand per-character combat from prototype strategy actions into authored skill/action-plan data.
4. Add building modules where each building has a distinct incremental mechanic.
5. Add skill refund/respec and secondary-job multiclass selection.
6. Add action-plan editing per character instead of three global strategy presets.
7. Add automation scheduling that shows travel, dungeon, return, and regeneration phases.

## Design Docs

- `docs/adventurer-skill-design.md`: race/job/multiclass model, deterministic skill categories, tree rules, and first implementation slice.
- `docs/progression-graph-system.md`: reusable node-based progression graph rules, data/state shape, UI contract, and extension notes for characters/buildings/dungeons.
- `docs/workforce-workshop-system.md`: direct worker hiring, fixed upkeep, unpaid production penalty, production workshop recipes including rations, recipe XP unlocks, research, and workshop progression graph.
- `docs/tavern-visitor-queue.md`: fame-gated visitor tiers, deterministic present/away cycles, visible visitor seats, recruitment validation, and Tavern UI contract.
- `docs/first-step-encounter-system.md`: first-step tutorial encounter goals, non-goals, state shape, trigger rules, command boundaries, rendering, save/load behavior, and extension path.
- `docs/dungeon-map-run-flow.md`: Map-party selection, dungeon context menu, immediate repeated-run scheduling, Dungeon-tab routing, strategy-change resimulation, and ownership boundaries.
- `docs/dungeon-progression-redesign.md`: dungeon-first onboarding, world visibility gates, route graphs, Resolve, unique bosses, dungeon mastery, and unlock ownership.
- `docs/temple-shard-design.md`: Temple board, shard slot/influence rules, deterministic shard drops, shard XP, and first implementation status.
- `docs/dungeon-combat-replay-design.md`: deterministic actor-timeline combat resolver and inspection-only replay UI.
- `docs/continent-expansion-design.md`: open multi-continent expansion design, Expedition POI trigger, Expedition tab launch flow, arrival switch/stay popup, Continent tab focus switching, active/focused continent model, deterministic catch-up, costly transfers, fatal route loss choices, memorials, and continent rule modifiers.
- `docs/continent-expansion-implementation-plan.md`: phased implementation plan for continent/route data, day-7 Expedition POI unlock, Map routing, Expedition tab skeleton, world shell, active-continent state migration, catch-up, hero stationing, transfers, fatal route resolution, and Training Grounds.

## Verification

Current quick validation:

```powershell
npm run check:js
npm test
```

Last validation result:

- `npm run check:js`: passed, checked 131 JavaScript files.
- `npm test`: passed, 362/362 tests.

Manual browser smoke test:

- open `index.html`
- switch through the seven tabs
- confirm auto time starts by default, then disable and re-enable it
- on Map, choose a party, click a dungeon, cancel, then click it again and run
- confirm run switches to Dungeon with repeat/full route selected and a fresh simulation
- change Dungeon strategy and confirm the estimate/replay updates immediately
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
