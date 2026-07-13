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

Save/load is versioned through `src/app/saveLoad.js`. Save payloads use schema version `1` and include only campaign/prototype state. Transient inspection/runtime state such as replay timer handles is excluded.

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

## Rendering Flow

Top-level render ordering is owned by `src/ui/renderApp.js` and coordinated by `src/app/appRenderHandlers.js`. Each major screen has a thin app render adapter and UI modules for DOM rendering/HTML generation.

The UI still uses broad `innerHTML` updates in places. This is acceptable for the prototype size; event delegation can be added selectively if repeated grids become a bottleneck.

## Determinism

Gameplay rules must not use `Math.random()`. Dungeon runs, combat actions, Temple shard progression, worker production, and repeated automation are deterministic.

Combat resolution is split across:

- `src/game/combat/combatTimeline.js`: node resolution, scheduler loop, actor construction, HP helpers, recovery-hour calculation.
- `src/game/combat/combatActions.js`: party action choice, enemy target choice, recovery and damage rules.
- `src/game/combat/combatReplayModel.js`: replay event snapshots.

Replay playback is inspection-only and does not advance game time or mutate campaign state.

## Validation

Use:

```powershell
npm run check:js
npm test
```

Current validated baseline:

- `npm run check:js`: 105 JavaScript files.
- `npm test`: 279/279 tests.
