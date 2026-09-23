/**
 * Calculates anchor point coordinates and SVG path strings
 * for one-way, two-way, dotted, and solid connection lines.
 */

export class PathRouter {
  static getAnchorCoordinates(node, anchorType) {
    const { x, y, width, height } = node;
    switch (anchorType) {
      case 'top':
        return { x: x + width / 2, y, dir: 'up' };
      case 'right':
        return { x: x + width, y: y + height / 2, dir: 'right' };
      case 'bottom':
        return { x: x + width / 2, y: y + height, dir: 'down' };
      case 'left':
        return { x, y: y + height / 2, dir: 'left' };
      default: { // Auto calculation
        return { x: x + width / 2, y: y + height / 2, dir: 'center' };
      }
    }
  }

  static getBestAnchors(sourceNode, targetNode, preferredSource = 'auto', preferredTarget = 'auto') {
    const anchors = ['top', 'right', 'bottom', 'left'];

    if (preferredSource !== 'auto' && preferredTarget !== 'auto') {
      return {
        source: this.getAnchorCoordinates(sourceNode, preferredSource),
        target: this.getAnchorCoordinates(targetNode, preferredTarget)
      };
    }

    let minDistance = Infinity;
    let bestPair = {
      source: this.getAnchorCoordinates(sourceNode, 'right'),
      target: this.getAnchorCoordinates(targetNode, 'left')
    };

    const sCandidates = preferredSource !== 'auto' ? [preferredSource] : anchors;
    const tCandidates = preferredTarget !== 'auto' ? [preferredTarget] : anchors;

    for (const sA of sCandidates) {
      const sPt = this.getAnchorCoordinates(sourceNode, sA);
      for (const tA of tCandidates) {
        const tPt = this.getAnchorCoordinates(targetNode, tA);
        const dist = Math.hypot(tPt.x - sPt.x, tPt.y - sPt.y);
        if (dist < minDistance) {
          minDistance = dist;
          bestPair = { source: sPt, target: tPt };
        }
      }
    }

    return bestPair;
  }

  static generatePathD(sourcePt, targetPt, lineStyle = 'curved') {
    const { x: x1, y: y1 } = sourcePt;
    const { x: x2, y: y2 } = targetPt;

    if (lineStyle === 'straight') {
      return `M ${x1} ${y1} L ${x2} ${y2}`;
    }

    if (lineStyle === 'orthogonal') {
      const midX = (x1 + x2) / 2;
      return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
    }

    // Smooth Bezier Curve (default)
    const dx = Math.abs(x2 - x1) * 0.45;
    const dy = Math.abs(y2 - y1) * 0.45;
    
    let cpx1 = x1;
    let cpy1 = y1;
    let cpx2 = x2;
    let cpy2 = y2;

    if (sourcePt.dir === 'right') cpx1 += dx;
    else if (sourcePt.dir === 'left') cpx1 -= dx;
    else if (sourcePt.dir === 'down') cpy1 += dy;
    else if (sourcePt.dir === 'up') cpy1 -= dy;
    else cpx1 += dx;

    if (targetPt.dir === 'right') cpx2 += dx;
    else if (targetPt.dir === 'left') cpx2 -= dx;
    else if (targetPt.dir === 'down') cpy2 += dy;
    else if (targetPt.dir === 'up') cpy2 -= dy;
    else cpx2 -= dx;

    return `M ${x1} ${y1} C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${x2} ${y2}`;
  }

  static getMidpoint(sourcePt, targetPt) {
    return {
      x: (sourcePt.x + targetPt.x) / 2,
      y: (sourcePt.y + targetPt.y) / 2
    };
  }
}
