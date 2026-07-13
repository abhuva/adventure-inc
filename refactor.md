# Adventure Inc Refactor Plan

## Purpose

Move the prototype from a monolithic HTML/CSS/JS implementation into a modular, maintainable, testable architecture that stays simple enough for iterative game-design work and coding-agent maintenance.

This is a planning document. It should be updated as refactor slices are completed.

## Refactor Goals

- Keep runtime browser-native: plain HTML, CSS, and JavaScript modules.
- Keep deterministic gameplay rules explicit and inspectable.
- Separate simulation/domain logic from DOM rendering and event binding.
- Make pure logic testable with `node --test`.
- Keep files small enough for coding agents to reason about safely.
- Preserve current user-facing prototype behavior while moving code.
- Avoid introducing a framework or build step until the project actually needs one.

## Current Architecture Review

### Current Shape

- `index.html` owns all static shell markup.
- `styles.css` owns all visual language and all screen-specific CSS.
- `src/app.js` owns data constants, mutable state, data loading, command handlers, simulation, replay playback, map interactions, DOM rendering, and DOM event binding.
- `assets/data/poi.json` is the only external gameplay data file.
- Design docs exist for adventurer skills, Temple shards, and Dungeon combat replay.

### Main Problems

- `src/app.js` is too large and mixes unrelated concerns.
- Domain logic is tightly coupled to global `state` and global `el`.
- Many functions mutate state and render immediately, which makes control flow difficult to test.
- DOM rendering uses broad `innerHTML` rewrites and rebinds event handlers after each render.
- Simulation code and UI replay code share the same file and global state even though replay is inspection-only.
- Gameplay data is split inconsistently between JSON and constants in `app.js`.
- The CSS file is large and not grouped by ownership boundaries.
- There is no automated test suite beyond syntax checks.
- There is no persistence/schema boundary yet, so state shape changes are risky.

## Code Review Findings

### High Severity

- [x] `src/app.js` has too many responsibilities.
  - Evidence: it contains bootstrapping, state, data constants, data loading, map input, time loop, roster, party management, dungeon simulation, combat replay, Temple stones, rendering, and utility formatting.
  - Risk: any feature edit can accidentally break unrelated systems.
  - Target: split into domain owners and UI owners.

- [x] Domain simulation is coupled to DOM state.
  - Examples: `selectedDungeon()` reads `el.dungeonSelect.value`; `simulateSelectedRun()` reads form controls; many command handlers mutate `state` and call `render()`.
  - Risk: pure tests require DOM setup, and domain rules are harder to reuse for automation or persistence.
  - Target: commands gather UI input, then call pure/domain functions with explicit parameters.

- [x] Combat replay playback is stored in global app state with a live timer handle.
  - Risk: saving/cloning future state could accidentally include non-serializable runtime handles.
  - Target: separate serializable game state from transient UI/runtime state.

- [x] `completeEstimate()` currently restores every party member to full HP after operations.
  - Risk: this conflicts with the newer detailed combat simulation where per-character HP changes exist in replay snapshots.
  - Target: decide whether recovery fully heals after the operation or whether injuries persist through a recovery owner. Until then, document it as prototype behavior.

### Medium Severity

- [x] Several data systems are hardcoded in `app.js`.
  - Examples: visitors, races, skills, blueprints, Temple stones, shards.
  - Risk: balancing and content authoring require code edits.
  - Target: move stable data to `assets/data/*.json` after data schemas are explicit.

- [x] State invalidation is manual and scattered.
  - Examples: many functions set `state.lastEstimate = null`; some do not clear replay state; some delete repeated plans.
  - Risk: stale estimates/replays can survive state changes.
  - Target: central invalidation helpers such as `invalidatePlan(reason)` and `invalidateReplay(reason)`.

- [x] Rendering rewrites large DOM regions and reattaches event listeners.
  - Risk: event/timer behavior becomes fragile as UI complexity grows.
  - Target: keep this simple but split render owners; use event delegation where practical.

- [x] Time systems are mixed together.
  - Examples: auto-time interval, map interpolation loop, replay interval.
  - Risk: one runtime loop can unexpectedly affect another.
  - Target: separate `gameClockRuntime`, `mapAnimationRuntime`, and `replayRuntime`.

- [x] CSS has no ownership boundaries.
  - Risk: small UI changes can accidentally affect other tabs.
  - Target: split or at least section CSS by layout/core/components/screens.

### Low Severity

- [x] Some naming is prototype-specific or inconsistent.
  - Examples: `estimate`, `operation`, `plan`, `automation`, `replay`, and `simulation` overlap.
  - Target: define vocabulary in docs and module names.

- [x] No lint/test scripts are defined.
  - Target: add minimal `package.json` scripts when tests are introduced.

- [x] File names preserve current user asset spelling such as `old-baracks`.
  - Target: do not rename assets during architecture refactor unless references and user files are intentionally migrated.

## Target Architecture

### Proposed Directory Layout

```text
src/
  main.js
  app/
    bootstrap.js
    appState.js
    appController.js
    selectors.js
  core/
    clamp.js
    format.js
    ids.js
    eventBus.js
  data/
    dataLoader.js
    validators/
      poiValidator.js
  game/
    time/
      gameClock.js
      operationRuntime.js
    tavern/
      tavernState.js
      tavernCommands.js
      tavernSelectors.js
    population/
      populationRuntime.js
    roster/
      rosterState.js
      rosterCommands.js
      heroStats.js
      skills.js
    party/
      partyState.js
      partyCommands.js
      partySelectors.js
    dungeon/
      dungeonPlanner.js
      dungeonRunSimulator.js
      dungeonOperations.js
    combat/
      combatActors.js
      combatActions.js
      combatTimeline.js
      combatReplayModel.js
    temple/
      templeData.js
      templeState.js
      templeBonuses.js
      templeCommands.js
    map/
      mapModel.js
      mapViewState.js
      mapOperations.js
  ui/
    dom.js
    renderApp.js
    tabs.js
    headerView.js
    mapView.js
    tavernView.js
    populationView.js
    rosterView.js
    dungeonView.js
    combatReplayView.js
    templeView.js
    systemsView.js
    logView.js
  styles/
    optional future split if CSS modules are not used
tests/
  combatTimeline.test.js
  dungeonRunSimulator.test.js
  templeBonuses.test.js
  heroStats.test.js
  operationRuntime.test.js
```

