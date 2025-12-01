/**
 * dynamic-bg.js - 移軸佈局版 (XY 雙向偏移)
 * 特色：
 * 1. 支援水平 (X) 與垂直 (Y) 的無變形平移。
 * 2. 閒置時：粒子極致寧靜懸浮。
 * 3. 聚焦時：快速組成清晰圖像。
 * 4. 只在 compact 模式下執行
 *
 * 完全套用自 test/main.js
 */

(function () {
  'use strict';

  // 檢查是否為 compact 模式
  const isCompactMode = document.body.classList.contains('bg-compact');

  if (!isCompactMode) {
    return; // 只在 compact 模式下執行
  }

  // 檢測是否為移動設備
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

  if (isMobile) {
    console.log('Mobile device detected - skipping particle background');
    return; // 移動端不執行粒子效果
  }

  // 檢查 Three.js 是否載入
  if (typeof THREE === 'undefined') {
    console.error('Three.js is not loaded. Please include Three.js before this script.');
    return;
  }

  // 獲取容器
  const container = document.getElementById('dynamic-bg');
  if (!container) {
    console.error('Container #dynamic-bg not found');
    return;
  }

  // 1. 項目資料（圖片 + 項目資訊）
  const PROJECTS = [
    { image: '/uploads/j/h4q-crop.jpg', title: 'Units, Joints, Forms', slug: 'joint-optimization' },
    { image: '/uploads/tuchsure/1.4.JPG', title: 'Techsure', slug: 'tuchsure' },
    { image: '/uploads/2.1.JPG', title: 'Ehoura', slug: 'ehoura' },
    { image: '/uploads/3.10.PNG', title: 'SerenEcho', slug: 'serenecho' },
    { image: '/uploads/4.2.JPG', title: 'Symbiophony', slug: 'symbiophony' },
    { image: '/uploads/6.1.png', title: 'SeePal', slug: 'seepal' },
    { image: '/uploads/7.1.jpg', title: 'TideEcho', slug: 'tideecho' },
    { image: '/uploads/model/1.png', title: 'Model', slug: 'model' }
  ];

  const CONFIG = {
    // --- 【關鍵修改：XY 軸佈局設定】 ---

    // 水平位置：0.0=置中, 0.15=往右移 15%, -0.15=往左移
    layoutShiftX: 0.3,

    // 垂直位置：0.0=置中, 0.1=往上移 10%, -0.1=往下移
    layoutShiftY: 0.1,

    // --- 粒子設定 ---
    particleCount: 100000,
    sampleStep: 1,
    particleSize: 2.8,
    renderScale: 1.5,
    brightnessBoost: 1.3,

    // --- 3D 設定 ---
    zDepthStrength: 100,
    zRandomness: 10,

    // --- 極限慢速背景 ---
    noiseSpeed: 0.001,
    noiseStrength: 0.2,

    // --- 透鏡設定 ---
    lensRadius: 220,
    lensMag: 0.15,
    lensSnap: 0.08,

    // --- 物理設定 ---
    friction: 0.94
  };

  let scene, camera, renderer, pointCloud;
  let geometry;
  let allImageTargets = [];
  let currentImageIndex = -1;
  let physicsData = [];
  const mouse = new THREE.Vector2(-9999, -9999);
  const clock = new THREE.Clock();

  // 使用 HTML 中已有的項目標題元素
  let projectTitleEl = null;
  let interactionHint = null;

  function createInteractionHint() {
    interactionHint = document.createElement('div');
    interactionHint.style.cssText = `
      position: fixed;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      font-size: 48px;
      z-index: 15;
      pointer-events: none;
      animation: pulse 2s ease-in-out infinite;
      opacity: 0.8;
    `;
    interactionHint.innerHTML = '👆';
    document.body.appendChild(interactionHint);

    // 添加脉冲动画
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% {
          opacity: 0.4;
          transform: translate(-50%, -50%) scale(1);
        }
        50% {
          opacity: 0.8;
          transform: translate(-50%, -50%) scale(1.2);
        }
      }
    `;
    document.head.appendChild(style);
  }

  function updateProjectTitle(index) {
    // 查找 HTML 中的标题元素
    if (!projectTitleEl) {
      projectTitleEl = document.getElementById('particle-project-title');
    }

    if (!projectTitleEl || index < 0 || index >= PROJECTS.length) return;

    const project = PROJECTS[index];
    const titleElement = projectTitleEl.querySelector('h2');
    const hintElement = projectTitleEl.querySelector('p');

    if (titleElement) titleElement.textContent = project.title;
    if (hintElement) hintElement.textContent = 'click here to view project';

    // 更新點擊事件 - 跳转到项目页面
    projectTitleEl.onclick = () => {
      window.location.href = `/project.php?slug=${project.slug}`;
    };

    // 淡入顯示
    projectTitleEl.style.opacity = '1';
  }

  function hideProjectTitle() {
    if (projectTitleEl) {
      projectTitleEl.style.opacity = '0';
    }
  }

  function log(msg) {
    console.log('[Dynamic BG]', msg);
  }

  // =========================================
  // 0. 貼圖
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
                // 這裡保持原始座標，不要手動加 offset，全部交給 camera 處理
                x: (x - w / 2) * CONFIG.renderScale,
                y: -(y - h / 2) * CONFIG.renderScale,
                z: zDepth + zRandom,
                r: Math.min(1, (r / 255) * CONFIG.brightnessBoost),
                g: Math.min(1, (g / 255) * CONFIG.brightnessBoost),
                b: Math.min(1, (b / 255) * CONFIG.brightnessBoost)
              });
            }
          }
        }
        log(`解析完成: ${points.length} 點`);
        resolve(points);
      };
      img.onerror = () => reject(`讀取失敗: ${src}`);
    });
  }

  // 【核心功能：計算 XY 偏移量】
  function updateCameraOffset() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // X 軸邏輯：往右移 -> 視窗往左偏 (負數)
    const xOffset = width * CONFIG.layoutShiftX * -1;

    // Y 軸邏輯：往上移 -> 視窗往下偏 (正數)
    // 因為 Three.js 的 setViewOffset 中，Y 增加代表視窗向下移動，
    // 視窗向下，原本在 (0,0) 的物體就會相對出現在畫面的「上方」。
    const yOffset = height * CONFIG.layoutShiftY;

    camera.setViewOffset(width, height, xOffset, yOffset, width, height);
  }

  // =========================================
  // 2. 場景
  // =========================================
  function initScene() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.0005);

    // 使用整個視窗尺寸（和 main.js 一樣）
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 5000);
    camera.position.z = 600;

    // 套用初始移軸
    updateCameraOffset();

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      // Resize 時更新移軸
      updateCameraOffset();

      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // 綁定事件到 canvas 元素
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);
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
  // 3. 物理與透鏡
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
        const idleSpring = 0.001;
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

    // 控制交互提示的显示/隐藏
    if (interactionHint) {
      // 检查鼠标是否靠近粒子中心（距离阈值）
      const centerDistSq = mouse.x * mouse.x + mouse.y * mouse.y;
      const isNearCenter = centerDistSq < (CONFIG.lensRadius * 3) ** 2;

      // 如果鼠标靠近或移动，隐藏提示；否则显示
      if (isNearCenter || mouse.x !== -9999) {
        interactionHint.style.opacity = '0';
      } else {
        interactionHint.style.opacity = '0.8';
      }
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    if (physicsData.length > 0) updateParticles();
    renderer.render(scene, camera);
  }

  function onMouseMove(e) {
    // 使用整個視窗座標（和 main.js 一樣）
    const v = new THREE.Vector3(
      (e.clientX / innerWidth) * 2 - 1,
      -(e.clientY / innerHeight) * 2 + 1,
      0.5
    );

    // unproject 會自動考慮 setViewOffset 的偏移
    v.unproject(camera);

    const dir = v.sub(camera.position).normalize();
    const dist = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(dist));

    mouse.x += (pos.x - mouse.x) * 0.06;
    mouse.y += (pos.y - mouse.y) * 0.06;
  }

  function onClick() {
    if (allImageTargets.length === 0) return;

    // 切换到下一张图片
    currentImageIndex = (currentImageIndex + 1) % allImageTargets.length;
    log(`切換到圖片 ${currentImageIndex + 1}/${allImageTargets.length}`);
    applyTargetImage(currentImageIndex);
    updateProjectTitle(currentImageIndex);

    // 添加一些粒子扰动效果
    physicsData.forEach(p => {
      p.vx += (Math.random() - 0.5) * 40;
      p.vy += (Math.random() - 0.5) * 40;
      p.vz += (Math.random() - 0.5) * 40;
    });
  }

  async function start() {
    initScene();
    createParticleSystem();
    createInteractionHint();
    animate();

    log("初始化...");

    const targets = [];
    for (const project of PROJECTS) {
      try {
        const points = await processImage(project.image);
        targets.push(points);
      } catch (err) { console.warn(err); }
    }
    allImageTargets = targets;

    if (allImageTargets.length > 0) {
      log("準備就緒");
      setTimeout(() => {
        currentImageIndex = 0;
        applyTargetImage(0);
        updateProjectTitle(0);
      }, 500);
    } else {
      log("❌ 解析失敗");
    }
  }

  // =========================================
  // 4. 滾動漸變效果
  // =========================================
  function handleScrollFade() {
    if (!renderer || !renderer.domElement) return;

    const containerRect = container.getBoundingClientRect();
    const containerTop = containerRect.top;
    const containerHeight = containerRect.height;

    let visibility = 1.0;

    if (containerTop < 0) {
      const scrolledOut = Math.abs(containerTop);
      visibility = Math.max(0, 1 - (scrolledOut / containerHeight));
    }

    renderer.domElement.style.opacity = visibility.toString();
  }

  window.addEventListener('scroll', handleScrollFade, { passive: true });
  handleScrollFade();

  start();

  console.log('✨ Particle Zero Gravity background initialized');

})();
