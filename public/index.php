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
$bgStyle = $config['background_style'] ?? 'full';
$bodyClass = 'bg-' . $bgStyle;
?>
<!doctype html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <title><?= htmlspecialchars($config['site_name']) ?></title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="css/test.css">
</head>

<body class="<?= htmlspecialchars($bodyClass) ?>">

  <!-- 
    SVG 滤镜升级版：
    1. type="turbulence": 更像液体，而不是烟雾 (fractalNoise)
    2. baseFrequency="0.003 0.006": 
       - 第一个数(x)极小，让横向拉伸很长，像宽阔的水波
       - 第二个数(y)稍大，保留垂直方向的流动感
       这样就不会有"格子重复"的感觉了
    3. numOctaves="3": 增加细节层次
  -->
  <svg style="display: none;">
    <defs>
      <filter id="glass-warp">
        <feTurbulence type="turbulence" baseFrequency="0.003 0.006" numOctaves="3" seed="5" result="warp" />
        <feDisplacementMap xChannelSelector="R" yChannelSelector="G" scale="60" in="SourceGraphic" in2="warp" />
      </filter>
    </defs>
  </svg>

  <!-- 1. 全局背景层 (SVG 扭曲版) -->
  <div class="reflection-layer" id="bg-layer">
    <?php if ($bgStyle === 'compact'): ?>
      <!-- 動態背景容器（預留給未來的 JS 動畫） -->
      <div class="dynamic-bg-container" id="dynamic-bg">
        <!-- TODO: 在這裡添加動態背景效果，例如粒子、波浪、漸變動畫等 -->
      </div>
    <?php endif; ?>
  </div>

  <!-- 2. WebGL 水波纹覆盖层 (禁用) -->
  <!-- <div class="water-overlay-layer">
    <canvas id="glCanvas"></canvas>
  </div> -->


  <!-- 2. 自定义鼠标 -->
  <div id="cursor-wrapper">
    <div class="cursor-main"></div>
    <div class="cursor-reflection"></div>
  </div>

  <!-- 3. 顶部固定 UI 层 -->
  <div class="ui-layer">
    <header>
      <!-- Logo added to the header link -->
      <h1>
        <img src="/uploads/logo.svg" alt="Hang Zhao Logo" class="header-logo">
        <span><?= htmlspecialchars($config['site_name']) ?></span>
      </h1>
    </header>

    <nav class="nav">
      <a href="/about.php">About</a>
      <a href="/contact.php">Contact</a>
      <a href="/admin.php">Admin</a>
      <a href="/demo.php">Demo</a>
    </nav>

    <!-- Filters removed -->
    <!-- <form class="filters" method="get">
      <input name="tag" placeholder="Tag" value="<?= htmlspecialchars($filters['tag'] ?? '') ?>">
      <input name="year" type="number" placeholder="Year" value="<?= htmlspecialchars($filters['year'] ?? '') ?>">
      <select name="sort">
        <option value="recent" <?= $filters['sort'] === 'recent' ? 'selected' : ''; ?>>Recent</option>
        <option value="alpha" <?= $filters['sort'] === 'alpha' ? 'selected' : ''; ?>>A–Z</option>
      </select>
      <button type="submit">Apply</button>
    </form> -->
  </div>

  <!-- 4. Hero 区域 -->
  <div class="hero-section">
    <div class="hero-text">
      I create digital <br>
      <span class="highlight">experiences</span> & visual <span class="highlight">narratives</span>.
    </div>
    <div class="hero-sub">
      Creating across interaction, visual systems, and computational art
    </div>
  </div>

  <!-- 5. 网格系统 -->
  <div class="glass-grid">

    <?php foreach ($projects as $p): ?>
      <?php
      $imgUrl = !empty($p['image_url']) ? htmlspecialchars($p['image_url']) : '';
      $badges = [];
      if (!empty($p['tags_joined'])) {
        $badges = array_map('trim', explode(',', $p['tags_joined']));
      } elseif (!empty($p['tags'])) {
        $badges = array_map('trim', explode(',', $p['tags']));
      }
      $mainTag = !empty($badges) ? $badges[0] : '';

      $meta = !empty($p['meta_json']) ? (json_decode($p['meta_json'], true) ?: []) : [];
      $coverScale = $meta['cover_scale'] ?? 1.0;
      $coverPosY = $meta['cover_pos_y'] ?? 50;
      $imgStyle = "object-position: center {$coverPosY}%";
      ?>
      <!-- DEBUG[<?= $p['id'] ?>]: scale=<?= $coverScale ?> posY=<?= $coverPosY ?>% -->
      <div class="grid-item" style="--project-img: url('<?= $imgUrl ?>'); --cover-scale: <?= $coverScale ?>; --cover-pos-y: <?= $coverPosY ?>%;">
        <a href="project.php?slug=<?= urlencode($p['slug'] ?: $p['id']) ?>" class="grid-link"></a>

        <?php if ($imgUrl): ?>
          <img src="<?= $imgUrl ?>" alt="<?= htmlspecialchars($p['title']) ?>" class="project-cover"
               style="<?= htmlspecialchars($imgStyle) ?>">
        <?php endif; ?>

        <div class="content">
          <h2><?= htmlspecialchars($p['title']) ?></h2>
          <p>
            <?= $p['year'] ? (int) $p['year'] : '' ?>
            <?= $mainTag ? ' / ' . htmlspecialchars($mainTag) : '' ?>
          </p>
        </div>
      </div>
    <?php endforeach; ?>

    <div class="grid-item"></div>
    <div class="grid-item"></div>
    <!-- <div class="grid-item"></div> -->

  </div>

  <footer>
    <p>© <?= date('Y') ?> <?= htmlspecialchars($config['site_name']) ?>, All Rights Reserved.</p>
    <img src="/uploads/logo.svg" class="footer-logo">
    <!-- <svg class="footer-logo" viewBox="0 0 723.61 479.65"> -->
      <!-- <path class="cls-1"
        d="M615.48,139.48c14.63,0,26.48,11.86,26.48,26.48s-11.86,26.48-26.48,26.48-26.48-11.86-26.48-26.48,11.86-26.48,26.48-26.48ZM564.84,0l-18.75,159.88-121.39,32.57-10.86-89.81L564.84,0ZM20.93,395.67c-11.56,0-20.93-9.37-20.93-20.93s9.37-20.93,20.93-20.93,20.93,9.37,20.93,20.93-9.37,20.93-20.93,20.93Zm133.39,83.98H73.82l-41.45-162.84,115.47-56.1,5.7,42.12c-9.53,4.02-16.23,13.46-16.23,24.46,0,13.48,10.07,24.59,23.09,26.29l1.51,11.19c-23.52,9.42-40.15,32.38-40.15,59.27,0,23.89,13.13,44.67,32.55,55.63Zm65.57,0l-.45-1.52c18.03-11.29,30.06-31.27,30.06-54.11,0-35.27-28.59-63.87-63.87-63.87-.41,0-.8,.05-1.21,.06l-3.7-12.45c5.9-4.87,9.66-12.23,9.66-20.48,0-13.65-10.32-24.89-23.58-26.36l-24.89-83.79L319.57,73.03l8.56,135.57c-12.92,1.59-22.93,12.59-22.93,25.94,0,14.45,11.71,26.16,26.16,26.16,.02,0,.04,0,.06,0l2.63,41.63c-5.27,3.59-8.74,9.63-8.74,16.49,0,7.74,4.45,14.37,10.9,17.67l9.03,143.16h-125.34Zm445.71,0h-41.73l12.69-67.51c-13.21,5.31-26.43,10.61-39.64,15.92l-37.63,13.94,9.97,37.65h-51.32l25.66-218.94-98.69,54.13,25.66,164.82h-88.82l12.83-238.84,193.44-48.36,8.91,235.6c7.76-52.87,15.52-105.75,23.28-158.62l103.41-41.45-58.01,251.67Z" />
    </svg> -->
  </footer>

  <!-- <script src="script/water-simple.js" defer></script> -->
  <script src="script/test.js" defer></script>

  <?php if ($bgStyle === 'compact'): ?>
    <!-- 將作品封面圖片傳遞給 JavaScript -->
    <script>
      window.PROJECT_COVER_IMAGES = [
        <?php
        $imageUrls = array_filter(array_map(function($p) {
          return !empty($p['image_url']) ? $p['image_url'] : null;
        }, $projects));
        echo implode(",\n        ", array_map(function($url) {
          return "'" . addslashes($url) . "'";
        }, $imageUrls));
        ?>
      ];
    </script>
    <!-- Three.js 庫 (動態背景需要) -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <!-- 動態背景 JS (只在 compact 模式載入) -->
    <script src="script/dynamic-bg.js" defer></script>
  <?php endif; ?>

</body>

</html>