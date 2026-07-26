# Next Session Handoff

## Scope

- Project: `adventure-inc`.
- Current implementation: static HTML/CSS/ES-module JS prototype.
- Root context starts with `AI_CONTEXT.md`.
- Adventurer skill design is documented in `docs/adventurer-skill-design.md`.
- Reusable progression graph design is documented in `docs/progression-graph-system.md`.
- Workforce and Production Workshop design is documented in `docs/workforce-workshop-system.md`.
- Tavern visitor queue design is documented in `docs/tavern-visitor-queue.md`.
- First-step encounter design is documented in `docs/first-step-encounter-system.md`.
- Temple shard design is documented in `docs/temple-shard-design.md`.
- Dungeon map-run flow is documented in `docs/dungeon-map-run-flow.md`.
- Dungeon progression redesign is documented in `docs/dungeon-progression-redesign.md`.
- Dungeon combat replay design is documented in `docs/dungeon-combat-replay-design.md`.
- Continent expansion design is documented in `docs/continent-expansion-design.md`.
- Continent expansion implementation planning is documented in `docs/continent-expansion-implementation-plan.md`.
- Git repository exists. Initial prototype commit: `f2938e2 Initial adventure-inc prototype`.
- Backup commit before Expedition implementation: `de0ccfc Backup before expedition implementation`.
- Current Expedition implementation work is uncommitted unless the user asks for another commit.

## Implemented State

