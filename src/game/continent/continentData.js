export const CONTINENTS = [
  {
    id: "old_marches",
    name: "Old Marches",
    description: "The starting continent around the first tavern.",
    coord: { x: 1188, y: 346 },
    rules: ["standard dungeon pressure", "starter work sites", "safe local travel"]
  },
  {
    id: "ash_coast",
    name: "Ash Coast",
    description: "A harsher coast reached by chartered expedition. Starting dungeons are not suitable for fresh recruits.",
    coord: { x: 770, y: 196 },
    rules: ["harder baseline dungeons", "training expected before expeditions", "no starter dungeon safety net"]
  }
];

export const EXPEDITION_ROUTES = [
  {
    id: "old_marches_to_ash_coast",
    poiId: "expedition",
    poiName: "Expedition",
    name: "Ash Coast Charter",
    originContinentId: "old_marches",
    destinationContinentId: "ash_coast",
    unlockDay: 7,
    durationHours: 18 * 24,
    cost: { food: 40, coin: 120, planks: 20 },
    capacity: "party",
    hazards: "none",
    description: "A costly charter across the western waterline. The route is safe for the prototype, but it removes the chosen party from local operations until landfall.",
    coord: { x: 118, y: 828 }
  }
];

export function continentById(continentId) {
  return CONTINENTS.find((continent) => continent.id === continentId) || CONTINENTS[0];
}

export function expeditionRouteById(routeId) {
  return EXPEDITION_ROUTES.find((route) => route.id === routeId) || null;
}

export function expeditionRouteForPoi(poiId) {
  return EXPEDITION_ROUTES.find((route) => route.poiId === poiId) || null;
}
