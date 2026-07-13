import assert from "node:assert/strict";
import test from "node:test";

import {
  bindAppElements,
  REQUIRED_ELEMENT_IDS
} from "../src/app/domElements.js";

test("REQUIRED_ELEMENT_IDS includes core app surfaces", () => {
  assert.equal(REQUIRED_ELEMENT_IDS.includes("overlandMap"), true);
  assert.equal(REQUIRED_ELEMENT_IDS.includes("dungeonSelect"), true);
  assert.equal(REQUIRED_ELEMENT_IDS.includes("templeMatrix"), true);
  assert.equal(REQUIRED_ELEMENT_IDS.includes("blueprintRows"), true);
});

test("bindAppElements returns required elements by id", () => {
  const root = {
    getElementById(id) {
      return { id };
    }
  };

  const elements = bindAppElements(root);

  assert.equal(elements.dayLabel.id, "dayLabel");
  assert.equal(elements.replayTimelineSlider.id, "replayTimelineSlider");
});

test("bindAppElements throws when a required element is missing", () => {
  const root = {
    getElementById(id) {
      return id === "dayLabel" ? null : { id };
    }
  };

  assert.throws(
    () => bindAppElements(root),
    /Missing required DOM element: dayLabel/
  );
});
