/**
 * main.js - 高可見度增強版
 * 解決黑色背景圖片導致粒子「隱形」的問題
 */

// 請確認你的檔名 (大小寫要精確)
const IMAGE_FILES = ['./1.jpg', './2.jpg', './3.png'];

const CONFIG = {
    particleCount: 30000, 
    sampleRate: 3,          // 調低這個數字 (3或4)，抓取更多細節
    particleSize: 4.5,      // 稍微加大粒子
    mouseRadius: 150,
    mouseForce: 200,
    springStrength: 0.05,
    friction: 0.92,
    brightnessBoost: 4.0    // 【關鍵】亮度倍增器，原本暗的顏色會變亮
};

let scene, camera, renderer, pointCloud;
let geometry;
let allImageTargets = [];
let currentImageIndex = -1; 
let physicsData = [];
const mouse = new THREE.Vector2(-9999, -9999);
const clock = new THREE.Clock();
const statusEl = document.getElementById('status-message');

function log(msg, isError = false) {
    if (statusEl) {
        statusEl.innerHTML = msg;
        statusEl.style.color = isError ? '#ff5555' : 'white';
        statusEl.style.display = 'block';
    }
    console.log(msg);
}

// =========================================
// 圖片處理 (增強可見度邏輯)
// =========================================
function processImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 縮放設定
            const maxSize = 400; 
            let w = img.width, h = img.height;
            if (w > h) { if (w > maxSize) { h *= maxSize / w; w = maxSize; } } 
            else { if (h > maxSize) { w *= maxSize / h; h = maxSize; } }
            
            canvas.width = w; canvas.height = h;
            
            // 畫黑底，避免透明圖變成空的
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0, w, h);

            const imgData = ctx.getImageData(0, 0, w, h).data;
            const points = [];
            
            for (let y = 0; y < h; y += CONFIG.sampleRate) {
                for (let x = 0; x < w; x += CONFIG.sampleRate) {
                    const i = (y * w + x) * 4;
                    let r = imgData[i];
                    let g = imgData[i+1];
                    let b = imgData[i+2];
                    
                    // 計算亮度 (Luma)
                    const brightness = (r * 0.299 + g * 0.587 + b * 0.114);

                    // 【關鍵修改】過濾門檻調低，只要有一點點亮就抓取
                    if (brightness > 15) { 
                        // 強制增強顏色，避免太暗看不見
                        r = Math.min(255, r * CONFIG.brightnessBoost);
                        g = Math.min(255, g * CONFIG.brightnessBoost);
                        b = Math.min(255, b * CONFIG.brightnessBoost);

                        points.push({
                            x: (x - w/2) * 6, 
                            y: -(y - h/2) * 6,
                            z: (Math.random() - 0.5) * 150,
                            r: r/255, g: g/255, b: b/255 // 正規化 0-1
                        });
                    }
                }
            }
            log(`圖檔 ${src} 解析完成: 抓取到 ${points.length} 個點`);
            resolve(points);
        };
        
        img.onerror = () => reject(`找不到檔案: ${src}`);
    });
}

// =========================================
// Three.js 場景
// =========================================
function initScene() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.001);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 4000);
    camera.position.z = 800;

    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('click', onClick);
}

function createParticleSystem() {
    geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(CONFIG.particleCount * 3);
    const colors = new Float32Array(CONFIG.particleCount * 3);
    const sizes = new Float32Array(CONFIG.particleCount);

    for (let i = 0; i < CONFIG.particleCount; i++) {
        // 初始球體
        const r = 300 + Math.random() * 100;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);

        positions[i*3] = x; positions[i*3+1] = y; positions[i*3+2] = z;
        
        // 初始高亮彩色
        colors[i*3] = 0.5 + Math.random()*0.5; 
        colors[i*3+1] = 0.5 + Math.random()*0.5;
        colors[i*3+2] = 1.0;

        sizes[i] = CONFIG.particleSize * (0.5 + Math.random());

        physicsData.push({
            x, y, z,
            vx: 0, vy: 0, vz: 0,
            targetX: x, targetY: y, targetZ: z, 
            targetR: colors[i*3], targetG: colors[i*3+1], targetB: colors[i*3+2],
            currR: colors[i*3], currG: colors[i*3+1], currB: colors[i*3+2]
        });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
        uniforms: {
            pointTexture: { value: new THREE.TextureLoader().load('https://assets.codepen.io/127738/dotTexture.png') }
        },
        vertexShader: `
            attribute float size;
            varying vec3 vColor;
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (400.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform sampler2D pointTexture;
            varying vec3 vColor;
            void main() {
                gl_FragColor = vec4(vColor, 1.0) * texture2D(pointTexture, gl_PointCoord);
            }
        `,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true
    });

    pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);
}

