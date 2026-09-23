import './style.css';
import { DiagramStore } from './core/DiagramStore.js';
import { Toolbar } from './components/Toolbar.js';
import { CanvasRenderer } from './components/CanvasRenderer.js';
import { Inspector } from './components/Inspector.js';

document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  // Initialize central diagram store
  const store = new DiagramStore();

  // DOM Layout structure
  appContainer.innerHTML = `
    <!-- Top Navigation & Floating Toolbar -->
    <div id="toolbar-container"></div>

    <!-- Main Working Area (Canvas + Sidebar Inspector) -->
    <div class="flex flex-1 w-full h-[calc(100vh-4rem)] overflow-hidden">
      <!-- Interactive Graph Canvas -->
      <div id="canvas-container" class="flex-1 relative flex"></div>
      
      <!-- Right Properties Inspector -->
      <div id="inspector-container"></div>
    </div>
  `;

  // Instantiate Application Components
  const toolbar = new Toolbar(document.getElementById('toolbar-container'), store);
  const canvas = new CanvasRenderer(document.getElementById('canvas-container'), store);
  const inspector = new Inspector(document.getElementById('inspector-container'), store);

  // Load initial demo diagram to showcase features
  store.loadSampleDemo();

  console.log("UML Graph Studio initialized successfully.");
});
