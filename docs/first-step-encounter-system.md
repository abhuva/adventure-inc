# First-Step Encounter System

## Purpose

The first-step encounter system introduces mechanics at the moment they become relevant. It is intentionally small: it provides deterministic, once-only tutorial prompts and a blocking encounter surface without becoming a quest engine, scripting language, wiki system, or general event bus.

The first use case is onboarding the opening loop:

- understand that the prototype is deterministic
- visit the tavern
- recruit an adventurer
- inspect parties and character builds
- simulate a dungeon before committing
- queue a run and watch it resolve
- understand that crafting and automation are known-output systems

## Design Goals

- Keep gameplay mutation in existing command/domain owners.
- Trigger encounters only after successful state changes or UI navigation.
- Keep encounter state serializable in the normal save payload.
- Pause auto-time for blocking prompts, then restore the previous running state when the queue closes.
- Keep the presentation dense, text-first, square, and consistent with the operations-console UI.
- Make the first implementation easy to replace or extend with richer content later.

## Non-Goals

The first slice should not include:

- branching quests
- authored scripting
- Markdown/wiki loading
- journal entries
- semantic UI highlights
- map-local event files
- localization plumbing
- hidden gameplay side effects from event definitions

Those may become useful later, but the current prototype needs a small encounter spine before it needs a content platform.

## Runtime Shape

The system is split across the normal repo layers:

- `src/game/events/eventDefinitions.js`: authored first-step definitions and trigger constants.
- `src/game/events/eventRuntime.js`: pure state normalization, trigger queueing, active-event lookup, seen-state handling, and close behavior.
- `src/app/eventCommandHandlers.js`: app-level coordination for triggering, closing, tab-routing actions, logging, rendering, and auto-time pause/resume.
- `src/app/eventRenderAdapter.js`: reads the active encounter and delegates to UI rendering.
- `src/ui/encounterView.js`: pure encounter HTML generation.
- `src/ui/encounterPanel.js`: DOM overlay rendering and delegated action clicks.
- `index.html`: `encounterOverlay` host element.
- `styles.css`: dense first-step encounter overlay styling.

This follows the existing pattern: pure rules live under `src/game/`, app coordination lives under `src/app/`, and DOM rendering lives under `src/ui/`.

## State Shape

Encounter state lives at `state.events`:

```js
{
  seen: {},
  queue: [],
  activeId: null,
  pausedTimeRunning: false
}
```

Field ownership:

- `seen`: event IDs closed at least once. Once-only events will not queue again.
- `queue`: pending event IDs waiting for the blocking encounter surface.
- `activeId`: currently visible encounter ID, or `null`.
- `pausedTimeRunning`: remembers whether auto-time was running when a blocking encounter paused it.

`createInitialState()` seeds this shape through `createInitialEventState()`. `normalizeAppState()` calls `ensureEventState()` so older saves gain compatible defaults.

`saveLoad.js` includes `events` in `SERIALIZABLE_TOP_LEVEL_KEYS`, so no separate localStorage key or sidecar state exists for encounters.

## Definition Shape

Current definitions are plain JavaScript data:

```js
{
  id: "tutorial.first_simulation",
  trigger: EVENT_TRIGGERS.FIRST_DUNGEON_SIMULATED,
  title: "Estimate Recorded",
  category: "Tutorial",
  priority: 60,
  once: true,
  presentation: { level: "blocking", time: "pause" },
  body: [
    "The estimate is now cached.",
    "Only committed operations change resources and character health."
  ],
  actions: [
    { id: "close", label: "continue", kind: "close" }
  ]
}
```

Definition rules:

- `id` is stable save-state identity.
- `trigger` is one of the exported `EVENT_TRIGGERS` constants.
- `priority` orders multiple events for the same trigger.
- `once` defaults conceptually to true; current authored tutorials are once-only.
- `presentation.level: "blocking"` opens the centered overlay.
- `presentation.time: "pause"` documents the time behavior; the current app handler pauses blocking encounters.
- `body` is text-only for now.
- `actions` can close the encounter or route to an existing top tab.

Definitions must not contain resource mutations, roster edits, operation creation, rewards, or arbitrary callbacks.