// =========================================
// 動畫邏輯
// =========================================

function applyTargetImage(index) {
    if (allImageTargets.length === 0) return;
    const targets = allImageTargets[index];
    
    // 安全檢查：如果這張圖沒有抓到任何點，就不切換
    if (!targets || targets.length < 100) {
        log(`警告: 第 ${index+1} 張圖點數過少 (${targets ? targets.length : 0})，可能全黑`, true);
        return;
    }

    log(`切換至第 ${index+1} 張圖`);

    for (let i = 0; i < CONFIG.particleCount; i++) {
        const p = physicsData[i];
        const t = targets[i % targets.length]; 

        p.targetX = t.x; p.targetY = t.y; p.targetZ = t.z;
        p.targetR = t.r; p.targetG = t.g; p.targetB = t.b;
    }
}

function updateParticles() {
    const positions = geometry.attributes.position.array;
    const colors = geometry.attributes.color.array;

    for (let i = 0; i < CONFIG.particleCount; i++) {
        const p = physicsData[i];
        
        // 物理
        const ax = (p.targetX - p.x) * CONFIG.springStrength;
        const ay = (p.targetY - p.y) * CONFIG.springStrength;
        const az = (p.targetZ - p.z) * CONFIG.springStrength;
        p.vx += ax; p.vy += ay; p.vz += az;

        // 滑鼠
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const distSq = dx*dx + dy*dy;
        if (distSq < CONFIG.mouseRadius**2) {
            const f = (1 - Math.sqrt(distSq)/CONFIG.mouseRadius) * CONFIG.mouseForce;
            const a = Math.atan2(dy, dx);
            p.vx += Math.cos(a)*f; p.vy += Math.sin(a)*f;
        }

        p.vx *= CONFIG.friction; p.vy *= CONFIG.friction; p.vz *= CONFIG.friction;
        p.x += p.vx; p.y += p.vy; p.z += p.vz;
        
        p.currR += (p.targetR - p.currR) * 0.05;
        p.currG += (p.targetG - p.currG) * 0.05;
        p.currB += (p.targetB - p.currB) * 0.05;

        positions[i*3] = p.x; positions[i*3+1] = p.y; positions[i*3+2] = p.z;
        colors[i*3] = p.currR; colors[i*3+1] = p.currG; colors[i*3+2] = p.currB;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
    
    if (currentImageIndex === -1 && pointCloud) pointCloud.rotation.y += 0.005;
}

function animate() {
    requestAnimationFrame(animate);
    if (physicsData.length > 0) updateParticles();
    renderer.render(scene, camera);
}

function onMouseMove(e) {
    const v = new THREE.Vector3((e.clientX/innerWidth)*2-1, -(e.clientY/innerHeight)*2+1, 0.5);
    v.unproject(camera);
    const dir = v.sub(camera.position).normalize();
    const dist = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(dist));
    mouse.set(pos.x, pos.y);
}

function onClick() {
    if (allImageTargets.length === 0) return;
    currentImageIndex = (currentImageIndex + 1) % allImageTargets.length;
    applyTargetImage(currentImageIndex);
    
    physicsData.forEach(p => {
        p.vx += (Math.random()-0.5)*150;
        p.vy += (Math.random()-0.5)*150;
        p.vz += (Math.random()-0.5)*150;
    });
}

// =========================================
// 啟動
// =========================================
async function start() {
    initScene();
    createParticleSystem();
    animate();

    log("正在分析圖片...", false);

    const targets = [];
    for (const file of IMAGE_FILES) {
        try {
            const points = await processImage(file);
            targets.push(points);
        } catch (err) {
            log(`❌ ${err}`, true);
        }
    }

    allImageTargets = targets;

    if (allImageTargets.length > 0) {
        log("準備就緒！點擊或等待開始");
        setTimeout(() => {
            currentImageIndex = 0;
            applyTargetImage(0);
        }, 1500); // 1.5秒後自動開始
    } else {
        log("❌ 所有圖片都太暗或讀取失敗", true);
    }
}

start();