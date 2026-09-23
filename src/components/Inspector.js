import { FileHandler } from '../core/FileHandler.js';

export class Inspector {
  constructor(container, store) {
    this.container = container;
    this.store = store;
    this.render();
    this.store.subscribe(() => this.render());
  }

  render() {
    const selectedNode = this.store.nodes.find(n => n.id === this.store.selectedNodeId);
    const selectedConn = this.store.connections.find(c => c.id === this.store.selectedConnectionId);

    if (!selectedNode && !selectedConn) {
      this.container.innerHTML = `
        <aside class="w-80 glass-panel p-5 flex flex-col justify-between h-[calc(100vh-4rem)] border-l border-slate-800 z-40">
          <div>
            <div class="flex items-center gap-2 mb-4 text-slate-400 font-semibold text-xs uppercase tracking-wider">
              <svg class="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Inspector Panel
            </div>
            
            <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center">
              <div class="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/>
                </svg>
              </div>
              <h3 class="text-sm font-semibold text-slate-300 mb-1">Nothing Selected</h3>
              <p class="text-xs text-slate-500 leading-relaxed">Select any node or connection line on the canvas to inspect & edit its properties.</p>
            </div>

            <!-- Quick Instructions -->
            <div class="mt-6 space-y-3">
              <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Diagram Controls</h4>
              <ul class="text-xs text-slate-400 space-y-2">
                <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> <strong>Drag Node:</strong> Click and move</li>
                <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-cyan-500"></span> <strong>Connect:</strong> Drag from blue dots on nodes</li>
                <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> <strong>Priority Badge:</strong> Set 3-char code (e.g. P01)</li>
                <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-pink-500"></span> <strong>Upload Image:</strong> Attach to node</li>
              </ul>
            </div>
          </div>

          <!-- Bottom Canvas Quick Stats -->
          <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between text-xs text-slate-400">
            <span>Nodes: <strong class="text-slate-200">${this.store.nodes.length}</strong></span>
            <span>Lines: <strong class="text-slate-200">${this.store.connections.length}</strong></span>
            <span>Zoom: <strong class="text-slate-200">${Math.round(this.store.zoom * 100)}%</strong></span>
          </div>
        </aside>
      `;
      return;
    }

    if (selectedNode) {
      this.renderNodeInspector(selectedNode);
    } else if (selectedConn) {
      this.renderConnectionInspector(selectedConn);
    }
  }

