/**
 * AutoFormatter: Hierarchical & Grid Graph Layout Engine
 * Automatically positions nodes to eliminate overlaps, organize layers,
 * and minimize line crossings.
 */

export class AutoFormatter {
  static formatDiagram(nodes, connections, options = {}) {
    if (!nodes || nodes.length === 0) return nodes;

    const startX = options.startX || 100;
    const startY = options.startY || 120;
    const horizontalGap = options.horizontalGap || 320;
    const verticalGap = options.verticalGap || 220;

    // Create lookup maps
    const nodeMap = new Map();
    nodes.forEach(n => nodeMap.set(n.id, { ...n }));

    const inDegree = new Map();
    const outNeighbors = new Map();

    nodes.forEach(n => {
      inDegree.set(n.id, 0);
      outNeighbors.set(n.id, []);
    });

    connections.forEach(c => {
      if (nodeMap.has(c.sourceId) && nodeMap.has(c.targetId) && c.sourceId !== c.targetId) {
        inDegree.set(c.targetId, (inDegree.get(c.targetId) || 0) + 1);
        outNeighbors.get(c.sourceId).push(c.targetId);
      }
    });

    // Determine levels (layers) using BFS / Topological assignment
    const levels = new Map();
    const queue = [];

    // Find root nodes (inDegree === 0)
    nodes.forEach(n => {
      if (inDegree.get(n.id) === 0) {
        levels.set(n.id, 0);
        queue.push(n.id);
      }
    });

    // If cycle or no roots found, pick node with highest outgoing connections
    if (queue.length === 0 && nodes.length > 0) {
      let maxOut = -1;
      let rootCandidate = nodes[0].id;
      nodes.forEach(n => {
        const count = (outNeighbors.get(n.id) || []).length;
        if (count > maxOut) {
          maxOut = count;
          rootCandidate = n.id;
        }
      });
      levels.set(rootCandidate, 0);
      queue.push(rootCandidate);
    }

    // BFS Traversal to assign depth levels
    const visited = new Set();
    while (queue.length > 0) {
      const currId = queue.shift();
      if (visited.has(currId)) continue;
      visited.add(currId);

      const currLevel = levels.get(currId) || 0;
      const neighbors = outNeighbors.get(currId) || [];

      for (const targetId of neighbors) {
        const nextLevel = Math.max(levels.get(targetId) || 0, currLevel + 1);
        levels.set(targetId, nextLevel);
        if (!visited.has(targetId)) {
          queue.push(targetId);
        }
      }
    }

    // Any remaining unvisited nodes get assigned level based on existing layers or isolated grid
    let maxAssignedLevel = 0;
    levels.forEach(lvl => {
      if (lvl > maxAssignedLevel) maxAssignedLevel = lvl;
    });

    const unvisitedNodes = nodes.filter(n => !levels.has(n.id));
    unvisitedNodes.forEach((n, idx) => {
      levels.set(n.id, maxAssignedLevel + 1 + Math.floor(idx / 3));
    });

    // Group nodes by assigned level
    const layers = new Map();
    levels.forEach((lvl, nodeId) => {
      if (!layers.has(lvl)) layers.set(lvl, []);
      layers.get(lvl).push(nodeId);
    });

    // Calculate (x, y) coordinates per layer
    const sortedLevels = Array.from(layers.keys()).sort((a, b) => a - b);
    const updatedNodes = [];

    sortedLevels.forEach((lvlIndex, levelCol) => {
      const nodeIdsInLayer = layers.get(lvlIndex);
      const layerSize = nodeIdsInLayer.length;

      nodeIdsInLayer.forEach((nodeId, rowIdx) => {
        const originalNode = nodeMap.get(nodeId);
        
        // Calculate centered vertical offset
        const totalHeight = (layerSize - 1) * verticalGap;
        const x = startX + levelCol * horizontalGap;
        const y = startY + (rowIdx * verticalGap) - (totalHeight / 2) + 200;

        updatedNodes.push({
          ...originalNode,
          x: Math.round(x / 20) * 20, // Grid snap to 20px
          y: Math.max(40, Math.round(y / 20) * 20)
        });
      });
    });

    return updatedNodes;
  }
}
