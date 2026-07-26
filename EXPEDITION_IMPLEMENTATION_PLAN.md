# Expedition Implementation Plan

## Backup

- [ ] Commit current full repository state before implementation.

## Phase 1: Data And State Foundations

- [ ] Add continent and expedition route definitions.
  - [ ] Define `old_marches` as the starting continent.
  - [ ] Define `ash_coast` as the first destination continent.
  - [ ] Define `old_marches_to_ash_coast` as the first safe expedition route.
  - [ ] Include route origin, destination, duration, costs, capacity, unlock day, hazard text, and map POI metadata.
- [ ] Add initial world/continent state.
  - [ ] Track focused continent.
  - [ ] Track unlocked continents.
  - [ ] Track unlocked expedition routes.
  - [ ] Track active/completed expedition transfers.
  - [ ] Track selected expedition route and selected continent in UI state.
- [ ] Add save/load normalization for world and expedition state.
  - [ ] Preserve backwards compatibility with existing saves.
  - [ ] Exclude transient popup-only state from persistence unless it must survive reload.

## Phase 2: Expedition POI Unlock And Map Routing

- [ ] Unlock the Expedition POI after day 7 for prototype testing.
  - [ ] Add deterministic unlock logic to world progression.
  - [ ] Log the unlock once.
- [ ] Render the Expedition POI on the Map after unlock.
  - [ ] Include it in visible map locations without treating it as a dungeon.
  - [ ] Give it stable map coordinates.
- [ ] Show Expedition POI details in the Map side panel.
  - [ ] Display route name, destination, duration, cost, capacity, and hazards.
  - [ ] Add a `run` button for expedition POIs.
- [ ] Route Map `run` to the Expedition tab.
  - [ ] Select the matching expedition route.
  - [ ] Switch to the top-level Expedition tab.

## Phase 3: Expedition Tab

- [ ] Add a new top-level `Expedition` tab.
  - [ ] Add HTML panel and tab button.
  - [ ] Add required DOM elements.
  - [ ] Add tab activation support.
- [ ] Render selected expedition information.
  - [ ] Show origin, destination, duration, costs, route capacity, and hazards.
  - [ ] Show readiness/validation messages.
- [ ] Add party selection for the expedition.
  - [ ] Reuse existing party select conventions.
  - [ ] Show selected party members and states.
  - [ ] Prevent invalid traveling/active/empty parties.
- [ ] Add `start expedition`.
  - [ ] Validate route unlock, resources, party location, party state, and capacity.
  - [ ] Pay expedition costs from the origin continent resources.
  - [ ] Create a deterministic transfer.

## Phase 4: Traveling Adventurers

- [ ] Mark expedition members as traveling.
  - [ ] Preserve hero records.
  - [ ] Remove members from origin continent active use.
  - [ ] Clear incompatible party assignments and focused hero selection.
- [ ] Filter traveling heroes from normal local views.
  - [ ] Hide them from Roster card lists.
  - [ ] Exclude them from party selectors and dungeon/crafting/training eligibility.
  - [ ] Show state as `Traveling` anywhere a historical reference remains visible.
- [ ] Advance expedition transfers through deterministic time.
  - [ ] Tick transfer elapsed time during time advancement.
  - [ ] Complete transfer when elapsed hours reach route duration.

## Phase 5: Arrival Popup And Destination Unlock

- [ ] Unlock the destination continent when the transfer arrives.
- [ ] Station arriving heroes on the destination continent.
- [ ] Show an arrival popup.
  - [ ] Display destination and arriving party/heroes.
  - [ ] Provide `switch to destination` action.
  - [ ] Provide `stay on current continent` action.
- [ ] Handle popup actions.
  - [ ] Switching sets the focused continent to the destination.
  - [ ] Staying leaves focus unchanged.
  - [ ] Both actions clear the pending arrival prompt.

## Phase 6: Continent Tab

- [ ] Add a new top-level `Continent` tab.
  - [ ] Add HTML panel and tab button.
  - [ ] Add required DOM elements.
  - [ ] Add tab activation support.
- [ ] Render continent switching controls.
  - [ ] Show current focused continent.
  - [ ] Show dropdown of unlocked continents.
  - [ ] Show selected continent summary.
  - [ ] Add `switch/focus` button.
- [ ] Implement focus switching.
  - [ ] Run deterministic catch-up placeholder for the destination.
  - [ ] Set focused continent.
  - [ ] Render updated local state.
  - [ ] Log the focus switch.

## Phase 7: Tests And Validation

- [ ] Add unit tests for expedition data and route lookup.
- [ ] Add unit tests for day-7 Expedition POI unlock.
- [ ] Add unit tests for starting an expedition transfer.
- [ ] Add unit tests for transfer completion and arrival prompt state.
- [ ] Add UI/render tests for Expedition and Continent panels.
- [ ] Run `npm run check:js`.
- [ ] Run `npm test`.
- [ ] Update `AI_CONTEXT.md`.
- [ ] Update `NEXT_SESSION_HANDOFF.md`.
