// canvas.js — pixel editor core

const SkinCanvas = (() => {
  // Dynamic resolution — 64 (Java) or 128 (Bedrock)
  let RES = 64;

  // Body-part UV regions are defined at 64x64 scale; scaled on access via scaledRegions()
  const BASE_REGIONS = {
    head:  [[0,0,32,16]],
    body:  [[16,16,40,32]],
    arm_r: [[40,16,56,32]],
    arm_l: [[32,48,48,64]],
    leg_r: [[0,16,16,32]],
    leg_l: [[16,48,32,64]],
    all:   [[0,0,64,64]]
  };

  function scaledRegions(part) {
    const s = RES / 64;
    return (BASE_REGIONS[part] || BASE_REGIONS.all).map(
      ([x1,y1,x2,y2]) => [x1*s, y1*s, x2*s, y2*s]
    );
  }

  let canvas, ctx;
  let baseLayer, outerLayer;
  let currentLayer = 'base';
  let showOuter = true;
  let zoom = 8;
  let tool = 'brush';
  let color = { r: 255, g: 255, b: 255, a: 255 };
  let showGrid = true;
  let mirrorMode = false;
  let activePart = 'all';

  let undoStack = [], redoStack = [];
  const MAX_UNDO = 50;

  let rectStart = null;
  let rectPreview = null;
  let isDrawing = false;
  let lastPixel = null;

  // Text tool state
  let textPreview = null; // { x, y, rendered }
  let textDragging = false;
  let textDragStart = null;

  // Overlay state
  let overlayImage = null;
  let overlayX = 0, overlayY = 0;
  let overlayScale = 1;
  let overlayOpacity = 1;
  let overlayActive = false;
  let overlayVisible = true;
  let overlaySnap = false;
  let overlayDragging = false;
  let overlayDragStart = null;

  let onUpdate = null;

  function init(canvasEl, updateCb) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    onUpdate = updateCb;
    baseLayer = new ImageData(RES, RES);
    outerLayer = new ImageData(RES, RES);
    resize();
    render();
    bindEvents();
  }

  function resize() {
    canvas.width = RES;
    canvas.height = RES;
    canvas.style.width  = (RES * zoom) + 'px';
    canvas.style.height = (RES * zoom) + 'px';
    ctx.imageSmoothingEnabled = false;
  }

  function getLayerData(layer) {
    return layer === 'base' ? baseLayer : outerLayer;
  }

  function getPixel(imgData, x, y) {
    const i = (y * RES + x) * 4;
    return { r: imgData.data[i], g: imgData.data[i+1], b: imgData.data[i+2], a: imgData.data[i+3] };
  }

  function setPixel(imgData, x, y, r, g, b, a) {
    const i = (y * RES + x) * 4;
    imgData.data[i] = r; imgData.data[i+1] = g; imgData.data[i+2] = b; imgData.data[i+3] = a;
  }

  function isInActivePart(x, y) {
    if (activePart === 'all') return true;
    return scaledRegions(activePart).some(([x1,y1,x2,y2]) => x >= x1 && x < x2 && y >= y1 && y < y2);
  }

  function getMirrorX(x) {
    if (!mirrorMode) return null;
    for (const [x1,,x2] of scaledRegions(activePart)) {
      if (x >= x1 && x < x2) return x1 + (x2 - x1 - 1) - (x - x1);
    }
    return null;
  }

  function paint(x, y) {
    if (x < 0 || x >= RES || y < 0 || y >= RES) return;
    if (!isInActivePart(x, y)) return;
    const layer = getLayerData(currentLayer);
    if (tool === 'brush') setPixel(layer, x, y, color.r, color.g, color.b, color.a);
    else if (tool === 'eraser') setPixel(layer, x, y, 0, 0, 0, 0);
    const mx = getMirrorX(x);
    if (mx !== null && mx !== x && mx >= 0 && mx < RES) {
      if (tool === 'brush') setPixel(layer, mx, y, color.r, color.g, color.b, color.a);
      else if (tool === 'eraser') setPixel(layer, mx, y, 0, 0, 0, 0);
    }
  }

  function floodFill(x, y) {
    const layer = getLayerData(currentLayer);
    const target = getPixel(layer, x, y);
    const { r: nr, g: ng, b: nb, a: na } = color;
    if (target.r === nr && target.g === ng && target.b === nb && target.a === na) return;
    const stack = [[x, y]];
    const visited = new Uint8Array(RES * RES);
    while (stack.length) {
      const [cx, cy] = stack.pop();
      if (cx < 0 || cx >= RES || cy < 0 || cy >= RES) continue;
      if (visited[cy * RES + cx]) continue;
      if (!isInActivePart(cx, cy)) continue;
      const p = getPixel(layer, cx, cy);
      if (p.r !== target.r || p.g !== target.g || p.b !== target.b || p.a !== target.a) continue;
      visited[cy * RES + cx] = 1;
      setPixel(layer, cx, cy, nr, ng, nb, na);
      stack.push([cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]);
    }
  }

  function eyedrop(x, y) {
    const layer = getLayerData(currentLayer);
    const p = getPixel(layer, x, y);
    if (p.a === 0) return;
    color = { ...p };
    if (onUpdate) onUpdate('color', color);
  }

  function render() {
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, RES, RES);
    drawCheckerboard();

    const composite = new ImageData(RES, RES);
    composite.data.set(baseLayer.data);

    if (showOuter) {
      for (let i = 0; i < RES * RES; i++) {
        const oi = i * 4;
        if (outerLayer.data[oi + 3] > 0) {
          const a = outerLayer.data[oi + 3] / 255;
          composite.data[oi]   = Math.round(outerLayer.data[oi]   * a + composite.data[oi]   * (1 - a));
          composite.data[oi+1] = Math.round(outerLayer.data[oi+1] * a + composite.data[oi+1] * (1 - a));
          composite.data[oi+2] = Math.round(outerLayer.data[oi+2] * a + composite.data[oi+2] * (1 - a));
          composite.data[oi+3] = Math.max(composite.data[oi+3], outerLayer.data[oi+3]);
        }
      }
    }

    if (rectPreview) {
      const { x1, y1, x2, y2 } = rectPreview;
      const minX = Math.min(x1,x2), maxX = Math.max(x1,x2);
      const minY = Math.min(y1,y2), maxY = Math.max(y1,y2);
      for (let py = minY; py <= maxY; py++) {
        for (let px = minX; px <= maxX; px++) {
          if (px >= 0 && px < RES && py >= 0 && py < RES) {
            const i = (py * RES + px) * 4;
            composite.data[i] = color.r; composite.data[i+1] = color.g;
            composite.data[i+2] = color.b; composite.data[i+3] = color.a;
          }
        }
      }
    }

    ctx.putImageData(composite, 0, 0);

    // Text preview
    if (textPreview && textPreview.rendered) {
      const { rendered, x, y } = textPreview;
      const tmp = document.createElement('canvas');
      tmp.width = rendered.width; tmp.height = rendered.height;
      tmp.getContext('2d').putImageData(rendered.imageData, 0, 0);
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(tmp, x, y);
      // dashed bounding box
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#6c63ff';
      ctx.lineWidth = 1 / zoom;
      ctx.setLineDash([2 / zoom, 2 / zoom]);
      ctx.strokeRect(x, y, rendered.width, rendered.height);
      ctx.setLineDash([]);
      ctx.restore();
    }

    if (overlayActive && overlayVisible && overlayImage) {
      const w = Math.floor(overlayImage.width * overlayScale);
      const h = Math.floor(overlayImage.height * overlayScale);
      ctx.save();
      ctx.globalAlpha = overlayOpacity;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(overlayImage, Math.floor(overlayX), Math.floor(overlayY), w, h);
      ctx.globalAlpha = 0.7;
      ctx.strokeStyle = '#6c63ff';
      ctx.lineWidth = 1 / zoom;
      ctx.setLineDash([2 / zoom, 2 / zoom]);
      ctx.strokeRect(Math.floor(overlayX), Math.floor(overlayY), w, h);
      ctx.restore();
    }

    if (activePart !== 'all') {
      const regions = scaledRegions(activePart);
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath();
      ctx.rect(0, 0, RES, RES);
      for (const [rx1,ry1,rx2,ry2] of regions) ctx.rect(rx1, ry1, rx2-rx1, ry2-ry1);
      ctx.fill('evenodd');
      ctx.restore();
    }

    if (showGrid) drawGrid();
  }

  function drawCheckerboard() {
    const step = Math.max(1, Math.round(RES / 64) * 2); // 2px at 64, 4px at 128
    for (let y = 0; y < RES; y += step) {
      for (let x = 0; x < RES; x += step) {
        ctx.fillStyle = ((x/step + y/step) % 2 === 0) ? '#1a1d27' : '#22263a';
        ctx.fillRect(x, y, step, step);
      }
    }
  }

  function drawGrid() {
    if (zoom < 4) return;
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1 / zoom;
    ctx.beginPath();
    for (let x = 0; x <= RES; x++) { ctx.moveTo(x, 0); ctx.lineTo(x, RES); }
    for (let y = 0; y <= RES; y++) { ctx.moveTo(0, y); ctx.lineTo(RES, y); }
    ctx.stroke();

    // Body-part boundary lines — every 8 base units scaled to RES
    const step = 8 * (RES / 64);
    ctx.strokeStyle = 'rgba(108,99,255,0.35)';
    ctx.lineWidth = 1.5 / zoom;
    ctx.beginPath();
    for (let x = 0; x <= RES; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, RES); }
    for (let y = 0; y <= RES; y += step) { ctx.moveTo(0, y); ctx.lineTo(RES, y); }
    ctx.stroke();
  }

  function getPixelCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = Math.floor((clientX - rect.left) / rect.width  * RES);
    const y = Math.floor((clientY - rect.top)  / rect.height * RES);
    return { x, y };
  }

  function saveUndo() {
    undoStack.push({
      base: new Uint8ClampedArray(baseLayer.data),
      outer: new Uint8ClampedArray(outerLayer.data),
      res: RES
    });
    if (undoStack.length > MAX_UNDO) undoStack.shift();
    redoStack = [];
  }

  function undo() {
    if (!undoStack.length) return;
    redoStack.push({ base: new Uint8ClampedArray(baseLayer.data), outer: new Uint8ClampedArray(outerLayer.data), res: RES });
    const state = undoStack.pop();
    if (state.res !== RES) _applyResolution(state.res, false);
    baseLayer.data.set(state.base);
    outerLayer.data.set(state.outer);
    render();
    if (onUpdate) onUpdate('pixels');
  }

  function redo() {
    if (!redoStack.length) return;
    undoStack.push({ base: new Uint8ClampedArray(baseLayer.data), outer: new Uint8ClampedArray(outerLayer.data), res: RES });
    const state = redoStack.pop();
    if (state.res !== RES) _applyResolution(state.res, false);
    baseLayer.data.set(state.base);
    outerLayer.data.set(state.outer);
    render();
    if (onUpdate) onUpdate('pixels');
  }

  function isOverOverlay(x, y) {
    if (!overlayActive || !overlayImage) return false;
    const w = Math.floor(overlayImage.width * overlayScale);
    const h = Math.floor(overlayImage.height * overlayScale);
    return x >= Math.floor(overlayX) && x < Math.floor(overlayX) + w &&
           y >= Math.floor(overlayY) && y < Math.floor(overlayY) + h;
  }

  function bindEvents() {
    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseup', onUp);
    canvas.addEventListener('mouseleave', onUp);
    canvas.addEventListener('touchstart', e => { e.preventDefault(); onDown(e); }, { passive: false });
    canvas.addEventListener('touchmove',  e => { e.preventDefault(); onMove(e); }, { passive: false });
    canvas.addEventListener('touchend', onUp);
  }

  function onDown(e) {
    const { x, y } = getPixelCoords(e);
    if (overlayActive && isOverOverlay(x, y)) {
      overlayDragging = true;
      overlayDragStart = { mx: x, my: y, ox: overlayX, oy: overlayY };
      return;
    }
    if (tool === 'text') {
      if (textPreview && textPreview.rendered) {
        const { x: tx, y: ty, rendered } = textPreview;
        if (x >= tx && x < tx + rendered.width && y >= ty && y < ty + rendered.height) {
          textDragging = true;
          textDragStart = { mx: x, my: y, ox: tx, oy: ty };
          return;
        }
        stampText();
      }
      return;
    }
    isDrawing = true;
    lastPixel = { x, y };
    if (tool === 'eyedropper') { eyedrop(x, y); return; }
    if (tool === 'fill') { saveUndo(); floodFill(x, y); render(); if (onUpdate) onUpdate('pixels'); return; }
    if (tool === 'rect') { rectStart = { x, y }; return; }
    saveUndo();
    paint(x, y);
    render();
    if (onUpdate) onUpdate('pixels');
  }

  function onMove(e) {
    if (textDragging && textDragStart) {
      const { x, y } = getPixelCoords(e);
      const { rendered } = textPreview;
      const nx = textDragStart.ox + (x - textDragStart.mx);
      const ny = textDragStart.oy + (y - textDragStart.my);
      textPreview.x = Utils.clamp(nx, 0, RES - rendered.width);
      textPreview.y = Utils.clamp(ny, 0, RES - rendered.height);
      render();
      return;
    }
    if (overlayDragging && overlayDragStart) {
      const { x, y } = getPixelCoords(e);
      let nx = overlayDragStart.ox + (x - overlayDragStart.mx);
      let ny = overlayDragStart.oy + (y - overlayDragStart.my);
      const snapUnit = 8 * (RES / 64);
      if (overlaySnap) { nx = Math.round(nx / snapUnit) * snapUnit; ny = Math.round(ny / snapUnit) * snapUnit; }
      overlayX = nx; overlayY = ny;
      render();
      return;
    }
    if (overlayActive && !isDrawing) {
      const { x, y } = getPixelCoords(e);
      canvas.style.cursor = isOverOverlay(x, y) ? 'move' : 'crosshair';
    }
    if (!isDrawing) return;
    const { x, y } = getPixelCoords(e);
    if (tool === 'eyedropper') { eyedrop(x, y); return; }
    if (tool === 'rect') {
      rectPreview = { x1: rectStart.x, y1: rectStart.y, x2: x, y2: y };
      render();
      return;
    }
    if (lastPixel && (lastPixel.x !== x || lastPixel.y !== y)) {
      const dx = x - lastPixel.x, dy = y - lastPixel.y;
      const steps = Math.max(Math.abs(dx), Math.abs(dy));
      for (let i = 0; i <= steps; i++) {
        paint(Math.round(lastPixel.x + dx * i / steps), Math.round(lastPixel.y + dy * i / steps));
      }
      lastPixel = { x, y };
      render();
      if (onUpdate) onUpdate('pixels');
    }
  }

  function onUp(e) {
    if (textDragging) { textDragging = false; textDragStart = null; return; }
    if (overlayDragging) { overlayDragging = false; overlayDragStart = null; return; }
    if (!isDrawing) return;
    isDrawing = false;
    if (tool === 'rect' && rectStart) {
      const { x, y } = getPixelCoords(e);
      saveUndo();
      const minX = Math.min(rectStart.x, x), maxX = Math.max(rectStart.x, x);
      const minY = Math.min(rectStart.y, y), maxY = Math.max(rectStart.y, y);
      const layer = getLayerData(currentLayer);
      for (let py = minY; py <= maxY; py++)
        for (let px = minX; px <= maxX; px++)
          if (px >= 0 && px < RES && py >= 0 && py < RES && isInActivePart(px, py))
            setPixel(layer, px, py, color.r, color.g, color.b, color.a);
      rectStart = null; rectPreview = null;
      render();
      if (onUpdate) onUpdate('pixels');
    }
    lastPixel = null;
  }

  // ===== Resolution =====

  // Internal: switch RES and rebuild ImageData, optionally scaling existing pixels
  function _applyResolution(newRes, scalePixels) {
    const oldRes = RES;
    RES = newRes;

    if (scalePixels) {
      baseLayer  = _scaleImageData(baseLayer,  oldRes, newRes);
      outerLayer = _scaleImageData(outerLayer, oldRes, newRes);
    } else {
      baseLayer  = new ImageData(RES, RES);
      outerLayer = new ImageData(RES, RES);
    }

    resize();
    if (onUpdate) onUpdate('resolution', RES);
  }

  function _scaleImageData(src, fromRes, toRes) {
    const off = document.createElement('canvas');
    off.width = toRes; off.height = toRes;
    const octx = off.getContext('2d');
    octx.imageSmoothingEnabled = false;
    // Draw src into a temp canvas at fromRes, then scale to toRes
    const tmp = document.createElement('canvas');
    tmp.width = fromRes; tmp.height = fromRes;
    tmp.getContext('2d').putImageData(src, 0, 0);
    octx.drawImage(tmp, 0, 0, toRes, toRes);
    return octx.getImageData(0, 0, toRes, toRes);
  }

  function setResolution(newRes, scalePixels) {
    if (newRes === RES) return;
    saveUndo();
    _applyResolution(newRes, scalePixels);
    render();
  }

  function getResolution() { return RES; }

  // ===== Load / Export =====

  function loadImage(img) {
    saveUndo();
    const off = document.createElement('canvas');
    off.width = RES; off.height = RES;
    const octx = off.getContext('2d');
    octx.imageSmoothingEnabled = false;
    octx.clearRect(0, 0, RES, RES);
    octx.drawImage(img, 0, 0, RES, RES);
    baseLayer  = octx.getImageData(0, 0, RES, RES);
    outerLayer = new ImageData(RES, RES);
    render();
    if (onUpdate) onUpdate('pixels');
  }

  function loadSkin(type) {
    const img = new Image();
    img.onload = () => {
      saveUndo();
      const off = document.createElement('canvas');
      off.width = RES; off.height = RES;
      const octx = off.getContext('2d');
      octx.imageSmoothingEnabled = false;
      octx.clearRect(0, 0, RES, RES);
      octx.drawImage(img, 0, 0, RES, RES); // upscales to 128 if needed
      baseLayer  = octx.getImageData(0, 0, RES, RES);
      outerLayer = new ImageData(RES, RES);
      render();
      if (onUpdate) onUpdate('pixels');
    };
    img.onerror = () => {
      baseLayer  = new ImageData(RES, RES);
      outerLayer = new ImageData(RES, RES);
      render();
      if (onUpdate) onUpdate('pixels');
    };
    img.src = type === 'alex' ? 'alex.png' : 'steve.png';
  }

  function exportPNG() {
    const off = document.createElement('canvas');
    off.width = RES; off.height = RES;
    const octx = off.getContext('2d');
    octx.imageSmoothingEnabled = false;
    octx.putImageData(baseLayer, 0, 0);
    const outerOff = document.createElement('canvas');
    outerOff.width = RES; outerOff.height = RES;
    outerOff.getContext('2d').putImageData(outerLayer, 0, 0);
    octx.drawImage(outerOff, 0, 0);
    return off.toDataURL('image/png');
  }

  function getCompositeImageData() {
    const off = document.createElement('canvas');
    off.width = RES; off.height = RES;
    const octx = off.getContext('2d');
    octx.imageSmoothingEnabled = false;
    octx.putImageData(baseLayer, 0, 0);
    const outerOff = document.createElement('canvas');
    outerOff.width = RES; outerOff.height = RES;
    outerOff.getContext('2d').putImageData(outerLayer, 0, 0);
    octx.drawImage(outerOff, 0, 0);
    return octx.getImageData(0, 0, RES, RES);
  }

  function clear() {
    saveUndo();
    getLayerData(currentLayer).data.fill(0);
    render();
    if (onUpdate) onUpdate('pixels');
  }

  function setZoom(z) {
    zoom = Utils.clamp(z, 2, 24);
    canvas.style.width  = (RES * zoom) + 'px';
    canvas.style.height = (RES * zoom) + 'px';
    render();
    return zoom;
  }

  // ===== Overlay API =====
  function loadOverlay(img) {
    overlayImage = img;
    overlayX = Math.floor((RES - img.width) / 2);
    overlayY = Math.floor((RES - img.height) / 2);
    overlayScale = 1;
    overlayOpacity = 1;
    overlayActive = true;
    overlayVisible = true;
    render();
  }

  function applyOverlay() {
    if (!overlayActive || !overlayImage) return;
    saveUndo();
    const off = document.createElement('canvas');
    off.width = RES; off.height = RES;
    const octx = off.getContext('2d');
    octx.imageSmoothingEnabled = false;
    octx.globalAlpha = overlayOpacity;
    octx.drawImage(overlayImage, Math.floor(overlayX), Math.floor(overlayY),
      Math.floor(overlayImage.width * overlayScale), Math.floor(overlayImage.height * overlayScale));
    const od = octx.getImageData(0, 0, RES, RES);
    const layer = getLayerData(currentLayer);
    for (let i = 0; i < RES * RES; i++) {
      const p = i * 4;
      if (od.data[p + 3] === 0) continue;
      const oa = od.data[p + 3] / 255;
      layer.data[p]   = Math.round(od.data[p]   * oa + layer.data[p]   * (1 - oa));
      layer.data[p+1] = Math.round(od.data[p+1] * oa + layer.data[p+1] * (1 - oa));
      layer.data[p+2] = Math.round(od.data[p+2] * oa + layer.data[p+2] * (1 - oa));
      layer.data[p+3] = Math.min(255, layer.data[p+3] + od.data[p+3]);
    }
    cancelOverlay();
    if (onUpdate) onUpdate('pixels');
  }

  function cancelOverlay() {
    overlayImage = null;
    overlayActive = false;
    render();
  }

  function setOverlayScale(s) { overlayScale = s; render(); }
  function setOverlayOpacity(o) { overlayOpacity = o; render(); }
  function setOverlayVisible(v) { overlayVisible = v; render(); }
  function setOverlaySnap(v) { overlaySnap = v; }
  function isOverlayActive() { return overlayActive; }

  function setTextPreview(rendered, x, y) {
    textPreview = rendered ? { rendered, x, y } : null;
    render();
  }

  function getTextPreviewPos() {
    return textPreview ? { x: textPreview.x, y: textPreview.y } : null;
  }

  function stampText() {
    if (!textPreview || !textPreview.rendered) return;
    saveUndo();
    const { rendered, x, y } = textPreview;
    const layer = getLayerData(currentLayer);
    const { imageData, width, height } = rendered;
    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const tx = x + px, ty = y + py;
        if (tx < 0 || tx >= RES || ty < 0 || ty >= RES) continue;
        const si = (py * width + px) * 4;
        if (imageData.data[si + 3] === 0) continue;
        setPixel(layer, tx, ty, imageData.data[si], imageData.data[si+1], imageData.data[si+2], imageData.data[si+3]);
      }
    }
    render();
    if (onUpdate) onUpdate('pixels');
  }

  function setTool(t) { tool = t; if (t !== 'text') { textPreview = null; render(); } }
  function setColor(c) { color = { ...c }; }
  function setLayer(l) { currentLayer = l; }
  function setShowOuter(v) { showOuter = v; render(); }
  function setGrid(v) { showGrid = v; render(); }
  function setMirror(v) { mirrorMode = v; }
  function setActivePart(p) { activePart = p; render(); }
  function getZoom() { return zoom; }
  function getColor() { return { ...color }; }

  function saveToStorage() {
    try {
      localStorage.setItem('mineskin_base',  JSON.stringify(Array.from(baseLayer.data)));
      localStorage.setItem('mineskin_outer', JSON.stringify(Array.from(outerLayer.data)));
      localStorage.setItem('mineskin_res',   String(RES));
    } catch(e) {}
  }

  function loadFromStorage() {
    try {
      const base  = localStorage.getItem('mineskin_base');
      const outer = localStorage.getItem('mineskin_outer');
      const res   = parseInt(localStorage.getItem('mineskin_res') || '64');
      if (!base) return false;
      if (res !== RES) _applyResolution(res, false);
      baseLayer.data.set(new Uint8ClampedArray(JSON.parse(base)));
      if (outer) outerLayer.data.set(new Uint8ClampedArray(JSON.parse(outer)));
      render();
      if (onUpdate) onUpdate('pixels');
      return true;
    } catch(e) {}
    return false;
  }

  return {
    init, undo, redo, clear, loadImage, loadSkin, exportPNG, getCompositeImageData,
    setZoom, getZoom, setTool, setColor, getColor, setLayer, setShowOuter,
    setGrid, setMirror, setActivePart, saveToStorage, loadFromStorage, render,
    loadOverlay, applyOverlay, cancelOverlay,
    setOverlayScale, setOverlayOpacity, setOverlayVisible, setOverlaySnap, isOverlayActive,
    setResolution, getResolution,
    setTextPreview, stampText, getTextPreviewPos
  };
})();
