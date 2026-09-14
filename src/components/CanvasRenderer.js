import { PathRouter } from '../core/PathRouter.js';

export class CanvasRenderer {
  constructor(container, store) {
    this.container = container;
    this.store = store;

    // Interaction state
    this.isPanning = false;
    this.panStart = { x: 0, y: 0 };
    
    this.draggingNode = null;
    this.nodeDragOffset = { x: 0, y: 0 };

    this.connectingFrom = null; // { nodeId, anchorType, startX, startY }
    this.mouseWorldPos = { x: 0, y: 0 };

    this.render();
    this.attachCanvasEvents();
    this.store.subscribe(() => this.updateDiagram());
  }

  render() {
    this.container.innerHTML = `
      <div id="canvas-wrapper" class="relative flex-1 w-full h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 canvas-grid cursor-grab active:cursor-grabbing">
        
        <!-- World Pan/Zoom Container -->
        <div id="canvas-world" class="absolute inset-0 origin-top-left transform-gpu transition-transform duration-75">
          
          <!-- SVG Layer for Connection Lines -->
          <svg id="svg-layer" class="absolute inset-0 w-[5000px] h-[5000px] pointer-events-none overflow-visible z-10">
            <defs>
              <!-- Arrow End Marker -->
              <marker id="marker-arrow-end" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b"/>
              </marker>

              <!-- Arrow Start Marker -->
              <marker id="marker-arrow-start" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 10 1 L 0 5 L 10 9 z" fill="#64748b"/>
              </marker>

              <!-- Selected Arrow End Marker -->
              <marker id="marker-arrow-selected-end" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#ec4899"/>
              </marker>

              <!-- Selected Arrow Start Marker -->
              <marker id="marker-arrow-selected-start" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                <path d="M 10 1 L 0 5 L 10 9 z" fill="#ec4899"/>
              </marker>

              <!-- Draft Connecting Line Marker -->
              <marker id="marker-arrow-draft" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
              </marker>
            </defs>

            <!-- Active Connection Paths Group -->
            <g id="connections-group"></g>

            <!-- Live Draft Dragging Line -->
            <path id="draft-connection-path" d="" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="4 4" marker-end="url(#marker-arrow-draft)" class="hidden pointer-events-none" />
          </svg>

          <!-- HTML Layer for Graph Nodes -->
          <div id="nodes-layer" class="nodes-layer absolute inset-0 w-[5000px] h-[5000px] pointer-events-none z-20"></div>

        </div>

        <!-- Floating Canvas Controls Overlay (Bottom-left) -->
        <div class="absolute bottom-6 left-6 z-30 flex items-center gap-2 glass-panel p-2 rounded-xl border border-slate-800 shadow-xl">
          <button id="btn-zoom-in" class="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition" title="Zoom In">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
          </button>
          <span id="zoom-level-text" class="text-xs font-mono text-slate-400 px-1 font-semibold">100%</span>
          <button id="btn-zoom-out" class="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition" title="Zoom Out">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
            </svg>
          </button>
          <div class="h-4 w-px bg-slate-800 mx-1"></div>
          <button id="btn-reset-view" class="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition text-xs font-medium" title="Reset View">
            Reset
          </button>
          <button id="btn-toggle-grid" class="p-2 text-indigo-400 hover:bg-slate-800 rounded-lg transition text-xs font-medium" title="Toggle Grid Snap">
            Snap: On
          </button>
        </div>

      </div>
    `;

    this.worldEl = this.container.querySelector('#canvas-world');
    this.nodesLayer = this.container.querySelector('#nodes-layer');
    this.connectionsGroup = this.container.querySelector('#connections-group');
    this.draftPathEl = this.container.querySelector('#draft-connection-path');

    this.updateDiagram();
  }

  screenToWorld(screenX, screenY) {
    const rect = this.container.querySelector('#canvas-wrapper').getBoundingClientRect();
    return {
      x: (screenX - rect.left - this.store.panX) / this.store.zoom,
      y: (screenY - rect.top - this.store.panY) / this.store.zoom
    };
  }

