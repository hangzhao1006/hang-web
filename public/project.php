<?php
require __DIR__ . '/../src/functions.php';
$config = require __DIR__ . '/../src/config.php';
ensure_schema();

$id_or_slug = $_GET['id'] ?? $_GET['slug'] ?? null;
if (!$id_or_slug) {
    http_response_code(400);
    exit('Missing id or slug');
}

$project = find_project_by_id_or_slug($id_or_slug);
if (!$project) {
    http_response_code(404);
    exit('Project not found');
}

$meta = !empty($project['meta_json']) ? (json_decode($project['meta_json'], true) ?: []) : [];
function g($key)
{
    global $meta, $project;
    return $meta[$key] ?? ($project[$key] ?? null);
}
function h($str)
{
    if (is_array($str))
        return '';
    return htmlspecialchars((string) $str, ENT_QUOTES, 'UTF-8');
}
$heroHeight = (isset($meta['hero_height']) && $meta['hero_height']) ? $meta['hero_height'] . 'vh' : '85vh';
// 2. Hero Scale: 默认 1.0
$heroScale = $meta['hero_scale'] ?? 1.0;
// 3. Hero Pos Y: 默认 50 (center)
$heroPosY = $meta['hero_pos_y'] ?? 50;
?>
<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <title><?= h($project['title']) ?> — <?= h($config['site_name']) ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- 样式引用 -->
    <link rel="stylesheet" href="css/test.css?v=<?= time() ?>">
    <link rel="stylesheet" href="css/project.css?v=<?= time() ?>">
</head>

