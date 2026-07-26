import { progressionGraphBounds } from "../game/progression/progressionGraphModel.js";

export function progressionGraphHtml({
  graph,
  state,
  canSpendNode,
  nodeLabel = (node) => node.name,
  nodeDetailHtml = () => "",
  actionAttribute = "data-progression-node"
}) {
  const bounds = progressionGraphBounds(graph);
  const widthSteps = Math.max(1, bounds.maxX);
  const heightSteps = Math.max(1, bounds.maxY);
  const nodePosition = (node) => ({
    x: 12 + ((node.x || 0) / widthSteps) * 76,
    y: 12 + ((node.y || 0) / heightSteps) * 76
  });
  return `
    <div class="progression-graph" style="--graph-rows:${heightSteps + 1}">
      <svg class="progression-link-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        ${graph.links.map((link) => progressionGraphLinkHtml({ graph, link, nodePosition })).join("")}
      </svg>
      ${Object.values(graph.nodes).map((node) => progressionGraphNodeHtml({
        node,
        rank: (state.points && state.points[node.id]) || 0,
        canSpend: canSpendNode(node.id),
        label: nodeLabel(node),
        detailHtml: nodeDetailHtml(node),
        position: nodePosition(node),
        actionAttribute
      })).join("")}
    </div>
  `;
}

function progressionGraphLinkHtml({ graph, link, nodePosition }) {
  const from = graph.nodes[link.from];
  const to = graph.nodes[link.to];
  if (!from || !to) return "";
  const a = nodePosition(from);
  const b = nodePosition(to);
  return `<line class="progression-link" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"></line>`;
}

function progressionGraphNodeHtml({ node, rank, canSpend, label, detailHtml, position, actionAttribute }) {
  const classes = [
    "skill-node",
    "progression-node",
    rank > 0 ? "learned" : "",
    rank >= node.maxRank ? "maxed" : "",
    canSpend.ok ? "available" : "locked"
  ].filter(Boolean).join(" ");
  const wrapClasses = [
    "progression-node-wrap",
    position.x >= 58 ? "detail-left" : ""
  ].filter(Boolean).join(" ");
  return `
    <span class="${wrapClasses}" style="left:${position.x}%;top:${position.y}%;">
      <button class="${classes}" ${actionAttribute}="${node.id}" ${canSpend.ok ? "" : "disabled"} aria-label="${node.name}: ${canSpend.reason}">
        <span class="progression-node-icon">${node.icon || node.category.slice(0, 2).toUpperCase()}</span>
        <span class="progression-node-rank">${rank}/${node.maxRank}</span>
        <span class="progression-node-label">${label}</span>
      </button>
      ${detailHtml}
    </span>
  `;
}