  renderNodeInspector(node) {
    this.container.innerHTML = `
      <aside class="w-80 glass-panel p-5 flex flex-col justify-between h-[calc(100vh-4rem)] border-l border-slate-800 z-40 overflow-y-auto">
        <div class="space-y-4">
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-indigo-500"></span> Node Properties
            </span>
            <button id="btn-delete-node" class="px-2 py-1 text-xs rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition">
              Delete Node
            </button>
          </div>

          <!-- Priority Input (Max 3 chars requirement) -->
          <div class="p-3 rounded-xl bg-slate-900/80 border border-amber-500/30">
            <label class="text-xs font-semibold text-amber-400 flex items-center justify-between mb-1.5">
              <span>Priority Code (Max 3 Chars)</span>
              <span class="text-[10px] text-slate-400">e.g. P01, VIP, 99</span>
            </label>
            <input id="input-node-priority" type="text" maxlength="3" value="${node.priority}" 
              class="w-full px-3 py-1.5 text-sm font-mono font-bold tracking-wider text-yellow-300 bg-slate-950 border border-amber-500/50 rounded-lg focus:border-amber-400 outline-none uppercase text-center shadow-inner" />
          </div>

          <!-- Node Title & Description -->
          <div class="space-y-3">
            <div>
              <label class="text-xs font-semibold text-slate-300 mb-1 block">Title / Name</label>
              <input id="input-node-title" type="text" value="${node.title}" 
                class="w-full px-3 py-1.5 text-sm text-slate-100 bg-slate-900 border border-slate-700 rounded-lg focus:border-indigo-500 outline-none" />
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-300 mb-1 block">Description</label>
              <textarea id="input-node-desc" rows="3" 
                class="w-full px-3 py-1.5 text-xs text-slate-200 bg-slate-900 border border-slate-700 rounded-lg focus:border-indigo-500 outline-none resize-none">${node.description}</textarea>
            </div>
          </div>

          <!-- Photo / Video Attachment -->
          <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <label class="text-xs font-semibold text-slate-300 block flex items-center justify-between">
              <span>Attached Photo / Video</span>
              <span class="text-[10px] text-slate-400 font-normal">Base64 JSON</span>
            </label>
            ${(node.mediaUrl || node.imageUrl) ? `
              <div class="relative group rounded-lg overflow-hidden border border-slate-700 max-h-40 bg-slate-950 flex items-center justify-center">
                ${(node.mediaType === 'video' || (node.mediaUrl || node.imageUrl || '').startsWith('data:video')) ? `
                  <video src="${node.mediaUrl || node.imageUrl}" controls class="max-h-36 w-full rounded object-contain"></video>
                ` : `
                  <img src="${node.mediaUrl || node.imageUrl}" class="object-contain max-h-36 w-full" />
                `}
                <button id="btn-remove-media" class="absolute top-2 right-2 p-1 rounded bg-red-600/80 text-white text-xs hover:bg-red-600 transition z-10 shadow-md">
                  ✕ Remove
                </button>
              </div>
            ` : `
              <div class="text-center p-3 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl transition cursor-pointer" id="box-upload-media">
                <svg class="w-6 h-6 text-slate-500 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span class="text-xs text-indigo-400 font-medium block">Click to upload photo or video</span>
                <span class="text-[10px] text-slate-500">Supports PNG, JPG, MP4, WebM</span>
                <input type="file" id="file-node-media" accept="image/*,video/*" class="hidden" />
              </div>
            `}
          </div>

          <!-- Dimensions & Shape -->
          <div class="space-y-3">
            <div>
              <label class="text-xs font-semibold text-slate-300 mb-1 block">Node Shape</label>
              <select id="select-node-shape" class="w-full px-3 py-1.5 text-xs text-slate-200 bg-slate-900 border border-slate-700 rounded-lg focus:border-indigo-500 outline-none">
                <option value="rounded" ${node.shape === 'rounded' ? 'selected' : ''}>Rounded Box</option>
                <option value="rectangle" ${node.shape === 'rectangle' ? 'selected' : ''}>Standard Rectangle</option>
                <option value="diamond" ${node.shape === 'diamond' ? 'selected' : ''}>Decision Diamond</option>
                <option value="cylinder" ${node.shape === 'cylinder' ? 'selected' : ''}>Database Cylinder</option>
                <option value="uml-class" ${node.shape === 'uml-class' ? 'selected' : ''}>UML Class Box</option>
              </select>
            </div>

            <!-- Width & Height Inputs -->
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="text-xs font-semibold text-slate-400 mb-1 block">Width (px)</label>
                <input id="input-node-width" type="number" min="140" max="1200" value="${node.width || 220}" class="w-full px-3 py-1 text-xs text-slate-200 bg-slate-900 border border-slate-700 rounded-lg focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label class="text-xs font-semibold text-slate-400 mb-1 block">Height (px)</label>
                <input id="input-node-height" type="number" min="90" max="1200" value="${node.height || 140}" class="w-full px-3 py-1 text-xs text-slate-200 bg-slate-900 border border-slate-700 rounded-lg focus:border-indigo-500 outline-none" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="text-xs font-semibold text-slate-400 mb-1 block">Fill Color</label>
                <input id="input-node-bg" type="color" value="${node.color || '#1e293b'}" class="w-full h-8 bg-slate-900 rounded border border-slate-700 cursor-pointer" />
              </div>
              <div>
                <label class="text-xs font-semibold text-slate-400 mb-1 block">Border Color</label>
                <input id="input-node-border" type="color" value="${node.borderColor || '#3b82f6'}" class="w-full h-8 bg-slate-900 rounded border border-slate-700 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      </aside>
    `;

    this.attachNodeEvents(node);
  }