- Added `index.html`, `styles.css`, and modular JavaScript under `src/`.
- `index.html` now loads `src/main.js` with `type="module"`.
- `src/main.js` imports the small compatibility shim in `src/app.js`.
- `src/app/adventureIncApp.js` owns app composition: data, state, command adapters, render adapters, browser APIs, bootstrap, and controls.
- `src/app/appConfig.js` owns stable prototype UI/runtime constants: character-atlas dimensions, map background fallback path/dimensions, map zoom defaults, Temple inventory slots, and replay default speed.
- `src/app/appState.js` owns initial state creation through `createInitialState()`.
- `src/app/stateNormalizer.js` owns compatibility defaults for event/settlement/workshop/resource state after startup and save restore.
- `src/app/localSaveRuntime.js` owns browser `localStorage` persistence through key `adventure-inc:save:v1`; startup loads it after POI data, render/tick paths debounce autosaves, and Systems exposes `save now` / `reset local save`.
- `src/app/appRuntimeContext.js` owns app runtime context construction: initial state, browser auto-time runtime, loaded-data context, DOM element bag, and app resource runtime.
- `src/app/appBootstrapSetup.js` owns app-specific DOM binding and startup registration wiring.
- `src/app/appCallbackRegistry.js` owns late-bound app-level callback forwarding across command, render, bootstrap, and interaction adapters.
- `src/app/appQueries.js` owns app-level read/query composition for POI-derived collections, selected dungeon/location/party, focused hero, party members/stats/readiness, operation phase projection, and roster status labels.
- `src/app/appSelectionFacade.js` owns the small app-facing read facade that composes app queries with roster skill progression projections.
- `src/app/appUtilityCallbacks.js` owns app-level log insertion, reward formatting, Temple progression/loot callbacks, and replay timer API creation.
- `src/app/appRenderHandlers.js` owns top-level render ordering, focused render pass delegation, Continent/arrival rendering, and scoped `renderTimeTick()` updates for routine auto-time ticks.
- `src/app/appShellCommandHandlers.js` owns UI-only shell commands: clear log, top-tab activation, Map/Tavern/Roster/local tab activation, and dungeon/party select-change estimate invalidation.
- `src/app/eventCommandHandlers.js` owns first-step encounter triggering, close/tab actions, and blocking encounter auto-time pause/resume coordination.
- `src/app/browserTimerAdapters.js` owns browser `window`/`performance` binding for auto-time and replay timer interfaces.
- `src/app/bootstrap.js` owns DOMContentLoaded startup sequencing and the requestAnimationFrame map actor refresh loop through injected browser/data/render dependencies.
- `src/app/domElements.js` owns the required DOM element ID contract and app element binding.
- `src/app/controlBindings.js` owns static DOM control binding to injected app command handlers.
- `src/app/appControlSetup.js` owns static control handler-map composition from shell, dungeon, expedition, party, replay, roster/tavern, and time command owners.
- `src/app/appDataContext.js` owns loaded POI data storage for bootstrap writes and query reads.
- `src/app/appMapInteractionSetup.js` owns app-state/config wiring for overland map pointer and wheel interactions.
- `src/app/dungeonCommandHandlers.js` owns dungeon simulation, cached estimate replay replacement, commit scheduling, repeated-plan automation, repeated queue attempts, and operation completion wrapper coordination.
- `src/app/mapCommandHandlers.js` owns map-location selection, transient dungeon/expedition context-menu state, Dungeon control sync, estimate invalidation for selected dungeon POIs, full repeated run setup, immediate simulation, first queue attempt, Dungeon-tab routing, and Expedition POI routing.
- `src/app/mapRenderAdapter.js` owns overland map panel rendering, map transform/status text, party actor-layer refresh, selected-location detail refresh, distance formatting, and Expedition POI run routing.
- `src/app/expeditionCommandHandlers.js` owns Expedition route/party selection, start-expedition validation/mutation, arrival prompt resolution, and Continent focus switching.
- `src/app/expeditionRenderAdapter.js` owns Map side-panel Expedition Plan rendering, Continent tab rendering, and arrival popup rendering from continent state.
- `src/app/dungeonRenderAdapter.js` owns Dungeon planner rendering and replay-only refresh coordination with selected dungeon, cached estimate, repeated plans, repeat mode, reward formatting, replay speed labels, and roster portrait styling.
- `src/app/replayCommandHandlers.js` owns replay cursor/playback/speed wrapper coordination, browser timer injection, full render vs replay-only render decisions, and replay speed labels.
- `src/app/rosterRenderAdapter.js` owns Tavern visitor queue/detail rendering, Population job rendering, party/focused-character panel rendering, roster card rendering, and shared atlas portrait helpers.
- `src/app/rosterTavernCommandHandlers.js` owns recruit, selected Tavern visitor inspection, focus, roster-view toggle, crafting, tavern upgrade, and worker assignment wrapper coordination for logging and rendering.
- `src/app/partyCommandHandlers.js` owns party command wrapper coordination for logging, party select refresh, and rendering.
- `src/app/selectControlAdapter.js` owns app-state-aware dungeon, stop-node, and party select population.
- `src/app/timeCommandHandlers.js` owns auto-time startup/toggling, hour advancement, worker deliveries, operation ticking/completion, Expedition transfer ticking/arrival logging, daily production, repeated-plan resume checks, logging, and rendering. Bootstrap enables auto-time by default after POI/autosave load and the first render. Automatic unreported ticks use scoped rendering instead of full `render()` to avoid replacing clickable DOM during pointer gestures; quiet day rollovers pass `dayRolledOver` so the active Tavern tab refreshes visitor cards when availability changes. Active Roster ticks refresh party rows, roster cards, and focused-character detail so operation state stays live without requiring a click.
- `src/app/headerRenderAdapter.js` owns global title-row render coordination with current app state, selected party, and the auto-time control lookup.
- `src/app/systemsRenderAdapter.js` owns Systems blueprint render coordination with blueprint definitions and unlocked blueprint state.
- `src/app/eventRenderAdapter.js` owns active first-step encounter rendering coordination.
- `src/app/selectControls.js` owns app-level dungeon, stop-node, and party select population using the pure select view helpers.
- `src/app/logRuntime.js` owns deterministic log entry stamping, newest-first insertion, cap enforcement, and clearing.
- `src/game/events/eventDefinitions.js` owns the current authored first-step tutorial encounter definitions and trigger constants.
- `src/game/events/eventRuntime.js` owns pure first-step encounter state normalization, queueing, active-event, seen-state, and close behavior.
- `src/app/commandMessages.js` owns first command-result-to-log-message adapters for recruit/focus/skill/craft/tavern/worker/party command wrappers, time/progression messages, party member edit/add messages, dungeon simulation/automation/scheduling/completion messages, map repeated-assignment messages, and Temple shard/inventory/equip/link messages.
- `src/app/mapInteractions.js` owns overland map pointer/wheel DOM event registration, pointer capture, drag CSS state, and zoom refresh callbacks. It resolves `state.mapView` through a getter so drag/zoom still mutate the restored map view after autosave load.
- `src/app/mapBackgroundRuntime.js` owns runtime loading/normalization of continent-specific map background dimensions. Old Marches uses `assets/map-bg.png`; Ash Coast uses `assets/map-ash-coast.png`. Map world size comes from the focused continent image's natural dimensions; POI coordinates remain source-image pixel coordinates.
- `src/app/planInvalidation.js` owns cached dungeon estimate clearing/setting and the explicit replay reset coupling for estimate changes.
- `src/app/rosterProgressionHandlers.js` owns app-level skill-learning log/render coordination and XP level-up logging around pure roster progression helpers.
- `src/app/templeInteractions.js` owns Temple board link clicks, shard token click/drag, socket drops, and inventory drops with injected command handlers.
- `src/app/templeAppQueries.js` owns app-level Temple reads for active stone definitions, active bonuses, shard ownership, color labels, and loot-bonus projection.
- `src/app/appQuerySetup.js` owns composition of loaded POI data, Temple query reads, and the app selection facade.
- `src/app/templeCommandHandlers.js` owns Temple shard XP placement/logging, stone/shard selection, inventory moves, socket equipment, and line-toggle wrapper coordination for logging and rendering.
- `src/app/templeProgressionHandlers.js` owns dungeon visit/boss shard progression award coordination around Temple shard XP command handling.
- `src/app/templeRenderAdapter.js` owns Temple panel render coordination with active stone state, normalized inventory slots, active bonuses, shard effect scaling, line activity checks, and injected Temple command callbacks.
- `src/core/math.js` and `src/core/format.js` own pure shared helpers.
- `src/data/dataLoader.js` and `src/data/validators/poiValidator.js` own POI loading and validation.
- `src/data/poiSelectors.js` owns POI read selectors and map-location composition from tavern/work-site/dungeon JSON data.
- `src/data/poiSelectors.js` also owns visible POI filtering from `state.progression.unlockedLocations`, Expedition route unlock state, and focused continent.
- `src/game/continent/continentData.js` defines `old_marches`, `ash_coast`, and the first safe `old_marches_to_ash_coast` Expedition route.
- `src/game/continent/continentState.js` owns focused continent, unlocked continents/routes, hero and party continent locations, Expedition transfers, pending arrivals, and deterministic time-away catch-up reports.
- `src/game/progression/worldProgression.js` owns world unlock state, population location reveal, dungeon clear counters, and the Rat Cellar 50-clear fallback unlock for Old Copper Mine. Old Barracks now unlocks through Old Copper Mine boss conquest.
- `src/game/map/mapViewRuntime.js` owns pure map drag, pan, zoom, screen/world conversion, transform style, and map status text.
- `src/game/roster/adventurerData.js`, `src/game/roster/skills.js`, and `src/game/roster/heroStats.js` own visitor data, skill definitions, and derived hero stats.
- `src/game/roster/visitorQueue.js` owns fame-gated Tavern visitor present/away cycles, visible-seat filling, minimum 5-day present stays, and deterministic turn-away timers.
- `src/game/roster/rosterCommands.js` owns roster mutations: next visitor lookup, visitor-to-hero conversion, recruitment, focused hero selection, and skill learning.
- `src/game/roster/craftingCommands.js` owns blueprint crafting/equipping.
- `src/game/progression/` owns reusable node-based progression graph helpers: graph normalization/layout, optional per-rank node costs, root/connected-node unlock checks, effect aggregation, and generic spend/refund mutations.
- `src/game/roster/skillProgression.js` owns character skill adapters for available-tree, skill-rank, and can-learn checks using the generic graph rules.
- `src/game/roster/leveling.js` owns XP gain, level-up loops, skill-point gain, and level-up HP restoration.
- `src/game/party/partySelectors.js` owns focused/selected party reads, party membership, hero-name fallback, character status derivation, full-heal checks, and party stat aggregation.
- `src/game/party/partyCommands.js` owns first party mutations: create/select party, cancel party action, remove member, and add/move hero into a party.
- `src/game/blueprints/blueprints.js` owns blueprint definitions.
- `src/game/temple/templeData.js` owns Temple colors, stones, and shard definitions.
- `src/game/temple/templeState.js` owns active stone lookup, socket helpers, stone-state creation/normalization, shard ownership checks, and socketed-shard checks.
- `src/game/temple/templeBonuses.js` owns color influence and active Temple bonus resolution.
- `src/game/temple/templeCommands.js` owns Temple stone/shard selection, inventory normalization/movement, socket equipment, and line toggling.
- `src/game/temple/shardProgression.js` owns deterministic shard visit/boss counters, due-shard award selection, and shard XP mutation.
- `src/game/combat/combatTimeline.js` owns combat actor creation, node resolution, deterministic combat scheduling, party HP summary, and recovery-hour calculation.
- `src/game/combat/combatActions.js` owns party action selection, enemy target selection, enemy damage, and action recovery helpers.
- `src/game/combat/combatReplayModel.js` owns replay event and actor snapshot creation.
- `src/game/dungeon/dungeonRunSimulator.js` owns deterministic dungeon estimate simulation, travel/food adjustment, reward merging, and replay start/block/end events.
- `src/game/dungeon/dungeonRunSimulator.js` now resolves named route graphs, applies per-node Resolve costs, withdraws heroes who run out of Resolve, and preserves partial rewards.
- `src/game/dungeon/dungeonGraphModel.js` owns route normalization, explicit planned paths, graph link/layout projection, click-to-plan/truncate behavior, node lookup, active modifiers, effective Resolve cost reads, and unique boss detection.
- `src/game/dungeon/dungeonConquest.js` owns scheduled-completion conquest effects: cleared nodes, disabled modifiers, unlocked nodes, unlocked locations/features, and persistent Resolve cost adjustments.
- `src/game/dungeon/dungeonMastery.js` owns dungeon mastery XP, graph point conversion, deterministic first-slice auto-spending, and mastery blueprint effects.
- `src/game/dungeon/dungeonOperationModel.js` owns estimate cloning, operation total hours, queued party hours, current operation phase calculation, queue-readiness checks, schedule validation, and party-operation construction.
- `src/game/dungeon/dungeonCompletion.js` owns party operation completion mutation with injected reward/XP/Temple callbacks.
- `src/game/dungeon/operationRuntime.js` owns operation elapsed-time ticking and completed/remaining operation splitting.
- `src/game/dungeon/repeatedPlanAutomation.js` owns repeated-plan toggle and queue/pause/no-op decisions.
- `src/game/dungeon/replayRuntime.js` owns replay cursor clamping, reset/stop/start/toggle, speed cycling, and speed labels with injected timer APIs.
- `src/game/resources/resourceState.js` owns resource defaults and starting stockpile helpers.
- `src/app/resourceRuntime.js` adapts app state to generic resource affordability, payment, and reward mutation helpers. Resources are local per continent under `state.world.resourcesByContinent`; `state.resources` remains a focused-continent compatibility alias for existing systems.
- `src/game/resources/resourceRewards.js` owns generic resource affordability/payment, reward application, and Temple loot bonus projection.
- `src/game/tavern/tavernCommands.js` owns tavern upgrade cost/upgrade behavior and wood/ore worker reassignment.
- `src/game/settlement/workforceModel.js` owns the three-worker minimum, direct coin-based hiring, worker assignment, and the worker production multiplier read.
- `src/game/settlement/workSiteUpgrades.js` owns wood/ore work-site upgrade levels, doubling upgrade costs, and max-worker workplace caps.
- `src/game/settlement/happinessRuntime.js` owns fixed daily worker upkeep and the unpaid `x0.5` production penalty.
- `src/game/workshop/workshopData.js`, `src/game/workshop/workshopRecipeProgression.js`, `src/game/workshop/workshopRuntime.js`, and `src/game/workshop/workshopCommands.js` own Production Workshop recipes, per-recipe XP/level unlocks, worker-hour production, overflow-worker speed assistants, auto-input prerequisite routing, research, and upgrade graph mutations. `rations` is the renewable food recipe.
- `src/game/tavern/tavernCommands.js` owns tavern upgrade cost/upgrade behavior and delegates worker assignment to the settlement workforce owner.
- `src/game/time/gameClock.js` owns explicit clock advancement/normalization and worker-cycle delivery helpers. Day rollover does not grant passive food or coin.
- `src/game/time/autoTimeRuntime.js` owns auto-time interval start/stop/toggle state, tick timestamps, and visual hour-fraction interpolation with injected timer/clock APIs.
- `src/game/time/timeAdvanceRuntime.js` owns hour-step sequencing for per-hour callbacks and clock advancement.
- `src/game/time/dailyProductionRuntime.js` owns daily production mutation and repeated-plan resume candidate selection.
- `src/ui/dom.js` owns required DOM element lookup and basic event binding helpers.
- `src/ui/tabRuntime.js` owns top-level tab and Map side-panel tab class activation helpers.
- `src/ui/renderApp.js` owns top-level render order orchestration.
- `src/ui/selectView.js` owns dungeon, stop-node, and party select option rendering helpers.
- `src/ui/dungeonPanel.js` owns Dungeon panel DOM rendering by coordinating node-map, estimate, and replay rendering.
- `src/ui/dungeonReplayPanel.js` owns Dungeon replay panel DOM rendering: slider/status/control state, actor panes, action icon/text, and event log.
- `src/ui/partyPanel.js` owns Party table plus focused-character panel DOM rendering and delegated parent action binding.
- `src/ui/rosterPanel.js` owns Roster card panel DOM rendering and delegated parent focus binding.
- `src/ui/mapPanel.js` owns Map panel DOM rendering: world markup injection, delegated POI click binding, selected-location detail binding, conditional Expedition Plan side-tab rendering, operations table rendering, POI coordinate table rendering, and deterministic log row rendering for the Map side-panel Log tab.
- `src/ui/expeditionPanel.js` owns Map side-panel Expedition Plan DOM rendering, Continent panel DOM rendering, and arrival prompt event binding.
- `src/ui/expeditionView.js` owns pure Expedition route detail, party manifest, Continent summary, transfer rows, and arrival prompt HTML.
- `src/ui/systemsPanel.js` owns Systems panel DOM rendering for blueprint rows.
- `src/ui/templePanel.js` owns Temple panel DOM rendering: stone buttons, board HTML, socket/inventory token rendering, active buffs, selected-shard detail, and local Temple interaction binding.
- `src/ui/headerView.js`, `src/ui/encounterView.js`, `src/ui/encounterPanel.js`, `src/ui/rewardText.js`, `src/ui/blueprintView.js`, `src/ui/logView.js`, `src/ui/populationView.js`, `src/ui/tavernView.js`, `src/ui/dungeonView.js`, `src/ui/mapSideView.js`, `src/ui/mapWorldView.js`, `src/ui/progressionGraphView.js`, `src/ui/rosterView.js`, and `src/ui/templeView.js` own the first extracted render helpers for the global title row, first-step encounter overlay, reward labels, blueprint rows, deterministic log rows, Population job/resource rows, Tavern upgrade hover panel, visitor queue and read-only visitor detail/skill panels, Dungeon node/estimate/replay HTML, Map side-panel HTML, Map route/POI/world/actor marker HTML, generic progression node graphs, Roster/party/skill/focused-character HTML including skill hover detail panels, and Temple board/shard/detail HTML.
- `package.json` provides `npm run check:js` and `npm test`.
- `scripts/check-js.mjs` recursively syntax-checks all JavaScript files under `src/`.
- Tests currently cover app config defaults, app-state independence, app runtime context construction, app bootstrap setup behavior, app callback registry behavior, app data context behavior, app query setup behavior, app utility callback behavior, app query behavior, app selection facade behavior, app render handler behavior, app shell command behavior, app event command behavior, app control setup behavior, app map interaction setup behavior, browser timer adapters, bootstrap startup/map-loop behavior, save/load payload behavior, resource runtime behavior, log runtime behavior, first-step event runtime behavior, plan invalidation/replay reset coupling, select-control adapter behavior, POI validation/selectors, map actor interpolation, map render adapter behavior, dungeon render adapter behavior, header render adapter behavior, systems render adapter behavior, Temple app query behavior, Temple render adapter behavior, hero stat calculation, skill progression checks, party selectors/stat aggregation, party commands, party command adapters, roster commands including skill learning, roster progression app handlers, roster render adapters, roster/tavern command adapters, crafting commands, tavern commands, resource rewards, time/worker cycles, time command adapters, Temple state/command/bonus resolution, Temple command adapters, Temple progression app handlers, shard progression, Temple interaction event wiring, deterministic combat timeline behavior, dungeon command adapters, dungeon run simulation, operation completion, operation phase modeling, operation scheduling decisions, repeated-plan automation decisions, map command adapters, map interaction event wiring, replay command adapters, Dungeon panel rendering, Dungeon replay panel rendering, Map panel rendering, Systems panel rendering, Temple panel rendering, Party/focused-character panel rendering, Roster card panel rendering, encounter view rendering, and extracted UI view-format helpers.
- Added `assets/data/poi.json` as the source for tavern, work-site, and dungeon POI data.
- Added project guidance docs:
  - `AGENTS.md`
  - `AI_CONTEXT.md`
  - `NEXT_SESSION_HANDOFF.md`