### Runtime Ownership

- `appState.js`: creates initial serializable game state and transient UI/runtime state.
- `appController.js`: command dispatcher and render scheduling.
- `game/*`: owns deterministic rules and state mutation.
- `ui/*`: owns DOM rendering and event binding only.
- `data/*`: owns async loading and validation of JSON data.
- `core/*`: pure helpers with no game knowledge.

### State Split

Serializable game state:

- day/hour
- tavern resources
- roster
- parties
- operations
- repeated plans
- Temple shard ownership and per-stone layouts
- map view if saveable
- blueprints/crafted state

Transient runtime/UI state:

- DOM references
- interval/timer handles
- pointer-drag state
- active tab
- selected panel items if not save-worthy
- replay playback timer

## Refactor Principles

- Move code without changing behavior whenever possible.
- Create tests before or during extraction for pure logic.
- Avoid a big-bang rewrite.
- Keep one module owner for each mutation path.
- UI reads snapshots/selectors; UI does not directly compute game rules.
- Commands mutate state; render functions render state.
- Replay playback is always inspection-only.
- Do not introduce a framework unless plain modules become a clear bottleneck.

## Task Plan

## Current Refactor Implementation Status

- ES-module entry is active through `src/main.js`.
- `src/app.js` is now a small compatibility shim; app composition lives in `src/app/adventureIncApp.js`.
- Stable app constants moved to `src/app/appConfig.js`.
- Initial state moved to `src/app/appState.js`.
- App runtime context construction moved to `src/app/appRuntimeContext.js`.
- App-specific DOM binding and startup registration setup moved to `src/app/appBootstrapSetup.js`.
- Late-bound app callback forwarding moved to `src/app/appCallbackRegistry.js`.
- Loaded POI data storage moved to `src/app/appDataContext.js`.
- App-level query composition moved to `src/app/appQueries.js`.
- App query setup composition moved to `src/app/appQuerySetup.js`.
- App-facing selection/progression read facade moved to `src/app/appSelectionFacade.js`.
- App-level utility callback composition moved to `src/app/appUtilityCallbacks.js`.
- Top-level render coordination moved to `src/app/appRenderHandlers.js`.
- UI-only shell command handling moved to `src/app/appShellCommandHandlers.js`.
- Browser timer API binding moved to `src/app/browserTimerAdapters.js`.
- DOMContentLoaded startup and requestAnimationFrame map actor refresh moved to `src/app/bootstrap.js`.
- Required DOM element IDs and binding moved to `src/app/domElements.js`.
- Static DOM control binding moved to `src/app/controlBindings.js`.
- App control setup composition moved to `src/app/appControlSetup.js`.
- App map interaction setup composition moved to `src/app/appMapInteractionSetup.js`.
- Dungeon command wrapper coordination moved to `src/app/dungeonCommandHandlers.js`.
- Map command wrapper coordination moved to `src/app/mapCommandHandlers.js`.
- Replay command wrapper coordination moved to `src/app/replayCommandHandlers.js`.
- Roster/tavern command wrapper coordination moved to `src/app/rosterTavernCommandHandlers.js`.
- Roster progression wrapper coordination moved to `src/app/rosterProgressionHandlers.js`.
- Party command wrapper coordination moved to `src/app/partyCommandHandlers.js`.
- Time command wrapper coordination moved to `src/app/timeCommandHandlers.js`.
- Header render adapter coordination moved to `src/app/headerRenderAdapter.js`.
- Systems render adapter coordination moved to `src/app/systemsRenderAdapter.js`.
- Dungeon/stop-node/party select population moved to `src/app/selectControls.js`.
- App-state-aware select control coordination moved to `src/app/selectControlAdapter.js`.
- Deterministic log mutation moved to `src/app/logRuntime.js`.
- Overland map DOM pointer/wheel interaction binding moved to `src/app/mapInteractions.js`.
- Temple board/shard drag-drop interaction binding moved to `src/app/templeInteractions.js`.
- Temple app-level query coordination moved to `src/app/templeAppQueries.js`.
- Temple command wrapper coordination moved to `src/app/templeCommandHandlers.js`.
- Temple progression wrapper coordination moved to `src/app/templeProgressionHandlers.js`.
- Temple render adapter coordination moved to `src/app/templeRenderAdapter.js`.
- Cached dungeon estimate/replay invalidation helpers moved to `src/app/planInvalidation.js`.
- First command result/log message adapters moved to `src/app/commandMessages.js`, including skill learning, time/progression, party member edit/add, dungeon simulation/automation/scheduling/completion messages, map repeated-assignment messages, and Temple shard/inventory/equip/link messages.
- Shared math/format helpers moved to `src/core/`.
- POI loading and validation moved to `src/data/`.
- POI read selectors and map-location composition moved to `src/data/poiSelectors.js`.
- Worker route marker interpolation moved to `src/game/map/mapActorRuntime.js`.
- Map pan/zoom/drag view-state math moved to `src/game/map/mapViewRuntime.js`.
- Map render adapter coordination moved to `src/app/mapRenderAdapter.js`.
- Roster render adapter coordination moved to `src/app/rosterRenderAdapter.js`.
- Dungeon render adapter coordination moved to `src/app/dungeonRenderAdapter.js`.
- Visitor, skill, hero-stat, blueprint, and Temple static definitions moved to `src/game/`.
- Skill progression checks moved to `src/game/roster/skillProgression.js`.
- Roster command helpers moved to `src/game/roster/rosterCommands.js`.
- Crafting command helpers moved to `src/game/roster/craftingCommands.js`.
- Hero XP/level-up mutation moved to `src/game/roster/leveling.js`.
- Party read selectors, hero-name fallback, character status derivation, and stat aggregation moved to `src/game/party/partySelectors.js`.
- Party command helpers moved to `src/game/party/partyCommands.js`.
- Temple state normalization/socket helpers moved to `src/game/temple/templeState.js`.
- Temple bonus resolution moved to `src/game/temple/templeBonuses.js`.
- Temple command helpers moved to `src/game/temple/templeCommands.js`.
- Shard progression moved to `src/game/temple/shardProgression.js`.
- Combat actor creation, node resolution, deterministic timeline scheduling, party HP summary, and recovery-hour calculation live in `src/game/combat/combatTimeline.js`.
- Combat action selection and enemy action helpers moved to `src/game/combat/combatActions.js`.
- Combat replay event snapshot helpers moved to `src/game/combat/combatReplayModel.js`.
- Dungeon run simulation moved to `src/game/dungeon/dungeonRunSimulator.js`.
- Dungeon operation value/scheduling helpers moved to `src/game/dungeon/dungeonOperationModel.js`.
- Dungeon operation completion moved to `src/game/dungeon/dungeonCompletion.js`.
- Dungeon operation elapsed-time ticking moved to `src/game/dungeon/operationRuntime.js`.
- Repeated-plan automation decisions moved to `src/game/dungeon/repeatedPlanAutomation.js`.
- Dungeon replay runtime controls moved to `src/game/dungeon/replayRuntime.js`.
- App resource runtime moved to `src/app/resourceRuntime.js`.
- Versioned save/load payload helpers moved to `src/app/saveLoad.js`.
- Generic resource reward helpers moved to `src/game/resources/resourceRewards.js`.
- Tavern command helpers moved to `src/game/tavern/tavernCommands.js`.
- Game clock, daily income, and worker-cycle helpers moved to `src/game/time/gameClock.js`.
- Auto-time interval/tick runtime moved to `src/game/time/autoTimeRuntime.js`.
- Hour-step advancement sequencing moved to `src/game/time/timeAdvanceRuntime.js`.
- Daily production mutation moved to `src/game/time/dailyProductionRuntime.js`.
- DOM lookup and basic event binding helpers moved to `src/ui/dom.js`.
- Top-level and Map side-panel tab activation moved to `src/ui/tabRuntime.js`.
- Top-level render order moved to `src/ui/renderApp.js`.
- Dungeon/stop-node/party select option rendering moved to `src/ui/selectView.js`.
- Dungeon replay panel DOM rendering moved to `src/ui/dungeonReplayPanel.js`.
- Dungeon panel DOM rendering moved to `src/ui/dungeonPanel.js`.
- Party/focused-character panel DOM rendering moved to `src/ui/partyPanel.js`.
- Roster card panel DOM rendering moved to `src/ui/rosterPanel.js`.
- Map panel DOM rendering moved to `src/ui/mapPanel.js`.
- Systems/log panel DOM rendering moved to `src/ui/systemsPanel.js`.
- Temple panel DOM rendering moved to `src/ui/templePanel.js`.
- Header/status, reward text, blueprint rows, log-row rendering, Population job rows, Tavern visitor queue rendering, Dungeon node/estimate/replay HTML, Map side-panel HTML, Map world/actor HTML, Roster/party/skill/focused-character HTML, and Temple board/shard/detail HTML moved to first `src/ui/*` view helpers.
- Node tests cover app config defaults, app-state independence, app runtime context construction, app bootstrap setup behavior, app callback registry behavior, app data context behavior, app query setup behavior, app utility callback behavior, app selection/query behavior, app render handler behavior, app shell command behavior, app control setup behavior, app map interaction setup behavior, browser timer adapters, save/load payload behavior, select-control adapter behavior, POI validation/selectors, map actor interpolation, roster/party/Temple/dungeon/time/resource helpers, roster progression app handlers, Temple progression app handlers, combat timeline behavior, and first extracted UI view helpers.
- Latest validation: `npm run check:js` passed for 105 JavaScript files; `npm test` passed 279/279 tests.
- Latest cleanup: removed stale `src/app.js` imports, dead pass-through wrappers, the app-selection wrapper block, direct command wrapper blocks, unused tab/time/render pass-through wrappers, and the redundant `resourceCommands` facade left behind by prior adapter extractions.

