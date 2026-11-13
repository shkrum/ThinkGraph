# UML Graph Studio (.umlgraph) — AI Agent File Format & Creation Guide

> **Direct Specification Link**: `https://raw.githubusercontent.com/shkrum/ThinkGraph/main/AI_INSTRUCTIONS.md`  
> **Repository**: [ThinkGraph on GitHub](https://github.com/shkrum/ThinkGraph)

---

## ⚡ Quick Prompt for Any AI Agent
When you want an AI (ChatGPT, Claude, Gemini, DeepSeek, Copilot) to generate a diagram for you, you do **not** need to copy the entire specification every time. Simply send:

```text
Create a .umlgraph diagram file for UML Graph Studio. Follow the instructions and file format specification at:
https://raw.githubusercontent.com/shkrum/ThinkGraph/main/AI_INSTRUCTIONS.md

Diagram Topic / Architecture:
[Describe your system, architecture, workflow, microservices, or database schema here]
```

---

## 📋 Role & Goal for the AI
You are an expert system architecture designer generating a `.umlgraph` JSON file for **UML Graph Studio**.
Your task is to produce a single, valid JSON document containing nodes, groups, and connections that render cleanly without overlaps, with proper dimensions, color hierarchy, and sequential multimedia ordering.

Save or return the file with the `.umlgraph` extension (or valid JSON within a markdown `json` code block).

---

## 1. Top-Level JSON Structure

```json
{
  "diagramId": "diag_system_architecture",
  "diagramName": "My System Architecture",
  "canvas": {
    "zoom": 1,
    "panX": 0,
    "panY": 0
  },
  "nodes": [ /* Array of Node and Group objects */ ],
  "connections": [ /* Array of Connection objects */ ],
  "updatedAt": 1727300000000
}
```

---

## 2. Node Schema

Each regular node represents a service, component, database, actor, or concept:

```json
{
  "id": "node_unique_id",            // Unique string ID, prefix "node_"
  "x": 60,                           // Horizontal canvas coordinate (pixels)
  "y": 60,                           // Vertical canvas coordinate (pixels)
  "w": 260,                          // Width in pixels (recommended: 220–320)
  "h": 180,                          // Height in pixels (budget accurately, see below)
  "title": "API Gateway",            // Short title displayed on header
  "desc": "Reverse proxy, TLS termination, and rate limiting service.", // Multi-line text
  "priority": "1",                   // Number ("1", "2") or sorting string ("P01", "VIP", "CRIT"). Default ""
  "color": "#1e293b",                // Node background fill color (hex)
  "borderColor": "#3b82f6",          // Node border color (hex)
  "shape": "rounded",                // "rounded" | "rectangle" | "diamond" | "cylinder" | "uml-class"
  "imageUrl": null,                  // Base64 data URL ("data:image/..." or "data:video/mp4;base64,...") or relative path
  "mediaType": null,                 // "image" | "video" | null
  "attributes": [],                  // UML class attribute strings (for "uml-class" shape)
  "methods": [],                     // UML class method strings (for "uml-class" shape)
  "attachments": []                  // Array of embedded file attachment objects
}
```

### Supported Shapes
- `"rounded"`: Default modern rounded card (services, microservices, components).
- `"rectangle"`: Clean rectangular card (infrastructure, hardware, boundaries).
- `"cylinder"`: Database or storage volume (PostgreSQL, Redis, S3).
- `"diamond"`: Decision gateway, condition, or branching check.
- `"uml-class"`: UML class structure showing `attributes` and `methods`.

---

## 3. 🎬 Video Nodes & Priority Playback Sequencing

UML Graph Studio includes an **automatic priority-based video sequencer**:

1. **How to Attach Video**:
   Set `mediaType: "video"` and supply a video data URL or path in `imageUrl`:
   ```json
   {
     "id": "node_video_demo",
     "title": "Onboarding Demo Video",
     "desc": "Walkthrough of user signup and verification.",
     "priority": "1",
     "shape": "rounded",
     "imageUrl": "data:video/mp4;base64,AAAA...",
     "mediaType": "video"
   }
   ```
2. **Priority Ordering Rules**:
   - **Numbers First**: If priorities are numbers (e.g. `1`, `2`, `10` or `"1"`, `"2"`, `"10"`), they are sorted numerically: `1 < 2 < 10`.
   - **Strings Sorted by Value**: If priorities are strings (e.g. `"P01"`, `"P02"`, `"VIP"`), their sorting values are used (natural alphanumeric sort: `"P01" < "P02" < "P10"`).
   - **Simultaneous Group Playback**: Videos that share the exact same priority value play simultaneously.
   - **Sequential Progression**: When a priority's video finishes (detectable via duration and completion), the system automatically starts the videos in the next priority tier.
   - **Continuous Cycle**: Once the final priority finishes, the sequence cycles back to the start.

---

## 4. Group Schema (Background Frames)

Groups organize and visually cluster related nodes (e.g., "Kubernetes Cluster", "Data Tier", "AWS Cloud"):

```json
{
  "id": "node_grp_backend",
  "type": "group",
  "x": 40,
  "y": 40,
  "w": 680,
  "h": 500,
  "title": "Backend Cluster",
  "color": "#6366f1",
  "fillOpacity": 0.08,
  "borderColor": "#818cf8",
  "imageUrl": null,
  "imageOpacity": 0.35,
  "priority": ""
}
```
*Note: Any node whose center falls inside the group frame belongs to that group and moves with it.*

---

## 5. Connection Schema

```json
{
  "id": "conn_1",
  "src": "node_frontend",
  "tgt": "node_api",
  "lineType": "one-way",     // "one-way" (→) | "two-way" (↔) | "dotted" (╌) | "solid" (—)
  "style": "curved",         // "curved" | "straight" | "ortho" (orthogonal elbow)
  "label": "gRPC / JSON",    // Edge label text
  "color": "#64748b"         // Stroke color (hex)
}
```

---

## 6. Layout & Coordinate Calculation (Zero Overlaps)

**CRITICAL RULE: Nodes must NEVER overlap.**

### A. Accurate Height Budgeting (`h`)
To prevent description text clipping or awkward overflow:
- Base header + padding: `60px`
- Title: `22px`
- Description text: `ceil(characters / (w / 7.5)) * 16px + 10px`
- Image or Video (`imageUrl`): Add `+150px`
- Attachments badge: Add `+24px`
- UML attributes & methods: Add `+18px` per entry

**Recommended Heights**:
- Brief card (1–2 lines text): `h: 120–150`
- Standard card (3–5 lines text): `h: 180–240`
- Multimedia card (video/image + text): `h: 320–420`

### B. Grid & Column Coordinates (`x`, `y`)
1. **Vertical Stacking in Same Column**:
   `y[next] = y[current] + h[current] + gapY`  
   *(Keep `gapY` between 60px and 90px)*
2. **Horizontal Column Spacing**:
   `x[nextColumn] = x[currentColumn] + w[currentColumn] + gapX`  
   *(Keep `gapX` between 120px and 180px)*
3. **Flow Direction**:
   - Left-to-Right: Column 0 = Ingestion/Clients, Column 1 = Gateway/Auth, Column 2 = Business Services, Column 3 = DB/Storage.

---

## 7. Complete Working Example

```json
{
  "diagramId": "diag_saas_ecommerce",
  "diagramName": "E-Commerce Cloud Architecture",
  "canvas": { "zoom": 1, "panX": 0, "panY": 0 },
  "nodes": [
    {
      "id": "node_web",
      "x": 60, "y": 60, "w": 250, "h": 160,
      "title": "Next.js Web Client",
      "desc": "Customer-facing web application deployed globally on Edge CDN.",
      "priority": "1",
      "color": "#0f172a",
      "borderColor": "#38bdf8",
      "shape": "rounded",
      "imageUrl": null,
      "mediaType": null,
      "attributes": [],
      "methods": [],
      "attachments": []
    },
    {
      "id": "node_gateway",
      "x": 420, "y": 60, "w": 260, "h": 180,
      "title": "API Gateway",
      "desc": "Kong API Gateway managing JWT authentication, SSL termination, and rate limiting.",
      "priority": "2",
      "color": "#0f172a",
      "borderColor": "#6366f1",
      "shape": "rounded",
      "imageUrl": null,
      "mediaType": null,
      "attributes": [],
      "methods": [],
      "attachments": []
    },
    {
      "id": "node_order_svc",
      "x": 420, "y": 300, "w": 260, "h": 180,
      "title": "Order Processing Service",
      "desc": "Go microservice orchestrating inventory checkout and Stripe payment intents.",
      "priority": "3",
      "color": "#0f172a",
      "borderColor": "#10b981",
      "shape": "rounded",
      "imageUrl": null,
      "mediaType": null,
      "attributes": [],
      "methods": [],
      "attachments": []
    },
    {
      "id": "node_db",
      "x": 800, "y": 60, "w": 240, "h": 160,
      "title": "PostgreSQL Primary",
      "desc": "Managed relational database with read replicas and automated daily backups.",
      "priority": "4",
      "color": "#0f172a",
      "borderColor": "#f59e0b",
      "shape": "cylinder",
      "imageUrl": null,
      "mediaType": null,
      "attributes": [],
      "methods": [],
      "attachments": []
    }
  ],
  "connections": [
    {
      "id": "conn_web_gw",
      "src": "node_web",
      "tgt": "node_gateway",
      "lineType": "one-way",
      "style": "curved",
      "label": "HTTPS REST",
      "color": "#38bdf8"
    },
    {
      "id": "conn_gw_orders",
      "src": "node_gateway",
      "tgt": "node_order_svc",
      "lineType": "one-way",
      "style": "ortho",
      "label": "Internal gRPC",
      "color": "#6366f1"
    },
    {
      "id": "conn_orders_db",
      "src": "node_order_svc",
      "tgt": "node_db",
      "lineType": "two-way",
      "style": "curved",
      "label": "SQL Queries",
      "color": "#10b981"
    }
  ],
  "updatedAt": 1727300000000
}
```

---

## 8. Output Instructions for the AI
1. Output valid JSON only (do not include trailing commas).
2. Save or instruct the user to save with the `.umlgraph` file extension.
3. Keep `attachments: []` if no binary files are embedded.
4. Keep `imageUrl: null` and `mediaType: null` when no media is present.
