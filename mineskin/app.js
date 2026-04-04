// app.js — main application controller

document.addEventListener('DOMContentLoaded', () => {

  // ===== Mobile Warning =====
  document.getElementById('mobile-warning-ok').addEventListener('click', () => {
    document.getElementById('mobile-warning').style.display = 'none';
  });

  // ===== Color State =====
  let hue = 0, sat = 1, val = 1, alpha = 255;
  let recentColors = [];
  const MAX_RECENT = 10;

  // ===== Init Canvas =====
  const canvasEl = document.getElementById('skin-canvas');
  SkinCanvas.init(canvasEl, onCanvasUpdate);

  // ===== Init 3D Preview =====
  SkinPreview.init('preview-container');

  // ===== Share System =====
  const shareModal      = document.getElementById('share-modal');
  const shareLinkInput  = document.getElementById('share-link-input');
  let _sharedSkinData   = null; // stores the original shared skin for reset

  function _getModelType() {
    return document.getElementById('btn-steve').classList.contains('active') ? 'steve' : 'alex';
  }

  function _buildShareLink() {
    const dataUrl    = SkinCanvas.exportPNG();
    const compressed = LZString.compressToEncodedURIComponent(dataUrl);
    const res        = SkinCanvas.getResolution();
    const model      = _getModelType();
    const name       = (document.getElementById('project-name').value.trim() || 'MySkin')
                         .replace(/[^a-zA-Z0-9_\-]/g, '_');
    const base       = window.location.href.split('?')[0];
    return `${base}?skin=${compressed}&model=${model}&res=${res}&name=${encodeURIComponent(name)}`;
  }

  function openShareModal() {
    const link = _buildShareLink();
    shareLinkInput.value = link;
    _sharedSkinData = null; // reset — will be set only when loaded from URL
    shareModal.classList.add('open');
    // Select the text for easy manual copy
    requestAnimationFrame(() => { shareLinkInput.select(); });
  }

  function closeShareModal() {
    shareModal.classList.remove('open');
  }

  document.getElementById('btn-share').addEventListener('click', openShareModal);
  document.getElementById('share-modal-close').addEventListener('click', closeShareModal);
  document.getElementById('share-modal-backdrop').addEventListener('click', closeShareModal);

  document.getElementById('btn-copy-link').addEventListener('click', () => {
    const link = shareLinkInput.value;
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => {
      const btn = document.getElementById('btn-copy-link');
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
      Utils.showToast('Link copied! Send it to your friends 😎');
    }).catch(() => {
      // Fallback for browsers that block clipboard without HTTPS
      shareLinkInput.select();
      document.execCommand('copy');
      Utils.showToast('Link copied ✓');
    });
  });

  document.getElementById('btn-share-newtab').addEventListener('click', () => {
    window.open(shareLinkInput.value, '_blank', 'noopener');
  });

  document.getElementById('btn-share-reset').addEventListener('click', () => {
    if (!_sharedSkinData) {
      Utils.showToast('No shared version to reset to');
      return;
    }
    const img = new Image();
    img.onload = () => {
      SkinCanvas.loadImage(img);
      schedulePreviewUpdate();
      closeShareModal();
      Utils.showToast('Reset to shared version ✓');
    };
    img.src = _sharedSkinData;
  });

  // Load skin from URL params on startup
  function loadSkinFromURL() {
    const params     = new URLSearchParams(window.location.search);
    const compressed = params.get('skin');
    if (!compressed) return false;

    let dataUrl;
    try {
      dataUrl = LZString.decompressFromEncodedURIComponent(compressed);
      if (!dataUrl || !dataUrl.startsWith('data:image/png')) throw new Error('invalid');
    } catch {
      Utils.showToast('Could not load shared skin — link may be corrupted');
      return false;
    }

    const model = params.get('model') || 'steve';
    const res   = parseInt(params.get('res') || '64');
    const name  = params.get('name');

    const img = new Image();
    img.onload = () => {
      const w = img.width;
      // Validate dimensions
      if ((w !== 64 && w !== 128) || img.width !== img.height) {
        Utils.showToast('Shared skin has invalid dimensions — ignored');
        return;
      }

      // Switch resolution if needed
      if (res !== SkinCanvas.getResolution()) {
        SkinCanvas.setResolution(res, false);
        document.querySelectorAll('.res-btn').forEach(b => {
          b.classList.toggle('active', parseInt(b.dataset.res) === res);
        });
      }

      // Set model
      if (model === 'alex') {
        document.getElementById('btn-alex').classList.add('active');
        document.getElementById('btn-steve').classList.remove('active');
        SkinPreview.setModel('alex');
      } else {
        document.getElementById('btn-steve').classList.add('active');
        document.getElementById('btn-alex').classList.remove('active');
        SkinPreview.setModel('steve');
      }

      // Set project name
      if (name) document.getElementById('project-name').value = decodeURIComponent(name);

      SkinCanvas.loadImage(img);
      schedulePreviewUpdate();

      // Store for reset
      _sharedSkinData = dataUrl;

      // Pre-fill share modal link
      shareLinkInput.value = window.location.href;

      Utils.showToast('🔗 Shared skin loaded — start editing!');

      // Clean URL without reloading (keeps it tidy)
      window.history.replaceState({}, '', window.location.pathname);
    };

    img.onerror = () => Utils.showToast('Could not decode shared skin image');
    img.src = dataUrl;
    return true;
  }

  // ===== Init: URL skin → startup choice → localStorage → blank =====
  const loadedFromURL = loadSkinFromURL();
  if (!loadedFromURL) {
    const hasSaved = !!localStorage.getItem('mineskin_base');
    if (hasSaved) {
      // Show startup modal — let user choose
      const startupModal = document.getElementById('startup-modal');
      startupModal.classList.add('open');

      document.getElementById('startup-load').addEventListener('click', () => {
        startupModal.classList.remove('open');
        SkinCanvas.loadFromStorage();
        schedulePreviewUpdate();
        Utils.showToast('Last project loaded ✓');
      });

      document.getElementById('startup-new').addEventListener('click', () => {
        startupModal.classList.remove('open');
        // Clear storage so this becomes a truly fresh project
        localStorage.removeItem('mineskin_base');
        localStorage.removeItem('mineskin_outer');
        localStorage.removeItem('mineskin_res');
        document.getElementById('project-name').value = 'MySkin';
        SkinCanvas.loadSkin('steve');
        schedulePreviewUpdate();
        Utils.showToast('New project started ✓');
      });
    } else {
      // No saved data — start fresh silently
      SkinCanvas.loadSkin('steve');
    }
  }

  // ===== Canvas Update Callback =====
  let previewTimer = null;
  function onCanvasUpdate(type, data) {
    if (type === 'color') {
      const { r, g, b, a } = data;
      const hsv = Utils.rgbToHsv(r, g, b);
      hue = hsv.h; sat = hsv.s; val = hsv.v; alpha = a;
      updateColorUI();
    }
    schedulePreviewUpdate();
    SkinCanvas.saveToStorage();
  }

  function schedulePreviewUpdate() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => {
      SkinPreview.updateTexture(SkinCanvas.getCompositeImageData());
    }, 80);
  }

  // ===== Text Tool =====
  const textPanel = document.getElementById('text-panel');
  const textInput = document.getElementById('text-input');
  const textSizeSlider = document.getElementById('text-size');
  const textSizeVal = document.getElementById('text-size-val');
  const textOutline = document.getElementById('text-outline');

  function updateTextPreview() {
    const txt = textInput.value.trim();
    if (!txt) { SkinCanvas.setTextPreview(null); return; }
    const res = SkinCanvas.getResolution();

    // Clamp slider max to what actually fits
    const maxScale = mcMaxScale(txt, res);
    textSizeSlider.max = maxScale;
    if (parseInt(textSizeSlider.value) > maxScale) {
      textSizeSlider.value = maxScale;
      textSizeVal.textContent = maxScale + '×';
    }

    const scale = parseInt(textSizeSlider.value);
    const c = SkinCanvas.getColor();
    const rendered = mcRenderText(txt, c.r, c.g, c.b, scale, textOutline.checked);
    if (!rendered) { SkinCanvas.setTextPreview(null); return; }

    // Center by default; preserve position if already placed
    const existing = SkinCanvas.getTextPreviewPos();
    const x = existing ? Utils.clamp(existing.x, 0, res - rendered.width)  : Math.floor((res - rendered.width)  / 2);
    const y = existing ? Utils.clamp(existing.y, 0, res - rendered.height) : Math.floor((res - rendered.height) / 2);
    SkinCanvas.setTextPreview(rendered, x, y);
  }

  textInput.addEventListener('input', () => {
    // Auto-scale when text changes
    const res = SkinCanvas.getResolution();
    const auto = mcAutoScale(textInput.value.trim(), res);
    textSizeSlider.value = auto;
    textSizeVal.textContent = auto + '×';
    updateTextPreview();
  });

  textSizeSlider.addEventListener('input', () => {
    textSizeVal.textContent = textSizeSlider.value + '×';
    updateTextPreview();
  });

  textOutline.addEventListener('change', updateTextPreview);

  document.getElementById('btn-text-center').addEventListener('click', () => {
    const txt = textInput.value.trim();
    if (!txt) return;
    const res = SkinCanvas.getResolution();
    const scale = parseInt(textSizeSlider.value);
    const c = SkinCanvas.getColor();
    const rendered = mcRenderText(txt, c.r, c.g, c.b, scale, textOutline.checked);
    if (!rendered) return;
    SkinCanvas.setTextPreview(rendered, Math.floor((res - rendered.width) / 2), Math.floor((res - rendered.height) / 2));
  });

  document.getElementById('btn-text-stamp').addEventListener('click', () => {
    SkinCanvas.stampText();
    schedulePreviewUpdate();
    Utils.showToast('Text stamped ✓');
  });

  // ===== Tool Buttons =====
  document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      SkinCanvas.setTool(btn.dataset.tool);
      document.getElementById('canvas-wrapper').style.cursor =
        btn.dataset.tool === 'eyedropper' ? 'crosshair' :
        btn.dataset.tool === 'fill' ? 'cell' : 'crosshair';
      textPanel.hidden = btn.dataset.tool !== 'text';
      if (btn.dataset.tool === 'text') updateTextPreview();
    });
  });

  // Mirror
  const btnMirror = document.getElementById('btn-mirror');
  btnMirror.addEventListener('click', () => {
    const active = btnMirror.dataset.active === 'true';
    btnMirror.dataset.active = String(!active);
    SkinCanvas.setMirror(!active);
    Utils.showToast(!active ? 'Mirror ON' : 'Mirror OFF');
  });

  // Grid
  const btnGrid = document.getElementById('btn-grid');
  btnGrid.addEventListener('click', () => {
    const active = btnGrid.dataset.active === 'true';
    btnGrid.dataset.active = String(!active);
    SkinCanvas.setGrid(!active);
  });

  // Undo / Redo
  document.getElementById('btn-undo').addEventListener('click', () => SkinCanvas.undo());
  document.getElementById('btn-redo').addEventListener('click', () => SkinCanvas.redo());

  // Clear
  document.getElementById('btn-clear').addEventListener('click', () => {
    if (confirm('Clear current layer?')) { SkinCanvas.clear(); schedulePreviewUpdate(); }
  });

  // Zoom
  const zoomLabel = document.getElementById('zoom-label');
  document.getElementById('btn-zoom-in').addEventListener('click', () => {
    zoomLabel.textContent = SkinCanvas.setZoom(SkinCanvas.getZoom() + 2) + 'x';
  });
  document.getElementById('btn-zoom-out').addEventListener('click', () => {
    zoomLabel.textContent = SkinCanvas.setZoom(SkinCanvas.getZoom() - 2) + 'x';
  });

  // Layer tabs
  document.querySelectorAll('.layer-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.layer-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      SkinCanvas.setLayer(tab.dataset.layer);
    });
  });

  document.getElementById('toggle-outer').addEventListener('change', e => {
    SkinCanvas.setShowOuter(e.target.checked);
    schedulePreviewUpdate();
  });

  // Body parts
  document.querySelectorAll('.part-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.part-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      SkinCanvas.setActivePart(btn.dataset.part);
    });
  });

  // 3D Model toggle — also loads the matching skin template into the canvas
  document.getElementById('btn-steve').addEventListener('click', () => {
    document.getElementById('btn-steve').classList.add('active');
    document.getElementById('btn-alex').classList.remove('active');
    SkinPreview.setModel('steve');
    SkinCanvas.loadSkin('steve');
    Utils.showToast('Steve skin loaded');
  });
  document.getElementById('btn-alex').addEventListener('click', () => {
    document.getElementById('btn-alex').classList.add('active');
    document.getElementById('btn-steve').classList.remove('active');
    SkinPreview.setModel('alex');
    SkinCanvas.loadSkin('alex');
    Utils.showToast('Alex skin loaded');
  });
  document.getElementById('btn-anim').addEventListener('click', () => {
    const on = SkinPreview.toggleAnimation();
    document.getElementById('btn-anim').textContent = on ? '▶' : '⏸';
  });

  // ===== 3D Preview Modal =====
  const modal        = document.getElementById('preview-modal');
  const modalBtnSteve = document.getElementById('modal-btn-steve');
  const modalBtnAlex  = document.getElementById('modal-btn-alex');
  const modalBtnAnim  = document.getElementById('modal-btn-anim');

  function openPreviewModal() {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    // Init popup renderer after the modal is visible so container has dimensions
    requestAnimationFrame(() => {
      SkinPreview.openPopup('preview-modal-container');
      // Sync current model/anim state to modal buttons
      const isSteve = document.getElementById('btn-steve').classList.contains('active');
      modalBtnSteve.classList.toggle('active',  isSteve);
      modalBtnAlex.classList.toggle('active',  !isSteve);
    });
  }

  function closePreviewModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    // Destroy popup renderer after transition ends to avoid flash
    setTimeout(() => SkinPreview.closePopup(), 280);
  }

  document.getElementById('btn-expand').addEventListener('click', openPreviewModal);
  document.getElementById('preview-modal-close').addEventListener('click', closePreviewModal);
  document.getElementById('preview-modal-backdrop').addEventListener('click', closePreviewModal);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closePreviewModal();
    if (e.key === 'Escape' && shareModal.classList.contains('open')) closeShareModal();
  });

  modalBtnSteve.addEventListener('click', () => {
    modalBtnSteve.classList.add('active');
    modalBtnAlex.classList.remove('active');
    // Sync both preview + canvas
    document.getElementById('btn-steve').click();
    SkinPreview.setPopupModel('steve');
  });
  modalBtnAlex.addEventListener('click', () => {
    modalBtnAlex.classList.add('active');
    modalBtnSteve.classList.remove('active');
    document.getElementById('btn-alex').click();
    SkinPreview.setPopupModel('alex');
  });
  modalBtnAnim.addEventListener('click', () => {
    const on = SkinPreview.togglePopupAnimation();
    modalBtnAnim.textContent = on ? '▶' : '⏸';
  });

  // ===== Resolution Toggle =====
  document.querySelectorAll('.res-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const newRes = parseInt(btn.dataset.res);
      if (newRes === SkinCanvas.getResolution()) return;
      const action = confirm(
        `Switch to ${newRes}×${newRes}?\n\n` +
        (newRes === 128
          ? 'Pixels will be upscaled to 128×128 (Bedrock Edition).'
          : 'Pixels will be downscaled to 64×64 (Java Edition).') +
        '\n\nClick OK to scale existing artwork, or Cancel to start fresh.'
      );
      SkinCanvas.setResolution(newRes, action);
      document.querySelectorAll('.res-btn').forEach(b => b.classList.toggle('active', b === btn));
      schedulePreviewUpdate();
      Utils.showToast(`Switched to ${newRes}×${newRes} ${ newRes === 128 ? '(Bedrock)' : '(Java)' }`);
    });
  });

  // ===== Image Overlay =====
  const overlayPanel = document.getElementById('overlay-panel');
  const overlayScaleSlider = document.getElementById('overlay-scale');
  const overlayScaleVal = document.getElementById('overlay-scale-val');
  const overlayOpacitySlider = document.getElementById('overlay-opacity');
  const overlayOpacityVal = document.getElementById('overlay-opacity-val');

  document.getElementById('btn-overlay-upload').addEventListener('click', () => {
    document.getElementById('overlay-file-input').click();
  });

  document.getElementById('overlay-file-input').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      SkinCanvas.loadOverlay(img);
      overlayPanel.hidden = false;
      overlayScaleSlider.value = 1;
      overlayScaleVal.textContent = '1.0×';
      overlayOpacitySlider.value = 100;
      overlayOpacityVal.textContent = '100%';
      document.getElementById('overlay-visible').checked = true;
      document.getElementById('overlay-snap').checked = false;
      Utils.showToast('Image loaded — drag to position ✓');
    };
    img.src = URL.createObjectURL(file);
    e.target.value = '';
  });

  overlayScaleSlider.addEventListener('input', () => {
    const v = parseFloat(overlayScaleSlider.value);
    overlayScaleVal.textContent = v.toFixed(1) + '×';
    SkinCanvas.setOverlayScale(v);
  });

  overlayOpacitySlider.addEventListener('input', () => {
    const v = parseInt(overlayOpacitySlider.value);
    overlayOpacityVal.textContent = v + '%';
    SkinCanvas.setOverlayOpacity(v / 100);
  });

  document.getElementById('overlay-visible').addEventListener('change', e => {
    SkinCanvas.setOverlayVisible(e.target.checked);
  });

  document.getElementById('overlay-snap').addEventListener('change', e => {
    SkinCanvas.setOverlaySnap(e.target.checked);
  });

  document.getElementById('btn-overlay-apply').addEventListener('click', () => {
    SkinCanvas.applyOverlay();
    overlayPanel.hidden = true;
    schedulePreviewUpdate();
    Utils.showToast('Overlay applied ✓');
  });

  document.getElementById('btn-overlay-cancel').addEventListener('click', () => {
    SkinCanvas.cancelOverlay();
    overlayPanel.hidden = true;
    Utils.showToast('Overlay cancelled');
  });

  // ===== Upload Validation =====
  const uploadErrorModal  = document.getElementById('upload-error-modal');
  const uploadErrorMsg    = document.getElementById('upload-error-msg');
  const uploadErrorOk     = document.getElementById('upload-error-ok');

  function showUploadError(message) {
    uploadErrorMsg.textContent = message;
    uploadErrorModal.classList.add('open');
  }

  function closeUploadError() {
    uploadErrorModal.classList.remove('open');
  }

  uploadErrorOk.addEventListener('click', closeUploadError);
  document.getElementById('upload-error-backdrop').addEventListener('click', closeUploadError);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && uploadErrorModal.classList.contains('open')) closeUploadError();
  });

  // Validate and load a skin file — the single entry point for all skin imports
  function loadSkinFile(file) {
    if (!file.type.startsWith('image/')) {
      showUploadError('Only image files are supported. Please upload a PNG file.');
      return;
    }
    if (file.type !== 'image/png') {
      showUploadError('Only PNG files are supported.\nJPEG, GIF, and other formats are not valid Minecraft skins.');
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      const w = img.width, h = img.height;

      if (w !== h) {
        showUploadError(
          `Your image is ${w}×${h} pixels — skins must be square.\n` +
          'Please use a 64×64 or 128×128 image.'
        );
        return;
      }

      if (w !== 64 && w !== 128) {
        showUploadError(
          `Your image is ${w}×${w} pixels, which is not a supported skin size.\n\n` +
          'Minecraft does not support this resolution natively.\n' +
          'Please resize your image to 64×64 or 128×128 and try again.'
        );
        return;
      }

      // Valid — auto-switch resolution if needed, then load
      if (w !== SkinCanvas.getResolution()) {
        SkinCanvas.setResolution(w, false);
        document.querySelectorAll('.res-btn').forEach(b => {
          b.classList.toggle('active', parseInt(b.dataset.res) === w);
        });
      }

      SkinCanvas.loadImage(img);
      schedulePreviewUpdate();
      Utils.showToast(`Skin loaded (${w}×${w}) ✓`);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      showUploadError('The file could not be read as an image. Please try a different file.');
    };

    img.src = url;
  }

  // ===== Import / Export =====
  document.getElementById('btn-import').addEventListener('click', () => {
    document.getElementById('file-input').click();
  });

  document.getElementById('file-input').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    loadSkinFile(file);
    e.target.value = '';
  });

  document.getElementById('btn-export').addEventListener('click', () => {
    const dataUrl = SkinCanvas.exportPNG();
    const a = document.createElement('a');
    a.href = dataUrl;
    const res = SkinCanvas.getResolution();
    const raw = document.getElementById('project-name').value.trim();
    const name = (raw || 'MySkin').replace(/[^a-zA-Z0-9_\-]/g, '_');
    a.download = `${name}_mineskin.png`;
    a.click();
    Utils.showToast(`Skin exported (${res}×${res}) ✓`);
  });

  // ===== Drag & Drop =====
  const dropOverlay = document.getElementById('drop-overlay');
  let dragCounter = 0;

  document.addEventListener('dragenter', e => {
    e.preventDefault();
    dragCounter++;
    dropOverlay.classList.add('active');
  });
  document.addEventListener('dragleave', () => {
    dragCounter--;
    if (dragCounter <= 0) { dragCounter = 0; dropOverlay.classList.remove('active'); }
  });
  document.addEventListener('dragover', e => e.preventDefault());
  document.addEventListener('drop', e => {
    e.preventDefault();
    dragCounter = 0;
    dropOverlay.classList.remove('active');
    const file = e.dataTransfer.files[0];
    if (file) loadSkinFile(file);
  });

  // ===== Keyboard Shortcuts =====
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    const key = e.key.toLowerCase();
    if (e.ctrlKey || e.metaKey) {
      if (key === 'z') { e.preventDefault(); SkinCanvas.undo(); }
      if (key === 'y') { e.preventDefault(); SkinCanvas.redo(); }
      return;
    }
    const toolMap = { b: 'brush', e: 'eraser', i: 'eyedropper', f: 'fill', r: 'rect', t: 'text' };
    if (toolMap[key]) {
      const toolName = toolMap[key];
      document.querySelectorAll('.tool-btn[data-tool]').forEach(b => {
        b.classList.toggle('active', b.dataset.tool === toolName);
      });
      SkinCanvas.setTool(toolName);
      textPanel.hidden = toolName !== 'text';
      if (toolName === 'text') updateTextPreview();
    }
    if (key === 'm') btnMirror.click();
    if (key === 'g') btnGrid.click();
    if (key === '+' || key === '=') document.getElementById('btn-zoom-in').click();
    if (key === '-') document.getElementById('btn-zoom-out').click();
  });

  // ===== Color Picker =====
  const gradientCanvas = document.getElementById('color-gradient');
  const gradCtx = gradientCanvas.getContext('2d');
  const hueCanvas = document.getElementById('hue-slider');
  const hueCtx = hueCanvas.getContext('2d');
  const alphaCanvas = document.getElementById('alpha-slider');
  const alphaCtx = alphaCanvas.getContext('2d');
  const gradCursor = document.getElementById('gradient-cursor');
  const hueCursor = document.getElementById('hue-cursor');
  const alphaCursor = document.getElementById('alpha-cursor');
  const hexInput = document.getElementById('hex-input');
  const alphaInput = document.getElementById('alpha-input');
  const colorPreview = document.getElementById('color-preview');

  function drawGradient() {
    const { r, g, b } = Utils.hsvToRgb(hue, 1, 1);
    const w = gradientCanvas.width, h = gradientCanvas.height;
    gradCtx.clearRect(0, 0, w, h);
    const gH = gradCtx.createLinearGradient(0, 0, w, 0);
    gH.addColorStop(0, '#fff');
    gH.addColorStop(1, `rgb(${r},${g},${b})`);
    gradCtx.fillStyle = gH;
    gradCtx.fillRect(0, 0, w, h);
    const gV = gradCtx.createLinearGradient(0, 0, 0, h);
    gV.addColorStop(0, 'rgba(0,0,0,0)');
    gV.addColorStop(1, '#000');
    gradCtx.fillStyle = gV;
    gradCtx.fillRect(0, 0, w, h);
  }

  function drawHueSlider() {
    const w = hueCanvas.width, h = hueCanvas.height;
    const g = hueCtx.createLinearGradient(0, 0, w, 0);
    for (let i = 0; i <= 6; i++) g.addColorStop(i/6, `hsl(${i*60},100%,50%)`);
    hueCtx.fillStyle = g;
    hueCtx.fillRect(0, 0, w, h);
  }

  function drawAlphaSlider() {
    const w = alphaCanvas.width, h = alphaCanvas.height;
    const { r, g, b } = Utils.hsvToRgb(hue, sat, val);
    // Checkerboard
    for (let x = 0; x < w; x += 8) {
      for (let y = 0; y < h; y += 8) {
        alphaCtx.fillStyle = ((x/8 + y/8) % 2 === 0) ? '#555' : '#888';
        alphaCtx.fillRect(x, y, 8, 8);
      }
    }
    const g2 = alphaCtx.createLinearGradient(0, 0, w, 0);
    g2.addColorStop(0, `rgba(${r},${g},${b},0)`);
    g2.addColorStop(1, `rgba(${r},${g},${b},1)`);
    alphaCtx.fillStyle = g2;
    alphaCtx.fillRect(0, 0, w, h);
  }

  function updateColorUI() {
    drawGradient();
    drawHueSlider();
    drawAlphaSlider();

    const gw = gradientCanvas.width, gh = gradientCanvas.height;
    gradCursor.style.left = (sat * gw) + 'px';
    gradCursor.style.top = ((1 - val) * gh) + 'px';
    hueCursor.style.left = (hue / 360 * hueCanvas.width) + 'px';
    alphaCursor.style.left = (alpha / 255 * alphaCanvas.width) + 'px';

    const { r, g, b } = Utils.hsvToRgb(hue, sat, val);
    hexInput.value = Utils.rgbaToHex(r, g, b);
    alphaInput.value = alpha;
    colorPreview.style.setProperty('--preview-color', `rgba(${r},${g},${b},${alpha/255})`);

    SkinCanvas.setColor({ r, g, b, a: alpha });
    addRecentColor(r, g, b, alpha);
    // Update text preview color if text tool is active
    if (!textPanel.hidden) updateTextPreview();
  }

  function addRecentColor(r, g, b, a) {
    const hex = Utils.rgbaToHex(r, g, b);
    recentColors = recentColors.filter(c => c.hex !== hex);
    recentColors.unshift({ hex, r, g, b, a });
    if (recentColors.length > MAX_RECENT) recentColors.pop();
    renderRecentPalette();
  }

  function renderRecentPalette() {
    const el = document.getElementById('recent-palette');
    el.innerHTML = '';
    recentColors.forEach(c => {
      const sw = document.createElement('div');
      sw.className = 'palette-swatch';
      sw.style.background = `rgba(${c.r},${c.g},${c.b},${c.a/255})`;
      sw.title = c.hex;
      sw.addEventListener('click', () => {
        const hsv = Utils.rgbToHsv(c.r, c.g, c.b);
        hue = hsv.h; sat = hsv.s; val = hsv.v; alpha = c.a;
        updateColorUI();
      });
      el.appendChild(sw);
    });
  }

  // Gradient interaction
  function handleGradient(e) {
    const rect = gradientCanvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    sat = Utils.clamp((cx - rect.left) / rect.width, 0, 1);
    val = Utils.clamp(1 - (cy - rect.top) / rect.height, 0, 1);
    updateColorUI();
  }

  let gradDragging = false;
  gradientCanvas.addEventListener('mousedown', e => { gradDragging = true; handleGradient(e); });
  window.addEventListener('mousemove', e => { if (gradDragging) handleGradient(e); });
  window.addEventListener('mouseup', () => gradDragging = false);
  gradientCanvas.addEventListener('touchstart', e => { e.preventDefault(); handleGradient(e); }, { passive: false });
  gradientCanvas.addEventListener('touchmove', e => { e.preventDefault(); handleGradient(e); }, { passive: false });

  // Hue slider
  function handleHue(e) {
    const rect = hueCanvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    hue = Utils.clamp((cx - rect.left) / rect.width, 0, 1) * 360;
    updateColorUI();
  }
  let hueDragging = false;
  hueCanvas.addEventListener('mousedown', e => { hueDragging = true; handleHue(e); });
  window.addEventListener('mousemove', e => { if (hueDragging) handleHue(e); });
  window.addEventListener('mouseup', () => hueDragging = false);
  hueCanvas.addEventListener('touchstart', e => { e.preventDefault(); handleHue(e); }, { passive: false });
  hueCanvas.addEventListener('touchmove', e => { e.preventDefault(); handleHue(e); }, { passive: false });

  // Alpha slider
  function handleAlpha(e) {
    const rect = alphaCanvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    alpha = Math.round(Utils.clamp((cx - rect.left) / rect.width, 0, 1) * 255);
    updateColorUI();
  }
  let alphaDragging = false;
  alphaCanvas.addEventListener('mousedown', e => { alphaDragging = true; handleAlpha(e); });
  window.addEventListener('mousemove', e => { if (alphaDragging) handleAlpha(e); });
  window.addEventListener('mouseup', () => alphaDragging = false);
  alphaCanvas.addEventListener('touchstart', e => { e.preventDefault(); handleAlpha(e); }, { passive: false });
  alphaCanvas.addEventListener('touchmove', e => { e.preventDefault(); handleAlpha(e); }, { passive: false });

  // Hex input
  hexInput.addEventListener('change', () => {
    const hex = hexInput.value.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      const { r, g, b } = Utils.hexToRgba(hex);
      const hsv = Utils.rgbToHsv(r, g, b);
      hue = hsv.h; sat = hsv.s; val = hsv.v;
      updateColorUI();
    }
  });

  alphaInput.addEventListener('change', () => {
    alpha = Utils.clamp(parseInt(alphaInput.value) || 0, 0, 255);
    updateColorUI();
  });

  // ===== Minecraft Palette =====
  const MC_PALETTE = [
    '#f9fafa','#d4d4d4','#a0a0a0','#6b6b6b','#3d3d3d','#1a1a1a','#0d0d0d','#000000',
    '#f5e6c8','#e8c99a','#c8a06e','#a07850','#7a5230','#4a2e18','#2a1a0a','#150d05',
    '#ff6b6b','#ff4444','#cc0000','#990000','#660000','#ff9966','#ff6633','#cc3300',
    '#ffcc44','#ffaa00','#cc8800','#996600','#664400','#ffff44','#cccc00','#888800',
    '#88ff44','#44cc00','#228800','#115500','#44ffcc','#00ccaa','#008877','#004433',
    '#44aaff','#0088ff','#0055cc','#003388','#4444ff','#2222cc','#111188','#000055',
    '#cc44ff','#aa00cc','#770088','#440055','#ff44aa','#cc0077','#880044','#440022',
    '#7b4f2e','#5c3a1e','#3d2510','#1e1208','#8b7355','#6b5a3e','#4a3d28','#2a2010',
  ];

  const mcPaletteEl = document.getElementById('mc-palette');
  MC_PALETTE.forEach(hex => {
    const sw = document.createElement('div');
    sw.className = 'palette-swatch';
    sw.style.background = hex;
    sw.title = hex;
    sw.addEventListener('click', () => {
      const { r, g, b } = Utils.hexToRgba(hex);
      const hsv = Utils.rgbToHsv(r, g, b);
      hue = hsv.h; sat = hsv.s; val = hsv.v; alpha = 255;
      updateColorUI();
    });
    mcPaletteEl.appendChild(sw);
  });

  // ===== Initial color render =====
  updateColorUI();
  schedulePreviewUpdate();
});