- The UI uses a dense dev-tool look with compact panels, tables, small monospace text, square controls, and a deterministic log.
- The UI now uses eight top tabs: Map, Tavern, Population, Roster, Dungeon, Continent, Temple, and Systems. Expedition planning lives in the Map side panel.
- The UI now has a centered first-step encounter overlay for blocking onboarding/tutorial prompts.
- The Map tab shows a simplified coordinate-based operations map with the tavern, work sites, dungeon POIs, and party operation markers. Worker gathering no longer renders moving map markers.
- The Map starts with only Tavern and Rat Cellar visible; wood/ore reveal through Population, Mine after 50 Rat Cellar clears or Rat Cellar boss conquest, and Barracks after all three Old Copper Mine branch bosses are cleared.
- Map POI labels are clickable and populate a selected-location side panel.
- Map layout is a 2/3 left map panel plus 1/3 right side panel.
- Map right side panel has local `Info`, `Operations`, `Log`, and `Dev` tabs. The previous bottom Map log panel was removed so the map workspace can fill the available height, and day/auto-time controls now live under `Dev`.
- Work-site POIs in the Map `Info` panel can be upgraded for wood/coin; the first upgrade costs 200 wood and 50 coin, each later upgrade doubles, and each upgrade adds 2 workplaces.
- The Map toolbar only shows inline `Selected Party` plus the party select, and dungeon POIs open a small `run`/`cancel` context menu at the clicked position.
- Dungeon `run` creates or replaces the selected party's repeated full-route plan, queues the first run when possible, performs the first simulation, and switches to the Dungeon tab.
- The day-7 Expedition route unlock reveals an `Expedition` POI on the Old Marches Map. Clicking it, or using its context `run` action, selects the route and opens the Map side-panel `Plan` tab.
- The Map side-panel `Plan` tab shows route facts, cost/readiness, local party selection, party manifest, and `start expedition`.
- Starting an Expedition marks the chosen party/heroes as traveling, hides them from origin-local Roster/Party/Dungeon eligibility, preserves hero records, and creates a deterministic transfer.
- Arriving Expeditions unlock Ash Coast, station the party/heroes there, and show a switch/stay popup.
- The Continent tab uses `assets/continent-bg.png` as a left-side overview map with clickable continent markers. The right side shows selected-continent details and transfers, and unlocked non-focused continents open a `switch`/`cancel` context menu near the click point.
- Continent focus switching records deterministic time-away catch-up hours and logs a placeholder report. Remote passive economy/resource catch-up is not implemented yet.
- Expedition costs use the focused continent's local resource pool through `state.resources`.
- The Tavern tab uses `assets/tavern-bg.png` as a fullscreen background behind the tavern management panel.
- The global title bar is reduced to `Adventure-Inc`, day, phase, time mode, coin, and fame.
- Tavern hire candidates render as fame-gated atlas-backed visitor cards, not a text table. The Tavern-only `advance day` button has been removed.
- The Tavern tab now uses a 2/3 visitor queue plus 1/3 right detail panel. Visitor cards have `hire` and `info`, show days left before the visitor leaves, and `info` selects that candidate for the right panel.
- The Tavern right detail panel has local `info`, `skill 1`, and `skill 2` tabs. It previews selected visitor stats and read-only skill trees using the same graph surface as Roster.
- The Tavern `upgrade tavern` button has a workshop-style hover panel with current level/effect, next effect, upgrade cost, and flavor text.
- The Population tab has second-row local tabs: `population` for worker hiring/assignment and labor notes, `workshop` for recipe stations and recipe XP hover panels, and `upgrades` for research progress plus the workshop upgrade graph.
- Population work-site rows display assigned/cap worker counts, starting at 2 workplaces for wood and ore.
- The Population tab has a persistent right side panel across all local tabs for gathered goods: food, wood, ore, hide, planks, comfort, and bows.
- The Roster tab uses `assets/roster-bg.png` as a fullscreen background behind the roster/party management panel.
- The Roster selected-character side panel starts with local `info`, `skill 1`, and `skill 2` tabs; info owns stats/gear/crafting/add-to-party actions, and the skill tabs show the first two available skill trees. Skill nodes show hover detail panels with flavor, rank/cost/requirement state, and current-to-next effect deltas.
- Roster character portraits use a 7x7 atlas at `assets/chars-atlas.png`; founder uses zero-based slot `0`, recruitable visitors use slots `1..48`.
- The Dungeon tab uses `assets/dungeons-bg.png` as a fullscreen background behind the dungeon planner panel.
- The Dungeon tab now has second-row local `dungeon` and `info` subtabs below the primary tabs. `dungeon` is a 2/3 main area plus 1/3 clicked-node info panel; the main area is split 50/50 between full-height route graph and full-height Combat Replay. `info` contains planner controls and run estimates.
- The Dungeon tab shows dungeon rooms as a clickable conquest graph; clicking nodes builds/truncates a planned path, and locked/unreachable nodes can still be inspected in the node info drawer.
- The Dungeon tab has a Combat Replay panel with a full-width event timeline slider, party/enemy actor cards, HP bars, action icon, event text, recent event log, first/prev/play/next/last controls, and playback speed.
- The Temple tab contains Ritual Stone selector buttons, board matrix, clickable connection lines, drag/drop shard tokens, bottom shard inventory rows, selected shard detail panel, active stone info, and active buff readout. Triangle Stone uses `assets/altar-triangle.png` as its matrix background, with socket coordinates aligned to the carved pads.
- The Map tab uses `assets/map-bg.png` as a real `1024x1024` transformed `.map-world`, not a cover background. POIs, route lines, workers, and party markers use pixel world coordinates.
- POI data is loaded from `assets/data/poi.json`; run via a local server so startup `fetch()` can load the file.
- Map viewport supports drag panning and cursor-centered wheel zoom. The map world uses the actual `map-bg.png` image dimensions instead of forcing `1024x1024`.

