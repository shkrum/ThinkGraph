/**
 * Central State Store for UML Graph Studio
 * Handles reactive diagram state, history, selection, and JSON data mapping.
 */

import { AutoFormatter } from './AutoFormatter.js';

export class DiagramStore {
  constructor() {
    this.nodes = [];
    this.connections = [];
    this.selectedNodeId = null;
    this.selectedConnectionId = null;
    this.listeners = [];
    
    // Default connection tool settings
    this.activeLineType = 'one-way'; // 'one-way' | 'two-way' | 'dotted' | 'solid'
    this.activeLineStyle = 'curved'; // 'straight' | 'curved' | 'orthogonal'
    this.gridSnap = true;
    this.gridSize = 20;
    
    // Priority filter (null or string like 'P01')
    this.priorityFilter = '';
    
    // Canvas transform
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    
    // Undo / Redo stacks
    this.history = [];
    this.historyIndex = -1;
    
    // Save initial state
    this.saveStateToHistory();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this);
    }
  }

  saveStateToHistory() {
    // Truncate future states if in middle of stack
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    
    const snapshot = JSON.stringify({
      nodes: this.nodes,
      connections: this.connections,
      zoom: this.zoom,
      panX: this.panX,
      panY: this.panY
    });
    
    // Prevent duplicate stack pushes
    if (this.history.length > 0 && this.history[this.historyIndex] === snapshot) {
      return;
    }
    
    this.history.push(snapshot);
    this.historyIndex = this.history.length - 1;
    if (this.history.length > 40) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      const snapshot = JSON.parse(this.history[this.historyIndex]);
      this.nodes = snapshot.nodes;
      this.connections = snapshot.connections;
      this.zoom = snapshot.zoom || 1;
      this.panX = snapshot.panX || 0;
      this.panY = snapshot.panY || 0;
      this.notify();
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      const snapshot = JSON.parse(this.history[this.historyIndex]);
      this.nodes = snapshot.nodes;
      this.connections = snapshot.connections;
      this.zoom = snapshot.zoom || 1;
      this.panX = snapshot.panX || 0;
      this.panY = snapshot.panY || 0;
      this.notify();
    }
  }

  autoFormatGraph() {
    if (this.nodes.length === 0) return;
    this.nodes = AutoFormatter.formatDiagram(this.nodes, this.connections);
    this.saveStateToHistory();
    this.notify();
  }

  // --- Node Operations ---
  addNode(options = {}) {
    const id = 'node_' + Math.random().toString(36).substring(2, 9);
    
    // Snap initial coordinates if enabled
    let x = options.x ?? 150;
    let y = options.y ?? 150;
    if (this.gridSnap) {
      x = Math.round(x / this.gridSize) * this.gridSize;
      y = Math.round(y / this.gridSize) * this.gridSize;
    }

    const newNode = {
      id,
      x,
      y,
      width: options.width || 220,
      height: options.height || 140,
      title: options.title || 'New Node',
      description: options.description || 'Add details here...',
      priority: (options.priority || 'P01').substring(0, 3).toUpperCase(),
      shape: options.shape || 'rounded', // 'rectangle' | 'rounded' | 'diamond' | 'cylinder' | 'uml-class'
      color: options.color || '#1e293b',
      borderColor: options.borderColor || '#3b82f6',
      textColor: options.textColor || '#f8fafc',
      imageUrl: options.imageUrl || options.mediaUrl || null,
      mediaUrl: options.mediaUrl || options.imageUrl || null,
      mediaType: options.mediaType || (options.mediaUrl?.startsWith('data:video') ? 'video' : (options.imageUrl || options.mediaUrl ? 'image' : null)),
      attributes: options.attributes || [],
      methods: options.methods || [],
      createdAt: new Date().toISOString()
    };

    this.nodes.push(newNode);
    this.selectedNodeId = id;
    this.selectedConnectionId = null;
    this.saveStateToHistory();
    this.notify();
    return newNode;
  }

  updateNode(id, updates, recordHistory = true) {
    const index = this.nodes.findIndex(n => n.id === id);
    if (index !== -1) {
      if (updates.priority !== undefined) {
        updates.priority = String(updates.priority).substring(0, 3).toUpperCase();
      }
      
      this.nodes[index] = { ...this.nodes[index], ...updates };
      
      if (recordHistory) {
        this.saveStateToHistory();
      }
      this.notify();
    }
  }

  deleteNode(id) {
    this.nodes = this.nodes.filter(n => n.id !== id);
    // Remove attached connections
    this.connections = this.connections.filter(c => c.sourceId !== id && c.targetId !== id);
    if (this.selectedNodeId === id) {
      this.selectedNodeId = null;
    }
    this.saveStateToHistory();
    this.notify();
  }

  // --- Connection Operations ---
  addConnection(sourceId, targetId, sourceAnchor = 'auto', targetAnchor = 'auto') {
    if (sourceId === targetId) return null;
    
    const exists = this.connections.some(c => c.sourceId === sourceId && c.targetId === targetId);
    if (exists) return null;

    const id = 'conn_' + Math.random().toString(36).substring(2, 9);
    const newConn = {
      id,
      sourceId,
      targetId,
      sourceAnchor,
      targetAnchor,
      lineType: this.activeLineType,
      lineStyle: this.activeLineStyle,
      label: '',
      color: '#64748b',
      createdAt: new Date().toISOString()
    };

    this.connections.push(newConn);
    this.selectedConnectionId = id;
    this.selectedNodeId = null;
    this.saveStateToHistory();
    this.notify();
    return newConn;
  }

  updateConnection(id, updates) {
    const index = this.connections.findIndex(c => c.id === id);
    if (index !== -1) {
      this.connections[index] = { ...this.connections[index], ...updates };
      this.saveStateToHistory();
      this.notify();
    }
  }

  deleteConnection(id) {
    this.connections = this.connections.filter(c => c.id !== id);
    if (this.selectedConnectionId === id) {
      this.selectedConnectionId = null;
    }
    this.saveStateToHistory();
    this.notify();
  }

  // --- Selection ---
  selectNode(id) {
    this.selectedNodeId = id;
    this.selectedConnectionId = null;
    this.notify();
  }

  selectConnection(id) {
    this.selectedConnectionId = id;
    this.selectedNodeId = null;
    this.notify();
  }

  clearSelection() {
    this.selectedNodeId = null;
    this.selectedConnectionId = null;
    this.notify();
  }

  deleteSelected() {
    if (this.selectedNodeId) {
      this.deleteNode(this.selectedNodeId);
    } else if (this.selectedConnectionId) {
      this.deleteConnection(this.selectedConnectionId);
    }
  }

  // --- Export / Import JSON Data Model ---
  exportToJson() {
    return {
      app: "UMLGraphStudio",
      version: "1.0",
      exportDate: new Date().toISOString(),
      canvas: {
        zoom: this.zoom,
        panX: this.panX,
        panY: this.panY,
        gridSnap: this.gridSnap
      },
      nodes: this.nodes,
      connections: this.connections
    };
  }

  importFromJson(data) {
    if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.connections)) {
      throw new Error("Invalid diagram JSON file format.");
    }

    this.nodes = data.nodes.map(n => {
      const url = n.mediaUrl || n.imageUrl || null;
      let type = n.mediaType;
      if (!type && url) {
        type = url.startsWith('data:video') ? 'video' : 'image';
      }
      return {
        ...n,
        priority: String(n.priority || 'P01').substring(0, 3).toUpperCase(),
        x: typeof n.x === 'number' ? n.x : 100,
        y: typeof n.y === 'number' ? n.y : 100,
        width: typeof n.width === 'number' ? n.width : 220,
        height: typeof n.height === 'number' ? n.height : 140,
        mediaUrl: url,
        imageUrl: url,
        mediaType: type
      };
    });

    this.connections = data.connections.map(c => ({
      ...c,
      lineType: c.lineType || 'one-way',
      lineStyle: c.lineStyle || 'curved'
    }));

    if (data.canvas) {
      this.zoom = data.canvas.zoom || 1;
      this.panX = data.canvas.panX || 0;
      this.panY = data.canvas.panY || 0;
      this.gridSnap = data.canvas.gridSnap ?? true;
    }

    this.selectedNodeId = null;
    this.selectedConnectionId = null;
    this.saveStateToHistory();
    this.notify();
  }

  loadSampleDemo() {
    const sampleData = {
      app: "UMLGraphStudio",
      version: "1.0",
      canvas: { zoom: 1, panX: 40, panY: 40, gridSnap: true },
      nodes: [
        {
          id: "node_auth",
          x: 100,
          y: 120,
          width: 240,
          height: 160,
          title: "Auth Gateway",
          description: "OAuth2 & JWT Token Verifier",
          priority: "P01",
          shape: "rounded",
          color: "#1e293b",
          borderColor: "#3b82f6",
          textColor: "#f8fafc",
          imageUrl: null
        },
        {
          id: "node_user",
          x: 460,
          y: 80,
          width: 240,
          height: 180,
          title: "User Service",
          description: "Profile management & Role RBAC",
          priority: "P02",
          shape: "uml-class",
          color: "#0f172a",
          borderColor: "#6366f1",
          textColor: "#f8fafc",
          attributes: ["+ userId: UUID", "+ email: String", "+ role: Enum"],
          methods: ["+ authenticate()", "+ updateProfile()"]
        },
        {
          id: "node_db",
          x: 460,
          y: 340,
          width: 220,
          height: 140,
          title: "Primary DB Cluster",
          description: "PostgreSQL High Availability",
          priority: "SYS",
          shape: "cylinder",
          color: "#1e1b4b",
          borderColor: "#a855f7",
          textColor: "#f8fafc"
        },
        {
          id: "node_cache",
          x: 100,
          y: 360,
          width: 220,
          height: 130,
          title: "Redis Cache",
          description: "Session store & Rate Limiting",
          priority: "MEM",
          shape: "rectangle",
          color: "#1f2937",
          borderColor: "#10b981",
          textColor: "#f8fafc"
        }
      ],
      connections: [
        {
          id: "conn_1",
          sourceId: "node_auth",
          targetId: "node_user",
          sourceAnchor: "right",
          targetAnchor: "left",
          lineType: "one-way",
          lineStyle: "curved",
          label: "Verify Token",
          color: "#60a5fa"
        },
        {
          id: "conn_2",
          sourceId: "node_user",
          targetId: "node_db",
          sourceAnchor: "bottom",
          targetAnchor: "top",
          lineType: "two-way",
          lineStyle: "straight",
          label: "SQL Query",
          color: "#c084fc"
        },
        {
          id: "conn_3",
          sourceId: "node_auth",
          targetId: "node_cache",
          sourceAnchor: "bottom",
          targetAnchor: "top",
          lineType: "dotted",
          lineStyle: "curved",
          label: "Cached Session",
          color: "#34d399"
        }
      ]
    };
    this.importFromJson(sampleData);
  }
}
