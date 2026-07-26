# Dungeon Map Run Flow

## Purpose

Describe the player-facing dungeon launch flow from the Map tab and the ownership boundaries behind it.

The goal is to make dungeon operation intent clear:

- the player chooses a party on the Map tab
- the player clicks a dungeon POI
- a small map context menu offers `run` or `cancel`
- `run` means the selected party is scheduled now
- the app switches to the Dungeon tab with the same party/dungeon selected, full-run repeated mode enabled, and a fresh deterministic simulation shown immediately

The deeper dungeon progression rules behind route graphs, Resolve, mastery XP, and location gates are documented in `docs/dungeon-progression-redesign.md`.

## UI Flow

The Map tab owns the first decision.

1. The Map toolbar exposes a party select.
2. Clicking a dungeon POI opens a small stacked context menu near the click position.
3. `cancel` closes the context menu without changing the operation queue.
4. `run` closes the context menu, syncs the Dungeon controls, simulates the default full route, stores a repeated plan for the selected party, attempts to queue the first operation, and switches to the Dungeon tab.
5. On the Dungeon tab, the route structure is shown as a clickable graph. Clicking nodes builds or truncates a planned path and refreshes the estimate/replay when the path is legal.

The Map side-panel dungeon detail intentionally no longer exposes a direct assignment button. It tells the player to click the dungeon on the map to run, keeping the map POI as the explicit launch affordance.

## Scheduling Semantics

`run` is not a preview command. It creates or replaces the selected party's repeated plan and immediately calls repeated-plan queueing.

If the party is idle, healed, non-empty, and resources are available, the first operation is queued immediately. If an operation for the same party already exists, repeated automation stays serialized behind the active operation through the existing repeated-plan queue rules. If resources or readiness block queueing, the repeated plan remains stored and can resume when conditions allow.

Manual Dungeon tab `commit` behavior remains separate: it queues the cached estimate once and clears that party's repeated plan before queueing.

## Simulation And Partial Rewards

The first simulation is still an estimate. It runs instantly, fills the Dungeon tab summary, and replaces the inspection replay timeline.

Partial dungeon clears remain valid. The deterministic simulator merges rewards only from reached nodes, so a run that reaches `2/3` nodes receives rewards from nodes 1 and 2. Failing the next node does not poison the result; it simply means the party did not earn later rewards.

## Strategy Changes

Changing the Dungeon strategy select immediately resimulates the selected party/dungeon/route.

If the current party already has a repeated plan, the repeated plan is replaced with a clone of the new estimate. The active operation is not rewritten in place. This keeps already-scheduled work stable while making the player's updated strategy apply to the next queue attempt or repeated requeue.

Changing the Dungeon graph path follows the same rule: it changes future intent immediately, but it does not rewrite an operation that is already walking, fighting, returning, or recovering. Clicking a locked or unreachable node selects it for the node info drawer without replacing the active simulated plan.

## Ownership

- `index.html` exposes the Map party select.
- `src/app/selectControls.js` populates both Dungeon and Map party selects from the same selected party state.
- `src/app/appShellCommandHandlers.js` keeps Dungeon and Map party selects synchronized and invalidates cached estimates on party changes.
- `src/app/controlBindings.js` wires the Map party select and strategy select to command handlers.
- `src/app/mapCommandHandlers.js` owns map POI selection, transient context-menu state, full-route repeated setup, immediate simulation, first queue attempt, and Dungeon-tab routing.
- `src/app/dungeonCommandHandlers.js` owns ordinary Dungeon simulation, graph node click planning, one-shot scheduling, repeated automation, and strategy/path-change resimulation.
- `src/app/mapRenderAdapter.js` and `src/ui/mapPanel.js` coordinate the Map panel render and delegated POI/context-menu clicks.
- `src/ui/mapWorldView.js` owns the pure map context-menu HTML.
- `src/game/dungeon/dungeonGraphModel.js` owns deterministic route/path selection plus graph link/layout projection.
- `src/ui/dungeonView.js` owns the clickable Dungeon route graph plus quick stats and transcript HTML for the Dungeon estimate.

## State Notes

`state.mapContextMenu` is transient UI state. It records only the clicked dungeon ID and screen-relative menu position. It is normalized for runtime compatibility, but it is not a gameplay commitment and should not become a persisted campaign mechanic.

Repeated dungeon intent remains authoritative in `state.repeatedPlans`, one plan per party ID. Scheduled/running work remains authoritative in `state.operations`.

Dungeon graph UI state and conquest progress live under `state.progression.dungeonConquest[dungeonId]`. `plannedNodeIds` and `selectedNodeId` are UI/planning state. `clearedNodes`, `unlockedNodes`, `disabledModifiers`, and `nodeCostAdjustments` are gameplay progression state and only mutate when scheduled operations complete.
