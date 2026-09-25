import { FileHandler } from '../core/FileHandler.js';

export class Toolbar {
  constructor(container, store) {
    this.container = container;
    this.store = store;
    this.render();
    this.store.subscribe(() => this.updateUIState());
  }

  render() {
    this.container.innerHTML = `
      <header class="h-16 px-6 flex items-center justify-between glass-panel z-50 relative border-b border-slate-800">
        <!-- Logo & Title -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <div>
            <h1 class="font-bold text-lg text-slate-100 tracking-tight flex items-center gap-2">
              UML Graph Studio
              <span class="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">v1.0</span>
            </h1>
            <p class="text-xs text-slate-400">Interactive Graph & UML Diagram Editor</p>
          </div>

          <div class="h-6 w-px bg-slate-800 mx-1"></div>

          <!-- Settings Dropdown (Level with File actions) -->
          <div class="relative dropdown" id="settings-menu-wrap">
            <button id="btn-settings-menu" class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5">
              <span>Settings ▾</span>
            </button>
            <div id="settings-menu-dropdown" class="dropdown-content absolute top-full left-0 mt-1.5 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-1.5 hidden z-50">
              <div class="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Appearance / Theme</div>
              <button id="menu-theme-dark" class="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-indigo-600/20 hover:text-white rounded-lg flex items-center justify-between transition">
                <span>🌙 Dark Theme</span>
                <span id="tb-check-dark" class="text-indigo-400 font-bold">✓</span>
              </button>
              <button id="menu-theme-light" class="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-indigo-600/20 hover:text-white rounded-lg flex items-center justify-between transition">
                <span>☀️ White Theme</span>
                <span id="tb-check-light" class="text-indigo-400 font-bold hidden">✓</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Central Floating Tool Groups -->
        <div class="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 shadow-inner">
          <!-- Add Node Presets -->
          <button id="btn-add-node" class="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm hover:shadow-indigo-500/30" title="Add New Node">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Add Node
          </button>

          <!-- Auto Format Graph Button -->
          <button id="btn-format-graph" class="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm hover:shadow-amber-500/20" title="Auto-Organize Graph & Align Elements">
            <svg class="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"/>
            </svg>
            Format
          </button>

          <div class="h-5 w-px bg-slate-800 my-auto"></div>

          <!-- Active Connection Line Selector -->
          <div class="flex items-center gap-1 px-1">
            <span class="text-xs text-slate-400 font-medium mr-1">Line:</span>
            
            <!-- One-way Arrow -->
            <button id="line-one-way" class="line-btn px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center gap-1 bg-slate-800 text-slate-200 border border-slate-700" title="One-way Arrow Connection">
              <span class="text-xs">Directed</span> →
            </button>

            <!-- Two-way Arrow -->
            <button id="line-two-way" class="line-btn px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center gap-1 bg-slate-900 text-slate-400 hover:text-slate-200" title="Two-way Arrow Connection">
              ← <span class="text-xs">Bi-dir</span> →
            </button>

            <!-- Dotted Line -->
            <button id="line-dotted" class="line-btn px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center gap-1 bg-slate-900 text-slate-400 hover:text-slate-200" title="Dotted / Dashed Line">
              <span class="border-b border-dashed border-current w-3 inline-block"></span> Dotted
            </button>

            <!-- Solid Undirected Line -->
            <button id="line-solid" class="line-btn px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center gap-1 bg-slate-900 text-slate-400 hover:text-slate-200" title="Solid Line">
              <span class="border-b border-current w-3 inline-block"></span> Solid
            </button>
          </div>

          <div class="h-5 w-px bg-slate-800 my-auto"></div>

          <!-- Priority Search / Filter -->
          <div class="flex items-center gap-1.5 px-1">
            <span class="text-xs text-slate-400">Filter Priority:</span>
            <input id="input-priority-filter" type="text" maxlength="3" placeholder="P01..." class="w-14 px-2 py-0.5 text-xs bg-slate-950 text-yellow-400 font-mono font-bold uppercase rounded border border-slate-700 focus:border-yellow-400 outline-none text-center" />
          </div>
        </div>

        <!-- Right Side Actions: Import / Export & Demo -->
        <div class="flex items-center gap-2">
          <!-- Load Sample Diagram -->
          <button id="btn-load-demo" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            Demo Diagram
          </button>

          <!-- Hidden File Input for Import -->
          <input type="file" id="file-import" accept=".json,.umlgraph" class="hidden" />

          <!-- Import Diagram Button -->
          <button id="btn-import" class="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold border border-emerald-500/30 hover:border-emerald-500/60 transition flex items-center gap-1.5 shadow-sm">
            <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
            </svg>
            Import Diagram
          </button>

          <!-- Export Diagram Button -->
          <button id="btn-export" class="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30">
            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Export Diagram
          </button>
        </div>
      </header>
    `;

    this.attachEvents();
  }

