import { validatePoiData } from "./validators/poiValidator.js";

export async function loadPoiData(path = "assets/data/poi.json") {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`${path} ${response.status}`);
  }
  const data = await response.json();
  validatePoiData(data);
  return data;
}
