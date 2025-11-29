/* main.js */

// 1. 圖片設定 (使用支援 CORS 的 Unsplash 圖片)
// 當你要換成自己的圖片時，請把檔案放在同目錄，並改成 './image1.jpg'
const imagePaths = [
    'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80', // 1. 霓虹流體
    'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=600&q=80', // 2. 書本與光
    'https://images.unsplash.com/photo-1530296870709-e6e344703d53?auto=format&fit=crop&w=600&q=80'  // 3. 抽象煙霧
];

const CONFIG = {
    particleCount: 30000,   // 粒子數量 (電腦卡頓可調低至 15000)
    sampleSize: 200,        // 取樣解析度 (越高圖案越精細，但運算越慢)
    particleSize: 2.5,      // 粒子顯示大小
    mouseRadius: 100,       // 滑鼠影響範圍
    mouseForce: 80,         // 滑鼠推開力度
    spring: 0.08,           // 變形速度 (越小越慢)
    friction: 0.92          // 摩擦力
};

let scene, camera, renderer, pointCloud;
let geometry, material;
let targetPositions = []; // 儲存所有圖片的目標點
let currentImageIndex = 0;
let physicsParticles = []; // 儲存物理狀態
const mouse = new THREE.Vector2(-9999, -9999);

// --- 圖片處理 ---
function getImageData(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // 關鍵：允許跨域
        img.src = src;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 等比縮放適應取樣大小
            const aspect = img.width / img.height;
            let w = CONFIG.sampleSize;
            let h = CONFIG.sampleSize / aspect;
            if (aspect < 1) { w = CONFIG.sampleSize * aspect; h = CONFIG.sampleSize; }

            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(img, 0, 0, w, h);

            try {
                const data = ctx.getImageData(0, 0, w, h).data;
                const points = [];
                
                // 掃描像素
                for (let y = 0; y < h; y++) {
                    for (let x = 0; x < w; x++) {
                        const i = (y * w + x) * 4;
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];
                        const a = data[i + 3];

                        // 只取亮色或不透明的像素
                        if (a > 128 && (r + g + b) > 50) {
                            points.push({
                                x: (x - w / 2) * 5, // 放大分佈
                                y: -(y - h / 2) * 5, // Y軸翻轉
                                z: 0,
                                color: new THREE.Color(r/255, g/255, b/255)
                            });
                        }
                    }
                }
                resolve(points);
            } catch (error) {
                reject(error); // CORS 錯誤會被捕捉
            }
        };
        img.onerror = () => reject(new Error(`Failed to load ${src}`));
    });
}

// --- 初始化 ---
async function init() {
    // 檢查是不是用 file:// 開啟
    if (window.location.protocol === 'file:') {
        showError();
        return;
    }

    // 載入所有圖片
    try {
        const promises = imagePaths.map(src => getImageData(src));
        targetPositions = await Promise.all(promises);
        targetPositions = targetPositions.filter(p => p.length > 0);

        if (targetPositions.length === 0) throw new Error("No valid image data");

        // 隱藏 Loading
        document.getElementById('overlay').style.opacity = 0;
        setTimeout(() => document.getElementById('overlay').style.display = 'none', 500);

        initThree();
        createParticles();
        animate();
    } catch (e) {
        console.error(e);
        showError();
    }
}

function showError() {
    document.getElementById('loading-text').style.display = 'none';
    document.getElementById('error-text').style.display = 'block';
}

function initThree() {
    const container = document.getElementById('canvas-container');
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.001);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.z = 800;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('click', changeImage);
}

function createParticles() {
    geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(CONFIG.particleCount * 3);
    const colors = new Float32Array(CONFIG.particleCount * 3);
    const sizes = new Float32Array(CONFIG.particleCount);

    for (let i = 0; i < CONFIG.particleCount; i++) {
        const x = (Math.random() - 0.5) * 1000;
        const y = (Math.random() - 0.5) * 1000;
        const z = (Math.random() - 0.5) * 1000;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        colors[i * 3] = 1; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 1;
        sizes[i] = Math.random() * CONFIG.particleSize;

        physicsParticles.push({
            x: x, y: y, z: z,
            vx: 0, vy: 0, vz: 0,
            targetX: x, targetY: y, targetZ: z,
            r: 1, g: 1, b: 1,
            targetR: 1, targetG: 1, targetB: 1
        });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // 使用 ShaderMaterial 製作發光圓點
    material = new THREE.ShaderMaterial({
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

    // 開始顯示第一張圖
    updateTargets(0);
}

function updateTargets(index) {
    const targets = targetPositions[index];
    if (!targets) return;

    for (let i = 0; i < CONFIG.particleCount; i++) {
        const p = physicsParticles[i];
        const t = targets[i % targets.length]; // 循環取樣

        p.targetX = t.x;
        p.targetY = t.y;
        p.targetZ = t.z + (Math.random() - 0.5) * 50; // 增加一點厚度
        p.targetR = t.color.r;
        p.targetG = t.color.g;
        p.targetB = t.color.b;
    }
}

function changeImage() {
    currentImageIndex = (currentImageIndex + 1) % targetPositions.length;
    updateTargets(currentImageIndex);

    // 切換特效：輕微爆炸
    physicsParticles.forEach(p => {
        p.vx += (Math.random() - 0.5) * 20;
        p.vy += (Math.random() - 0.5) * 20;
        p.vz += (Math.random() - 0.5) * 20;
    });
}

function onMouseMove(e) {
    const vector = new THREE.Vector3();
    vector.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1,
        0.5
    );
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));
    mouse.set(pos.x, pos.y);
}

function animate() {
    requestAnimationFrame(animate);

    const positions = geometry.attributes.position.array;
    const colors = geometry.attributes.color.array;

    for (let i = 0; i < CONFIG.particleCount; i++) {
        const p = physicsParticles[i];

        // 1. 物理：彈簧力趨向目標
        const ax = (p.targetX - p.x) * CONFIG.spring;
        const ay = (p.targetY - p.y) * CONFIG.spring;
        const az = (p.targetZ - p.z) * CONFIG.spring;

        p.vx += ax;
        p.vy += ay;
        p.vz += az;

        // 2. 物理：滑鼠排斥
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const distSq = dx*dx + dy*dy;
        if (distSq < CONFIG.mouseRadius * CONFIG.mouseRadius) {
            const force = (1 - Math.sqrt(distSq)/CONFIG.mouseRadius) * CONFIG.mouseForce;
            const angle = Math.atan2(dy, dx);
            p.vx += Math.cos(angle) * force;
            p.vy += Math.sin(angle) * force;
        }

        // 3. 物理：摩擦力與位置更新
        p.vx *= CONFIG.friction;
        p.vy *= CONFIG.friction;
        p.vz *= CONFIG.friction;

        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // 4. 顏色漸變
        p.r += (p.targetR - p.r) * 0.05;
        p.g += (p.targetG - p.g) * 0.05;
        p.b += (p.targetB - p.b) * 0.05;

        positions[i*3] = p.x;
        positions[i*3+1] = p.y;
        positions[i*3+2] = p.z;
        colors[i*3] = p.r;
        colors[i*3+1] = p.g;
        colors[i*3+2] = p.b;
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
    
    // 場景緩慢旋轉
    if (pointCloud) pointCloud.rotation.y += 0.001;

    renderer.render(scene, camera);
}

// 啟動程式
init();