### Phase 0: Safety Baseline

- [x] Create a `package.json` with minimal scripts.
  - Depends on: none.
  - Scripts:
    - `check:js`: `node --check src/main.js` after module migration starts.
    - `test`: `node --test tests/*.test.js`.

- [x] Add a lightweight smoke checklist to `README.md`.
  - Depends on: none.
  - Include local server command and key screens to test.

- [x] Add initial tests around current pure-ish logic before moving it.
  - Depends on: none.
  - Start with copied/extracted pure functions if direct import is not possible yet.

- [x] Define refactor vocabulary in `AI_CONTEXT.md`.
  - Depends on: none.
  - Terms: estimate, operation, replay, plan, repeated plan, command, selector, runtime state.

### Phase 1: Bootstrap And State Split

- [x] Extract stable app constants to `src/app/appConfig.js`.
  - Depends on: module entry.
  - Covers character-atlas dimensions, map world/zoom defaults, Temple inventory slots, and replay default speed.

- [x] Rename `src/app.js` entry path to `src/main.js` or create `src/main.js` that imports current `app.js`.
  - Depends on: Phase 0 validation scripts if added.
  - Goal: prepare for ES module imports.

- [x] Switch `index.html` script tag to `type="module"`.
  - Depends on: `src/main.js`.