## Gameplay Implemented

- Tavern resources and production:
  - coin
  - food
  - wood
  - ore
  - hide
  - fame
- Population jobs:
  - wood workers
  - ore workers
  - workshop workers
  - workshop research workers
  - minimum workforce of 3 workers
  - direct `hire worker` action with exponentially rising coin cost
  - fixed daily upkeep of `1 coin` per worker
  - unpaid upkeep keeps workers but applies a `x0.5` production multiplier
  - worker delivery cycles that visibly move on the map
- Production Workshop:
  - recipe stations for rations/food, planks, simple furniture/comfort goods, and training bows
  - one workshop worker mans one station, assigned from first station to last
  - workshop workers above station count become assistants and add `+5%` speed each
  - station slots store target recipe, temporary active recipe, `autoInputs`, and progress
  - `auto inputs` routes through known prerequisite recipes, e.g. furniture can temporarily craft planks
  - deterministic worker-hour production
  - food is produced through `rations` worker-hour production rather than passive tavern income
  - each recipe gains deterministic XP on craft, levels through square XP thresholds, and unlocks item-specific cost/output/work improvements
  - recipe labels show level and expose hover panels with XP, current effective stats, and unlock milestones
  - research progress that grants workshop upgrade points
  - building upgrades through the generic progression graph system