## Trigger Rules

Triggers are post-change notifications, not commands.

Good trigger points:

- app startup has completed
- a top tab was selected
- recruitment succeeded
- simulation succeeded and cached an estimate
- a run was actually queued
- an operation actually returned
- crafting succeeded

Bad trigger points:

- before validation succeeds
- inside pure domain helpers that should not know about UI
- as a replacement for command return values
- as a way to mutate unrelated gameplay state

Current trigger coverage:

- `game.started`
- `tab.tavern`
- `tab.roster`
- `tab.dungeon`
- `roster.first_recruit`
- `dungeon.first_simulated`
- `dungeon.first_queued`
- `dungeon.first_returned`
- `craft.first_item`

## Command Boundary

`eventRuntime` never knows about DOM, timers, logging, tabs, or save behavior. It only mutates the provided `state.events` object.

`eventCommandHandlers` is the app boundary. It:

- calls `triggerEvent()` after a producer command reports success
- logs encounter open/close messages
- pauses auto-time when a blocking encounter opens and time was running
- resumes auto-time only after the blocking queue is empty
- runs tab actions through `appShellCommandHandlers.setTab()`
- calls `render()` after encounter state changes

Encounter actions are intentionally narrow:

- `kind: "close"` closes the active encounter.
- `kind: "tab"` closes the active encounter and asks the shell command owner to switch tabs.

Future action kinds should stay narrow and should route through explicit command owners.

## Rendering Contract

The overlay is rendered through the normal render order. `renderAppSections()` includes `encounter` after `header`, before the main screen panels.

`renderEncounterPanel()` toggles the overlay's `hidden` class and replaces the overlay HTML. Click handling is delegated from the overlay to buttons with `data-encounter-action`.

The UI should remain:

- compact
- monospace
- square
- text-first
- consistent with `panel` and `panel-head` styling
- free of fantasy/modal ornamentation

The encounter overlay should not replace the deterministic Systems log. Logs remain the audit trail; encounters are momentary guidance.

## Time Behavior

When a blocking encounter opens:

1. If auto-time is running, `eventCommandHandlers` sets `state.events.pausedTimeRunning = true`.
2. It calls `timeCommandHandlers.stopAutoTime()`.
3. The encounter remains visible until closed.

When the active encounter closes:

1. The runtime marks it seen.
2. The next queued encounter opens if one exists.
3. If the queue is empty and `pausedTimeRunning` is true, auto-time resumes through `timeCommandHandlers.enableAutoTime()`.
4. `pausedTimeRunning` is reset to false.

If time was not running when the encounter opened, closing it does not start auto-time.

## Save/Load Behavior

Persisted:

- seen encounter IDs
- queued encounter IDs
- active encounter ID
- pause-resume marker

Not separately persisted:

- rendered HTML
- DOM focus
- timer handles
- derived event definitions

Definitions are code-owned data in this slice. A save references definitions by stable ID. Removing or renaming an ID can strand saved `activeId` or `queue` entries, so future definition changes should either keep IDs stable or add a small cleanup/migration rule in `ensureEventState()`.

## Tests

Current focused coverage:

- `tests/eventRuntime.test.js`: queueing, priority, once-only seen behavior, close advancement, normalization.
- `tests/eventCommandHandlers.test.js`: blocking pause/resume behavior and tab action routing.
- `tests/encounterView.test.js`: encounter HTML output and escaping.

Integration-adjacent coverage also lives in:

- `tests/appState.test.js`
- `tests/saveLoad.test.js`
- `tests/renderApp.test.js`
- `tests/appRenderHandlers.test.js`

Run after changes:

```powershell
npm run check:js
npm test
```

## Extension Path

Good next extensions:

- add a small debug/reset action for tutorial state in Systems if repeated onboarding testing becomes annoying
- add non-blocking notice entries only when the UI has a real place for them
- move definitions to JSON if content iteration needs non-code authoring
- add journal/wiki only when there is enough authored content to justify it
- add semantic UI highlights only for specific confusing controls

Avoid expanding the system into a general command bus. The current architecture works because encounter triggers observe successful changes while existing owners still perform all gameplay mutations.
