<?php
require __DIR__ . '/../src/functions.php';
$config = require __DIR__ . '/../src/config.php';
ensure_schema();

$filters = [
  'tag' => $_GET['tag'] ?? null,
  'year' => $_GET['year'] ?? null,
  'sort' => $_GET['sort'] ?? 'recent'
];
$projects = get_projects_filtered_joined($filters);
?>
<!doctype html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <title><?= htmlspecialchars($config['site_name']) ?> (Glass Wall)</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="css/test.css?v=<?= time() ?>">
  <!-- 引入玻璃墙样式 -->
  <link rel="stylesheet" href="css/glass-wall.css?v=<?= time() ?>">
  <style>
    /* 页面特定微调 */
    .reflection-layer { display: none !important; }
    #canvas-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; background: #000; pointer-events: auto; }
    
    /* 【关键】让 Hero 文字悬浮在网格之上，而不是挤占空间 */
    .hero-section {
        position: absolute; /* 绝对定位 */
        top: 0; 
        left: 0;
        width: 100%;
        height: 100vh; /* 占满首屏 */
        z-index: 20;   /* 在网格之上 */
        pointer-events: none; /* 让鼠标能穿透文字点到下面的玻璃 */
        background: transparent; /* 确保没有背景色遮挡网格 */
    }
  </style>
</head>

<body>

  <div id="canvas-container"></div>
  <div id="cursor-wrapper"><div class="cursor-main"></div><div class="cursor-reflection"></div></div>

  <div class="ui-layer">
      <header>
        <h1><?= htmlspecialchars($config['site_name']) ?></h1>
        <nav class="nav">
          <a href="about.php">About</a>
          <a href="contact.php">Contact</a>
          <a href="admin.php">Admin</a>
        </nav>
      </header>
      <!-- Filter 省略，保持原样即可 -->
  </div>

  <!-- Hero 文字 (现在是悬浮层) -->
  <div class="hero-section">
    <div class="hero-text">
        I create digital <br>
        <span class="highlight">experiences</span> & visual <span class="highlight">narratives</span>.
    </div>
    <div class="hero-sub">Based in Shanghai / Available for freelance</div>
  </div>

  <!-- 网格系统 (全屏通铺) -->
  <div class="glass-grid">
    
    <!-- 【核心】前置 12 个空格子 (3行)，作为 Hero 文字的背景墙 -->
    <!-- 这样文字背后也是有格子、有缝隙、有反光的 -->
    <?php for($i=0; $i<12; $i++): ?>
        <div class="grid-item empty-pane" style="min-height: 33.33vh;"></div>
    <?php endfor; ?>

    <!-- 实际项目格子 -->
    <?php foreach ($projects as $p): ?>
        <?php
          $imgUrl = !empty($p['image_url']) ? htmlspecialchars($p['image_url']) : '';
          $badges = [];
          if (!empty($p['tags_joined'])) $badges = array_map('trim', explode(',', $p['tags_joined']));
          elseif (!empty($p['tags'])) $badges = array_map('trim', explode(',', $p['tags']));
          $mainTag = !empty($badges) ? $badges[0] : '';
        ?>
        <div class="grid-item" style="--project-img: url('<?= $imgUrl ?>'); min-height: 33.33vh;">
            <a href="project.php?slug=<?= urlencode($p['slug'] ?: $p['id']) ?>" class="grid-link"></a>
            <div class="content">
                <h2><?= htmlspecialchars($p['title']) ?></h2>
                <p><?= $p['year'] ? (int)$p['year'] : '' ?><?= $mainTag ? ' / ' . htmlspecialchars($mainTag) : '' ?></p>
            </div>
        </div>
    <?php endforeach; ?>
    
    <!-- 底部补空 -->
    <div class="grid-item empty-pane" style="min-height: 33.33vh;"></div>
    <div class="grid-item empty-pane" style="min-height: 33.33vh;"></div>
  </div>

  <footer><p>© <?= date('Y') ?> <?= htmlspecialchars($config['site_name']) ?></p></footer>
  <script src="script/test.js"></script>

  <script type="importmap">
    { "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js" } }
  </script>

  <script type="module">
    import * as THREE from 'three';

    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 8);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // 背景
    const loader = new THREE.TextureLoader();
    const bgTexture = loader.load('https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=2070&auto=format&fit=crop');
    bgTexture.colorSpace = THREE.SRGBColorSpace;
    const bgGeo = new THREE.PlaneGeometry(32, 18); 
    const bgMat = new THREE.MeshBasicMaterial({ map: bgTexture });
    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.z = -4; 
    scene.add(bgMesh);

    // 玻璃板
    const glassGeo = new THREE.PlaneGeometry(25, 15); 
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff, metalness: 0.1, roughness: 0.0, transmission: 1.0,
        thickness: 2.5, ior: 1.52, clearcoat: 1.0, side: THREE.DoubleSide
    });
    const glassPanel = new THREE.Mesh(glassGeo, glassMat);
    scene.add(glassPanel);

    // 灯光
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(10, 10, 20);
    scene.add(sunLight);
    
    // 视差
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    function animate() {
        requestAnimationFrame(animate);
        camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
        camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.05;
        camera.lookAt(0, 0, 0);
        bgMesh.position.x = -camera.position.x * 0.5;
        bgMesh.position.y = -camera.position.y * 0.5;
        renderer.render(scene, camera);
    }
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    animate();
  </script>
</body>
</html>