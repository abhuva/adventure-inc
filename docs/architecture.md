# Adventure Inc Architecture

## Runtime Shape

`adventure-inc` is a browser-native ES-module prototype. `index.html` loads `src/main.js`, which imports the small compatibility shim `src/app.js`. The real app composition lives in `src/app/adventureIncApp.js`.

The runtime is intentionally dependency-free: no framework, bundler, game engine, or build step.

## Ownership Layers

- `src/app/`: app composition, browser adapters, command-handler adapters, render adapters, bootstrap, save/load, and app-level coordination.
- `src/core/`: small pure helpers with no game-domain ownership.
- `src/data/`: JSON loading, POI validation, and POI selectors.
- `src/game/`: deterministic domain rules and state mutation helpers.
- `src/ui/`: DOM renderers, pure HTML view helpers, tab helpers, and static event binding helpers.

## State Boundaries

The in-memory app state is created through `src/app/appState.js`. `src/app/appRuntimeContext.js` creates the full runtime context: initial state, loaded-data context, DOM element bag, browser auto-time runtime, and resource runtime.

Save/load is versioned through `src/app/saveLoad.js`. Save payloads use schema version `1` and include only campaign/prototype state, including first-step encounter seen/queue state. Transient inspection/runtime state such as replay timer handles is excluded. Browser persistence is handled by `src/app/localSaveRuntime.js` through `localStorage` key `adventure-inc:save:v1`; startup loads it after POI data is available and routine renders/ticks debounce autosaves. Systems exposes `save now` and `reset local save` controls. Bootstrap starts auto-time by default after POI/autosave load and the first render.

Map pan/zoom state is part of saved app state. Map pointer and wheel handlers must resolve the current `state.mapView` through a getter because save restore replaces the map-view object during startup. Map background dimensions are runtime-derived from `assets/map-bg.png` during bootstrap and are not part of the saved campaign state; POI coordinates are interpreted as pixels in that source image.

## Data Boundaries

POI data is external JSON in `assets/data/poi.json` and validated on startup. Other content data currently lives in dedicated domain modules:

- `src/game/roster/adventurerData.js`
- `src/game/roster/skills.js`
- `src/game/blueprints/blueprints.js`
- `src/game/temple/templeData.js`

This keeps the prototype simple while preserving one owner per data family. Moving these to JSON later should be a content-pipeline task, not an architecture prerequisite.

## Command Flow

UI controls call app command adapters under `src/app/*CommandHandlers.js`. These adapters gather selected UI state, call pure/domain helpers under `src/game/`, write logs, invalidate cached plans when needed, and schedule render updates.

Domain helpers do not read DOM nodes directly.

First-step onboarding uses the same command boundary. `src/game/events/eventRuntime.js` owns pure encounter queue/seen-state rules, `src/game/events/eventDefinitions.js` owns the current authored tutorial triggers, and `src/app/eventCommandHandlers.js` opens or closes encounters only after successful app command paths. Encounter actions can close the panel or route through existing tab commands; they do not mutate tavern, roster, dungeon, or resource state directly.

Map-driven dungeon launching is a UI command flow rather than a new domain model. `src/app/mapCommandHandlers.js` owns transient dungeon context-menu state, syncs Dungeon controls for full repeated runs, simulates the selected party/dungeon immediately, stores the selected party's repeated plan, attempts the first queue through repeated-plan automation, and routes to the Dungeon tab. `src/app/dungeonCommandHandlers.js` remains the owner for Dungeon-tab simulation, one-shot commits, repeated automation helpers, operation completion, and strategy-change resimulation. The resulting UI and state contract is documented in `docs/dungeon-map-run-flow.md`.

World progression and deeper dungeon progression are state-gated on top of complete POI/source data. `src/game/progression/worldProgression.js` owns unlocked locations, dungeon clear counters, and reveal gates. `src/game/dungeon/dungeonGraphModel.js` owns route selection over node graphs, while `src/game/dungeon/dungeonMastery.js` adapts the existing progression graph system to dungeon mastery XP and deterministic mastery unlocks. `src/game/dungeon/dungeonRunSimulator.js` consumes named routes and per-hero Resolve, allowing heroes to withdraw from deeper nodes without invalidating partial rewards. The design is documented in `docs/dungeon-progression-redesign.md`.

