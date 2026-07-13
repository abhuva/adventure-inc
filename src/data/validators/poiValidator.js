export function validatePoiData(data) {
  if (!data || !data.tavern || !Array.isArray(data.workSites) || !Array.isArray(data.dungeons)) {
    throw new Error("invalid POI data shape");
  }
  if (!data.tavern.coord || typeof data.tavern.coord.x !== "number" || typeof data.tavern.coord.y !== "number") {
    throw new Error("invalid tavern coordinate");
  }
}