<body class="project-page">

    <!-- 鼠标 -->
    <div id="cursor-wrapper">
        <div class="cursor-main"></div>
        <div class="cursor-reflection"></div>
    </div>

    <!-- 悬浮导航 -->
    <nav class="project-nav"><a href="index.php" class="back-link"><span class="icon">←</span> <span
                class="text">Back</span></a></nav>

    <!-- Hero 封面 -->
    <header class="project-hero" style="height: <?= h($heroHeight) ?>; transform: scale(<?= h($heroScale) ?>);">
        <div class="hero-bg">
            <?php
            // 获取 Hero Media (支持 meta_json, hero_media 字段, image_url 回退)
            $heroMedia = $meta['hero_media'] ?? $project['hero_media'] ?? $project['image_url'];
            $heroSrc = is_string($heroMedia) ? $heroMedia : ($heroMedia['src'] ?? '');
            if (!$heroSrc)
                $heroSrc = $project['image_url'];

            // 尝试解析 JSON
            if (is_string($heroMedia) && (str_starts_with($heroMedia, '{') || str_starts_with($heroMedia, '['))) {
                $decoded = json_decode($heroMedia, true);
                if (json_last_error() === JSON_ERROR_NONE)
                    $heroMedia = $decoded;
            }


            // 最终回退到 image_url
            if (empty($heroMedia))
                $heroMedia = $project['image_url'];

            // 判断类型
            $isVideo = false;
            $heroSrc = '';
            if (is_string($heroMedia)) {
                $heroSrc = $heroMedia;
                if (preg_match('/\.(mp4|webm)$/i', $heroSrc))
                    $isVideo = true;
            } elseif (is_array($heroMedia)) {
                $heroSrc = $heroMedia['src'] ?? '';
                if (($heroMedia['type'] ?? '') === 'video')
                    $isVideo = true;
            }
            ?>

            <img src="<?= h($heroSrc) ?>" alt="Hero"
                style="object-position: center <?= h($heroPosY) ?>%; transform: scale(<?= h($heroScale) ?>);">

            <div class="hero-gradient"></div>

            <?php if ($heroSrc): ?>
                <?php if ($isVideo): ?>
                    <video autoplay loop muted playsinline src="<?= h($heroSrc) ?>"></video>
                <?php else: ?>
                    <img src="<?= h($heroSrc) ?>" alt="Hero" onerror="this.style.display='none'">
                <?php endif; ?>
            <?php else: ?>
                <div style="width:100%;height:100%;background:#f0f0f0;"></div>
            <?php endif; ?>

            <!-- 渐变层放在 hero-bg 内部，或者紧贴其后 -->
            <div class="hero-gradient"></div>
        </div>

        <div class="hero-content">
            <h1 class="title"><?= h($project['title']) ?></h1>
            <?php if ($sub = g('subtitle')): ?>
                <p class="subtitle"><?= h($sub) ?></p><?php endif; ?>
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
                    <label>Client / Context</label>
                    <span><?= h(g('client') ?: 'Personal') ?></span>
                </div>

                <?php
                $links = g('links');
                if (is_string($links))
                    $links = json_decode($links, true);
                if (!empty($project['url']))
                    $links = array_merge(['Live Demo' => $project['url']], (array) $links);
                ?>
                <?php if (!empty($links)): ?>
                    <div class="hud-item links">
                        <label>Links</label>
                        <div class="link-group">
                            <?php foreach ($links as $label => $url):
                                if (!$url)
                                    continue; ?>
                                <a href="<?= h($url) ?>" target="_blank" class="hud-link"><?= h(ucfirst($label)) ?> ↗</a>
                            <?php endforeach; ?>
                        </div>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </header>

    <!-- 正文 -->
    <main class="project-body">
        <!-- Overview -->
        <?php if ($desc = g('description')): ?>
            <section class="content-row intro">
                <div class="row-label">Overview</div>
                <div class="row-content lead-text">
                    <?= render_markdown($desc) ?>
                </div>
            </section>
        <?php endif; ?>

        <!-- Blocks / Dynamic Details -->
        <?php
        $blocks = $meta['blocks'] ?? [];
        if (!empty($blocks) && is_array($blocks)):
            foreach ($blocks as $b):
                ?>
                <?php if ($b['type'] === 'text'): ?>
                    <section class="content-row">
                        <div class="row-label"><?= h($b['label']) ?></div>
                        <div class="row-content">
                            <?= render_markdown($b['content']) ?>
                        </div>
                    </section>
                <?php elseif ($b['type'] === 'image'): ?>
                    <section class="content-row image-row">
                        <div class="row-label"><?= h($b['label'] ?? '') ?></div>
                        <div class="row-content">
                            <?php
                            // 读取自定义样式
                            $width = $b['width'] ?? '100%';
                            $align = ($b['layout'] ?? 'center') === 'center' ? '0 auto' : '0';
                            ?>
                            <figure class="large-image" style="width: <?= h($width) ?>; margin: <?= h($align) ?>;">
                                <img src="<?= h($b['src']) ?>" alt="Image" loading="lazy">
                                <?php if (!empty($b['caption'])): ?>
                                    <figcaption><?= h($b['caption']) ?></figcaption>
                                <?php endif; ?>
                            </figure>
                        </div>
                    </section>
                <?php endif; ?>
                <?php
            endforeach;
        else:
            // Fallback for old data
            $sections = [
                'background_problem' => 'The Problem',
                'design_goals' => 'Design Goals',
                'solution_overview' => 'Solution',
                'interaction_design' => 'Interaction',
                'outcomes' => 'Outcomes',
                'next_steps' => 'Next Steps'
            ];
            foreach ($sections as $key => $label):
                $content = g($key);
                if (!$content)
                    continue;
                ?>
                <section class="content-row">
                    <div class="row-label"><?= $label ?></div>
                    <div class="row-content"><?= render_markdown($content) ?></div>
                </section>
                <?php
            endforeach;
        endif;
        ?>

        <!-- Gallery Fallback (for old data) -->
        <?php if (empty($blocks) && !empty($gallery)): ?>
            <section class="content-row gallery-section">
                <div class="row-label">Gallery</div>
                <div class="row-content gallery-grid">
                    <?php foreach ($gallery as $item):
                        $src = is_string($item) ? $item : ($item['src'] ?? '');
                        $cap = is_array($item) ? ($item['caption'] ?? '') : '';
                        if (!$src)
                            continue;
                        ?>
                        <figure>
                            <img src="<?= h($src) ?>" alt="Gallery" loading="lazy">
                            <?php if ($cap): ?>
                                <figcaption><?= h($cap) ?></figcaption><?php endif; ?>
                        </figure>
                    <?php endforeach; ?>
                </div>
            </section>
        <?php endif; ?>

        <?php
        $blocks = $meta['blocks'] ?? [];
        foreach ($blocks as $b):
            ?>
            <?php if ($b['type'] === 'text'): ?>
                <section class="content-row">
                    <div class="row-label"><?= h($b['label']) ?></div>
                    <div class="row-content"><?= render_markdown($b['content']) ?></div>
                </section>

            <?php elseif ($b['type'] === 'image'): ?>
                <section class="content-row image-row">
                    <div class="row-label"><?= h($b['label'] ?? '') ?></div>
                    <div class="row-content">
                        <?php
                        // 【核心】读取图片宽度，如果没存，默认 100
                        $w = isset($b['width']) ? $b['width'] . '%' : '100%';
                        ?>
                        <!-- 应用宽度 -->
                        <figure class="large-image" style="width: <?= $w ?>;">
                            <img src="<?= h($b['src']) ?>" alt="Img">
                            <?php if (!empty($b['caption'])): ?>
                                <figcaption><?= h($b['caption']) ?></figcaption><?php endif; ?>
                        </figure>
                    </div>
                </section>
            <?php endif; ?>
        <?php endforeach; ?>

    </main>

    <footer class="project-footer">
        <p>© <?= date('Y') ?> <?= h($config['site_name']) ?></p>
    </footer>
    <script src="script/test.js"></script>
</body>

</html>