- Adventurer roster:
  - focused character selection for training/crafting
  - character State column instead of Active set/on
  - clickable portrait-card grid backed by `assets/chars-atlas.png`
  - toggleable detailed/minimized roster card modes
  - 2/3 main roster panel plus 1/3 selected-character side panel
  - main roster panel splits party groups left and character grid right
  - focused-character sidebar for detailed stats
  - party groups with member assignment buttons
  - party rows show current members as remove buttons; focused-character sidebar owns adding to the selected party
  - party selection happens through party/state cells with a yellow selected-row outline
  - party Command column has `cancel`, returning the party to town idle without rewards
  - selected party for dungeon planning
  - deterministic visitor queue with 48 recruitable adventurers
  - visitor fame thresholds, availability tiers, and deterministic present/away cycles
  - three visible visitor seats by default, separate from roster capacity
  - recruitment costs
  - level, XP, skill points
  - race, primary job, secondary job placeholder, and learned skill ranks
  - focused-character sidebar skill trees for race and primary job, rendered as node graphs
  - skill node hover panels with costs, requirements, state, flavor, and effect deltas
  - deterministic skill effects feeding derived stats, Resolve, food cost, travel time, and recovery time
  - every race tree includes a connected three-node Resolve progression spine; deeper Resolve ranks use higher `costPerRank` values
  - gear list
