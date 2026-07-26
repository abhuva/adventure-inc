export function normalizeProgressionGraph(definition) {
  const nodes = Object.fromEntries(
    Object.entries(definition.nodes || {}).map(([nodeId, node]) => [
      nodeId,
      {
        id: node.id || nodeId,
        name: node.name || nodeId,
        category: node.category || "utility",
        maxRank: Math.max(1, Number(node.maxRank || 1)),
        requires: Array.isArray(node.requires) ? [...node.requires] : [],
        effects: Array.isArray(node.effects) ? [...node.effects] : [],
        costPerRank: Math.max(1, Number(node.costPerRank || 1)),
        icon: node.icon || "",
        x: Number.isFinite(node.x) ? node.x : null,
        y: Number.isFinite(node.y) ? node.y : null
      }
    ])
  );
  return {
    id: definition.id,
    name: definition.name || definition.id,
    type: definition.type || "progression",
    nodes,
    links: Array.isArray(definition.links) ? definition.links.map(normalizeLink) : linksFromRequirements(nodes)
  };
}

export function graphFromLinearTree({ id, name, skillIds, skills, type = "characterSkillTree" }) {
  const depthById = {};
  const siblingIndexByDepth = {};
  function depthOf(skillId, visiting = new Set()) {
    if (depthById[skillId] !== undefined) return depthById[skillId];
    if (visiting.has(skillId)) return 0;
    visiting.add(skillId);
    const requires = skills[skillId]?.requires || [];
    const depth = requires.length ? Math.max(...requires.map((requiredId) => depthOf(requiredId, visiting))) + 1 : 0;
    depthById[skillId] = depth;
    visiting.delete(skillId);
    return depth;
  }
  const nodes = {};
  skillIds.forEach((skillId) => {
    const skill = skills[skillId];
    if (!skill) return;
    const y = depthOf(skillId);
    const x = siblingIndexByDepth[y] || 0;
    siblingIndexByDepth[y] = x + 1;
    nodes[skillId] = {
      id: skillId,
      name: skill.name,
      category: skill.category,
      maxRank: skill.maxRank,
      requires: skill.requires,
      effects: skill.effects,
      costPerRank: skill.costPerRank,
      x,
      y
    };
  });
  return normalizeProgressionGraph({ id, name, type, nodes });
}

export function progressionGraphBounds(graph) {
  const nodes = Object.values(graph.nodes);
  return {
    maxX: Math.max(0, ...nodes.map((node) => node.x || 0)),
    maxY: Math.max(0, ...nodes.map((node) => node.y || 0))
  };
}

function normalizeLink(link) {
  if (Array.isArray(link)) return { from: link[0], to: link[1] };
  return { from: link.from, to: link.to };
}

function linksFromRequirements(nodes) {
  return Object.values(nodes).flatMap((node) => node.requires.map((requiredId) => ({ from: requiredId, to: node.id })));
}
