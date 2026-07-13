# Next Session Handoff

## Scope

- Project: `adventure-inc`.
- Current implementation: static HTML/CSS/ES-module JS prototype.
- Root context starts with `AI_CONTEXT.md`.
- Adventurer skill design is documented in `docs/adventurer-skill-design.md`.
- Temple shard design is documented in `docs/temple-shard-design.md`.
- Dungeon combat replay design is documented in `docs/dungeon-combat-replay-design.md`.
- Git repository exists. Initial prototype commit: `f2938e2 Initial adventure-inc prototype`.
- Current refactor work is uncommitted unless the user asks for a commit.

## Implemented State

- Added `index.html`, `styles.css`, and modular JavaScript under `src/`.
- `index.html` now loads `src/main.js` with `type="module"`.
- `src/main.js` imports the small compatibility shim in `src/app.js`.
- `src/app/adventureIncApp.js` owns app composition: data, state, command adapters, render adapters, browser APIs, bootstrap, and controls.
- `src/app/appConfig.js` owns stable prototype UI/runtime constants: character-atlas dimensions, map world/zoom defaults, Temple inventory slots, and replay default speed.
- `src/app/appState.js` owns initial state creation through `createInitialState()`.
- `src/app/appRuntimeContext.js` owns app runtime context construction: initial state, browser auto-time runtime, loaded-data context, DOM element bag, and app resource runtime.
- `src/app/appBootstrapSetup.js` owns app-specific DOM binding and startup registration wiring.
- `src/app/appCallbackRegistry.js` owns late-bound app-level callback forwarding across command, render, bootstrap, and interaction adapters.
- `src/app/appQueries.js` owns app-level read/query composition for POI-derived collections, selected dungeon/location/party, focused hero, party members/stats/readiness, operation phase projection, and roster status labels.
- `src/app/appSelectionFacade.js` owns the small app-facing read facade that composes app queries with roster skill progression projections.
- `src/app/appUtilityCallbacks.js` owns app-level log insertion, reward formatting, Temple progression/loot callbacks, and replay timer API creation.
- `src/app/appRenderHandlers.js` owns top-level render ordering and focused render pass delegation across the extracted render adapters.
- `src/app/appShellCommandHandlers.js` owns UI-only shell commands: clear log, top-tab activation, map-side-tab activation, and dungeon/party select-change estimate invalidation.
- `src/app/browserTimerAdapters.js` owns browser `window`/`performance` binding for auto-time and replay timer interfaces.
- `src/app/bootstrap.js` owns DOMContentLoaded startup sequencing and the requestAnimationFrame map actor refresh loop through injected browser/data/render dependencies.
- `src/app/domElements.js` owns the required DOM element ID contract and app element binding.
- `src/app/controlBindings.js` owns static DOM control binding to injected app command handlers.
- `src/app/appControlSetup.js` owns static control handler-map composition from shell, dungeon, party, replay, roster/tavern, and time command owners.
- `src/app/appDataContext.js` owns loaded POI data storage for bootstrap writes and query reads.
- `src/app/appMapInteractionSetup.js` owns app-state/config wiring for overland map pointer and wheel interactions.
- `src/app/dungeonCommandHandlers.js` owns dungeon simulation, cached estimate replay replacement, commit scheduling, repeated-plan automation, repeated queue attempts, and operation completion wrapper coordination.
- `src/app/mapCommandHandlers.js` owns map-location selection, dungeon-control sync, estimate invalidation for selected dungeon POIs, and map-side repeated dungeon assignment setup/queueing.
- `src/app/mapRenderAdapter.js` owns overland map panel rendering, map transform/status text, actor-layer refresh, selected-location detail refresh, distance formatting, and worker marker coordinates.
- `src/app/dungeonRenderAdapter.js` owns Dungeon planner rendering and replay-only refresh coordination with selected dungeon, cached estimate, repeated plans, repeat mode, reward formatting, replay speed labels, and roster portrait styling.
- `src/app/replayCommandHandlers.js` owns replay cursor/playback/speed wrapper coordination, browser timer injection, full render vs replay-only render decisions, and replay speed labels.
- `src/app/rosterRenderAdapter.js` owns Tavern visitor rendering, Population job rendering, party/focused-character panel rendering, roster card rendering, and shared atlas portrait helpers.
- `src/app/rosterTavernCommandHandlers.js` owns recruit, focus, roster-view toggle, crafting, tavern upgrade, and worker assignment wrapper coordination for logging and rendering.
- `src/app/partyCommandHandlers.js` owns party command wrapper coordination for logging, party select refresh, and rendering.
- `src/app/selectControlAdapter.js` owns app-state-aware dungeon, stop-node, and party select population.
- `src/app/timeCommandHandlers.js` owns auto-time toggling, hour advancement, worker deliveries, operation ticking/completion, daily production, repeated-plan resume checks, logging, and rendering.
- `src/app/headerRenderAdapter.js` owns global title-row render coordination with current app state, selected party, and the auto-time control lookup.
- `src/app/systemsRenderAdapter.js` owns Systems/log panel render coordination with blueprint definitions, unlocked blueprint state, and deterministic log entries.
- `src/app/selectControls.js` owns app-level dungeon, stop-node, and party select population using the pure select view helpers.
- `src/app/logRuntime.js` owns deterministic log entry stamping, newest-first insertion, cap enforcement, and clearing.
- `src/app/commandMessages.js` owns first command-result-to-log-message adapters for recruit/focus/skill/craft/tavern/worker/party command wrappers, time/progression messages, party member edit/add messages, dungeon simulation/automation/scheduling/completion messages, map repeated-assignment messages, and Temple shard/inventory/equip/link messages.
- `src/app/mapInteractions.js` owns overland map pointer/wheel DOM event registration, pointer capture, drag CSS state, and zoom refresh callbacks.
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
- `src/game/map/mapActorRuntime.js` owns deterministic map actor interpolation helpers, currently worker route marker coordinates.
- `src/game/map/mapViewRuntime.js` owns pure map drag, pan, zoom, screen/world conversion, transform style, and map status text.
- `src/game/roster/adventurerData.js`, `src/game/roster/skills.js`, and `src/game/roster/heroStats.js` own visitor data, skill definitions, and derived hero stats.
- `src/game/roster/rosterCommands.js` owns roster mutations: next visitor lookup, visitor-to-hero conversion, recruitment, focused hero selection, and skill learning.
- `src/game/roster/craftingCommands.js` owns blueprint crafting/equipping.
- `src/game/roster/skillProgression.js` owns available-tree, skill-rank, and can-learn checks.
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
- `src/game/dungeon/dungeonOperationModel.js` owns estimate cloning, operation total hours, queued party hours, current operation phase calculation, queue-readiness checks, schedule validation, and party-operation construction.
- `src/game/dungeon/dungeonCompletion.js` owns party operation completion mutation with injected reward/XP/Temple callbacks.
- `src/game/dungeon/operationRuntime.js` owns operation elapsed-time ticking and completed/remaining operation splitting.
- `src/game/dungeon/repeatedPlanAutomation.js` owns repeated-plan toggle and queue/pause/no-op decisions.
- `src/game/dungeon/replayRuntime.js` owns replay cursor clamping, reset/stop/start/toggle, speed cycling, and speed labels with injected timer APIs.
- `src/app/resourceRuntime.js` adapts app state to generic resource affordability, payment, and reward mutation helpers.
- `src/game/resources/resourceRewards.js` owns generic resource affordability/payment, reward application, and Temple loot bonus projection.
- `src/game/tavern/tavernCommands.js` owns tavern upgrade cost/upgrade behavior and wood/ore worker reassignment.
- `src/game/time/gameClock.js` owns daily tavern income, explicit clock advancement/normalization, and worker-cycle delivery helpers.
- `src/game/time/autoTimeRuntime.js` owns auto-time interval start/stop/toggle state, tick timestamps, and visual hour-fraction interpolation with injected timer/clock APIs.
- `src/game/time/timeAdvanceRuntime.js` owns hour-step sequencing for per-hour callbacks and clock advancement.
- `src/game/time/dailyProductionRuntime.js` owns daily production mutation and repeated-plan resume candidate selection.
- `src/ui/dom.js` owns required DOM element lookup and basic event binding helpers.
- `src/ui/tabRuntime.js` owns top-level tab and Map side-panel tab class activation helpers.
- `src/ui/renderApp.js` owns top-level render order orchestration.
- `src/ui/selectView.js` owns dungeon, stop-node, and party select option rendering helpers.
- `src/ui/dungeonPanel.js` owns Dungeon panel DOM rendering by coordinating node-map, estimate, and replay rendering.
- `src/ui/dungeonReplayPanel.js` owns Dungeon replay panel DOM rendering: slider/status/control state, actor panes, action icon/text, and event log.
- `src/ui/partyPanel.js` owns Party table plus focused-character panel DOM rendering and related action binding.
- `src/ui/rosterPanel.js` owns Roster card panel DOM rendering and focus-button binding.
- `src/ui/mapPanel.js` owns Map panel DOM rendering: world markup injection, POI click binding, selected-location detail binding, operations table rendering, and POI coordinate table rendering.
- `src/ui/systemsPanel.js` owns Systems/log panel DOM rendering by coordinating blueprint rows and deterministic log rows.
- `src/ui/templePanel.js` owns Temple panel DOM rendering: stone buttons, board HTML, socket/inventory token rendering, active buffs, selected-shard detail, and local Temple interaction binding.
- `src/ui/headerView.js`, `src/ui/rewardText.js`, `src/ui/blueprintView.js`, `src/ui/logView.js`, `src/ui/populationView.js`, `src/ui/tavernView.js`, `src/ui/dungeonView.js`, `src/ui/mapSideView.js`, `src/ui/mapWorldView.js`, `src/ui/rosterView.js`, and `src/ui/templeView.js` own the first extracted render helpers for the global title row, reward labels, blueprint rows, deterministic log rows, Population job rows, Tavern visitor queue, Dungeon node/estimate/replay HTML, Map side-panel HTML, Map route/POI/world/actor marker HTML, Roster/party/skill/focused-character HTML, and Temple board/shard/detail HTML.
- `package.json` provides `npm run check:js` and `npm test`.
- `scripts/check-js.mjs` recursively syntax-checks all JavaScript files under `src/`.
- Tests currently cover app config defaults, app-state independence, app runtime context construction, app bootstrap setup behavior, app callback registry behavior, app data context behavior, app query setup behavior, app utility callback behavior, app query behavior, app selection facade behavior, app render handler behavior, app shell command behavior, app control setup behavior, app map interaction setup behavior, browser timer adapters, bootstrap startup/map-loop behavior, save/load payload behavior, resource runtime behavior, log runtime behavior, plan invalidation/replay reset coupling, select-control adapter behavior, POI validation/selectors, map actor interpolation, map render adapter behavior, dungeon render adapter behavior, header render adapter behavior, systems render adapter behavior, Temple app query behavior, Temple render adapter behavior, hero stat calculation, skill progression checks, party selectors/stat aggregation, party commands, party command adapters, roster commands including skill learning, roster progression app handlers, roster render adapters, roster/tavern command adapters, crafting commands, tavern commands, resource rewards, time/worker cycles, time command adapters, Temple state/command/bonus resolution, Temple command adapters, Temple progression app handlers, shard progression, Temple interaction event wiring, deterministic combat timeline behavior, dungeon command adapters, dungeon run simulation, operation completion, operation phase modeling, operation scheduling decisions, repeated-plan automation decisions, map command adapters, map interaction event wiring, replay command adapters, Dungeon panel rendering, Dungeon replay panel rendering, Map panel rendering, Systems panel rendering, Temple panel rendering, Party/focused-character panel rendering, Roster card panel rendering, and extracted UI view-format helpers.
- Added `assets/data/poi.json` as the source for tavern, work-site, and dungeon POI data.
- Added project guidance docs:
  - `AGENTS.md`
  - `AI_CONTEXT.md`
  - `NEXT_SESSION_HANDOFF.md`
