import { isLocationUnlocked } from "../game/progression/worldProgression.js";

export function dungeonsFromPoi(poiData) {
  return poiData?.dungeons || [];
}

export function visibleDungeonsFromPoi(poiData, state) {
  return dungeonsFromPoi(poiData).filter((dungeon) => isLocationUnlocked(state, dungeon.id));
}

export function workSitesFromPoi(poiData) {
  return poiData?.workSites || [];
}

export function visibleWorkSitesFromPoi(poiData, state) {
  return workSitesFromPoi(poiData).filter((site) => isLocationUnlocked(state, site.id));
}

export function workSiteById(poiData, id) {
  return workSitesFromPoi(poiData).find((site) => site.id === id);
}

export function tavernCoordFromPoi(poiData) {
  return poiData?.tavern?.coord || { x: 0, y: 0 };
}

export function mapLocationsFromPoi(poiData) {
  if (!poiData?.tavern) return [];
  return [
    { ...poiData.tavern, type: "tavern" },
    ...workSitesFromPoi(poiData).map((site) => ({
      ...site,
      type: "work",
      description: site.description || `Worker route. Completes a deterministic delivery every ${site.cycleHours} worker-hours.`
    })),
    ...dungeonsFromPoi(poiData).map((dungeon) => ({
      id: dungeon.id,
      name: dungeon.name,
      titleImage: dungeon.titleImage,
      coord: dungeon.coord,
      type: "dungeon",
      dungeon,
      description: dungeon.description || `Dungeon POI. Travel ${dungeon.travelHours}h each way, food cost ${dungeon.foodCost}.`
    }))
  ];
}

export function visibleMapLocationsFromPoi(poiData, state) {
  if (!poiData?.tavern) return [];
  return [
    { ...poiData.tavern, type: "tavern" },
    ...visibleWorkSitesFromPoi(poiData, state).map((site) => ({
      ...site,
      type: "work",
      description: site.description || `Worker route. Completes a deterministic delivery every ${site.cycleHours} worker-hours.`
    })),
    ...visibleDungeonsFromPoi(poiData, state).map((dungeon) => ({
      id: dungeon.id,
      name: dungeon.name,
      titleImage: dungeon.titleImage,
      coord: dungeon.coord,
      type: "dungeon",
      dungeon,
      description: dungeon.description || `Dungeon POI. Travel ${dungeon.travelHours}h each way, food cost ${dungeon.foodCost}.`
    }))
  ];
}

export function selectedLocationFromPoi(poiData, selectedLocationId) {
  const locations = mapLocationsFromPoi(poiData);
  return locations.find((location) => location.id === selectedLocationId) || locations[0] || null;
}

export function visibleSelectedLocationFromPoi(poiData, state, selectedLocationId) {
  const locations = visibleMapLocationsFromPoi(poiData, state);
  return locations.find((location) => location.id === selectedLocationId) || locations[0] || null;
}
