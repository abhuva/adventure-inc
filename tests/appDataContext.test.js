import assert from "node:assert/strict";
import test from "node:test";

import { createAppDataContext } from "../src/app/appDataContext.js";

test("app data context stores and replaces loaded POI data", () => {
  const initialPoiData = { tavern: { id: "tavern" } };
  const nextPoiData = { dungeons: [{ id: "rat_cellar" }] };
  const context = createAppDataContext(initialPoiData);

  assert.equal(context.getPoiData(), initialPoiData);

  context.setPoiData(nextPoiData);

  assert.equal(context.getPoiData(), nextPoiData);
});

test("app data context defaults to no POI data", () => {
  const context = createAppDataContext();

  assert.equal(context.getPoiData(), null);
});
