// preview.js — Three.js 3D Minecraft character preview

const SkinPreview = (() => {
  let scene, camera, renderer, model, skinTexture;
  let isAnimating = true;
  let modelType = 'steve';
  let animFrame = 0;
  let rafId = null;
  let isDragging = false, prevMouse = { x: 0, y: 0 };
  let rotY = 0.3, rotX = 0.1;
  let camDist = 3.2;
  let container;

  // Minecraft UV mappings [u, v, w, h] in 0-1 space (64x64 texture)
  const UV = {
    head:    { front: [8,8,16,16],  back: [24,8,32,16],  top: [8,0,16,8],   bottom: [16,0,24,8],  right: [0,8,8,16],   left: [16,8,24,16]  },
    body:    { front: [20,20,28,32], back: [32,20,40,32], top: [20,16,28,20], bottom: [28,16,36,20], right: [16,20,20,32], left: [28,20,32,32] },
    arm_r:   { front: [44,20,48,32], back: [52,20,56,32], top: [44,16,48,20], bottom: [48,16,52,20], right: [40,20,44,32], left: [48,20,52,32] },
    arm_l:   { front: [36,52,40,64], back: [44,52,48,64], top: [36,48,40,52], bottom: [40,48,44,52], right: [32,52,36,64], left: [40,52,44,64] },
    leg_r:   { front: [4,20,8,32],   back: [12,20,16,32], top: [4,16,8,20],   bottom: [8,16,12,20],  right: [0,20,4,32],   left: [8,20,12,32]  },
    leg_l:   { front: [20,52,24,64], back: [28,52,32,64], top: [20,48,24,52], bottom: [24,48,28,52], right: [16,52,20,64], left: [24,52,28,64] },
  };

  function makeUVs(faceUVs) {
    // BoxGeometry UV layout: each face has 4 vertices (2 triangles)
    // Face order in Three.js BoxGeometry: +x, -x, +y, -y, +z, -z (right,left,top,bottom,front,back)
    const faces = ['right','left','top','bottom','front','back'];
    const uvArr = [];
    for (const face of faces) {
      const [px1,py1,px2,py2] = faceUVs[face]; // pixel coords
      const u1 = px1/64, v1 = 1-py2/64, u2 = px2/64, v2 = 1-py1/64;
      // Three.js BoxGeometry vertex order per face: TL, TR, BL, BR (in UV space)
      uvArr.push(u1,v2, u2,v2, u1,v1, u2,v1);
    }
    return new Float32Array(uvArr);
  }

  function createBox(w, h, d, uvFaces, x, y, z) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const uvs = makeUVs(uvFaces);
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({
      map: skinTexture,
      transparent: true,
      alphaTest: 0.1,
      side: THREE.FrontSide
    }));
    mesh.position.set(x, y, z);
    return mesh;
  }

  function buildModel(type) {
    if (model) scene.remove(model);
    model = new THREE.Group();

    const armW = type === 'alex' ? 0.25 : 0.375;
    const armUV_R = type === 'alex'
      ? { front:[44,20,47,32], back:[51,20,54,32], top:[44,16,47,20], bottom:[47,16,50,20], right:[40,20,44,32], left:[47,20,51,32] }
      : UV.arm_r;
    const armUV_L = type === 'alex'
      ? { front:[36,52,39,64], back:[43,52,46,64], top:[36,48,39,52], bottom:[39,48,42,52], right:[32,52,36,64], left:[39,52,43,64] }
      : UV.arm_l;

    // Head
    const head = createBox(1, 1, 1, UV.head, 0, 1.5, 0);
    // Body
    const body = createBox(1.5, 1.5, 0.75, UV.body, 0, 0.25, 0);
    // Arms
    const armR = createBox(armW, 1.5, 0.375, armUV_R, -(0.75 + armW/2), 0.25, 0);
    const armL = createBox(armW, 1.5, 0.375, armUV_L,  (0.75 + armW/2), 0.25, 0);
    // Legs
    const legR = createBox(0.375, 1.5, 0.375, UV.leg_r, -0.1875, -1.25, 0);
    const legL = createBox(0.375, 1.5, 0.375, UV.leg_l,  0.1875, -1.25, 0);

    // Store refs for animation
    model.userData = { head, armR, armL, legR, legL };

    model.add(head, body, armR, armL, legR, legL);
    scene.add(model);
  }

  function init(containerId) {
    container = document.getElementById(containerId);
    const w = container.clientWidth, h = container.clientHeight;

    scene = new THREE.Scene();
    scene.background = null;

    camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 0.5, camDist);
    camera.lookAt(0, 0.5, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(2, 4, 3);
    scene.add(ambient, dir);

    // Placeholder texture
    const blankData = new Uint8Array(64*64*4);
    // Fill with a subtle default so the model is visible
    for (let i = 0; i < blankData.length; i += 4) { blankData[i]=100; blankData[i+1]=80; blankData[i+2]=60; blankData[i+3]=255; }
    skinTexture = new THREE.DataTexture(blankData, 64, 64, THREE.RGBAFormat);
    skinTexture.magFilter = THREE.NearestFilter;
    skinTexture.minFilter = THREE.NearestFilter;
    skinTexture.flipY = false;
    skinTexture.needsUpdate = true;

    buildModel('steve');
    bindEvents();
    animate();
  }

  function updateTexture(imageData) {
    if (!skinTexture) return;
    const src = imageData.data;
    const flipped = new Uint8Array(64 * 64 * 4);
    for (let y = 0; y < 64; y++) {
      const srcRow = (63 - y) * 64 * 4;
      const dstRow = y * 64 * 4;
      flipped.set(src.subarray(srcRow, srcRow + 64*4), dstRow);
    }
    skinTexture.image = { data: flipped, width: 64, height: 64 };
    skinTexture.needsUpdate = true;
    // Popup shares the same DataTexture reference — needsUpdate propagates automatically
  }

  function animate() {
    rafId = requestAnimationFrame(animate);
    animFrame += 0.02;

    if (model) {
      model.rotation.y = rotY;
      model.rotation.x = rotX;

      if (isAnimating) {
        const swing = Math.sin(animFrame) * 0.25;
        const { head, armR, armL, legR, legL } = model.userData;
        if (head) head.rotation.y = Math.sin(animFrame * 0.5) * 0.1;
        if (armR) armR.rotation.x = swing;
        if (armL) armL.rotation.x = -swing;
        if (legR) legR.rotation.x = -swing;
        if (legL) legL.rotation.x = swing;
      } else {
        const { head, armR, armL, legR, legL } = model.userData;
        [head, armR, armL, legR, legL].forEach(m => { if (m) { m.rotation.x = 0; m.rotation.y = 0; } });
      }
    }

    renderer.render(scene, camera);
  }

  function bindEvents() {
    const el = renderer.domElement;
    el.addEventListener('mousedown', e => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; });
    window.addEventListener('mousemove', e => {
      if (!isDragging) return;
      rotY += (e.clientX - prevMouse.x) * 0.01;
      rotX += (e.clientY - prevMouse.y) * 0.01;
      rotX = Utils.clamp(rotX, -0.6, 0.6);
      prevMouse = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mouseup', () => isDragging = false);
    el.addEventListener('wheel', e => {
      camDist = Utils.clamp(camDist + e.deltaY * 0.005, 1.5, 8);
      camera.position.setLength(camDist);
      camera.lookAt(0, 0.5, 0);
    });
    // Touch
    let lastTouch = null;
    el.addEventListener('touchstart', e => { lastTouch = e.touches[0]; });
    el.addEventListener('touchmove', e => {
      if (!lastTouch) return;
      rotY += (e.touches[0].clientX - lastTouch.clientX) * 0.01;
      rotX += (e.touches[0].clientY - lastTouch.clientY) * 0.01;
      rotX = Utils.clamp(rotX, -0.6, 0.6);
      lastTouch = e.touches[0];
    });
    el.addEventListener('touchend', () => lastTouch = null);

    window.addEventListener('resize', () => {
      if (!container) return;
      const w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  }

  function setModel(type) {
    modelType = type;
    buildModel(type);
    // Sync popup model if open
    if (popup.active) popup.buildModel(type);
  }

  function toggleAnimation() {
    isAnimating = !isAnimating;
    // Sync popup
    if (popup.active) popup.isAnimating = isAnimating;
    return isAnimating;
  }

  // ===== Popup (large modal preview) =====
  const popup = {
    active: false,
    scene: null, camera: null, renderer: null, model: null,
    animFrame: 0, isAnimating: true,
    rotY: 0.3, rotX: 0.1, camDist: 3.8,
    isDragging: false, prevMouse: { x: 0, y: 0 },
    rafId: null,

    buildModel(type) {
      if (this.model) this.scene.remove(this.model);
      this.model = new THREE.Group();

      const armW = type === 'alex' ? 0.25 : 0.375;
      const armUV_R = type === 'alex'
        ? { front:[44,20,47,32], back:[51,20,54,32], top:[44,16,47,20], bottom:[47,16,50,20], right:[40,20,44,32], left:[47,20,51,32] }
        : UV.arm_r;
      const armUV_L = type === 'alex'
        ? { front:[36,52,39,64], back:[43,52,46,64], top:[36,48,39,52], bottom:[39,48,42,52], right:[32,52,36,64], left:[39,52,43,64] }
        : UV.arm_l;

      const mk = (w,h,d,uv,x,y,z) => {
        const geo = new THREE.BoxGeometry(w,h,d);
        geo.setAttribute('uv', new THREE.BufferAttribute(makeUVs(uv), 2));
        const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({
          map: skinTexture, transparent: true, alphaTest: 0.1, side: THREE.FrontSide
        }));
        mesh.position.set(x,y,z);
        return mesh;
      };

      const head  = mk(1,1,1,UV.head,0,1.5,0);
      const body  = mk(1.5,1.5,0.75,UV.body,0,0.25,0);
      const armR  = mk(armW,1.5,0.375,armUV_R,-(0.75+armW/2),0.25,0);
      const armL  = mk(armW,1.5,0.375,armUV_L, (0.75+armW/2),0.25,0);
      const legR  = mk(0.375,1.5,0.375,UV.leg_r,-0.1875,-1.25,0);
      const legL  = mk(0.375,1.5,0.375,UV.leg_l, 0.1875,-1.25,0);

      this.model.userData = { head, armR, armL, legR, legL };
      this.model.add(head, body, armR, armL, legR, legL);
      this.scene.add(this.model);
    },

    init(containerId) {
      const el = document.getElementById(containerId);
      const w = el.clientWidth || 780, h = el.clientHeight || 560;

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(42, w/h, 0.1, 100);
      this.camera.position.set(0, 0.5, this.camDist);
      this.camera.lookAt(0, 0.5, 0);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(w, h);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.setClearColor(0x000000, 0);
      el.appendChild(this.renderer.domElement);

      const ambient = new THREE.AmbientLight(0xffffff, 0.65);
      const dir = new THREE.DirectionalLight(0xffffff, 0.85);
      dir.position.set(3, 5, 4);
      const dir2 = new THREE.DirectionalLight(0x8899ff, 0.3);
      dir2.position.set(-3, -1, -2);
      this.scene.add(ambient, dir, dir2);

      this.buildModel(modelType);
      this.bindEvents(el);
      this.isAnimating = isAnimating;
      this.rotY = rotY; this.rotX = rotX;
      this.active = true;
      this.animate();
    },

    animate() {
      this.rafId = requestAnimationFrame(() => this.animate());
      this.animFrame += 0.02;
      if (this.model) {
        this.model.rotation.y = this.rotY;
        this.model.rotation.x = this.rotX;
        if (this.isAnimating) {
          const sw = Math.sin(this.animFrame) * 0.25;
          const { head, armR, armL, legR, legL } = this.model.userData;
          if (head) head.rotation.y = Math.sin(this.animFrame * 0.5) * 0.1;
          if (armR) armR.rotation.x = sw;
          if (armL) armL.rotation.x = -sw;
          if (legR) legR.rotation.x = -sw;
          if (legL) legL.rotation.x = sw;
        } else {
          const { head, armR, armL, legR, legL } = this.model.userData;
          [head,armR,armL,legR,legL].forEach(m => { if(m){m.rotation.x=0;m.rotation.y=0;} });
        }
      }
      this.renderer.render(this.scene, this.camera);
    },

    bindEvents(containerEl) {
      const el = this.renderer.domElement;
      el.addEventListener('mousedown', e => { this.isDragging=true; this.prevMouse={x:e.clientX,y:e.clientY}; });
      window.addEventListener('mousemove', e => {
        if (!this.isDragging) return;
        this.rotY += (e.clientX - this.prevMouse.x) * 0.008;
        this.rotX += (e.clientY - this.prevMouse.y) * 0.008;
        this.rotX = Utils.clamp(this.rotX, -0.7, 0.7);
        this.prevMouse = { x: e.clientX, y: e.clientY };
      });
      window.addEventListener('mouseup', () => this.isDragging = false);
      el.addEventListener('wheel', e => {
        this.camDist = Utils.clamp(this.camDist + e.deltaY * 0.004, 1.5, 9);
        this.camera.position.setLength(this.camDist);
        this.camera.lookAt(0, 0.5, 0);
      }, { passive: true });
      let lastTouch = null;
      el.addEventListener('touchstart', e => { lastTouch = e.touches[0]; });
      el.addEventListener('touchmove', e => {
        if (!lastTouch) return;
        this.rotY += (e.touches[0].clientX - lastTouch.clientX) * 0.01;
        this.rotX += (e.touches[0].clientY - lastTouch.clientY) * 0.01;
        this.rotX = Utils.clamp(this.rotX, -0.7, 0.7);
        lastTouch = e.touches[0];
      });
      el.addEventListener('touchend', () => lastTouch = null);

      // Resize when modal resizes
      const ro = new ResizeObserver(() => {
        if (!this.renderer) return;
        const w = containerEl.clientWidth, h = containerEl.clientHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
      });
      ro.observe(containerEl);
      this._ro = ro;
    },

    destroy() {
      if (this.rafId) cancelAnimationFrame(this.rafId);
      if (this._ro) this._ro.disconnect();
      if (this.renderer) {
        this.renderer.domElement.remove();
        this.renderer.dispose();
      }
      this.scene = this.camera = this.renderer = this.model = null;
      this.active = false;
    }
  };

  function openPopup(containerId) {
    popup.init(containerId);
    // Push current texture immediately
    if (skinTexture) {
      popup.scene && popup.scene.traverse(obj => {
        if (obj.isMesh && obj.material) obj.material.map = skinTexture;
      });
    }
  }

  function closePopup() {
    popup.destroy();
  }

  function setPopupModel(type) {
    if (popup.active) popup.buildModel(type);
  }

  function togglePopupAnimation() {
    if (!popup.active) return;
    popup.isAnimating = !popup.isAnimating;
    return popup.isAnimating;
  }

  return { init, updateTexture, setModel, toggleAnimation, openPopup, closePopup, setPopupModel, togglePopupAnimation };
})();