- [x] Create `src/app/appState.js`.
  - Depends on: module entry.
  - Move initial state creation into `createInitialState()`.
  - Split serializable state from transient runtime state.

- [x] Extract app runtime context to `src/app/appRuntimeContext.js`.
  - Depends on: app state, app data context, browser timer adapter, and resource runtime.
  - Covers initial state, auto-time runtime, loaded data context, DOM element bag, and resource runtime construction.

- [x] Extract app-level query composition to `src/app/appQueries.js`.
  - Depends on: POI selectors, party selectors, operation model, and Temple query adapter.
  - Covers selected dungeon/location/party, focused hero, POI collections, party members/stats/readiness, operation phases, and roster status labels.

- [x] Extract app query setup composition to `src/app/appQuerySetup.js`.
  - Depends on: app data context, app query owner, Temple query owner, and app selection facade.
  - Covers composition of loaded POI data, Temple query reads, and the app selection facade.

- [x] Extract app-facing selection facade to `src/app/appSelectionFacade.js`.
  - Depends on: app queries and skill progression helpers.
  - Covers selected app reads plus roster skill-tree/rank/can-learn projections for adapters.

- [x] Extract top-level render coordinator to `src/app/appRenderHandlers.js`.
  - Depends on: extracted render adapters and render order helper.
  - Covers full render order and focused render pass delegation.

- [x] Extract UI-only shell command adapter to `src/app/appShellCommandHandlers.js`.
  - Depends on: log runtime, plan invalidation, and tab runtime.
  - Covers clear log, dungeon-select invalidation, party-select invalidation, top-tab activation, and map-side-tab activation.

- [x] Extract app bootstrap setup adapter to `src/app/appBootstrapSetup.js`.
  - Depends on: DOM element binding and bootstrap runtime extraction.
  - Covers app-specific element assignment and startup callback registration.

- [x] Extract app callback registry to `src/app/appCallbackRegistry.js`.
  - Depends on: command/render adapter extraction.
  - Covers late-bound callback forwarding across command, render, bootstrap, and interaction adapters.

- [x] Extract loaded POI data context to `src/app/appDataContext.js`.
  - Depends on: POI loading and app query extraction.
  - Covers loaded POI data storage for bootstrap writes and query reads.

- [x] Extract app utility callback adapter to `src/app/appUtilityCallbacks.js`.
  - Depends on: log runtime, reward text helper, Temple query/progression adapters, and browser replay timer adapter.
  - Covers app-level log insertion, reward formatting, Temple progression/loot callbacks, and replay timer API creation.

- [x] Extract app control setup adapter to `src/app/appControlSetup.js`.
  - Depends on: static control bindings and command adapter extraction.
  - Covers control handler-map composition for shell, dungeon, party, replay, roster/tavern, and time owners.

- [x] Extract app map interaction setup adapter to `src/app/appMapInteractionSetup.js`.
  - Depends on: map interaction bindings and map view config.
  - Covers app-state/config/callback wiring for overland map pointer and wheel interactions.

- [x] Extract browser timer adapter to `src/app/browserTimerAdapters.js`.
  - Depends on: auto-time runtime and replay runtime timer contract.
  - Covers browser `window`/`performance` binding for auto-time and replay timer APIs.

- [x] Extract app resource runtime to `src/app/resourceRuntime.js`.
  - Depends on: generic resource reward helpers.
  - Covers app-state affordability checks, payment mutation, and reward application for command adapters.

- [x] Create `src/ui/dom.js`.
  - Depends on: module entry.
  - Move DOM lookup/binding helpers from `bindElements()` and `on()`.

- [x] Create `src/app/domElements.js`.
  - Depends on: `src/ui/dom.js`.
  - Owns the app required-element ID list and element binding contract.

- [x] Create `src/app/bootstrap.js`.
  - Depends on: `appState.js`, `dom.js`.
  - Own startup sequence: bind DOM, load data, setup controls, render, start loops.

- [x] Keep a temporary compatibility barrel while extracting.
  - Depends on: module entry.
  - Goal: avoid moving all code at once.

### Phase 2: Core Helpers And Data Loading

- [x] Extract `clamp`, `distance`, `interpolateCoord`, and formatting helpers to `src/core/`.
  - Depends on: module entry.

- [x] Extract POI loading and validation to `src/data/dataLoader.js` and `src/data/validators/poiValidator.js`.
  - Depends on: core helpers if needed.

- [x] Add tests for POI validation.
  - Depends on: data validator extraction.

- [x] Replace direct global `poiData` access with explicit data context/selectors.
  - Depends on: data loader extraction.
  - Covers dungeon/work-site/tavern selectors, work-site lookup, map-location composition, and selected-location fallback.

### Phase 3: Roster, Skills, And Party Domain

- [x] Extract skill definitions and skill helpers to `src/game/roster/skills.js`.
  - Depends on: module entry.

- [x] Extract hero stat calculation to `src/game/roster/heroStats.js`.
  - Depends on: skills extraction, Temple bonus boundary.

- [x] Extract skill progression checks to `src/game/roster/skillProgression.js`.
  - Depends on: skills extraction.
  - Includes available trees, skill rank, and can-learn validation.

- [x] Extract roster commands to `src/game/roster/rosterCommands.js`.
  - Depends on: app state split.
  - Commands: recruit, focus hero, learn skill, craft gear if gear remains roster-owned.

- [x] Extract first roster commands to `src/game/roster/rosterCommands.js`.
  - Depends on: app state split.
  - Includes next visitor lookup, visitor-to-hero conversion, recruitment, and focus hero.