- Dungeons:
  - Rat Cellar
  - Old Copper Mine
  - Old Barracks
  - Rat Cellar is now authored as a conquest graph with branches, a relief node, a modifier-disabling miniboss, and a main boss unlock effect
  - Old Copper Mine is authored as a three-branch conquest graph with 79 total Resolve across all nodes and three unique branch bosses; it has one opening check, one flooded-branch hazard, one relief node, and otherwise combat pressure; clearing all three bosses reveals Old Barracks
- Dungeon planning:
  - selected party
  - graph-planned route path
  - strategy preset
  - fixed food and travel cost
  - named dungeon routes when the dungeon defines route graph data
  - clickable graph view for adding/removing planned path nodes
  - selected-node info drawer with type, state, Resolve cost, reward, modifiers, and on-clear effects
  - persistent dungeon conquest state for cleared nodes, unlocked nodes, disabled modifiers, and Resolve cost adjustments
  - per-hero Resolve costs and withdrawal
  - deterministic combat transcript
  - structured combat replay timeline
  - cached estimate
  - quick estimate inspector with main stats and time/combat transcript
- Automation:
  - queues cached plan once
  - supports manual or repeated mode only
  - repeated mode stores an endless deterministic party plan
  - Map `run` stores repeated intent and schedules now when readiness/resources allow
  - strategy changes immediately resimulate and update the stored repeated estimate for future queue attempts
  - same-party repeated operations serialize through a queued phase at the tavern
  - repeated plans pause when resources are missing and resume after production checks
  - rewards apply only when the operation completes