  attachNodeEvents(node) {
    // Delete
    this.container.querySelector('#btn-delete-node')?.addEventListener('click', () => {
      this.store.deleteNode(node.id);
    });

    // Priority input max 3 chars
    const prioInput = this.container.querySelector('#input-node-priority');
    prioInput?.addEventListener('input', (e) => {
      const val = e.target.value.substring(0, 3).toUpperCase();
      prioInput.value = val;
      this.store.updateNode(node.id, { priority: val });
    });

    // Title & Desc
    this.container.querySelector('#input-node-title')?.addEventListener('input', (e) => {
      this.store.updateNode(node.id, { title: e.target.value }, false);
    });
    this.container.querySelector('#input-node-desc')?.addEventListener('input', (e) => {
      this.store.updateNode(node.id, { description: e.target.value }, false);
    });

    // Shape, Dimensions & Colors
    this.container.querySelector('#select-node-shape')?.addEventListener('change', (e) => {
      this.store.updateNode(node.id, { shape: e.target.value });
    });
    this.container.querySelector('#input-node-width')?.addEventListener('input', (e) => {
      const val = Math.max(140, parseInt(e.target.value) || 220);
      this.store.updateNode(node.id, { width: val });
    });
    this.container.querySelector('#input-node-height')?.addEventListener('input', (e) => {
      const val = Math.max(90, parseInt(e.target.value) || 140);
      this.store.updateNode(node.id, { height: val });
    });
    this.container.querySelector('#input-node-bg')?.addEventListener('input', (e) => {
      this.store.updateNode(node.id, { color: e.target.value });
    });
    this.container.querySelector('#input-node-border')?.addEventListener('input', (e) => {
      this.store.updateNode(node.id, { borderColor: e.target.value });
    });

    // Photo / Video Upload
    const uploadBox = this.container.querySelector('#box-upload-media');
    const mediaInput = this.container.querySelector('#file-node-media');
    uploadBox?.addEventListener('click', () => mediaInput?.click());

    mediaInput?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const base64 = await FileHandler.convertFileToBase64(file);
          const isVideo = file.type.startsWith('video/');
          this.store.updateNode(node.id, {
            mediaUrl: base64,
            imageUrl: base64,
            mediaType: isVideo ? 'video' : 'image'
          });
        } catch (err) {
          alert("Media upload failed: " + err.message);
        }
      }
    });

    // Remove Media
    this.container.querySelector('#btn-remove-media')?.addEventListener('click', () => {
      this.store.updateNode(node.id, {
        mediaUrl: null,
        imageUrl: null,
        mediaType: null
      });
    });
  }

  renderConnectionInspector(conn) {
    const sourceNode = this.store.nodes.find(n => n.id === conn.sourceId);
    const targetNode = this.store.nodes.find(n => n.id === conn.targetId);

    this.container.innerHTML = `
      <aside class="w-80 glass-panel p-5 flex flex-col justify-between h-[calc(100vh-4rem)] border-l border-slate-800 z-40 overflow-y-auto">
        <div class="space-y-4">
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <span class="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-pink-500"></span> Line Properties
            </span>
            <button id="btn-delete-conn" class="px-2 py-1 text-xs rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition">
              Delete Line
            </button>
          </div>

          <!-- Connected Nodes summary -->
          <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-400">From:</span>
              <span class="font-semibold text-slate-200">${sourceNode ? sourceNode.title : 'Unknown'}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">To:</span>
              <span class="font-semibold text-slate-200">${targetNode ? targetNode.title : 'Unknown'}</span>
            </div>
          </div>

          <!-- Line Direction / Type -->
          <div>
            <label class="text-xs font-semibold text-slate-300 mb-1 block">Connection Arrow Type</label>
            <select id="select-conn-type" class="w-full px-3 py-1.5 text-xs text-slate-200 bg-slate-900 border border-slate-700 rounded-lg focus:border-indigo-500 outline-none">
              <option value="one-way" ${conn.lineType === 'one-way' ? 'selected' : ''}>One-way Arrow (--->)</option>
              <option value="two-way" ${conn.lineType === 'two-way' ? 'selected' : ''}>Two-way Arrow (<--->)</option>
              <option value="dotted" ${conn.lineType === 'dotted' ? 'selected' : ''}>Dotted / Dashed Line (- - -)</option>
              <option value="solid" ${conn.lineType === 'solid' ? 'selected' : ''}>Solid Undirected Line (------)</option>
            </select>
          </div>

          <!-- Line Routing Style -->
          <div>
            <label class="text-xs font-semibold text-slate-300 mb-1 block">Routing Style</label>
            <select id="select-conn-style" class="w-full px-3 py-1.5 text-xs text-slate-200 bg-slate-900 border border-slate-700 rounded-lg focus:border-indigo-500 outline-none">
              <option value="curved" ${conn.lineStyle === 'curved' ? 'selected' : ''}>Smooth Bezier Curve</option>
              <option value="straight" ${conn.lineStyle === 'straight' ? 'selected' : ''}>Straight Line</option>
              <option value="orthogonal" ${conn.lineStyle === 'orthogonal' ? 'selected' : ''}>Orthogonal Elbow</option>
            </select>
          </div>

          <!-- Line Label -->
          <div>
            <label class="text-xs font-semibold text-slate-300 mb-1 block">Line Label / Relationship</label>
            <input id="input-conn-label" type="text" value="${conn.label || ''}" placeholder="e.g. Calls API..." 
              class="w-full px-3 py-1.5 text-xs text-slate-200 bg-slate-900 border border-slate-700 rounded-lg focus:border-indigo-500 outline-none" />
          </div>

          <!-- Line Color -->
          <div>
            <label class="text-xs font-semibold text-slate-400 mb-1 block">Line Stroke Color</label>
            <input id="input-conn-color" type="color" value="${conn.color || '#64748b'}" class="w-full h-8 bg-slate-900 rounded border border-slate-700 cursor-pointer" />
          </div>
        </div>
      </aside>
    `;

    this.attachConnectionEvents(conn);
  }

  attachConnectionEvents(conn) {
    this.container.querySelector('#btn-delete-conn')?.addEventListener('click', () => {
      this.store.deleteConnection(conn.id);
    });

    this.container.querySelector('#select-conn-type')?.addEventListener('change', (e) => {
      this.store.updateConnection(conn.id, { lineType: e.target.value });
    });

    this.container.querySelector('#select-conn-style')?.addEventListener('change', (e) => {
      this.store.updateConnection(conn.id, { lineStyle: e.target.value });
    });

    this.container.querySelector('#input-conn-label')?.addEventListener('input', (e) => {
      this.store.updateConnection(conn.id, { label: e.target.value });
    });

    this.container.querySelector('#input-conn-color')?.addEventListener('input', (e) => {
      this.store.updateConnection(conn.id, { color: e.target.value });
    });
  }
}