- [x] Extract roster/tavern command wrapper adapter to `src/app/rosterTavernCommandHandlers.js`.
  - Depends on: roster commands, crafting commands, tavern commands, and command message adapters.
  - Includes recruit, focus, roster view toggle, craft, tavern upgrade, worker assignment wrappers, log output, and render callbacks.

- [x] Extract skill learning command to `src/game/roster/rosterCommands.js`.
  - Depends on: skill progression extraction.
  - Includes busy-state gate, skill-point spend, skill-point bonus, HP adjustment, and repeated-plan invalidation.

- [x] Extract crafting command to `src/game/roster/craftingCommands.js`.
  - Depends on: resource helper extraction.
  - Includes blueprint discovery, affordability, duplicate gear guard, gear equip, crafted count, and estimate invalidation.

- [x] Extract hero XP/leveling helper to `src/game/roster/leveling.js`.
  - Depends on: hero stat calculation.
  - Includes XP addition, multi-level-up loop, skill-point gain, and HP restoration to derived max.

- [x] Extract roster progression app adapter to `src/app/rosterProgressionHandlers.js`.
  - Depends on: roster commands, leveling helper, command message adapters, and hero stat calculation.
  - Includes skill-learning log/render coordination and XP level-up logging.

- [x] Extract party selectors and commands to `src/game/party/`.
  - Depends on: hero stats extraction.
  - Commands: add party, select party, cancel party action, toggle member, add focused hero.

- [x] Extract first party commands to `src/game/party/partyCommands.js`.
  - Depends on: hero stats extraction.
  - Includes add/select/cancel party, remove member, and add/move hero to selected party.

- [x] Extract party command wrapper adapter to `src/app/partyCommandHandlers.js`.
  - Depends on: party commands and command message adapters.
  - Includes add/select/cancel party wrappers, member removal wrapper, focused-hero add wrapper, log output, select refresh, and render callbacks.

- [x] Extract first party read selectors to `src/game/party/partySelectors.js`.
  - Depends on: hero stats extraction.
  - Includes focused hero, selected party, party lookup by hero, hero-name fallback, character status derivation, party members, full-heal checks, and party stat aggregation.

- [x] Add tests for `heroStats()`, skill unlock rules, and party membership mutation.
  - Depends on: roster/party extraction.

- [x] Add tests for `heroStats()`, skill unlock rules, and party read selectors.
  - Depends on: roster/party selector extraction.

- [x] Add tests for first roster and party commands.
  - Depends on: roster/party command extraction.

- [x] Add tests for skill learning and crafting commands.
  - Depends on: skill/crafting command extraction.

### Phase 4: Temple Domain

- [x] Extract Temple constants to `src/game/temple/templeData.js`.
  - Depends on: module entry.
  - Includes colors, stones, shards.

- [x] Extract Temple state helpers to `src/game/temple/templeState.js`.
  - Depends on: `templeData.js`.
  - Includes active stone, socket IDs, normalization, inventory slots.

- [x] Extract Temple bonus resolution to `src/game/temple/templeBonuses.js`.
  - Depends on: `templeState.js`.

- [x] Extract Temple commands to `src/game/temple/templeCommands.js`.
  - Depends on: `templeState.js`.
  - Commands: select stone, select shard, equip shard, move inventory slot, toggle line, add shard XP.

- [x] Extract Temple command wrapper adapter to `src/app/templeCommandHandlers.js`.
  - Depends on: Temple commands, shard progression, Temple state helpers, and command message adapters.
  - Includes shard XP placement/logging, stone/shard selection, inventory move, socket equip/clear/error feedback, line toggle wrappers, and render callbacks.

- [x] Add tests for Temple commands.
  - Depends on: Temple command extraction.

- [x] Add tests for Temple color-effect activation.
  - Depends on: Temple bonus extraction.

- [x] Add tests for per-stone saved layouts.
  - Depends on: Temple state extraction.

- [x] Extract shard progression to `src/game/temple/shardProgression.js`.
  - Depends on: Temple data/state shape.
  - Includes visit/boss counters, due-award selection, and shard XP mutation.

- [x] Extract Temple progression app adapter to `src/app/templeProgressionHandlers.js`.
  - Depends on: shard progression and Temple command handlers.
  - Includes dungeon visit/boss shard award coordination and shard XP command delegation.

- [x] Add tests for shard progression.
  - Depends on: shard progression extraction.

### Phase 5: Dungeon And Combat Domain

- [x] Extract combat actor creation to `src/game/combat/combatTimeline.js`.
  - Depends on: hero stats extraction.

- [x] Extract combat action selection to `src/game/combat/combatActions.js`.
  - Depends on: combat actor extraction.

- [x] Extract deterministic timeline scheduler to `src/game/combat/combatTimeline.js`.
  - Depends on: combat actions.

- [x] Extract replay event model helpers to `src/game/combat/combatReplayModel.js`.
  - Depends on: combat timeline.

- [x] Extract dungeon run simulation to `src/game/dungeon/dungeonRunSimulator.js`.
  - Depends on: combat timeline, party selectors, Temple bonuses.

- [x] Extract operation queue/runtime to `src/game/dungeon/dungeonOperationModel.js` and `src/game/dungeon/operationRuntime.js`.
  - Depends on: dungeon simulator and game clock boundary.

- [x] Extract operation value helpers to `src/game/dungeon/dungeonOperationModel.js`.
  - Depends on: dungeon simulator.
  - Includes estimate clone, total hours, queued party hours, and current phase resolution.

- [x] Extract first operation scheduling helpers to `src/game/dungeon/dungeonOperationModel.js`.
  - Depends on: operation value helper extraction.
  - Includes assignment readiness, schedule validation, and operation construction.

- [x] Extract operation completion to `src/game/dungeon/dungeonCompletion.js`.
  - Depends on: resource rewards, hero stats, shard progression.
  - Includes reward application callbacks, member healing, XP callback, blueprint unlock, Temple loot callback, and shard progress callback.

