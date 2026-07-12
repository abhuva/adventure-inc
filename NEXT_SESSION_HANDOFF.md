# Next Session Handoff

## Scope

- Project: `adventure-inc`.
- Current implementation: first static HTML/CSS/JS prototype.
- Root context starts with `AI_CONTEXT.md`.
- Adventurer skill design is documented in `docs/adventurer-skill-design.md`.
- Temple shard design is documented in `docs/temple-shard-design.md`.
- Dungeon combat replay design is documented in `docs/dungeon-combat-replay-design.md`.
- No git repository was present when this handoff was created.

## Implemented State

- Added `index.html`, `styles.css`, and `src/app.js`.
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
- `src/app.js` is currently monolithic but intentionally explicit for prototype readability.
- `simulateRun()` previews outcomes without mutating state.
- `scheduleEstimate()` pays food and queues party operations for the estimate party snapshot.
- Manual Dungeon Planner assignments stop the party's repeated plan before queueing the new action, but do not cancel active operations.
- Map-side dungeon assignment creates/replaces the party's repeated route and queues the first run when possible.
- Party assignments require non-empty party, enough food, and full health when starting from town; assignments can queue behind an active operation and start after it fully completes.
- `repeatedPlans` stores endless automation by party ID.
- `ensureRepeatedPlanQueued()` requeues repeated party operations when no operation for that party is active.
- `characterState()` derives roster states from operation phases.
- `partyStats()` aggregates member HP/ATK/DEF/utility for the current combat prototype.
- `resolveCombat()` now uses per-actor deterministic timeline combat for estimates and replay events.
- `base.hp` is level-1 max HP; level bonus HP starts at level 2 to avoid new characters starting below max HP.
- `advanceTime()` advances worker cycles, party operations, and day rollover.
- Completed party operations mutate resources, XP, fame, blueprints, and hero HP.
- Completed party operations also update Temple shard visit/boss counters and award due shard XP.
- Automation depends on a cached simulation result and does not recompute every combat step for each replay.

## Validation To Run

```powershell
node --check src\app.js
```

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

1. Add localStorage save/load with a versioned schema.
2. Extract dungeons, blueprints, visitors, and initial state into separate data modules.
3. Expand per-character combat from prototype strategy actions into authored skill/action-plan data.
4. Replace global strategy presets with per-character action-plan rules.
5. Add a first building module beyond the tavern, such as Blacksmith or University.
6. Add skill refund/respec and secondary-job multiclass selection.
7. Improve automation display into explicit phases: outbound travel, dungeon run, return travel, regeneration.
8. Move shard definitions into a data file once the Temple shape stabilizes.
9. Replace percentage-coordinate map placeholders with a stronger POI layout and route-duration model.
