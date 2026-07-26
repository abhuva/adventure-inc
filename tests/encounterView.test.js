import assert from "node:assert/strict";
import test from "node:test";

import { encounterPanelHtml } from "../src/ui/encounterView.js";

test("encounterPanelHtml renders event body and actions", () => {
  const html = encounterPanelHtml({
    id: "tutorial.test",
    title: "Test <Title>",
    category: "Tutorial",
    body: ["Line one", "Line two"],
    actions: [
      { id: "close", label: "continue", kind: "close" },
      { id: "map", label: "open map", kind: "tab", tabId: "map" }
    ]
  });

  assert.match(html, /role="dialog"/);
  assert.match(html, /Test &lt;Title&gt;/);
  assert.match(html, /Line one/);
  assert.match(html, /data-encounter-action="close"/);
  assert.match(html, /open map/);
});

test("encounterPanelHtml returns empty markup without an event", () => {
  assert.equal(encounterPanelHtml(null), "");
});
