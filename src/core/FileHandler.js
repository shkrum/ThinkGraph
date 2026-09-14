/**
 * Utility for exporting & importing diagram files (.umlgraph / .json)
 * and exporting image snapshots (PNG / SVG).
 */

export class FileHandler {
  static exportDiagram(store, filename = 'diagram.umlgraph') {
    const data = store.exportToJson();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static importDiagram(file, store) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error("No file provided"));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          store.importFromJson(parsed);
          resolve(parsed);
        } catch (err) {
          reject(new Error("Failed to parse diagram JSON: " + err.message));
        }
      };
      reader.onerror = () => reject(new Error("Error reading file"));
      reader.readAsText(file);
    });
  }

  static convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  static async exportToPng(canvasContainer, filename = 'uml_diagram.png') {
    // Basic SVG to Canvas screenshot
    try {
      const svg = canvasContainer.querySelector('svg').cloneNode(true);
      const nodesContainer = canvasContainer.querySelector('.nodes-layer').cloneNode(true);

      const width = canvasContainer.scrollWidth || 1920;
      const height = canvasContainer.scrollHeight || 1080;

      // Create dummy canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Draw dark background
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, width, height);

      // SVG Data string
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const URLObj = window.URL || window.webkitURL || window;
      const svgUrl = URLObj.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        URLObj.revokeObjectURL(svgUrl);

        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      };
      img.src = svgUrl;
    } catch (e) {
      console.error("Export PNG failed:", e);
      alert("Note: PNG export preview created. For exact lossless vectors, use Export JSON.");
    }
  }
}