- The UI uses a dense dev-tool look with compact panels, tables, small monospace text, square controls, and a deterministic log.
- The UI now uses seven top tabs: Map, Tavern, Population, Roster, Dungeon, Temple, and Systems.
- The Map tab shows a simplified coordinate-based operations map with the tavern, work sites, dungeon POIs, worker markers, and party operation markers.
- Map POI labels are clickable and populate a selected-location side panel.
- Map layout is a 2/3 left map panel plus 1/3 right side panel.
- Map right side panel has local `Info` and `Operations` tabs.
- Dungeon POIs can assign the selected party from the map panel as a repeated route.
- The Tavern tab uses `assets/tavern-bg.png` as a fullscreen background behind the tavern management panel.
- Resource totals are rendered as one compact global title-bar line next to day/phase/time mode.
- Tavern hire candidates render as atlas-backed visitor cards, not a text table.
- The Population tab owns population and wood/ore worker assignment.
- The Roster tab uses `assets/roster-bg.png` as a fullscreen background behind the roster/party management panel.
- Roster character portraits use a 7x7 atlas at `assets/chars-atlas.png`; founder uses zero-based slot `0`, recruitable visitors use slots `1..48`.
- The Dungeon tab uses `assets/dungeons-bg.png` as a fullscreen background behind the dungeon planner panel.
- The Dungeon tab has a Combat Replay panel with a full-width event timeline slider, party/enemy actor cards, HP bars, action icon, event text, recent event log, first/prev/play/next/last controls, and playback speed.
- The Temple tab contains Ritual Stone selector buttons, board matrix, clickable connection lines, drag/drop shard tokens, bottom shard inventory rows, selected shard detail panel, active stone info, and active buff readout.
- The Map tab uses `assets/map-bg.png` as a real `1024x1024` transformed `.map-world`, not a cover background. POIs, route lines, workers, and party markers use pixel world coordinates.
- POI data is loaded from `assets/data/poi.json`; run via a local server so startup `fetch()` can load the file.
- Map viewport supports drag panning and cursor-centered wheel zoom.

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
  - base kitchen output
  - worker delivery cycles that visibly move on the map
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
  - recruitment costs
  - level, XP, skill points
  - race, primary job, secondary job placeholder, and learned skill ranks
  - focused-character sidebar skill trees for race and primary job
  - deterministic skill effects feeding derived stats, food cost, travel time, and recovery time
  - gear list
