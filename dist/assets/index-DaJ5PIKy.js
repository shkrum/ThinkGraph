(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=class{static formatDiagram(e,t,n={}){if(!e||e.length===0)return e;let r=n.startX||100,i=n.startY||120,a=n.horizontalGap||320,o=n.verticalGap||220,s=new Map;e.forEach(e=>s.set(e.id,{...e}));let c=new Map,l=new Map;e.forEach(e=>{c.set(e.id,0),l.set(e.id,[])}),t.forEach(e=>{s.has(e.sourceId)&&s.has(e.targetId)&&e.sourceId!==e.targetId&&(c.set(e.targetId,(c.get(e.targetId)||0)+1),l.get(e.sourceId).push(e.targetId))});let u=new Map,d=[];if(e.forEach(e=>{c.get(e.id)===0&&(u.set(e.id,0),d.push(e.id))}),d.length===0&&e.length>0){let t=-1,n=e[0].id;e.forEach(e=>{let r=(l.get(e.id)||[]).length;r>t&&(t=r,n=e.id)}),u.set(n,0),d.push(n)}let f=new Set;for(;d.length>0;){let e=d.shift();if(f.has(e))continue;f.add(e);let t=u.get(e)||0,n=l.get(e)||[];for(let e of n){let n=Math.max(u.get(e)||0,t+1);u.set(e,n),f.has(e)||d.push(e)}}let p=0;u.forEach(e=>{e>p&&(p=e)}),e.filter(e=>!u.has(e.id)).forEach((e,t)=>{u.set(e.id,p+1+Math.floor(t/3))});let m=new Map;u.forEach((e,t)=>{m.has(e)||m.set(e,[]),m.get(e).push(t)});let h=Array.from(m.keys()).sort((e,t)=>e-t),g=[];return h.forEach((e,t)=>{let n=m.get(e),c=n.length;n.forEach((e,n)=>{let l=s.get(e),u=(c-1)*o,d=r+t*a,f=i+n*o-u/2+200;g.push({...l,x:Math.round(d/20)*20,y:Math.max(40,Math.round(f/20)*20)})})}),g}},t=class{constructor(){this.nodes=[],this.connections=[],this.selectedNodeId=null,this.selectedConnectionId=null,this.listeners=[],this.activeLineType=`one-way`,this.activeLineStyle=`curved`,this.gridSnap=!0,this.gridSize=20,this.priorityFilter=``,this.zoom=1,this.panX=0,this.panY=0,this.history=[],this.historyIndex=-1,this.saveStateToHistory()}subscribe(e){return this.listeners.push(e),()=>{this.listeners=this.listeners.filter(t=>t!==e)}}notify(){for(let e of this.listeners)e(this)}saveStateToHistory(){this.historyIndex<this.history.length-1&&(this.history=this.history.slice(0,this.historyIndex+1));let e=JSON.stringify({nodes:this.nodes,connections:this.connections,zoom:this.zoom,panX:this.panX,panY:this.panY});this.history.length>0&&this.history[this.historyIndex]===e||(this.history.push(e),this.historyIndex=this.history.length-1,this.history.length>40&&(this.history.shift(),this.historyIndex--))}undo(){if(this.historyIndex>0){this.historyIndex--;let e=JSON.parse(this.history[this.historyIndex]);this.nodes=e.nodes,this.connections=e.connections,this.zoom=e.zoom||1,this.panX=e.panX||0,this.panY=e.panY||0,this.notify()}}redo(){if(this.historyIndex<this.history.length-1){this.historyIndex++;let e=JSON.parse(this.history[this.historyIndex]);this.nodes=e.nodes,this.connections=e.connections,this.zoom=e.zoom||1,this.panX=e.panX||0,this.panY=e.panY||0,this.notify()}}autoFormatGraph(){this.nodes.length!==0&&(this.nodes=e.formatDiagram(this.nodes,this.connections),this.saveStateToHistory(),this.notify())}addNode(e={}){let t=`node_`+Math.random().toString(36).substring(2,9),n=e.x??150,r=e.y??150;this.gridSnap&&(n=Math.round(n/this.gridSize)*this.gridSize,r=Math.round(r/this.gridSize)*this.gridSize);let i={id:t,x:n,y:r,width:e.width||220,height:e.height||140,title:e.title||`New Node`,description:e.description||`Add details here...`,priority:(e.priority||`P01`).substring(0,3).toUpperCase(),shape:e.shape||`rounded`,color:e.color||`#1e293b`,borderColor:e.borderColor||`#3b82f6`,textColor:e.textColor||`#f8fafc`,imageUrl:e.imageUrl||null,attributes:e.attributes||[],methods:e.methods||[],createdAt:new Date().toISOString()};return this.nodes.push(i),this.selectedNodeId=t,this.selectedConnectionId=null,this.saveStateToHistory(),this.notify(),i}updateNode(e,t,n=!0){let r=this.nodes.findIndex(t=>t.id===e);r!==-1&&(t.priority!==void 0&&(t.priority=String(t.priority).substring(0,3).toUpperCase()),this.nodes[r]={...this.nodes[r],...t},n&&this.saveStateToHistory(),this.notify())}deleteNode(e){this.nodes=this.nodes.filter(t=>t.id!==e),this.connections=this.connections.filter(t=>t.sourceId!==e&&t.targetId!==e),this.selectedNodeId===e&&(this.selectedNodeId=null),this.saveStateToHistory(),this.notify()}addConnection(e,t,n=`auto`,r=`auto`){if(e===t||this.connections.some(n=>n.sourceId===e&&n.targetId===t))return null;let i=`conn_`+Math.random().toString(36).substring(2,9),a={id:i,sourceId:e,targetId:t,sourceAnchor:n,targetAnchor:r,lineType:this.activeLineType,lineStyle:this.activeLineStyle,label:``,color:`#64748b`,createdAt:new Date().toISOString()};return this.connections.push(a),this.selectedConnectionId=i,this.selectedNodeId=null,this.saveStateToHistory(),this.notify(),a}updateConnection(e,t){let n=this.connections.findIndex(t=>t.id===e);n!==-1&&(this.connections[n]={...this.connections[n],...t},this.saveStateToHistory(),this.notify())}deleteConnection(e){this.connections=this.connections.filter(t=>t.id!==e),this.selectedConnectionId===e&&(this.selectedConnectionId=null),this.saveStateToHistory(),this.notify()}selectNode(e){this.selectedNodeId=e,this.selectedConnectionId=null,this.notify()}selectConnection(e){this.selectedConnectionId=e,this.selectedNodeId=null,this.notify()}clearSelection(){this.selectedNodeId=null,this.selectedConnectionId=null,this.notify()}deleteSelected(){this.selectedNodeId?this.deleteNode(this.selectedNodeId):this.selectedConnectionId&&this.deleteConnection(this.selectedConnectionId)}exportToJson(){return{app:`UMLGraphStudio`,version:`1.0`,exportDate:new Date().toISOString(),canvas:{zoom:this.zoom,panX:this.panX,panY:this.panY,gridSnap:this.gridSnap},nodes:this.nodes,connections:this.connections}}importFromJson(e){if(!e||!Array.isArray(e.nodes)||!Array.isArray(e.connections))throw Error(`Invalid diagram JSON file format.`);this.nodes=e.nodes.map(e=>({...e,priority:String(e.priority||`P01`).substring(0,3).toUpperCase(),x:typeof e.x==`number`?e.x:100,y:typeof e.y==`number`?e.y:100,width:typeof e.width==`number`?e.width:220,height:typeof e.height==`number`?e.height:140})),this.connections=e.connections.map(e=>({...e,lineType:e.lineType||`one-way`,lineStyle:e.lineStyle||`curved`})),e.canvas&&(this.zoom=e.canvas.zoom||1,this.panX=e.canvas.panX||0,this.panY=e.canvas.panY||0,this.gridSnap=e.canvas.gridSnap??!0),this.selectedNodeId=null,this.selectedConnectionId=null,this.saveStateToHistory(),this.notify()}loadSampleDemo(){this.importFromJson({app:`UMLGraphStudio`,version:`1.0`,canvas:{zoom:1,panX:40,panY:40,gridSnap:!0},nodes:[{id:`node_auth`,x:100,y:120,width:240,height:160,title:`Auth Gateway`,description:`OAuth2 & JWT Token Verifier`,priority:`P01`,shape:`rounded`,color:`#1e293b`,borderColor:`#3b82f6`,textColor:`#f8fafc`,imageUrl:null},{id:`node_user`,x:460,y:80,width:240,height:180,title:`User Service`,description:`Profile management & Role RBAC`,priority:`P02`,shape:`uml-class`,color:`#0f172a`,borderColor:`#6366f1`,textColor:`#f8fafc`,attributes:[`+ userId: UUID`,`+ email: String`,`+ role: Enum`],methods:[`+ authenticate()`,`+ updateProfile()`]},{id:`node_db`,x:460,y:340,width:220,height:140,title:`Primary DB Cluster`,description:`PostgreSQL High Availability`,priority:`SYS`,shape:`cylinder`,color:`#1e1b4b`,borderColor:`#a855f7`,textColor:`#f8fafc`},{id:`node_cache`,x:100,y:360,width:220,height:130,title:`Redis Cache`,description:`Session store & Rate Limiting`,priority:`MEM`,shape:`rectangle`,color:`#1f2937`,borderColor:`#10b981`,textColor:`#f8fafc`}],connections:[{id:`conn_1`,sourceId:`node_auth`,targetId:`node_user`,sourceAnchor:`right`,targetAnchor:`left`,lineType:`one-way`,lineStyle:`curved`,label:`Verify Token`,color:`#60a5fa`},{id:`conn_2`,sourceId:`node_user`,targetId:`node_db`,sourceAnchor:`bottom`,targetAnchor:`top`,lineType:`two-way`,lineStyle:`straight`,label:`SQL Query`,color:`#c084fc`},{id:`conn_3`,sourceId:`node_auth`,targetId:`node_cache`,sourceAnchor:`bottom`,targetAnchor:`top`,lineType:`dotted`,lineStyle:`curved`,label:`Cached Session`,color:`#34d399`}]})}},n=class{static exportDiagram(e,t=`diagram.umlgraph`){let n=e.exportToJson(),r=JSON.stringify(n,null,2),i=new Blob([r],{type:`application/json`}),a=URL.createObjectURL(i),o=document.createElement(`a`);o.href=a,o.download=t,document.body.appendChild(o),o.click(),document.body.removeChild(o),URL.revokeObjectURL(a)}static importDiagram(e,t){return new Promise((n,r)=>{if(!e){r(Error(`No file provided`));return}let i=new FileReader;i.onload=e=>{try{let r=JSON.parse(e.target.result);t.importFromJson(r),n(r)}catch(e){r(Error(`Failed to parse diagram JSON: `+e.message))}},i.onerror=()=>r(Error(`Error reading file`)),i.readAsText(e)})}static convertFileToBase64(e){return new Promise((t,n)=>{let r=new FileReader;r.onload=()=>t(r.result),r.onerror=e=>n(e),r.readAsDataURL(e)})}static async exportToPng(e,t=`uml_diagram.png`){try{let n=e.querySelector(`svg`).cloneNode(!0);e.querySelector(`.nodes-layer`).cloneNode(!0);let r=e.scrollWidth||1920,i=e.scrollHeight||1080,a=document.createElement(`canvas`);a.width=r,a.height=i;let o=a.getContext(`2d`);o.fillStyle=`#0b0f19`,o.fillRect(0,0,r,i);let s=new XMLSerializer().serializeToString(n),c=new Blob([s],{type:`image/svg+xml;charset=utf-8`}),l=window.URL||window.webkitURL||window,u=l.createObjectURL(c),d=new Image;d.onload=()=>{o.drawImage(d,0,0),l.revokeObjectURL(u);let e=a.toDataURL(`image/png`),n=document.createElement(`a`);n.href=e,n.download=t,document.body.appendChild(n),n.click(),document.body.removeChild(n)},d.src=u}catch(e){console.error(`Export PNG failed:`,e),alert(`Note: PNG export preview created. For exact lossless vectors, use Export JSON.`)}}},r=class{constructor(e,t){this.container=e,this.store=t,this.render(),this.store.subscribe(()=>this.updateUIState())}render(){this.container.innerHTML=`
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
    `,this.attachEvents()}attachEvents(){this.container.querySelector(`#btn-add-node`).addEventListener(`click`,()=>{let e=-this.store.panX+250,t=-this.store.panY+200;this.store.addNode({x:Math.max(50,e),y:Math.max(50,t)})}),this.container.querySelector(`#btn-format-graph`)?.addEventListener(`click`,()=>{this.store.autoFormatGraph()}),[`one-way`,`two-way`,`dotted`,`solid`].forEach(e=>{this.container.querySelector(`#line-${e}`)?.addEventListener(`click`,()=>{this.store.activeLineType=e,this.updateLineButtons()})}),this.container.querySelector(`#input-priority-filter`).addEventListener(`input`,e=>{this.store.priorityFilter=e.target.value.substring(0,3).toUpperCase(),this.store.notify()}),this.container.querySelector(`#btn-load-demo`).addEventListener(`click`,()=>{confirm(`Load demo architecture diagram? Current unsaved changes will be replaced.`)&&this.store.loadSampleDemo()});let e=this.container.querySelector(`#btn-import`),t=this.container.querySelector(`#file-import`);e.addEventListener(`click`,()=>t.click()),t.addEventListener(`change`,async e=>{let r=e.target.files[0];if(r){try{await n.importDiagram(r,this.store),alert(`Successfully imported "${r.name}"!`)}catch(e){alert(`Import Error: `+e.message)}t.value=``}}),this.container.querySelector(`#btn-export`).addEventListener(`click`,()=>{n.exportDiagram(this.store,`uml_diagram_${Date.now()}.umlgraph`)})}updateLineButtons(){let e=this.store.activeLineType;[`one-way`,`two-way`,`dotted`,`solid`].forEach(t=>{let n=this.container.querySelector(`#line-${t}`);n&&(n.className=t===e?`line-btn px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center gap-1 bg-indigo-600/30 text-indigo-200 border border-indigo-500/50 shadow-sm`:`line-btn px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center gap-1 bg-slate-900 text-slate-400 hover:text-slate-200`)})}updateUIState(){this.updateLineButtons()}},i=class{static getAnchorCoordinates(e,t){let{x:n,y:r,width:i,height:a}=e;switch(t){case`top`:return{x:n+i/2,y:r,dir:`up`};case`right`:return{x:n+i,y:r+a/2,dir:`right`};case`bottom`:return{x:n+i/2,y:r+a,dir:`down`};case`left`:return{x:n,y:r+a/2,dir:`left`};default:return{x:n+i/2,y:r+a/2,dir:`center`}}}static getBestAnchors(e,t,n=`auto`,r=`auto`){let i=[`top`,`right`,`bottom`,`left`];if(n!==`auto`&&r!==`auto`)return{source:this.getAnchorCoordinates(e,n),target:this.getAnchorCoordinates(t,r)};let a=1/0,o={source:this.getAnchorCoordinates(e,`right`),target:this.getAnchorCoordinates(t,`left`)},s=n===`auto`?i:[n],c=r===`auto`?i:[r];for(let n of s){let r=this.getAnchorCoordinates(e,n);for(let e of c){let n=this.getAnchorCoordinates(t,e),i=Math.hypot(n.x-r.x,n.y-r.y);i<a&&(a=i,o={source:r,target:n})}}return o}static generatePathD(e,t,n=`curved`){let{x:r,y:i}=e,{x:a,y:o}=t;if(n===`straight`)return`M ${r} ${i} L ${a} ${o}`;if(n===`orthogonal`){let e=(r+a)/2;return`M ${r} ${i} L ${e} ${i} L ${e} ${o} L ${a} ${o}`}let s=Math.abs(a-r)*.45,c=Math.abs(o-i)*.45,l=r,u=i,d=a,f=o;return e.dir===`right`?l+=s:e.dir===`left`?l-=s:e.dir===`down`?u+=c:e.dir===`up`?u-=c:l+=s,t.dir===`right`?d+=s:t.dir===`left`?d-=s:t.dir===`down`?f+=c:t.dir===`up`?f-=c:d-=s,`M ${r} ${i} C ${l} ${u}, ${d} ${f}, ${a} ${o}`}static getMidpoint(e,t){return{x:(e.x+t.x)/2,y:(e.y+t.y)/2}}},a=class{constructor(e,t){this.container=e,this.store=t,this.isPanning=!1,this.panStart={x:0,y:0},this.draggingNode=null,this.nodeDragOffset={x:0,y:0},this.connectingFrom=null,this.mouseWorldPos={x:0,y:0},this.render(),this.attachCanvasEvents(),this.store.subscribe(()=>this.updateDiagram())}render(){this.container.innerHTML=`
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
    `,this.worldEl=this.container.querySelector(`#canvas-world`),this.nodesLayer=this.container.querySelector(`#nodes-layer`),this.connectionsGroup=this.container.querySelector(`#connections-group`),this.draftPathEl=this.container.querySelector(`#draft-connection-path`),this.updateDiagram()}screenToWorld(e,t){let n=this.container.querySelector(`#canvas-wrapper`).getBoundingClientRect();return{x:(e-n.left-this.store.panX)/this.store.zoom,y:(t-n.top-this.store.panY)/this.store.zoom}}updateWorldTransform(){this.worldEl.style.transform=`translate(${this.store.panX}px, ${this.store.panY}px) scale(${this.store.zoom})`;let e=this.container.querySelector(`#zoom-level-text`);e&&(e.textContent=`${Math.round(this.store.zoom*100)}%`)}updateDiagram(){this.updateWorldTransform(),this.renderNodes(),this.renderConnections()}renderNodes(){this.nodesLayer.innerHTML=``;let e=this.store.priorityFilter.trim().toUpperCase();this.store.nodes.forEach(t=>{let n=!e||t.priority.includes(e),r=this.store.selectedNodeId===t.id,i=document.createElement(`div`);i.dataset.id=t.id,i.style.left=`${t.x}px`,i.style.top=`${t.y}px`,i.style.width=`${t.width}px`,i.style.backgroundColor=t.color||`#1e293b`,i.style.borderColor=t.borderColor||`#3b82f6`;let a=`uml-node pointer-events-auto border-2 ${t.shape?`shape-`+t.shape:`shape-rounded`}`;r&&(a+=` selected`),n||(a+=` opacity-30 grayscale`),i.className=a,i.innerHTML=`
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
              <input type="text" maxlength="3" value="${t.priority}" 
                class="priority-input-node text-xs font-mono font-bold text-yellow-300 bg-slate-900/90 border border-yellow-500/40 rounded px-1.5 py-0.5 text-center w-12 outline-none uppercase focus:border-yellow-400" 
                data-node-id="${t.id}" />
            </div>
            
            <span class="text-[10px] font-mono text-slate-500">${t.id.replace(`node_`,`#`)}</span>
          </div>

          <!-- Title (Double click to edit) -->
          <h4 class="node-editable-title font-bold text-sm text-slate-100 leading-tight tracking-tight break-words cursor-text select-text" 
              title="Double click to edit title" data-field="title">${t.title}</h4>

          <!-- Image Attachment (If Present) -->
          ${t.imageUrl?`
            <div class="rounded-lg overflow-hidden border border-slate-700/80 bg-slate-950/80 max-h-36 flex items-center justify-center p-1">
              <img src="${t.imageUrl}" class="object-contain max-h-32 rounded w-full" alt="Node image" />
            </div>
          `:``}

          <!-- Description (Double click to edit) -->
          <p class="node-editable-desc text-xs text-slate-300 leading-normal break-words cursor-text select-text" 
             title="Double click to edit description" data-field="description">${t.description}</p>

          <!-- UML Class Attributes / Methods Format if UML Shape -->
          ${t.shape===`uml-class`?`
            <div class="mt-1 pt-1 border-t border-slate-700 text-[11px] font-mono text-indigo-300 space-y-0.5">
              ${(t.attributes||[]).map(e=>`<div>${e}</div>`).join(``)}
              ${(t.methods||[]).map(e=>`<div class="text-emerald-300">${e}</div>`).join(``)}
            </div>
          `:``}
        </div>
      `,this.attachNodeElementEvents(i,t),this.nodesLayer.appendChild(i)})}attachNodeElementEvents(e,t){e.addEventListener(`pointerdown`,n=>{if(n.target.classList.contains(`anchor-port`)||n.target.tagName===`INPUT`||n.target.isContentEditable)return;n.stopPropagation(),this.store.selectNode(t.id),this.draggingNode=t;let r=this.screenToWorld(n.clientX,n.clientY);this.nodeDragOffset={x:r.x-t.x,y:r.y-t.y};try{e.setPointerCapture(n.pointerId)}catch{}}),e.addEventListener(`pointermove`,n=>{if(this.draggingNode&&this.draggingNode.id===t.id){let t=this.screenToWorld(n.clientX,n.clientY),r=t.x-this.nodeDragOffset.x,i=t.y-this.nodeDragOffset.y;this.store.gridSnap&&(r=Math.round(r/this.store.gridSize)*this.store.gridSize,i=Math.round(i/this.store.gridSize)*this.store.gridSize),this.draggingNode.x=r,this.draggingNode.y=i,e.style.left=`${r}px`,e.style.top=`${i}px`,this.renderConnections()}}),e.addEventListener(`pointerup`,n=>{if(this.draggingNode&&this.draggingNode.id===t.id){try{e.releasePointerCapture(n.pointerId)}catch{}this.store.updateNode(t.id,{x:this.draggingNode.x,y:this.draggingNode.y},!0),this.draggingNode=null}}),e.querySelectorAll(`.anchor-port`).forEach(e=>{e.addEventListener(`pointerdown`,n=>{n.stopPropagation();let r=e.dataset.anchor,a=i.getAnchorCoordinates(t,r);this.connectingFrom={nodeId:t.id,anchorType:r,startX:a.x,startY:a.y},this.draftPathEl.classList.remove(`hidden`)})});let n=e.querySelector(`.priority-input-node`);n&&(n.addEventListener(`pointerdown`,e=>e.stopPropagation()),n.addEventListener(`keydown`,e=>e.stopPropagation()),n.addEventListener(`input`,e=>{let r=e.target.value.substring(0,3).toUpperCase();n.value=r,this.store.updateNode(t.id,{priority:r},!1)}),n.addEventListener(`blur`,()=>{this.store.saveStateToHistory()})),e.querySelectorAll(`.node-editable-title, .node-editable-desc`).forEach(e=>{e.addEventListener(`pointerdown`,t=>{e.isContentEditable&&t.stopPropagation()}),e.addEventListener(`keydown`,t=>{t.stopPropagation(),t.key===`Enter`&&!t.shiftKey&&(t.preventDefault(),e.blur())}),e.addEventListener(`dblclick`,t=>{t.stopPropagation(),e.contentEditable=`true`,e.classList.add(`bg-slate-900`,`p-1`,`rounded`,`border`,`border-indigo-500`,`outline-none`),e.focus();let n=document.createRange();n.selectNodeContents(e);let r=window.getSelection();r.removeAllRanges(),r.addRange(n)}),e.addEventListener(`blur`,()=>{e.contentEditable=`false`,e.classList.remove(`bg-slate-900`,`p-1`,`rounded`,`border`,`border-indigo-500`,`outline-none`);let n=e.dataset.field;this.store.updateNode(t.id,{[n]:e.innerText.trim()},!0)})})}renderConnections(){this.connectionsGroup.innerHTML=``,this.store.connections.forEach(e=>{let t=this.store.nodes.find(t=>t.id===e.sourceId),n=this.store.nodes.find(t=>t.id===e.targetId);if(!t||!n)return;let r=this.store.selectedConnectionId===e.id,{source:a,target:o}=i.getBestAnchors(t,n,e.sourceAnchor,e.targetAnchor),s=i.generatePathD(a,o,e.lineStyle||`curved`),c=i.getMidpoint(a,o),l=``,u=``;e.lineType===`one-way`?l=r?`url(#marker-arrow-selected-end)`:`url(#marker-arrow-end)`:e.lineType===`two-way`&&(u=r?`url(#marker-arrow-selected-start)`:`url(#marker-arrow-start)`,l=r?`url(#marker-arrow-selected-end)`:`url(#marker-arrow-end)`);let d=r?`#ec4899`:e.color||`#64748b`,f=e.lineType===`dotted`,p=document.createElementNS(`http://www.w3.org/2000/svg`,`g`);p.className=`pointer-events-auto cursor-pointer`,p.innerHTML=`
        <!-- Wide Hit Area -->
        <path d="${s}" fill="none" stroke="transparent" stroke-width="16" />
        
        <!-- Visible Connection Line -->
        <path d="${s}" fill="none" stroke="${d}" stroke-width="${r?3.5:2.5}" 
          ${f?`stroke-dasharray="6,6" class="line-dotted"`:``} 
          ${u?`marker-start="${u}"`:``} 
          ${l?`marker-end="${l}"`:``} 
          class="svg-connection-line ${r?`selected`:``}" />

        <!-- Line Label Badge -->
        ${e.label?`
          <g transform="translate(${c.x}, ${c.y})">
            <rect x="-40" y="-12" width="80" height="24" rx="6" fill="#0f172a" stroke="${d}" stroke-width="1.5" />
            <text x="0" y="4" fill="#f8fafc" font-size="10" font-weight="600" text-anchor="middle">${e.label}</text>
          </g>
        `:``}
      `,p.addEventListener(`pointerdown`,t=>{t.stopPropagation(),this.store.selectConnection(e.id)}),this.connectionsGroup.appendChild(p)})}attachCanvasEvents(){let e=this.container.querySelector(`#canvas-wrapper`);e.addEventListener(`pointerdown`,e=>{(e.target.id===`canvas-wrapper`||e.target.id===`canvas-world`||e.target.id===`svg-layer`)&&(this.store.clearSelection(),this.isPanning=!0,this.panStart={x:e.clientX-this.store.panX,y:e.clientY-this.store.panY})}),window.addEventListener(`pointermove`,e=>{if(this.mouseWorldPos=this.screenToWorld(e.clientX,e.clientY),this.isPanning){this.store.panX=e.clientX-this.panStart.x,this.store.panY=e.clientY-this.panStart.y,this.updateWorldTransform();return}if(this.connectingFrom){let e=i.generatePathD({x:this.connectingFrom.startX,y:this.connectingFrom.startY,dir:this.connectingFrom.anchorType},{x:this.mouseWorldPos.x,y:this.mouseWorldPos.y,dir:`auto`},this.store.activeLineStyle);this.draftPathEl.setAttribute(`d`,e)}}),window.addEventListener(`pointerup`,e=>{if(this.isPanning&&=!1,this.connectingFrom){let t=document.elementFromPoint(e.clientX,e.clientY),n=t?.closest(`.uml-node`);if(n){let e=n.dataset.id,r=t?.closest(`.anchor-port`),i=r?r.dataset.anchor:`auto`;e&&e!==this.connectingFrom.nodeId&&this.store.addConnection(this.connectingFrom.nodeId,e,this.connectingFrom.anchorType,i)}this.connectingFrom=null,this.draftPathEl.classList.add(`hidden`)}}),e.addEventListener(`wheel`,e=>{e.preventDefault();let t=e.deltaY<0?1.1:.9,n=Math.min(Math.max(.2,this.store.zoom*t),3),r=this.screenToWorld(e.clientX,e.clientY);this.store.zoom=n;let i=this.screenToWorld(e.clientX,e.clientY);this.store.panX+=(i.x-r.x)*n,this.store.panY+=(i.y-r.y)*n,this.updateWorldTransform()},{passive:!1}),this.container.querySelector(`#btn-zoom-in`)?.addEventListener(`click`,()=>{this.store.zoom=Math.min(3,this.store.zoom+.15),this.updateWorldTransform()}),this.container.querySelector(`#btn-zoom-out`)?.addEventListener(`click`,()=>{this.store.zoom=Math.max(.2,this.store.zoom-.15),this.updateWorldTransform()}),this.container.querySelector(`#btn-reset-view`)?.addEventListener(`click`,()=>{this.store.zoom=1,this.store.panX=40,this.store.panY=40,this.updateWorldTransform()});let t=this.container.querySelector(`#btn-toggle-grid`);t?.addEventListener(`click`,()=>{this.store.gridSnap=!this.store.gridSnap,t.textContent=`Snap: ${this.store.gridSnap?`On`:`Off`}`,t.className=`p-2 ${this.store.gridSnap?`text-indigo-400`:`text-slate-500`} hover:bg-slate-800 rounded-lg transition text-xs font-medium`}),window.addEventListener(`keydown`,e=>{let t=document.activeElement;t&&(t.tagName===`INPUT`||t.tagName===`TEXTAREA`||t.tagName===`SELECT`||t.isContentEditable||t.closest(`input, textarea, select, [contenteditable="true"]`))||(e.key===`Delete`||e.key===`Backspace`?this.store.deleteSelected():(e.ctrlKey||e.metaKey)&&e.key===`z`&&(e.shiftKey?this.store.redo():this.store.undo()))})}},o=class{constructor(e,t){this.container=e,this.store=t,this.render(),this.store.subscribe(()=>this.render())}render(){let e=this.store.nodes.find(e=>e.id===this.store.selectedNodeId),t=this.store.connections.find(e=>e.id===this.store.selectedConnectionId);if(!e&&!t){this.container.innerHTML=`
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
            <span>Zoom: <strong class="text-slate-200">${Math.round(this.store.zoom*100)}%</strong></span>
          </div>
        </aside>
      `;return}e?this.renderNodeInspector(e):t&&this.renderConnectionInspector(t)}renderNodeInspector(e){this.container.innerHTML=`
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
            <input id="input-node-priority" type="text" maxlength="3" value="${e.priority}" 
              class="w-full px-3 py-1.5 text-sm font-mono font-bold tracking-wider text-yellow-300 bg-slate-950 border border-amber-500/50 rounded-lg focus:border-amber-400 outline-none uppercase text-center shadow-inner" />
          </div>

          <!-- Node Title & Description -->
          <div class="space-y-3">
            <div>
              <label class="text-xs font-semibold text-slate-300 mb-1 block">Title / Name</label>
              <input id="input-node-title" type="text" value="${e.title}" 
                class="w-full px-3 py-1.5 text-sm text-slate-100 bg-slate-900 border border-slate-700 rounded-lg focus:border-indigo-500 outline-none" />
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-300 mb-1 block">Description</label>
              <textarea id="input-node-desc" rows="3" 
                class="w-full px-3 py-1.5 text-xs text-slate-200 bg-slate-900 border border-slate-700 rounded-lg focus:border-indigo-500 outline-none resize-none">${e.description}</textarea>
            </div>
          </div>

          <!-- Image Attachment -->
          <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <label class="text-xs font-semibold text-slate-300 block">Attached Image</label>
            ${e.imageUrl?`
              <div class="relative group rounded-lg overflow-hidden border border-slate-700 max-h-32 bg-slate-950 flex items-center justify-center">
                <img src="${e.imageUrl}" class="object-contain max-h-32 w-full" />
                <button id="btn-remove-image" class="absolute top-2 right-2 p-1 rounded bg-red-600/80 text-white text-xs hover:bg-red-600 transition">
                  ✕ Remove
                </button>
              </div>
            `:`
              <div class="text-center p-3 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl transition cursor-pointer" id="box-upload-image">
                <svg class="w-6 h-6 text-slate-500 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span class="text-xs text-indigo-400 font-medium">Click to upload image</span>
                <input type="file" id="file-node-image" accept="image/*" class="hidden" />
              </div>
            `}
          </div>

          <!-- Shape & Style -->
          <div class="space-y-3">
            <div>
              <label class="text-xs font-semibold text-slate-300 mb-1 block">Node Shape</label>
              <select id="select-node-shape" class="w-full px-3 py-1.5 text-xs text-slate-200 bg-slate-900 border border-slate-700 rounded-lg focus:border-indigo-500 outline-none">
                <option value="rounded" ${e.shape===`rounded`?`selected`:``}>Rounded Box</option>
                <option value="rectangle" ${e.shape===`rectangle`?`selected`:``}>Standard Rectangle</option>
                <option value="diamond" ${e.shape===`diamond`?`selected`:``}>Decision Diamond</option>
                <option value="cylinder" ${e.shape===`cylinder`?`selected`:``}>Database Cylinder</option>
                <option value="uml-class" ${e.shape===`uml-class`?`selected`:``}>UML Class Box</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="text-xs font-semibold text-slate-400 mb-1 block">Fill Color</label>
                <input id="input-node-bg" type="color" value="${e.color||`#1e293b`}" class="w-full h-8 bg-slate-900 rounded border border-slate-700 cursor-pointer" />
              </div>
              <div>
                <label class="text-xs font-semibold text-slate-400 mb-1 block">Border Color</label>
                <input id="input-node-border" type="color" value="${e.borderColor||`#3b82f6`}" class="w-full h-8 bg-slate-900 rounded border border-slate-700 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      </aside>
    `,this.attachNodeEvents(e)}attachNodeEvents(e){this.container.querySelector(`#btn-delete-node`)?.addEventListener(`click`,()=>{this.store.deleteNode(e.id)});let t=this.container.querySelector(`#input-node-priority`);t?.addEventListener(`input`,n=>{let r=n.target.value.substring(0,3).toUpperCase();t.value=r,this.store.updateNode(e.id,{priority:r})}),this.container.querySelector(`#input-node-title`)?.addEventListener(`input`,t=>{this.store.updateNode(e.id,{title:t.target.value},!1)}),this.container.querySelector(`#input-node-desc`)?.addEventListener(`input`,t=>{this.store.updateNode(e.id,{description:t.target.value},!1)}),this.container.querySelector(`#select-node-shape`)?.addEventListener(`change`,t=>{this.store.updateNode(e.id,{shape:t.target.value})}),this.container.querySelector(`#input-node-bg`)?.addEventListener(`input`,t=>{this.store.updateNode(e.id,{color:t.target.value})}),this.container.querySelector(`#input-node-border`)?.addEventListener(`input`,t=>{this.store.updateNode(e.id,{borderColor:t.target.value})});let r=this.container.querySelector(`#box-upload-image`),i=this.container.querySelector(`#file-node-image`);r?.addEventListener(`click`,()=>i?.click()),i?.addEventListener(`change`,async t=>{let r=t.target.files[0];if(r)try{let t=await n.convertFileToBase64(r);this.store.updateNode(e.id,{imageUrl:t})}catch(e){alert(`Image upload failed: `+e.message)}}),this.container.querySelector(`#btn-remove-image`)?.addEventListener(`click`,()=>{this.store.updateNode(e.id,{imageUrl:null})})}renderConnectionInspector(e){let t=this.store.nodes.find(t=>t.id===e.sourceId),n=this.store.nodes.find(t=>t.id===e.targetId);this.container.innerHTML=`
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
              <span class="font-semibold text-slate-200">${t?t.title:`Unknown`}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">To:</span>
              <span class="font-semibold text-slate-200">${n?n.title:`Unknown`}</span>
            </div>
          </div>

          <!-- Line Direction / Type -->
          <div>
            <label class="text-xs font-semibold text-slate-300 mb-1 block">Connection Arrow Type</label>
            <select id="select-conn-type" class="w-full px-3 py-1.5 text-xs text-slate-200 bg-slate-900 border border-slate-700 rounded-lg focus:border-indigo-500 outline-none">
              <option value="one-way" ${e.lineType===`one-way`?`selected`:``}>One-way Arrow (--->)</option>
              <option value="two-way" ${e.lineType===`two-way`?`selected`:``}>Two-way Arrow (<--->)</option>
              <option value="dotted" ${e.lineType===`dotted`?`selected`:``}>Dotted / Dashed Line (- - -)</option>
              <option value="solid" ${e.lineType===`solid`?`selected`:``}>Solid Undirected Line (------)</option>
            </select>
          </div>

          <!-- Line Routing Style -->
          <div>
            <label class="text-xs font-semibold text-slate-300 mb-1 block">Routing Style</label>
            <select id="select-conn-style" class="w-full px-3 py-1.5 text-xs text-slate-200 bg-slate-900 border border-slate-700 rounded-lg focus:border-indigo-500 outline-none">
              <option value="curved" ${e.lineStyle===`curved`?`selected`:``}>Smooth Bezier Curve</option>
              <option value="straight" ${e.lineStyle===`straight`?`selected`:``}>Straight Line</option>
              <option value="orthogonal" ${e.lineStyle===`orthogonal`?`selected`:``}>Orthogonal Elbow</option>
            </select>
          </div>

          <!-- Line Label -->
          <div>
            <label class="text-xs font-semibold text-slate-300 mb-1 block">Line Label / Relationship</label>
            <input id="input-conn-label" type="text" value="${e.label||``}" placeholder="e.g. Calls API..." 
              class="w-full px-3 py-1.5 text-xs text-slate-200 bg-slate-900 border border-slate-700 rounded-lg focus:border-indigo-500 outline-none" />
          </div>

          <!-- Line Color -->
          <div>
            <label class="text-xs font-semibold text-slate-400 mb-1 block">Line Stroke Color</label>
            <input id="input-conn-color" type="color" value="${e.color||`#64748b`}" class="w-full h-8 bg-slate-900 rounded border border-slate-700 cursor-pointer" />
          </div>
        </div>
      </aside>
    `,this.attachConnectionEvents(e)}attachConnectionEvents(e){this.container.querySelector(`#btn-delete-conn`)?.addEventListener(`click`,()=>{this.store.deleteConnection(e.id)}),this.container.querySelector(`#select-conn-type`)?.addEventListener(`change`,t=>{this.store.updateConnection(e.id,{lineType:t.target.value})}),this.container.querySelector(`#select-conn-style`)?.addEventListener(`change`,t=>{this.store.updateConnection(e.id,{lineStyle:t.target.value})}),this.container.querySelector(`#input-conn-label`)?.addEventListener(`input`,t=>{this.store.updateConnection(e.id,{label:t.target.value})}),this.container.querySelector(`#input-conn-color`)?.addEventListener(`input`,t=>{this.store.updateConnection(e.id,{color:t.target.value})})}};document.addEventListener(`DOMContentLoaded`,()=>{let e=document.getElementById(`app`);if(!e)return;let n=new t;e.innerHTML=`
    <!-- Top Navigation & Floating Toolbar -->
    <div id="toolbar-container"></div>

    <!-- Main Working Area (Canvas + Sidebar Inspector) -->
    <div class="flex flex-1 w-full h-[calc(100vh-4rem)] overflow-hidden">
      <!-- Interactive Graph Canvas -->
      <div id="canvas-container" class="flex-1 relative flex"></div>
      
      <!-- Right Properties Inspector -->
      <div id="inspector-container"></div>
    </div>
  `,new r(document.getElementById(`toolbar-container`),n),new a(document.getElementById(`canvas-container`),n),new o(document.getElementById(`inspector-container`),n),n.loadSampleDemo(),console.log(`UML Graph Studio initialized successfully.`)});