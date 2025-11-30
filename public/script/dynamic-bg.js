/**
 * 動態背景效果 - 微重力懸浮版 (Zero Gravity)
 * 特色：
 * 1. 平時粒子極致寧靜懸浮，幾乎靜止
 * 2. 滑鼠移動時變成「放大鏡」，還原圖片的清晰細節與原本色彩
 * 3. 點擊切換不同作品的封面圖片
 *
 * 改編自 test/main.js
 */

(function () {
  'use strict';

  // 檢查是否為 compact 模式
  const isCompactMode = document.body.classList.contains('bg-compact');

  if (!isCompactMode) {
    return; // 只在 compact 模式下執行
  }

  const container = document.getElementById('dynamic-bg');

  if (!container) {
    console.warn('Dynamic background container not found');
    return;
  }

  // 檢查 Three.js 是否載入
  if (typeof THREE === 'undefined') {
    console.error('Three.js is not loaded. Please include Three.js before this script.');
    return;
  }

  // ====== 配置 ======
  // 從 PHP 傳入的作品封面圖片
  const IMAGE_FILES = window.PROJECT_COVER_IMAGES || ['/uploads/BG.png', '/uploads/BG2.jpg'];

  const CONFIG = {
    // --- 粒子設定 ---
    particleCount: 80000,
    sampleStep: 1,
    particleSize: 2.8,
    renderScale: 1.5,
    brightnessBoost: 1.3,

    // --- 3D 設定 ---
    zDepthStrength: 100,
    zRandomness: 10,

    // --- 極限慢速背景 ---
    noiseSpeed: 0.005,      // 幾乎像時間停止一樣慢
    noiseStrength: 1.5,     // 輕微的浮動幅度

    // --- 透鏡設定 ---
    lensRadius: 220,
    lensMag: 0.15,
    lensSnap: 0.2,         // 放大鏡抓取的速度

    // --- 物理設定 ---
    friction: 0.95          // 高阻力，防止任何抖動
  };

  let scene, camera, renderer, pointCloud;
  let geometry;
  let allImageTargets = [];
  let currentImageIndex = -1;
  let physicsData = [];
  const mouse = new THREE.Vector2(-9999, -9999);
  const clock = new THREE.Clock();
  const statusEl = createStatusElement();

  function createStatusElement() {
    const el = document.createElement('div');
    el.id = 'particle-status';
    el.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px 40px;
      border-radius: 10px;
      font-size: 14px;
      z-index: 1000;
      display: none;
    `;
    document.body.appendChild(el);
    return el;
  }

  function log(msg) {
    if (statusEl) {
      statusEl.innerHTML = msg;
      statusEl.style.display = 'block';
    }
    console.log(msg);
  }

  // =========================================
  // 0. 貼圖 (柔和的羽化圓點)
  // =========================================
  function createSoftTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.9)');
    grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.3)');
    grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }

  // =========================================
  // 1. 圖片分析
  // =========================================
  function processImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxSize = 400;
        let w = img.width, h = img.height;
        if (w > h) { if (w > maxSize) { h *= maxSize / w; w = maxSize; } }
        else { if (h > maxSize) { w *= maxSize / h; h = maxSize; } }

        canvas.width = w; canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);

        const imgData = ctx.getImageData(0, 0, w, h).data;
        const points = [];

        // 【關鍵修改】計算偏移量
        // 計算 3D 世界中的可視寬度
        // Camera Z = 600, FOV = 75
        const vFOV = camera.fov * Math.PI / 180;
        const visibleHeight = 2 * Math.tan(vFOV / 2) * camera.position.z;
        const visibleWidth = visibleHeight * (window.innerWidth / window.innerHeight);

        // 我們要往右移螢幕寬度的 15% (從 50% 到 65%)
        const xOffset = visibleWidth * 0.15;

        for (let y = 0; y < h; y += CONFIG.sampleStep) {
          for (let x = 0; x < w; x += CONFIG.sampleStep) {
            const i = (y * w + x) * 4;
            const r = imgData[i];
            const g = imgData[i + 1];
            const b = imgData[i + 2];
            const a = imgData[i + 3];
            const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

            if (a > 20) {
              const zDepth = (brightness - 0.5) * -CONFIG.zDepthStrength;
              const zRandom = (Math.random() - 0.5) * CONFIG.zRandomness;

              points.push({
                // 原本是置中 (x - w/2)，現在加上 xOffset
                x: (x - w / 2) * CONFIG.renderScale + xOffset,
                y: -(y - h / 2) * CONFIG.renderScale,
                z: zDepth + zRandom,
                r: Math.min(1, (r / 255) * CONFIG.brightnessBoost),
                g: Math.min(1, (g / 255) * CONFIG.brightnessBoost),
                b: Math.min(1, (b / 255) * CONFIG.brightnessBoost)
              });
            }
          }
        }
        resolve(points);
      };
      img.onerror = () => reject(`讀取失敗: ${src}`);
    });
  }

  // =========================================
  // 2. 場景
  // =========================================
  function initScene() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.0005);

    // 獲取容器尺寸
    const width = container.offsetWidth || window.innerWidth;
    const height = container.offsetHeight || window.innerHeight;

    camera = new THREE.PerspectiveCamera(75, width / height, 1, 5000);
    camera.position.z = 600;

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 設置渲染器樣式
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    container.appendChild(renderer.domElement);

    window.addEventListener('resize', () => {
      const width = container.offsetWidth || window.innerWidth;
      const height = container.offsetHeight || window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });

    // 將事件綁定到 canvas
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);
    console.log('🎯 已綁定點擊事件到 canvas');
  }

  function createParticleSystem() {
    geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(CONFIG.particleCount * 3);
    const colors = new Float32Array(CONFIG.particleCount * 3);

    for (let i = 0; i < CONFIG.particleCount; i++) {
      const x = (Math.random() - 0.5) * 1500;
      const y = (Math.random() - 0.5) * 1500;
      const z = (Math.random() - 0.5) * 1500;
      positions[i * 3] = x; positions[i * 3 + 1] = y; positions[i * 3 + 2] = z;
      colors[i * 3] = 0; colors[i * 3 + 1] = 0; colors[i * 3 + 2] = 0;

      physicsData.push({
        x, y, z,
        vx: 0, vy: 0, vz: 0,
        targetX: x, targetY: y, targetZ: z,
        targetR: 0, targetG: 0, targetB: 0,
        currR: 0, currG: 0, currB: 0,
        noiseOffset: Math.random() * 100
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: CONFIG.particleSize,
      map: createSoftTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.NormalBlending,
      sizeAttenuation: true
    });

    pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);
  }

  // =========================================
  // 3. 物理與透鏡邏輯
  // =========================================
  function applyTargetImage(index) {
    if (allImageTargets.length === 0) return;
    const targets = allImageTargets[index];

    for (let i = 0; i < CONFIG.particleCount; i++) {
      const p = physicsData[i];
      const t = targets[i % targets.length];
      if (t) {
        p.targetX = t.x; p.targetY = t.y; p.targetZ = t.z;
        p.targetR = t.r; p.targetG = t.g; p.targetB = t.b;
      }
    }
  }

  function updateParticles() {
    const positions = geometry.attributes.position.array;
    const colors = geometry.attributes.color.array;
    const time = clock.getElapsedTime() * CONFIG.noiseSpeed;
    const nScale = 0.005;

    for (let i = 0; i < CONFIG.particleCount; i++) {
      const p = physicsData[i];

      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const distSq = dx * dx + dy * dy;
      const isInsideLens = distSq < CONFIG.lensRadius ** 2;

      // --- 狀態 A: 透鏡內 (放大鏡互動) ---
      if (isInsideLens) {
        const dist = Math.sqrt(distSq);
        const normalizedDist = dist / CONFIG.lensRadius;
        const magFactor = 1 + (1 - normalizedDist) * CONFIG.lensMag;

        const targetDx = p.targetX - mouse.x;
        const targetDy = p.targetY - mouse.y;
        const zoomTargetX = mouse.x + targetDx * magFactor;
        const zoomTargetY = mouse.y + targetDy * magFactor;
        const zoomTargetZ = p.targetZ * 0.3 + 30;

        const snap = CONFIG.lensSnap;
        p.vx += (zoomTargetX - p.x) * snap;
        p.vy += (zoomTargetY - p.y) * snap;
        p.vz += (zoomTargetZ - p.z) * snap;
      }

      // --- 狀態 B: 透鏡外 (極慢速懸浮) ---
      else {
        // 閒置時的彈簧力極小，讓粒子懶懶地飄
        const idleSpring = 0.005;
        p.vx += (p.targetX - p.x) * idleSpring;
        p.vy += (p.targetY - p.y) * idleSpring;
        p.vz += (p.targetZ - p.z) * idleSpring;

        const nStr = CONFIG.noiseStrength;
        const tOff = time + p.noiseOffset;

        p.vx += Math.sin(p.y * nScale + tOff) * nStr;
        p.vy += Math.cos(p.z * nScale + tOff) * nStr;
        p.vz += Math.sin(p.x * nScale + tOff) * nStr;
      }

      // 物理更新
      p.vx *= CONFIG.friction; p.vy *= CONFIG.friction; p.vz *= CONFIG.friction;
      p.x += p.vx; p.y += p.vy; p.z += p.vz;

      // 顏色平滑更新
      p.currR += (p.targetR - p.currR) * 0.08;
      p.currG += (p.targetG - p.currG) * 0.08;
      p.currB += (p.targetB - p.currB) * 0.08;

      positions[i * 3] = p.x; positions[i * 3 + 1] = p.y; positions[i * 3 + 2] = p.z;
      colors[i * 3] = p.currR; colors[i * 3 + 1] = p.currG; colors[i * 3 + 2] = p.currB;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;

    if (pointCloud) {
      // 極慢速自轉
      pointCloud.rotation.y = Math.sin(time * 0.5) * 0.02;
      pointCloud.rotation.x = Math.cos(time * 0.3) * 0.01;
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    if (physicsData.length > 0) updateParticles();
    renderer.render(scene, camera);
  }

  function onMouseMove(e) {
    const v = new THREE.Vector3((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1, 0.5);
    v.unproject(camera);
    const dir = v.sub(camera.position).normalize();
    const dist = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(dist));

    // 滑鼠跟隨速度
    mouse.x += (pos.x - mouse.x) * 0.06;
    mouse.y += (pos.y - mouse.y) * 0.06;
  }

  function onClick() {
    if (allImageTargets.length === 0) {
      console.log('❌ 沒有圖片可以切換');
      return;
    }
    currentImageIndex = (currentImageIndex + 1) % allImageTargets.length;
    console.log(`✨ 切換到圖片 ${currentImageIndex + 1}/${allImageTargets.length}`);
    applyTargetImage(currentImageIndex);
    physicsData.forEach(p => {
      // 切換時的力道
      p.vx += (Math.random() - 0.5) * 40;
      p.vy += (Math.random() - 0.5) * 40;
      p.vz += (Math.random() - 0.5) * 40;
    });
  }

  async function start() {
    initScene();
    createParticleSystem();
    animate();

    log("初始化粒子系統...");
    console.log(`📸 準備載入 ${IMAGE_FILES.length} 張作品封面圖片`);

    const targets = [];
    for (const file of IMAGE_FILES) {
      try {
        const points = await processImage(file);
        targets.push(points);
      } catch (err) {
        console.warn(err);
      }
    }
    allImageTargets = targets;

    if (allImageTargets.length > 0) {
      log("準備就緒");
      console.log(`✅ 成功載入 ${allImageTargets.length} 張圖片`);
      setTimeout(() => {
        statusEl.style.display = 'none';
        currentImageIndex = 0;
        applyTargetImage(0);
      }, 1000);
    } else {
      log("❌ 圖片解析失敗");
    }
  }

  // 啟動粒子系統
  start();

  console.log('✨ Particle Zero Gravity background initialized');

})();
