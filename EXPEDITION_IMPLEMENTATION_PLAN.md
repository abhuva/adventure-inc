# Expedition Implementation Plan

## Backup

- [x] Commit current full repository state before implementation.

## Phase 1: Data And State Foundations

- [x] Add continent and expedition route definitions.
  - [x] Define `old_marches` as the starting continent.
  - [x] Define `ash_coast` as the first destination continent.
  - [x] Define `old_marches_to_ash_coast` as the first safe expedition route.
  - [x] Include route origin, destination, duration, costs, capacity, unlock day, hazard text, and map POI metadata.
- [x] Add initial world/continent state.
  - [x] Track focused continent.
  - [x] Track unlocked continents.
  - [x] Track unlocked expedition routes.
  - [x] Track active/completed expedition transfers.
  - [x] Track selected expedition route and selected continent in UI state.
- [x] Add save/load normalization for world and expedition state.
  - [x] Preserve backwards compatibility with existing saves.
  - [x] Persist pending arrival prompt state so arrivals survive reload.

## Phase 2: Expedition POI Unlock And Map Routing

- [x] Unlock the Expedition POI after day 7 for prototype testing.
  - [x] Add deterministic unlock logic to world progression.
  - [x] Log the unlock once.
- [x] Render the Expedition POI on the Map after unlock.
  - [x] Include it in visible map locations without treating it as a dungeon.
  - [x] Give it stable map coordinates.
- [x] Show Expedition POI details in the Map side panel.
  - [x] Display route name, destination, duration, cost, capacity, and hazards.
  - [x] Add a `run` button for expedition POIs.
- [x] Route Map `run` to the Expedition tab.
  - [x] Select the matching expedition route.
  - [x] Switch to the top-level Expedition tab.

## Phase 3: Expedition Tab

- [x] Add a new top-level `Expedition` tab.
  - [x] Add HTML panel and tab button.
  - [x] Add required DOM elements.
  - [x] Add tab activation support.
- [x] Render selected expedition information.
  - [x] Show origin, destination, duration, costs, route capacity, and hazards.
  - [x] Show readiness/validation messages.
- [x] Add party selection for the expedition.
  - [x] Reuse existing party select conventions.
  - [x] Show selected party members and states.
  - [x] Prevent invalid traveling/active/empty parties.
- [x] Add `start expedition`.
  - [x] Validate route unlock, resources, party location, party state, and capacity.
  - [x] Pay expedition costs from the current global resource pool.
  - [x] Create a deterministic transfer.

## Phase 4: Traveling Adventurers

- [x] Mark expedition members as traveling.
  - [x] Preserve hero records.
  - [x] Remove members from origin continent active use.
  - [x] Clear incompatible party assignments and focused hero selection.
- [x] Filter traveling heroes from normal local views.
  - [x] Hide them from Roster card lists.
  - [x] Exclude them from party selectors and dungeon/crafting/training eligibility.
  - [x] Show state as `Traveling` anywhere a historical reference remains visible.
- [x] Advance expedition transfers through deterministic time.
  - [x] Tick transfer elapsed time during time advancement.
  - [x] Complete transfer when elapsed hours reach route duration.

## Phase 5: Arrival Popup And Destination Unlock

- [x] Unlock the destination continent when the transfer arrives.
- [x] Station arriving heroes on the destination continent.
- [x] Show an arrival popup.
  - [x] Display destination and arriving party/heroes.
  - [x] Provide `switch to destination` action.
  - [x] Provide `stay on current continent` action.
- [x] Handle popup actions.
  - [x] Switching sets the focused continent to the destination.
  - [x] Staying leaves focus unchanged.
  - [x] Both actions clear the pending arrival prompt.

## Phase 6: Continent Tab

- [x] Add a new top-level `Continent` tab.
  - [x] Add HTML panel and tab button.
  - [x] Add required DOM elements.
  - [x] Add tab activation support.
- [x] Render continent switching controls.
  - [x] Show current focused continent.
  - [x] Show dropdown of unlocked continents.
  - [x] Show selected continent summary.
  - [x] Add `switch/focus` button.
- [x] Implement focus switching.
  - [x] Run deterministic catch-up placeholder for the destination.
  - [x] Set focused continent.
  - [x] Render updated local state.
  - [x] Log the focus switch.

## Phase 7: Tests And Validation

- [x] Add unit tests for expedition data and route lookup.
- [x] Add unit tests for day-7 Expedition POI unlock.
- [x] Add unit tests for starting an expedition transfer.
- [x] Add unit tests for transfer completion and arrival prompt state.
- [x] Add UI/render tests for Expedition and Continent panels.
- [x] Run `npm run check:js`.
- [x] Run `npm test`.
- [x] Update `AI_CONTEXT.md`.
- [x] Update `NEXT_SESSION_HANDOFF.md`.