- Dungeons:
  - Rat Cellar
  - Old Copper Mine
  - Old Barracks
- Dungeon planning:
  - selected party
  - route stop point
  - strategy preset
  - fixed food and travel cost
  - deterministic combat transcript
  - structured combat replay timeline
  - cached estimate
- Automation:
  - queues cached plan once
  - supports manual or repeated mode only
  - repeated mode stores an endless deterministic party plan
  - same-party repeated operations serialize through a queued phase at the tavern
  - repeated plans pause when resources are missing and resume after production checks
  - rewards apply only when the operation completes
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
  - `auto time` toggle
- Progression:
  - fixed resource rewards
  - XP and leveling
  - fame
  - blueprint unlocks
  - deterministic crafting for Iron Blade and Ward Charm
  - tavern upgrade path
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

## Important Behavior

- No gameplay randomness is used.
- `src/app.js` is now a small compatibility shim. App composition lives in `src/app/adventureIncApp.js`.
- `simulateRun()` previews outcomes without mutating state.
- `scheduleEstimate()` pays food and queues party operations for the estimate party snapshot.
- Manual Dungeon Planner assignments stop the party's repeated plan before queueing the new action, but do not cancel active operations.
- Map-side dungeon assignment creates/replaces the party's repeated route and queues the first run when possible.
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

