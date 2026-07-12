# AI_CONTEXT.md

## Purpose

Fast handoff context for agents working in this repo. Read this before changing code.

## Product Intent

`adventure-inc` is a deterministic idle/incremental RPG-management prototype. The player starts with a tavern that attracts adventurers, recruits and develops a roster, sends parties into deterministic dungeon plans, converts solved plans into automation, and grows the tavern into a wider settlement economy.

The design intentionally rejects random drops, random stat rolls, and RNG combat. The strategic challenge should come from planning, resource constraints, build choices, blueprint unlocks, and deterministic puzzle-like dungeon resolution.

## Current Architecture Baseline

- Entry point: `index.html`.
- Styling: `styles.css`.
- Runtime/gameplay owner: `src/app.js`.
- No dependencies, build step, bundler, framework, or persistence layer currently exists.
- POI data lives in `assets/data/poi.json` and is loaded with `fetch()` during startup.
- State is held in one in-memory `state` object in `src/app.js`.
- Rendering is DOM-driven through explicit `render*()` functions.
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
  - shard definitions currently live in `src/app.js`
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
- `simulateRun()` is the central deterministic planner and also produces combat replay timelines.
- `partyStats()` aggregates member stats for the current first-slice party combat model.
- `resolveNode()` dispatches hazard/check/combat node rules.
- `resolveCombat()` owns deterministic actor-timeline combat for inspection replay and final estimate output.
- `applyEstimate()` turns a cached plan into actual state changes.
- `scheduleEstimate()` queues a party operation and pays food up front.
- Manual Dungeon Planner assignments stop that party's repeated plan before queueing the new assignment; active operations are not cancelled.
- Map-side dungeon assignment creates/replaces a repeated route for the selected party and queues it through `ensureRepeatedPlanQueued()`.
- Party assignments require a non-empty party, sufficient food, and if no current operation exists the party must be in town and fully healed. If the party is already on an operation, the new assignment queues behind it and starts after recovery.
- `repeatedPlans` stores one endless automation plan per party.
- `ensureRepeatedPlanQueued()` keeps repeated plans to one queued/running operation per party.
- `advanceTime()` is the hour-tick owner for workers, party operations, daily rollover, and rendering.
- `currentOperationPhase()` resolves queued/outbound/dungeon/return/regeneration phase state for map rendering.
- `characterState()` derives visible roster state from scheduled party operations: Idle, Queued, Walking to dungeon, Fighting, Walking home, or Recovering.
- `applyRewards()` separates inventory resources from progression values like fame, XP, and blueprints.
- `heroStats()` is the current derived-stat owner and includes level, build, and gear.
- `templeBonuses()` resolves equipped shard color effects from the selected Ritual Stone's active socket/line influence colors, then applies stone modifiers. `partyStats()` consumes party-facing Temple bonuses.
- `recordShardProgress()` is called from `completeEstimate()` and owns deterministic shard visit/boss counters.
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

- No save/load yet.
- Multi-character party combat is aggregate-stat based only; per-character tactics and damage allocation are not implemented yet.
- No building-specific incremental mechanics beyond basic tavern production.
- No map or graphical dungeon view yet.
- No item affixes, random drops, or randomized crafting.
- No background real-time idle loop yet.
- No freeform map navigation or graphical terrain yet.
- No backend.

## Likely Next Systems

1. Extract gameplay data into data files or owner modules once rules grow beyond the first slice.
2. Add save/load through local storage with versioned state.
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
node --check src\app.js
```

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
