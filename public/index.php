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
  <title><?= htmlspecialchars($config['site_name']) ?></title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="css/test.css">
</head>

<body>

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
        <feTurbulence 
            type="turbulence" 
            baseFrequency="0.003 0.006" 
            numOctaves="3" 
            seed="5" 
            result="warp" 
        />
        <feDisplacementMap 
            xChannelSelector="R" 
            yChannelSelector="G" 
            scale="60" 
            in="SourceGraphic" 
            in2="warp" 
        />
      </filter>
    </defs>
  </svg>

  <!-- 1. 全局背景层 -->
  <div class="reflection-layer" id="bg-layer"></div>

  <!-- 2. 自定义鼠标 -->
  <div id="cursor-wrapper">
      <div class="cursor-main"></div>
      <div class="cursor-reflection"></div>
  </div>

  <!-- 3. 顶部固定 UI 层 -->
  <div class="ui-layer">
      <header>
        <h1><?= htmlspecialchars($config['site_name']) ?></h1>
        <nav class="nav">
          <a href="/about.php">About</a>
          <a href="/contact.php">Contact</a>
          <a href="/admin.php">Admin</a>
        </nav>
      </header>

      <form class="filters" method="get">
        <input name="tag" placeholder="Tag" value="<?= htmlspecialchars($filters['tag'] ?? '') ?>">
        <input name="year" type="number" placeholder="Year" value="<?= htmlspecialchars($filters['year'] ?? '') ?>">
        <select name="sort">
          <option value="recent" <?= $filters['sort'] === 'recent' ? 'selected' : ''; ?>>Recent</option>
          <option value="alpha" <?= $filters['sort'] === 'alpha' ? 'selected' : ''; ?>>A–Z</option>
        </select>
        <button type="submit">Apply</button>
      </form>
  </div>

  <!-- 4. Hero 区域 -->
  <div class="hero-section">
    <div class="hero-text">
        I create digital <br>
        <span class="highlight">experiences</span> & visual <span class="highlight">narratives</span>.
    </div>
    <div class="hero-sub">
        Based in Boston / Available for freelance
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
        ?>

        <div class="grid-item" style="--project-img: url('<?= $imgUrl ?>');">
           <a href="project.php?slug=<?= urlencode($p['slug'] ?: $p['id']) ?>" class="grid-link"></a>

            <div class="content">
                <h2><?= htmlspecialchars($p['title']) ?></h2>
                <p>
                    <?= $p['year'] ? (int)$p['year'] : '' ?>
                    <?= $mainTag ? ' / ' . htmlspecialchars($mainTag) : '' ?>
                </p>
            </div>
        </div>
    <?php endforeach; ?>
    
    <div class="grid-item"></div>
    <div class="grid-item"></div>
    <div class="grid-item"></div>

  </div>

  <footer>
    <p>© <?= date('Y') ?> <?= htmlspecialchars($config['site_name']) ?></p>
  </footer>

  <script src="script/test.js" defer></script>

</body>
</html>