  attachEvents() {
    // Theme & Settings Menu
    const btnSettings = this.container.querySelector('#btn-settings-menu');
    const settingsDropdown = this.container.querySelector('#settings-menu-dropdown');
    const menuDark = this.container.querySelector('#menu-theme-dark');
    const menuLight = this.container.querySelector('#menu-theme-light');
    const checkDark = this.container.querySelector('#tb-check-dark');
    const checkLight = this.container.querySelector('#tb-check-light');

    const updateCheckmarks = (theme) => {
      if (theme === 'light') {
        document.body.classList.add('light-theme');
        checkDark?.classList.add('hidden');
        checkLight?.classList.remove('hidden');
      } else {
        document.body.classList.remove('light-theme');
        checkDark?.classList.remove('hidden');
        checkLight?.classList.add('hidden');
      }
    };

    const initialTheme = localStorage.getItem('uml_studio_theme') || 'dark';
    updateCheckmarks(initialTheme);

    btnSettings?.addEventListener('click', (e) => {
      e.stopPropagation();
      settingsDropdown?.classList.toggle('hidden');
    });

    menuDark?.addEventListener('click', () => {
      localStorage.setItem('uml_studio_theme', 'dark');
      updateCheckmarks('dark');
      settingsDropdown?.classList.add('hidden');
    });

    menuLight?.addEventListener('click', () => {
      localStorage.setItem('uml_studio_theme', 'light');
      updateCheckmarks('light');
      settingsDropdown?.classList.add('hidden');
    });

    document.addEventListener('click', () => {
      settingsDropdown?.classList.add('hidden');
    });

    // Add Node
    this.container.querySelector('#btn-add-node').addEventListener('click', () => {
      const panX = -this.store.panX + 250;
      const panY = -this.store.panY + 200;
      this.store.addNode({ x: Math.max(50, panX), y: Math.max(50, panY) });
    });

    // Auto Format Graph
    this.container.querySelector('#btn-format-graph')?.addEventListener('click', () => {
      this.store.autoFormatGraph();
    });

    // Line Selectors
    const lineTypes = ['one-way', 'two-way', 'dotted', 'solid'];
    lineTypes.forEach(type => {
      const btn = this.container.querySelector(`#line-${type}`);
      btn?.addEventListener('click', () => {
        this.store.activeLineType = type;
        this.updateLineButtons();
      });
    });

    // Priority Filter
    const priorityInput = this.container.querySelector('#input-priority-filter');
    priorityInput.addEventListener('input', (e) => {
      this.store.priorityFilter = e.target.value.substring(0, 3).toUpperCase();
      this.store.notify();
    });

    // Demo Diagram
    this.container.querySelector('#btn-load-demo').addEventListener('click', () => {
      if (confirm("Load demo architecture diagram? Current unsaved changes will be replaced.")) {
        this.store.loadSampleDemo();
      }
    });

    // File Import trigger
    const importBtn = this.container.querySelector('#btn-import');
    const fileInput = this.container.querySelector('#file-import');
    importBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          await FileHandler.importDiagram(file, this.store);
          alert(`Successfully imported "${file.name}"!`);
        } catch (err) {
          alert("Import Error: " + err.message);
        }
        fileInput.value = '';
      }
    });

    // File Export
    this.container.querySelector('#btn-export').addEventListener('click', () => {
      FileHandler.exportDiagram(this.store, `uml_diagram_${Date.now()}.umlgraph`);
    });
  }

  updateLineButtons() {
    const active = this.store.activeLineType;
    const types = ['one-way', 'two-way', 'dotted', 'solid'];
    types.forEach(t => {
      const btn = this.container.querySelector(`#line-${t}`);
      if (btn) {
        if (t === active) {
          btn.className = 'line-btn px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center gap-1 bg-indigo-600/30 text-indigo-200 border border-indigo-500/50 shadow-sm';
        } else {
          btn.className = 'line-btn px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center gap-1 bg-slate-900 text-slate-400 hover:text-slate-200';
        }
      }
    });
  }

  updateUIState() {
    this.updateLineButtons();
  }
}