- [x] Extract dungeon command wrapper adapter to `src/app/dungeonCommandHandlers.js`.
  - Depends on: dungeon simulator, operation model, operation completion, repeated-plan automation, plan invalidation, and command message adapters.
  - Includes simulate selected run, cached estimate/replay replacement, commit scheduling, repeated-plan toggling, repeated queue attempts, operation completion logging, and injected reward/XP/Temple callbacks.

- [x] Extract operation elapsed-time ticking to `src/game/dungeon/operationRuntime.js`.
  - Depends on: operation value helper extraction.
  - Includes advancing elapsed operation hours and splitting completed vs remaining operations.

- [x] Add tests for actor initiative ordering.
  - Depends on: combat timeline extraction.

- [x] Add tests for replay timeline immutability/inspection-only behavior.
  - Depends on: replay model extraction.

- [x] Add tests for dungeon run estimate outputs.
  - Depends on: dungeon run simulator extraction.

- [x] Add tests for operation phase modeling.
  - Depends on: operation value helper extraction.

- [x] Add tests for operation scheduling decisions.
  - Depends on: operation scheduling helper extraction.

- [x] Add tests for operation completion.
  - Depends on: operation completion extraction.

### Phase 6: Time, Operations, And Automation

- [x] Extract generic resource reward helpers to `src/game/resources/resourceRewards.js`.
  - Depends on: core state shape.
  - Includes affordability checks, payment, reward application, and Temple loot projection.

- [x] Extract tavern command helpers to `src/game/tavern/tavernCommands.js`.
  - Depends on: resource helper extraction.
  - Includes upgrade cost/upgrade behavior and wood/ore worker reassignment.

- [x] Extract game clock to `src/game/time/gameClock.js`.
  - Depends on: operation runtime extraction.
  - Own day/hour advancement and daily rollover.

- [x] Extract hour-step advancement sequencing to `src/game/time/timeAdvanceRuntime.js`.
  - Depends on: game clock extraction.
  - Owns per-hour callback ordering and clock advancement while leaving gameplay side effects injected.

- [x] Extract daily production runtime to `src/game/time/dailyProductionRuntime.js`.
  - Depends on: game clock and repeated-plan automation helpers.
  - Owns daily income mutation and repeated-plan resume candidate selection while leaving logging/queue attempts injected.

- [x] Extract time command wrapper adapter to `src/app/timeCommandHandlers.js`.
  - Depends on: auto-time runtime, game clock, worker-cycle helpers, operation runtime, daily production runtime, repeated-plan automation, and command message adapters.
  - Covers auto-time toggle/stop, hour advancement, worker delivery logging, operation ticking/completion, daily production logging, repeated-plan resume checks, and render callbacks.

- [x] Add tests for game clock and worker-cycle helpers.
  - Depends on: game clock extraction.

- [x] Extract repeated-plan queueing to a deterministic automation owner.
  - Depends on: dungeon operation extraction.

- [x] Add tests for repeated-plan automation decisions.
  - Depends on: repeated-plan automation extraction.

- [x] Replace scattered `state.lastEstimate = null` with `clearDungeonEstimate(state, replayTimerApi)`.
  - Depends on: dungeon planner extraction.

- [x] Add tests for repeated plan pause/resume behavior.
  - Depends on: operation runtime extraction.

### Phase 7: Map Domain And UI

- [x] Extract map POI selectors to `src/data/poiSelectors.js`.
  - Depends on: data loader extraction.
  - Kept under `src/data/` because the selectors shape loaded POI JSON rather than owning map simulation state.

- [x] Extract map view state and coordinate transforms to `src/game/map/mapViewRuntime.js`.
  - Depends on: core helpers.

- [x] Extract worker route visualization helpers to `src/game/map/mapActorRuntime.js`.
  - Depends on: population runtime.

- [x] Extract map UI renderer and event binding to `src/ui/mapPanel.js`, `src/ui/mapWorldView.js`, `src/ui/mapSideView.js`, and `src/app/mapInteractions.js`.
  - Depends on: map domain extraction and DOM helper.

- [x] Extract first `mapSideView.js` slice.
  - Depends on: current map selectors/adapters.
  - Covers selected-location detail HTML, active/repeated operation rows, and coordinate POI rows.

- [x] Extract first `mapWorldView.js` slice.
  - Depends on: current map coordinate adapters.
  - Covers route lines, POI buttons, world wrapper, worker actor markers, and party actor markers.

- [x] Extract Map panel DOM renderer.
  - Depends on: `mapSideView.js` and `mapWorldView.js`.
  - Covers world markup injection, POI click binding, selected-location detail binding, operations table rendering, and POI coordinate table rendering.

- [x] Extract map render adapter to `src/app/mapRenderAdapter.js`.
  - Depends on: map view-state runtime, map actor runtime, Map panel renderer, and Map world view helpers.
  - Covers overland map panel rendering, transform/status text, actor-layer refresh, selected-location detail refresh, distance formatting, and worker marker coordinates.

- [x] Extract map command wrapper adapter to `src/app/mapCommandHandlers.js`.
  - Depends on: map selectors, dungeon command adapter, plan invalidation, and command message adapters.
  - Covers map-location selection, dungeon-control sync, cached-estimate invalidation for dungeon POI selection, and map-side repeated dungeon assignment setup/queueing.

- [x] Extract map interaction view-state runtime.
  - Depends on: core math helpers.
  - Covers drag start/update/end, screen-to-world conversion, cursor-centered zoom, transform CSS, and status text.

- [x] Extract map DOM interaction binding.
  - Depends on: map interaction view-state runtime.
  - Covers pointerdown/move/up/cancel, pointer capture, drag CSS class, wheel zoom, and map detail refresh callback.