  updateWorldTransform() {
    this.worldEl.style.transform = `translate(${this.store.panX}px, ${this.store.panY}px) scale(${this.store.zoom})`;
    const zoomText = this.container.querySelector('#zoom-level-text');
    if (zoomText) zoomText.textContent = `${Math.round(this.store.zoom * 100)}%`;
  }

  updateDiagram() {
    this.updateWorldTransform();
    this.renderNodes();
    this.renderConnections();
  }

  renderNodes() {
    this.nodesLayer.innerHTML = '';
    const filter = this.store.priorityFilter.trim().toUpperCase();

    this.store.nodes.forEach(node => {
      const matchesFilter = !filter || node.priority.includes(filter);
      const isSelected = this.store.selectedNodeId === node.id;

      const nodeEl = document.createElement('div');
      nodeEl.dataset.id = node.id;
      nodeEl.style.left = `${node.x}px`;
      nodeEl.style.top = `${node.y}px`;
      nodeEl.style.width = `${node.width}px`;
      nodeEl.style.backgroundColor = node.color || '#1e293b';
      nodeEl.style.borderColor = node.borderColor || '#3b82f6';
      
      let classNames = `uml-node pointer-events-auto border-2 ${node.shape ? 'shape-' + node.shape : 'shape-rounded'}`;
      if (isSelected) classNames += ' selected';
      if (!matchesFilter) classNames += ' opacity-30 grayscale';
      nodeEl.className = classNames;

      nodeEl.innerHTML = `
        <!-- Directional Anchor Ports -->
        <div class="anchor-port anchor-top" data-anchor="top" title="Drag to Connect (Top)"></div>
        <div class="anchor-port anchor-right" data-anchor="right" title="Drag to Connect (Right)"></div>
        <div class="anchor-port anchor-bottom" data-anchor="bottom" title="Drag to Connect (Bottom)"></div>
        <div class="anchor-port anchor-left" data-anchor="left" title="Drag to Connect (Left)"></div>

        <div class="node-inner p-3 flex flex-col gap-2">
          <!-- Top Row: Priority Input Badge + Actions -->
          <div class="flex items-center justify-between gap-2 border-b border-slate-700/50 pb-2">
            <div class="flex items-center gap-1.5" title="Priority Code (3 Chars Max)">
              <span class="text-[10px] uppercase font-bold text-slate-400">Prio:</span>
              <input type="text" maxlength="3" value="${node.priority}" 
                class="priority-input-node text-xs font-mono font-bold text-yellow-300 bg-slate-900/90 border border-yellow-500/40 rounded px-1.5 py-0.5 text-center w-12 outline-none uppercase focus:border-yellow-400" 
                data-node-id="${node.id}" />
            </div>
            
            <span class="text-[10px] font-mono text-slate-500">${node.id.replace('node_', '#')}</span>
          </div>

          <!-- Title (Double click to edit) -->
          <h4 class="node-editable-title font-bold text-sm text-slate-100 leading-tight tracking-tight break-words cursor-text select-text" 
              title="Double click to edit title" data-field="title">${node.title}</h4>

          <!-- Image Attachment (If Present) -->
          ${node.imageUrl ? `
            <div class="rounded-lg overflow-hidden border border-slate-700/80 bg-slate-950/80 max-h-36 flex items-center justify-center p-1">
              <img src="${node.imageUrl}" class="object-contain max-h-32 rounded w-full" alt="Node image" />
            </div>
          ` : ''}

          <!-- Description (Double click to edit) -->
          <p class="node-editable-desc text-xs text-slate-300 leading-normal break-words cursor-text select-text" 
             title="Double click to edit description" data-field="description">${node.description}</p>

          <!-- UML Class Attributes / Methods Format if UML Shape -->
          ${node.shape === 'uml-class' ? `
            <div class="mt-1 pt-1 border-t border-slate-700 text-[11px] font-mono text-indigo-300 space-y-0.5">
              ${(node.attributes || []).map(attr => `<div>${attr}</div>`).join('')}
              ${(node.methods || []).map(m => `<div class="text-emerald-300">${m}</div>`).join('')}
            </div>
          ` : ''}
        </div>
      `;

      this.attachNodeElementEvents(nodeEl, node);
      this.nodesLayer.appendChild(nodeEl);
    });
  }