- `npm run check:js`: passed, checked 105 JavaScript files.
- `npm test`: passed, 279/279 tests.

Suggested manual smoke test:

1. Open `index.html`.
2. Switch through Map, Tavern, Roster, Dungeon, Temple, and Systems tabs.
3. Enable auto time and confirm worker markers move and resources increase on cycle completion.
4. Simulate Rat Cellar with each strategy.
5. Use replay first/prev/play/next/last and speed controls; confirm no game time advances during playback.
6. Commit a successful or partial run and confirm the party marker travels and returns.
7. Queue automation with a cached plan and confirm same-party runs serialize.
8. Let repeated mode continue through at least two returns or pause on food shortage.
9. Recruit one visitor.
10. Move idle characters between party groups.
11. Simulate a dungeon with a multi-member party.
12. Confirm logs and resource deltas remain deterministic.
13. In Temple, change the line and socket assignment, then confirm party stats/run estimates reflect active buffs.
14. Let a dungeon complete 10 times and confirm the matching shard XP increments deterministically.

## Likely Next Work

1. Wire player-facing save/load controls if persistence becomes a gameplay requirement.
2. Extract dungeon definitions/run simulation and operation queueing into `src/game/dungeon/`.
3. Move Temple colors/stones/shards to `assets/data/temple.json` once the code-module boundary is stable.
4. Replace direct global `poiData` access with explicit data context/selectors.
5. Move domain data modules to JSON only when content-authoring workflow needs it.
6. Expand per-character combat from prototype strategy actions into authored skill/action-plan data.
7. Replace global strategy presets with per-character action-plan rules.
8. Add a first building module beyond the tavern, such as Blacksmith or University.
9. Add skill refund/respec and secondary-job multiclass selection.