- First-step encounters:
  - trigger after app startup, Tavern/Population/Roster/Dungeon first visits, first recruit, first dungeon simulation, first queued run, first operation return, second dungeon reveal, and first crafted item
  - now introduce the game in dungeon-first order: founder, Rat Cellar run, Dungeon readout, Tavern recruitment, Roster party setup, then Population/Workshop
  - are once-only by default and persist seen/queue state in the normal save payload
  - blocking encounters pause auto-time and restore the previous running state when the queue closes
  - actions either close the encounter or switch tabs through existing shell commands
- Combat replay:
  - simulation runs instantly and stores a replay timeline
  - timeline slider maps one slider step to one replay event
  - autoplay advances replay cursor through stored events and redraws only the replay panel
  - replay playback is independent from game time and does not mutate rewards, resources, HP, or XP
  - party actors use current roster stats, initiative, speed, and character portraits
  - combat actor order is deterministic by next action time, initiative, team order, and stable ID
  - current actions are strategy-driven and include attacks, heal, guard, and enemy scripted actions
- Time:
  - `+1 hour`
  - `+1 day`
  - `auto time` toggle, default-on from initial state
- Progression:
  - fixed resource rewards
  - XP and leveling
  - fame
  - blueprint unlocks
  - deterministic crafting for Iron Blade and Ward Charm
  - tavern upgrade path
  - coin comes from fixed dungeon/resource rewards, not passive tavern income
- Temple shards:
  - selectable Ritual Stones: Triangle, Square, and Hourglass
  - each stone has its own sockets, active links, inventory slot positions, and modifier
  - shard ownership/XP is global, but layout setup is saved per stone
  - only the selected stone applies effects
  - current colors: Ember, Verdant, Azure
  - Triangle has 1 active line and fight effects +10%
  - Square has 2 active lines and Verdant/Azure effects +15%
  - Hourglass has 1 active line, loot effects +20%, and fight effects -10%
  - one shard per socket with no duplicate-equipping
  - shards are dragged from the bottom inventory onto sockets
  - bottom inventory is an explicit free-form `2x10` slot grid
  - dragging between inventory slots moves or swaps shard positions
  - dragging an equipped shard back to an empty inventory slot unequips it
  - clicking an inactive line enables it; clicking the active line disables it
  - every shard effect is tied to a specific color via `colorEffects`
  - effects apply only when their color is active through the shard socket or the active line
  - shard effects have min/max values and scale through shard XP
  - duplicate finds add shard XP
  - visit shards drop every configured number of completed dungeon operations
  - boss shards drop every configured number of full successful clears
  - active shard effects currently modify party ATK/DEF/utility/recovery and add deterministic loot bonuses
  - tutorial introduction is delayed until the second dungeon reveal

## Important Behavior