  attachNodeElementEvents(nodeEl, node) {
    // 1. Mouse Drag & Hold on Node (Press-Hold-Move-Release)
    nodeEl.addEventListener('pointerdown', (e) => {
      // Ignore if clicking anchor port, priority input, or active contenteditable
      if (e.target.classList.contains('anchor-port') || 
          e.target.tagName === 'INPUT' || 
          e.target.isContentEditable) {
        return;
      }

      e.stopPropagation();
      this.store.selectNode(node.id);

      // Start drag interaction
      this.draggingNode = node;
      const worldPos = this.screenToWorld(e.clientX, e.clientY);
      this.nodeDragOffset = {
        x: worldPos.x - node.x,
        y: worldPos.y - node.y
      };

      try {
        nodeEl.setPointerCapture(e.pointerId);
      } catch (err) {
        // Fallback for browsers
      }
    });

    nodeEl.addEventListener('pointermove', (e) => {
      if (this.draggingNode && this.draggingNode.id === node.id) {
        const worldPos = this.screenToWorld(e.clientX, e.clientY);
        let newX = worldPos.x - this.nodeDragOffset.x;
        let newY = worldPos.y - this.nodeDragOffset.y;

        if (this.store.gridSnap) {
          newX = Math.round(newX / this.store.gridSize) * this.store.gridSize;
          newY = Math.round(newY / this.store.gridSize) * this.store.gridSize;
        }

        this.draggingNode.x = newX;
        this.draggingNode.y = newY;

        nodeEl.style.left = `${newX}px`;
        nodeEl.style.top = `${newY}px`;
        this.renderConnections();
      }
    });

    nodeEl.addEventListener('pointerup', (e) => {
      if (this.draggingNode && this.draggingNode.id === node.id) {
        try {
          nodeEl.releasePointerCapture(e.pointerId);
        } catch (err) {}

        this.store.updateNode(node.id, { x: this.draggingNode.x, y: this.draggingNode.y }, true);
        this.draggingNode = null;
      }
    });

    // 2. Anchor port connection drag start
    const anchors = nodeEl.querySelectorAll('.anchor-port');
    anchors.forEach(anchorEl => {
      anchorEl.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        const anchorType = anchorEl.dataset.anchor;
        const pt = PathRouter.getAnchorCoordinates(node, anchorType);
        this.connectingFrom = {
          nodeId: node.id,
          anchorType,
          startX: pt.x,
          startY: pt.y
        };
        this.draftPathEl.classList.remove('hidden');
      });
    });

    // 3. Priority input inline change & prevent key propagation
    const prioInput = nodeEl.querySelector('.priority-input-node');
    if (prioInput) {
      prioInput.addEventListener('pointerdown', (e) => e.stopPropagation());
      prioInput.addEventListener('keydown', (e) => e.stopPropagation());
      prioInput.addEventListener('input', (e) => {
        const val = e.target.value.substring(0, 3).toUpperCase();
        prioInput.value = val;
        this.store.updateNode(node.id, { priority: val }, false);
      });
      prioInput.addEventListener('blur', () => {
        this.store.saveStateToHistory();
      });
    }

    // 4. Double-Click to Edit Text (Double click title or description)
    const editableEls = nodeEl.querySelectorAll('.node-editable-title, .node-editable-desc');
    editableEls.forEach(field => {
      field.addEventListener('pointerdown', (e) => {
        if (field.isContentEditable) {
          e.stopPropagation(); // Allow cursor positioning inside active editable field
        }
      });

      field.addEventListener('keydown', (e) => {
        e.stopPropagation(); // Prevent Backspace / Delete from deleting the node!
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          field.blur();
        }
      });

      field.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        field.contentEditable = 'true';
        field.classList.add('bg-slate-900', 'p-1', 'rounded', 'border', 'border-indigo-500', 'outline-none');
        field.focus();
        
        // Select all text inside
        const range = document.createRange();
        range.selectNodeContents(field);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      });

      field.addEventListener('blur', () => {
        field.contentEditable = 'false';
        field.classList.remove('bg-slate-900', 'p-1', 'rounded', 'border', 'border-indigo-500', 'outline-none');
        const key = field.dataset.field;
        this.store.updateNode(node.id, { [key]: field.innerText.trim() }, true);
      });
    });
  }

  renderConnections() {
    this.connectionsGroup.innerHTML = '';

    this.store.connections.forEach(conn => {
      const sourceNode = this.store.nodes.find(n => n.id === conn.sourceId);
      const targetNode = this.store.nodes.find(n => n.id === conn.targetId);
      if (!sourceNode || !targetNode) return;

      const isSelected = this.store.selectedConnectionId === conn.id;
      const { source: sourcePt, target: targetPt } = PathRouter.getBestAnchors(
        sourceNode,
        targetNode,
        conn.sourceAnchor,
        conn.targetAnchor
      );

      const pathD = PathRouter.generatePathD(sourcePt, targetPt, conn.lineStyle || 'curved');
      const mid = PathRouter.getMidpoint(sourcePt, targetPt);

      let markerEnd = '';
      let markerStart = '';

      if (conn.lineType === 'one-way') {
        markerEnd = isSelected ? 'url(#marker-arrow-selected-end)' : 'url(#marker-arrow-end)';
      } else if (conn.lineType === 'two-way') {
        markerStart = isSelected ? 'url(#marker-arrow-selected-start)' : 'url(#marker-arrow-start)';
        markerEnd = isSelected ? 'url(#marker-arrow-selected-end)' : 'url(#marker-arrow-end)';
      }

      const strokeColor = isSelected ? '#ec4899' : (conn.color || '#64748b');
      const isDotted = conn.lineType === 'dotted';

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.className = 'pointer-events-auto cursor-pointer';

      g.innerHTML = `
        <!-- Wide Hit Area -->
        <path d="${pathD}" fill="none" stroke="transparent" stroke-width="16" />
        
        <!-- Visible Connection Line -->
        <path d="${pathD}" fill="none" stroke="${strokeColor}" stroke-width="${isSelected ? 3.5 : 2.5}" 
          ${isDotted ? 'stroke-dasharray="6,6" class="line-dotted"' : ''} 
          ${markerStart ? `marker-start="${markerStart}"` : ''} 
          ${markerEnd ? `marker-end="${markerEnd}"` : ''} 
          class="svg-connection-line ${isSelected ? 'selected' : ''}" />

        <!-- Line Label Badge -->
        ${conn.label ? `
          <g transform="translate(${mid.x}, ${mid.y})">
            <rect x="-40" y="-12" width="80" height="24" rx="6" fill="#0f172a" stroke="${strokeColor}" stroke-width="1.5" />
            <text x="0" y="4" fill="#f8fafc" font-size="10" font-weight="600" text-anchor="middle">${conn.label}</text>
          </g>
        ` : ''}
      `;

      g.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.store.selectConnection(conn.id);
      });

      this.connectionsGroup.appendChild(g);
    });
  }

  attachCanvasEvents() {
    const wrapper = this.container.querySelector('#canvas-wrapper');

    // Pan Canvas via Pointer Down
    wrapper.addEventListener('pointerdown', (e) => {
      if (e.target.id === 'canvas-wrapper' || e.target.id === 'canvas-world' || e.target.id === 'svg-layer') {
        this.store.clearSelection();
        this.isPanning = true;
        this.panStart = { x: e.clientX - this.store.panX, y: e.clientY - this.store.panY };
      }
    });

    // Global Pointer Move
    window.addEventListener('pointermove', (e) => {
      this.mouseWorldPos = this.screenToWorld(e.clientX, e.clientY);

      // Panning Canvas
      if (this.isPanning) {
        this.store.panX = e.clientX - this.panStart.x;
        this.store.panY = e.clientY - this.panStart.y;
        this.updateWorldTransform();
        return;
      }

      // Drawing Live Connection Draft Path
      if (this.connectingFrom) {
        const pathD = PathRouter.generatePathD(
          { x: this.connectingFrom.startX, y: this.connectingFrom.startY, dir: this.connectingFrom.anchorType },
          { x: this.mouseWorldPos.x, y: this.mouseWorldPos.y, dir: 'auto' },
          this.store.activeLineStyle
        );
        this.draftPathEl.setAttribute('d', pathD);
      }
    });

    // Global Pointer Up (Completing connection line creation)
    window.addEventListener('pointerup', (e) => {
      if (this.isPanning) {
        this.isPanning = false;
      }

      if (this.connectingFrom) {
        // Use elementFromPoint to find node under mouse cursor regardless of pointer capture
        const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY);
        const targetNodeEl = elementUnderMouse?.closest('.uml-node');
        
        if (targetNodeEl) {
          const targetId = targetNodeEl.dataset.id;
          const targetAnchorPort = elementUnderMouse?.closest('.anchor-port');
          const targetAnchorType = targetAnchorPort ? targetAnchorPort.dataset.anchor : 'auto';

          if (targetId && targetId !== this.connectingFrom.nodeId) {
            this.store.addConnection(
              this.connectingFrom.nodeId,
              targetId,
              this.connectingFrom.anchorType,
              targetAnchorType
            );
          }
        }
        this.connectingFrom = null;
        this.draftPathEl.classList.add('hidden');
      }
    });

    // Wheel Zoom
    wrapper.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const newZoom = Math.min(Math.max(0.2, this.store.zoom * zoomFactor), 3);

      const mouseBefore = this.screenToWorld(e.clientX, e.clientY);
      this.store.zoom = newZoom;
      const mouseAfter = this.screenToWorld(e.clientX, e.clientY);

      this.store.panX += (mouseAfter.x - mouseBefore.x) * newZoom;
      this.store.panY += (mouseAfter.y - mouseBefore.y) * newZoom;

      this.updateWorldTransform();
    }, { passive: false });

    // Floating Zoom Controls
    this.container.querySelector('#btn-zoom-in')?.addEventListener('click', () => {
      this.store.zoom = Math.min(3, this.store.zoom + 0.15);
      this.updateWorldTransform();
    });

    this.container.querySelector('#btn-zoom-out')?.addEventListener('click', () => {
      this.store.zoom = Math.max(0.2, this.store.zoom - 0.15);
      this.updateWorldTransform();
    });

    this.container.querySelector('#btn-reset-view')?.addEventListener('click', () => {
      this.store.zoom = 1;
      this.store.panX = 40;
      this.store.panY = 40;
      this.updateWorldTransform();
    });

    const gridBtn = this.container.querySelector('#btn-toggle-grid');
    gridBtn?.addEventListener('click', () => {
      this.store.gridSnap = !this.store.gridSnap;
      gridBtn.textContent = `Snap: ${this.store.gridSnap ? 'On' : 'Off'}`;
      gridBtn.className = `p-2 ${this.store.gridSnap ? 'text-indigo-400' : 'text-slate-500'} hover:bg-slate-800 rounded-lg transition text-xs font-medium`;
    });

    // Keyboard Shortcuts (Delete, Undo, Redo) with Strict Active Element Check
    window.addEventListener('keydown', (e) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.tagName === 'SELECT' || 
        activeEl.isContentEditable || 
        activeEl.closest('input, textarea, select, [contenteditable="true"]')
      );

      if (isInput) return; // Do NOT trigger node deletion if user is typing or pressing Backspace in an input!

      if (e.key === 'Delete' || e.key === 'Backspace') {
        this.store.deleteSelected();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) this.store.redo();
        else this.store.undo();
      }
    });
  }
}