Tavern visitor availability is deterministic domain state, not UI filtering. `src/game/roster/adventurerData.js` owns each visitor's fame threshold, tier, stay days, and away days. `src/game/roster/visitorQueue.js` owns daily present/away refresh, visible visitor-seat filling, and turn-away timers. The Tavern renderer only receives visitors who are currently waiting. The design is documented in `docs/tavern-visitor-queue.md`.

## Rendering Flow

Top-level render ordering is owned by `src/ui/renderApp.js` and coordinated by `src/app/appRenderHandlers.js`. The encounter overlay is rendered early in this order through `src/app/eventRenderAdapter.js`, `src/ui/encounterPanel.js`, and `src/ui/encounterView.js`. Each major screen has a thin app render adapter and UI modules for DOM rendering/HTML generation. Routine automatic time ticks use scoped `renderTimeTick()` updates instead of full app renders so clickable DOM is not replaced during pointer gestures. High-interaction panels such as Roster, Party, and Map use delegated parent click handlers for the same reason.

The UI still uses broad `innerHTML` updates in places. This is acceptable for the prototype size; event delegation can be added selectively if repeated grids become a bottleneck. The deterministic log is rendered into the Map side-panel `Log` tab through the Map panel renderer, while Systems stays focused on blueprints and system controls.

## Determinism

Gameplay rules must not use `Math.random()`. Dungeon runs, combat actions, Temple shard progression, worker production, and repeated automation are deterministic.

Combat resolution is split across:

- `src/game/combat/combatTimeline.js`: node resolution, scheduler loop, actor construction, HP helpers, recovery-hour calculation.
- `src/game/combat/combatActions.js`: party action choice, enemy target choice, recovery and damage rules.
- `src/game/combat/combatReplayModel.js`: replay event snapshots.

Replay playback is inspection-only and does not advance game time or mutate campaign state.

## Progression Graphs

Reusable node-based progression lives under `src/game/progression/`:

- `progressionGraphModel.js`: normalizes graph definitions, derives links from prerequisites, and derives simple layouts from linear tree data.
- `progressionGraphRules.js`: owns rank reads, spent-point totals, root/connected-node unlock checks, and point-spend availability.
- `progressionGraphEffects.js`: aggregates active effect values from ranked nodes.
- `progressionGraphCommands.js`: owns generic spend/refund point mutations.

The first consumer is character skill progression. `src/game/roster/skillProgression.js` adapts current race/job skill data to the generic graph rules while preserving the existing character-facing reason strings. The focused-character sidebar renders these trees through `src/ui/progressionGraphView.js`; `src/ui/rosterView.js` provides the skill-specific hover panels for costs, requirements, availability state, and effect deltas.

## Settlement And Workshop

Settlement workforce rules live under `src/game/settlement/`. `workforceModel.js` owns the three-worker minimum, direct coin-based worker hiring, job assignment, and compatibility wrappers for old housing actions. `happinessRuntime.js` owns fixed daily worker upkeep: each worker costs `1 coin`, and unpaid upkeep leaves the workforce intact but applies a `x0.5` production multiplier until the next fully paid upkeep.

Production Workshop rules live under `src/game/workshop/`. `workshopData.js` defines recipes, per-recipe level unlocks, and the building progression graph. `workshopRecipeProgression.js` owns recipe XP, square level thresholds, unlock state, and effective recipe cost/output/work values. `workshopRuntime.js` advances deterministic production/research worker-hours, resolves auto-input prerequisite routing from target recipe to temporary active recipe, and treats workshop workers above active station count as `+5%` speed assistants. `workshopCommands.js` exposes recipe, auto-input, and upgrade mutations. The Population tab renders this through `src/ui/populationView.js`, including recipe XP hover panels. Renewable food comes from the `rations` production recipe rather than passive tavern income; coin comes from fixed dungeon/resource rewards.

Detailed gameplay notes are in `docs/workforce-workshop-system.md`.

## First-Step Encounters

First-step onboarding is documented in `docs/first-step-encounter-system.md`. The short version: encounters are post-change tutorial notifications with a blocking overlay. They can pause auto-time, close, and route to existing top tabs, but gameplay mutations remain in explicit command/domain owners.

## Validation

Use:

```powershell
npm run check:js
npm test
```

Current validated baseline:

- `npm run check:js`: 131 JavaScript files.
- `npm test`: 356/356 tests.