- [x] Add tests for map coordinate transforms and worker route interpolation.
  - Depends on: map view state extraction.
  - Covers map view-state transforms and first worker route marker interpolation helper.

### Phase 8: UI Render Modules

- [x] Create `src/ui/renderApp.js`.
  - Depends on: command and domain extraction enough to pass snapshots.
  - Own render orchestration.

- [x] Extract app-state-aware select-control adapter to `src/app/selectControlAdapter.js`.
  - Depends on: select-control rendering and selected dungeon/party app boundary.
  - Covers dungeon, stop-node, and party select population from app state/selectors.

- [x] Extract first `headerView.js` slice.
  - Depends on: selectors for resources/time/party status.
  - Covers the global title/status row.

- [x] Extract first `tavernView.js` slice.
  - Depends on: tavern commands/selectors.
  - Covers visitor queue HTML and recruit button binding.

- [x] Extract first `populationView.js` slice.
  - Depends on: population runtime.
  - Covers worker/kitchen job rows.

- [x] Extract first `rosterView.js` slice.
  - Depends on: roster and party modules.
  - Covers portrait/atlas helpers, compact state labels, HP percent, party rows/member buttons, skill trees/buttons, roster cards, and focused-character details.

- [x] Extract roster render adapter to `src/app/rosterRenderAdapter.js`.
  - Depends on: Tavern visitor view, Population view, Party panel, Roster panel, and Roster view portrait helpers.
  - Covers Tavern visitor rendering, Population job rendering, party/focused-character panel rendering, roster card rendering, and shared atlas portrait helpers.

- [x] Extract header render adapter to `src/app/headerRenderAdapter.js`.
  - Depends on: `headerView.js` and selected-party app boundary.
  - Covers global title-row render coordination, selected party status, resource line, roster view label, and auto-time button text lookup.

- [x] Extract Systems render adapter to `src/app/systemsRenderAdapter.js`.
  - Depends on: `systemsPanel.js`, blueprint data, and log runtime state.
  - Covers blueprint/log panel render coordination and replaces the stale load-error `renderLog()` path with `renderSystems()`.

- [x] Extract Roster card panel DOM renderer.
  - Depends on: roster view helpers.
  - Covers minimized class state, roster card HTML injection, and focus-button binding.

- [x] Extract Party/focused-character panel DOM renderer.
  - Depends on: roster view helpers.
  - Covers party row HTML injection, party select/cancel/member binding, focused-character detail injection, add-to-party binding, and skill-learn binding.

- [x] Extract first `dungeonView.js` and replay view slice.
  - Depends on: dungeon/combat modules.
  - Covers Dungeon node map HTML, estimate text, replay actor rows, replay event rows, and empty replay placeholders.

- [x] Extract Dungeon replay panel DOM renderer.
  - Depends on: dungeon replay view slice.
  - Covers timeline slider, replay status, replay control enabled/disabled state, actor panes, action icon/text, and event list.

- [x] Extract Dungeon panel DOM renderer.
  - Depends on: `dungeonView.js` and `dungeonReplayPanel.js`.
  - Covers node map, cached estimate text, repeated-plan indicator, and replay panel coordination.

- [x] Extract dungeon render adapter to `src/app/dungeonRenderAdapter.js`.
  - Depends on: Dungeon panel renderer, replay panel renderer, roster portrait helpers, and selected dungeon app boundary.
  - Covers app-state/control wiring for full Dungeon render and replay-only refresh without duplicating UI rendering logic in `src/app.js`.

- [x] Extract replay runtime controls.
  - Depends on: combat replay state shape.
  - Covers cursor clamping, reset, stop, start, toggle, speed cycling, speed labels, and injected timer APIs.

- [x] Extract replay command wrapper adapter to `src/app/replayCommandHandlers.js`.
  - Depends on: replay runtime controls.
  - Covers replay cursor/playback/speed wrappers, browser timer API injection, full render vs replay-only render decisions, stop playback wrapper, and speed labels.

- [x] Extract first `templeView.js` slice.
  - Depends on: Temple modules.
  - Covers Temple status, stone buttons, board shell, links, sockets, shard token/dots/progress, inventory slots, active buffs, selected-shard detail, and effect labels.

- [x] Extract Temple panel DOM renderer.
  - Depends on: `templeView.js`, Temple state/bonus helpers, and Temple interaction binding adapter.
  - Covers stone-button binding, board/socket rendering, shard inventory rendering, active buffs, selected-shard detail, and drag/drop binding calls.

- [x] Extract Temple render adapter to `src/app/templeRenderAdapter.js`.
  - Depends on: Temple panel renderer, Temple state helpers, Temple bonus helpers, and Temple command wrappers.
  - Covers active stone render-state derivation, normalized per-stone inventory slots, active bonus calculation, shard effect scaling, line activity checks, and injected Temple command callbacks.

- [x] Extract Temple app query adapter to `src/app/templeAppQueries.js`.
  - Depends on: Temple state helpers, Temple bonus helpers, and resource reward projection.
  - Covers active stone lookup, active bonuses, shard ownership, color labels, and loot-bonus projection for app command/render adapters.

- [x] Extract tab runtime helpers.
  - Depends on: DOM helper conventions.
  - Covers active-class toggling for top-level tabs and Map side-panel local tabs.

- [x] Extract auto-time runtime.
  - Depends on: game clock runtime and visual tick state.
  - Covers interval start/stop/toggle, tick timestamping, and visual hour-fraction interpolation with injected timer APIs.

- [x] Extract select option helpers.
  - Depends on: current dungeon/party state shape.
  - Covers dungeon select, stop-node select, and party select option rendering.

- [x] Extract app-level select population adapter.
  - Depends on: `selectView.js`.
  - Covers dungeon select population plus stop-node refresh, stop-node-only refresh, and party select population.