- No gameplay randomness is used.
- Initial visible locations are Tavern and Rat Cellar only.
- First-step encounter triggers are post-change notifications; gameplay mutation stays in explicit command/domain owners.
- `src/app.js` is now a small compatibility shim. App composition lives in `src/app/adventureIncApp.js`.
- `simulateRun()` previews outcomes without mutating state.
- `scheduleEstimate()` pays food and queues party operations for the estimate party snapshot.
- Manual Dungeon Planner assignments stop the party's repeated plan before queueing the new action, but do not cancel active operations.
- Map-side dungeon `run` creates/replaces the party's repeated full-route plan, queues the first run when possible, simulates immediately, and routes to the Dungeon tab.
- Dungeon graph planning uses `path:<nodeId>,<nodeId>` stop values, simulates the legal deterministic path, and updates repeated intent for future queue attempts when repeated mode is active. Legacy `node:<nodeId>` target values remain available from the Info select.
- Dungeon completion applies conquest effects from reached nodes only after scheduled operations return; simulation previews never mutate conquest state.
- Dungeon strategy changes resimulate immediately and replace the selected party's repeated estimate for future queue attempts without mutating active operations.
- Successful completed dungeon operations increment clear counters and can reveal later locations.
- `dungeonXp` feeds dungeon mastery and is ignored by generic resource reward application.
- Party assignments require non-empty party, enough food, and full health when starting from town; assignments can queue behind an active operation and start after it fully completes.
- `repeatedPlans` stores endless automation by party ID.
- `ensureRepeatedPlanQueued()` requeues repeated party operations when no operation for that party is active.
- `characterState()` derives roster states from operation phases.
- `partyStats()` aggregates member HP/ATK/DEF/utility for the current combat prototype.
- Combat timeline logic is split across `src/game/combat/combatTimeline.js`, `src/game/combat/combatActions.js`, and `src/game/combat/combatReplayModel.js`.
- `base.hp` is level-1 max HP; level bonus HP starts at level 2 to avoid new characters starting below max HP.
- `advanceTime()` advances worker cycles, party operations, and day rollover.
- Completed party operations mutate resources, XP, fame, blueprints, and hero HP.
- Completed party operations also update Temple shard visit/boss counters and award due shard XP.
- Automation depends on a cached simulation result and does not recompute every combat step for each replay.

## Validation To Run

```powershell
npm run check:js
npm test
```

Last validation result:

- `npm run check:js`: passed, checked 137 JavaScript files.
- `npm test`: passed, 372/372 tests.

Suggested manual smoke test:

1. Open `index.html`.
2. Switch through Map, Tavern, Roster, Dungeon, Continent, Temple, and Systems tabs.
3. Confirm auto time starts by default, then disable/re-enable it and verify resources increase on worker cycle completion.
4. In Population, confirm the right resource panel stays visible across `population`, `workshop`, and `upgrades`, then hire a worker, assign workers to workshop/research, craft planks, hover the recipe label to inspect XP/unlocks, and underpay upkeep to confirm production drops to `x0.5`.
5. On Map, choose a party, click Rat Cellar, use `cancel`, then click it again and use `run`; confirm the app switches to Dungeon with a repeated full run and fresh simulation.
6. Change Dungeon strategy and confirm the estimate/replay updates immediately.
7. Click Dungeon graph nodes to build a multi-node route, then click a planned node again and confirm the route truncates.
8. Switch Dungeon local tabs and confirm graph/replay plus clicked-node info stay under `dungeon`, while controls/estimate are under `info`.
9. Inspect Rat Cellar Scent Warden and Brood Matron before/after clearing the warden; confirm active modifiers and locked/cleared state update.
10. Use replay first/prev/play/next/last and speed controls; confirm no game time advances during playback.
11. Commit a successful or partial run and confirm the party marker travels and returns.
12. Queue automation with a cached plan and confirm same-party runs serialize.
13. Let repeated mode continue through at least two returns or pause on food shortage.
14. Recruit one visitor, then confirm the Tavern can show an empty visitor seat until the next daily visitor refresh.
15. Move idle characters between party groups.
16. Simulate a dungeon with a multi-member party.
17. Confirm logs and resource deltas remain deterministic.
18. In Temple, change the line and socket assignment, then confirm party stats/run estimates reflect active buffs.
19. Let a dungeon complete 10 times and confirm the matching shard XP increments deterministically.
20. Advance to day 7, click the Expedition POI on Map, and confirm the Map side-panel Plan tab shows route details plus readiness display.
21. With enough food/coin/planks, start the Expedition and confirm the chosen heroes disappear from Old Marches local Roster/Party views.
22. Advance the Expedition duration, resolve the arrival popup, then use the Continent marker context menu to focus Ash Coast from the Continent tab.

## Likely Next Work

1. Add save export/import if backups or manual save sharing become a gameplay/dev requirement.
2. Continue continent expansion by splitting resources/economy per continent and replacing the current catch-up placeholder with real deterministic remote settlement/dungeon calculations.
3. Extract dungeon definitions/run simulation and operation queueing into `src/game/dungeon/`.
4. Move Temple colors/stones/shards to `assets/data/temple.json` once the code-module boundary is stable.
5. Replace direct global `poiData` access with explicit data context/selectors.
6. Move domain data modules to JSON only when content-authoring workflow needs it.
7. Add saved/named dungeon route plans if players need multiple automation profiles per dungeon.
8. Expand per-character combat from prototype strategy actions into authored skill/action-plan data.
9. Replace global strategy presets with per-character action-plan rules.
10. Add a first building module beyond the tavern, such as Blacksmith or University.
11. Add skill refund/respec and secondary-job multiclass selection.
