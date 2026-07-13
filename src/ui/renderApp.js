export const DEFAULT_RENDER_ORDER = [
  "header",
  "map",
  "visitors",
  "jobs",
  "parties",
  "roster",
  "dungeon",
  "temple",
  "systems"
];

export function renderAppSections(renderers, order = DEFAULT_RENDER_ORDER) {
  order.forEach((key) => {
    const renderer = renderers[key];
    if (typeof renderer !== "function") {
      throw new Error(`missing renderer: ${key}`);
    }
    renderer();
  });
}