- [x] Extract static control binding adapter.
  - Depends on: stable DOM IDs and command handler wrappers.
  - Covers top-level static button/select event binding with injected handlers.

- [x] Extract deterministic log runtime.
  - Depends on: app state split.
  - Covers stamped newest-first insertion, 80-entry cap, and clearing.

- [x] Extract Temple interaction binding adapter.
  - Depends on: Temple UI view helper extraction.
  - Covers board link clicks, socket drag/drop, shard token select/drag, and inventory drop wiring with injected handlers.

- [x] Extract dungeon estimate/replay invalidation helper.
  - Depends on: replay runtime extraction.
  - Covers clearing cached estimate with replay reset, setting cached estimate with replay timeline replacement, and estimate-only changes that preserve replay state.

- [x] Extract first command result/log adapters.
  - Depends on: roster/tavern/party command extraction.
  - Covers recruit, focus hero, skill learning, craft, tavern upgrade, worker assignment, time/progression, add party, cancel party, party member edit, add-to-party, dungeon simulation, automation, scheduling, operation completion, map repeated assignment, and Temple shard/inventory/equip/link messages.

- [x] Extract Systems panel DOM renderer.
  - Depends on: blueprint and log view helpers.
  - Covers blueprint row rendering and deterministic log row rendering through one render-order slot.

- [x] Extract first `logView.js` slice.
  - Depends on: app selectors.
  - Covers deterministic log-row HTML.

- [x] Extract reward and blueprint view helpers.
  - Depends on: core formatting and blueprint data.
  - Covers reward labels and blueprint-row HTML.

- [x] Prefer event delegation for repeated lists/grids where it materially improves maintainability.
  - Depends on: view extraction.
  - Current state: direct binding remains in small panel modules where explicit local handlers are clearer for this prototype.

### Phase 9: CSS Organization

- [x] Add section headers to existing `styles.css` before splitting.
  - Depends on: UI owner boundaries.

- [x] Split CSS only if it improves maintainability without adding a build step.
  - Depends on: section headers.
  - Option A: keep one `styles.css` with ordered sections.
  - Option B: use multiple `<link>` files such as `styles/base.css`, `styles/map.css`, `styles/temple.css`.
  - Current decision: keep one ordered stylesheet to preserve the static-file/no-build workflow.

- [x] Isolate screen-specific selectors.
  - Depends on: UI view extraction.
  - Current state: screen-specific selectors are grouped by stylesheet section.

- [x] Preserve current dev-tool visual direction.
  - Depends on: all CSS work.

### Phase 10: Data Boundaries

- [x] Move visitors/archetypes/races out of `src/app.js`.
  - Current owner: `src/game/roster/adventurerData.js`.

- [x] Move skill trees and skill definitions out of `src/app.js`.
  - Current owner: `src/game/roster/skills.js`.

- [x] Move blueprints out of `src/app.js`.
  - Current owner: `src/game/blueprints/blueprints.js`.

- [x] Move Temple colors/stones/shards out of `src/app.js`.
  - Current owner: `src/game/temple/templeData.js`.

- [x] Keep POI/dungeon source in `assets/data/poi.json`.
  - This is the current simple data boundary for the prototype.

- [x] Add validator for the current external data file.
  - Current owner: `src/data/validators/poiValidator.js`.

- Optional future content-pipeline task: move roster, skill, blueprint, and Temple data modules to JSON when non-coder content authoring is needed.
  - This is no longer considered part of the architecture refactor completion criteria.

### Phase 11: Persistence

- [x] Define savegame schema version.
  - Depends on: state split.

- [x] Add `src/app/saveLoad.js`.
  - Depends on: serializable state boundary.

- [x] Exclude transient runtime state from saves.
  - Depends on: replay/runtime state split.

- [x] Add migration stubs for future versions.
  - Depends on: schema definition.
  - Unsupported versions now fail explicitly; migration functions can be added when version `2` exists.

- [x] Add tests for save/load roundtrip.
  - Depends on: save/load implementation.

### Phase 12: Cleanup And Enforcement

- [x] Delete temporary compatibility barrel.
  - Depends on: all module extraction.
  - No barrel remains; `src/app.js` is only the startup shim.

- [x] Ensure `src/app.js` is removed or reduced to a small compatibility shim.
  - Depends on: all module extraction.

- [x] Update `AGENTS.md`, `AI_CONTEXT.md`, and `NEXT_SESSION_HANDOFF.md`.
  - Depends on: each major phase.

- [x] Add a final architecture overview to `docs/architecture.md`.
  - Depends on: stable module layout.

- [x] Run full validation.
  - Depends on: all phases.
  - Commands:
    - `npm run check:js`
    - `npm test`

## Recommended First Refactor Slice

Start with a low-risk extraction that creates the module structure without changing behavior:

- [x] Add `src/main.js` as module entry.
- [x] Move constants-free pure helpers to `src/core/`.
- [x] Move POI loader/validator to `src/data/`.
- [x] Move combat replay timeline helpers to `src/game/combat/`.
- [x] Add first `node --test` tests for combat ordering and Temple bonuses.

Reason:

- Combat and Temple now have the highest complexity.
- They can be tested without DOM once extracted.
- Early tests will catch regressions during later UI extraction.

## Refactor Risks

- Behavior drift during extraction.
- Accidentally coupling modules back to global `state`.
- Moving too much data to JSON before schemas are stable.
- Adding abstractions before owner boundaries are clear.
- Breaking current UI event handling through partial render extraction.

## Refactor Guardrails

- Keep each PR/commit focused on one owner boundary.
- Do not combine data schema changes with UI extraction in the same slice.
- Preserve current behavior unless a task explicitly changes it.
- Add tests for extracted pure logic before changing algorithms.
- After each slice, run `node --check` and a browser smoke test.
- Keep docs aligned after every completed phase.
