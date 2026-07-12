# AGENTS.md

Always read `AI_CONTEXT.md` first. Use `NEXT_SESSION_HANDOFF.md` for the current session state, validation notes, and likely next work.

Adventurer race/job/skill design lives in `docs/adventurer-skill-design.md`.
Temple shard design lives in `docs/temple-shard-design.md`.
Dungeon combat replay design lives in `docs/dungeon-combat-replay-design.md`.

## Project Goal

Build a self-contained browser prototype for `adventure-inc`: a deterministic idle/incremental RPG and management game where a tavern recruits adventurers, sends them into deterministic dungeon plans, converts solved plans into automation, and grows into a settlement economy.

Core prototype pillars:

- deterministic dungeon resolution with no random drops, rolls, or stat variance
- tavern and population management as the first base layer
- adventurer roster growth, leveling, skill choices, and build experimentation
- party formation with multiple characters per group
- blueprint-driven crafting and progression
- Temple shard setups with limited color sockets, connection lines, deterministic drops, and deterministic shard XP
- dense dev-tool UI made from text, tables, buttons, and logs
- tabbed management screens with a simple coordinate-based operations map

## Technical Direction

- Runtime: plain HTML, CSS, and JavaScript.
- No game engine and no framework unless the user explicitly changes direction.
- Keep the prototype static-file friendly; it should run by opening `index.html` or serving the folder.
- Prefer explicit state objects and pure-ish resolver functions for deterministic systems.
- Keep simulation rules inspectable in code; avoid hidden timers or random sources.
- Time advancement may be automatic, but gameplay outcomes must still be deterministic and tick-driven.

## Working Agreement

- Preserve user changes. Do not revert unrelated edits.
- Keep dependencies minimal; add none for this first prototype unless clearly justified.
- Prefer small, testable increments over rewrites.
- Update `AI_CONTEXT.md` when changing architecture, data ownership, UI contracts, save/load behavior, automation, combat resolution, or major gameplay systems.
- Update `NEXT_SESSION_HANDOFF.md` at the end of substantial work.
- If the repo becomes a git repository later, do not commit, push, or create PRs unless explicitly asked.

## UI Direction

- Use a dev-tool / operations-console aesthetic.
- Small monospace type, square controls, dense tables, compact logs.
- Avoid hero cards, marketing-style landing pages, rounded card layouts, or decorative fantasy UI.
- Text-first is acceptable and preferred until mechanics are stable.
- Use top tabs for primary screens instead of showing all management panels at once.
- The map is a visualization surface for operations, not a replacement for management screens.
- Mobile support should keep the page usable, but desktop density is the primary target.

## Determinism Rules

- Do not use `Math.random()` for gameplay outcomes.
- Dungeon results must derive from party state, selected route/stop point, strategy, enemy scripts, and resource state.
- Roster UI should expose character State and party membership instead of a single Active character flag.
- Automation is manual or repeated. Repeated means endless requeue for that party while resources allow, not a fixed repeat count.
- Drops are not random. Rewards are fixed resources, fame, XP, and blueprints.
- Crafting produces known outputs from known costs; item stats must not roll.

## Current File Layout

- `index.html`: static document and UI structure.
- `styles.css`: dense dev-tool visual language.
- `src/app.js`: current state model, deterministic dungeon resolver, tavern loop, roster, crafting, and rendering.
- `AI_CONTEXT.md`: current architecture and gameplay context for future sessions.
- `NEXT_SESSION_HANDOFF.md`: current state and likely next work.

## Common Validation

Use quick checks after JavaScript changes:

```powershell
node --check src\app.js
```

For browser behavior, run a local static server if needed:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080/`.
