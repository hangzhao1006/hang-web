<?php
require __DIR__ . '/../src/functions.php';
$config = require __DIR__ . '/../src/config.php';
ensure_schema();

// 1. 获取项目数据
$id_or_slug = $_GET['id'] ?? $_GET['slug'] ?? null;
if (!$id_or_slug) { http_response_code(400); exit('Missing id or slug'); }

$project = find_project_by_id_or_slug($id_or_slug);
if (!$project) { http_response_code(404); exit('Project not found'); }

// 2. 数据预处理
$meta = !empty($project['meta_json']) ? (json_decode($project['meta_json'], true) ?: []) : [];
$gallery = !empty($project['gallery_json']) ? (json_decode($project['gallery_json'], true) ?: []) : [];

// 辅助函数：安全获取数据
function g($key) {
    global $meta, $project;
    // 先找 meta_json，再找 project 表字段
    return $meta[$key] ?? ($project[$key] ?? null);
}

// 辅助函数：HTML 转义
function h($str) {
    if (is_array($str)) return ''; // 简单处理数组
    return htmlspecialchars((string)$str, ENT_QUOTES, 'UTF-8');
}
?>
<!doctype html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <title><?= h($project['title']) ?> — <?= h($config['site_name']) ?></title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  
  <!-- 引入样式：加时间戳防止缓存 -->
  <link rel="stylesheet" href="css/test.css?v=<?= time() ?>">
  <link rel="stylesheet" href="css/project.css?v=<?= time() ?>">
</head>

<body class="project-page">

  <!-- 1. 氛围层 (继承主页) -->
  <!-- <div class="noise-overlay"></div>
  <div class="vignette"></div> -->
  <div id="cursor-wrapper">
      <div class="cursor-main"></div>
      <div class="cursor-reflection"></div>
  </div>

  <!-- 2. 悬浮导航 -->
  <nav class="project-nav">
    <a href="index.php" class="back-link">
        <span class="icon">←</span> <span class="text">Back</span>
    </a>
  </nav>

  <!-- 3. Hero 封面区域 -->
  <header class="project-hero">
    <div class="hero-bg">
        <?php 
            // 智能判断：如果有 hero_media 用它，否则用 image_url
            $heroMedia = $meta['hero_media'] ?? $project['hero_media'] ?? $project['image_url'];
            $isVideo = false;
            $heroSrc = '';

            if (is_string($heroMedia)) {
                // 简单判断是不是视频文件
                $heroSrc = $heroMedia;
                if (preg_match('/\.(mp4|webm)$/i', $heroSrc)) $isVideo = true;
            } elseif (is_array($heroMedia)) {
                $heroSrc = $heroMedia['src'] ?? '';
                if (($heroMedia['type'] ?? '') === 'video') $isVideo = true;
            }
        ?>
        
        <?php if ($isVideo): ?>
            <video autoplay loop muted playsinline src="<?= h($heroSrc) ?>"></video>
        <?php elseif ($heroSrc): ?>
            <img src="<?= h($heroSrc) ?>" alt="Hero">
        <?php endif; ?>
        
        <div class="hero-gradient"></div>
    </div>

    <div class="hero-content">
        <h1 class="title"><?= h($project['title']) ?></h1>
        <?php if ($sub = g('subtitle')): ?>
            <p class="subtitle"><?= h($sub) ?></p>
        <?php endif; ?>

        <!-- 信息仪表盘 (HUD) -->
        <div class="info-hud">
            <div class="hud-item">
                <label>Year</label>
                <span><?= h($project['year']) ?></span>
            </div>
            <div class="hud-item">
                <label>Role</label>
                <span><?= h(g('role') ?: 'Designer') ?></span>
            </div>
            <div class="hud-item">
                <label>Client/Context</label>
                <span><?= h(g('client') ?: 'Personal') ?></span>
            </div>
            
            <?php 
                $links = g('links');
                if(is_string($links)) $links = json_decode($links, true);
                if(!empty($project['url'])) $links = array_merge(['Live Demo' => $project['url']], (array)$links);
            ?>
            <?php if (!empty($links)): ?>
            <div class="hud-item links">
                <label>Links</label>
                <div class="link-group">
                    <?php foreach ($links as $label => $url): if(!$url) continue; ?>
                        <a href="<?= h($url) ?>" target="_blank" class="hud-link"><?= h(ucfirst($label)) ?> ↗</a>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>
        </div>
    </div>
  </header>

  <!-- 4. 正文内容 -->
  <main class="project-body">
    
    <!-- 概览 -->
    <?php if ($desc = g('description')): ?>
    <section class="content-row intro">
        <div class="row-label">Overview</div>
        <div class="row-content lead-text">
            <?= nl2br(h($desc)) ?>
        </div>
    </section>
    <?php endif; ?>

    <!-- 动态详情循环 (不再写死) -->
    <?php
    // 定义你要显示的字段顺序和标题
    $sections = [
        'background_problem' => 'The Problem',
        'design_goals'       => 'Design Goals',
        'solution_overview'  => 'Solution',
        'interaction_design' => 'Interaction',
        'tech_stack'         => 'Tech Stack', // 假设你有这个字段
        'outcomes'           => 'Outcomes',
        'next_steps'         => 'Next Steps'
    ];

    foreach ($sections as $key => $label): 
        $content = g($key); 
        if (!$content) continue; // 如果没填这一项，直接跳过
    ?>
        <section class="content-row">
            <div class="row-label"><?= $label ?></div>
            <div class="row-content">
                <p><?= nl2br(h($content)) ?></p>
            </div>
        </section>
    <?php endforeach; ?>

    <!-- 画廊 -->
    <?php if (!empty($gallery)): ?>
    <section class="content-row gallery-section">
        <div class="row-label">Gallery</div>
        <div class="row-content gallery-grid">
            <?php foreach ($gallery as $item): 
                $src = is_string($item) ? $item : ($item['src'] ?? '');
                $cap = is_array($item) ? ($item['caption'] ?? '') : '';
            ?>
                <figure>
                    <img src="<?= h($src) ?>" alt="Gallery Image" loading="lazy">
                    <?php if($cap): ?><figcaption><?= h($cap) ?></figcaption><?php endif; ?>
                </figure>
            <?php endforeach; ?>
        </div>
    </section>
    <?php endif; ?>

  </main>

  <footer class="project-footer">
      <p>© <?= date('Y') ?> <?= h($config['site_name']) ?></p>
  </footer>

  <script src="script/test.js"></script>
</body>
</html>