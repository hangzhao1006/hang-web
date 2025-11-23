<?php
require __DIR__ . '/../src/functions.php';
$config = require __DIR__ . '/../src/config.php';
ensure_schema();

$id_or_slug = $_GET['id'] ?? $_GET['slug'] ?? null;
if (!$id_or_slug) {
    http_response_code(400);
    exit('Missing id');
}
$project = find_project_by_id_or_slug($id_or_slug);
if (!$project) {
    http_response_code(404);
    exit('Not Found');
}

$meta = !empty($project['meta_json']) ? (json_decode($project['meta_json'], true) ?: []) : [];
$gallery = !empty($project['gallery_json']) ? (json_decode($project['gallery_json'], true) ?: []) : [];

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
$heroScale = $meta['hero_scale'] ?? 1.0;
$heroPosY = $meta['hero_pos_y'] ?? 50;
?>
<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <title><?= h($project['title']) ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="css/test.css?v=<?= time() ?>">
    <link rel="stylesheet" href="css/project.css?v=<?= time() ?>">

</head>

<body class="project-page">
    <div id="cursor-wrapper">
        <div class="cursor-main"></div>
        <div class="cursor-reflection"></div>
    </div>
    <!-- <nav class="project-nav"><a href="index.php" class="back-link"><span class="icon">←</span> Back</a></nav> -->

    <header class="project-header is-dark">
        <!-- h1：和 index.php 一模一样 -->
        <h1>
            <img src="/uploads/logo.svg" alt="Hang Zhao Logo" class="header-logo">
            <span><?= htmlspecialchars($config['site_name']) ?></span>
        </h1>

        <!-- nav：project 自己的链接 & 样式 -->
        <nav class="nav">
            <a href="index.php">Selected Works</a>
            <a href="about.php">About</a>
            <a href="contact.php">Contact</a>
            <a href="admin.php">Admin</a>
        </nav>
    </header>




    <header class="project-hero" style="height: <?= h($heroHeight) ?>;">
        <!-- Hero Logic (Same as before) -->
        <div class="hero-bg">
            <?php
            $heroMedia = $meta['hero_media'] ?? $project['hero_media'] ?? $project['image_url'];
            $heroSrc = is_string($heroMedia) ? $heroMedia : ($heroMedia['src'] ?? '');
            if (!$heroSrc)
                $heroSrc = $project['image_url'];
            $isVideo = preg_match('/\.(mp4|webm)$/i', $heroSrc);
            ?>
            <?php if ($isVideo): ?>
                <video autoplay loop muted playsinline src="<?= h($heroSrc) ?>"
                    style="object-position: center <?= h($heroPosY) ?>%; transform: scale(<?= h($heroScale) ?>);"></video>
            <?php else: ?>
                <img src="<?= h($heroSrc) ?>" alt="Hero"
                    style="object-position: center <?= h($heroPosY) ?>%; transform: scale(<?= h($heroScale) ?>);">
            <?php endif; ?>
            <div class="hero-gradient"></div>
        </div>
        <div class="hero-content">
            <h1 class="title"><?= h($project['title']) ?></h1>
            <?php if ($sub = g('subtitle')): ?>
                <p class="subtitle"><?= h($sub) ?></p><?php endif; ?>
            <div class="info-hud">
                <div class="hud-item year"><label>Year</label><span><?= h($project['year']) ?></span></div>
                <div class="hud-item"><label>Role</label><span><?= h(g('role')) ?></span></div>
                <div class="hud-item tools">
                    <label>Tools</label>
                    <span>
                        <?php
                        $tools = g('tool');
                        if ($tools) {
                            // 支持逗号分隔的工具列表
                            $toolList = array_map('trim', explode(',', $tools));
                            foreach ($toolList as $tool):
                                if ($tool): ?>
                                    <span class="tool-tag"><?= h($tool) ?></span>
                                <?php endif;
                            endforeach;
                        }
                        ?>
                    </span>
                </div>
                <div class="hud-item context"><label>Context</label><span><?= h(g('client')) ?></span></div>
                <?php
                $links = g('links');
                if (is_string($links))
                    $links = json_decode($links, true);
                if (!empty($project['url']))
                    $links = array_merge(['Demo' => $project['url']], (array) $links);
                ?>
                <div class="hud-item link-col">
                    <div class="link-group">
                        <?php if ($links)
                            foreach ($links as $k => $v):
                                if (!$v)
                                    continue; ?>
                                <a href="<?= h($v) ?>" target="_blank" class="hud-link"><?= h(ucfirst($k)) ?> ↗</a>
                            <?php endforeach; ?>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <main class="project-body">
        <?php if ($desc = g('description')): ?>
            <section class="content-row intro">
                <div class="row-label">Overview</div>
                <div class="row-content lead-text"><?= render_markdown($desc) ?></div>
            </section>
        <?php endif; ?>


        <!-- Gallery Slider (自动播放画廊) -->
        <?php if (!empty($gallery)): ?>
            <section class="content-row gallery-section mode-center">
                <div class="row-label">Gallery</div>
                <div class="row-content" style="width: 100%;">

                    <div class="gallery-slider" id="gallery-slider">
                        <div class="slider-track">
                            <?php foreach ($gallery as $index => $item):
                                $src = is_string($item) ? $item : ($item['src'] ?? '');
                                $cap = is_array($item) ? ($item['caption'] ?? '') : '';
                                if (!$src)
                                    continue;
                                ?>
                                <div class="slide">
                                    <img src="<?= h($src) ?>" alt="Gallery Image">
                                    <?php if ($cap): ?>
                                        <div class="slide-caption"><?= h($cap) ?></div><?php endif; ?>
                                </div>
                            <?php endforeach; ?>
                        </div>

                        <!-- Controls -->
                        <div class="slider-controls">
                            <button class="prev-btn">←</button>
                            <span class="slide-counter">1 / <?= count($gallery) ?></span>
                            <button class="next-btn">→</button>
                        </div>
                    </div>

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
                    <div class="row-content">
                        <?php
                        $sections = $b['sections'] ?? [['subtitle' => $b['subtitle'] ?? '', 'content' => $b['content'] ?? '']];
                        foreach ($sections as $sec):
                            ?>
                            <div class="text-section-block" style="margin-bottom: 40px;">
                                <?php if (!empty($sec['subtitle'])): ?>
                                    <h4 class="content-subtitle"><?= h($sec['subtitle']) ?></h4>
                                <?php endif; ?>
                                <div class="content-markdown"><?= render_markdown($sec['content']) ?></div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </section>

            <?php elseif ($b['type'] === 'image' || $b['type'] === 'video'): ?>
                <?php
                $wVal = $b['width'] ?? 100;
                $wStyle = $wVal . '%';
                $layout = $b['layout'] ?? 'center';
                $rowClass = ($layout === 'center') ? 'content-row image-row mode-center' : 'content-row image-row';
                $alignStyle = ($layout === 'center') ? '0 auto' : '0';
                $isVideo = $b['type'] === 'video';
                ?>
                <section class="<?= $rowClass ?>">
                    <div class="row-label"><?= h($b['label'] ?? '') ?></div>
                    <div class="row-content">
                        <figure class="large-image" style="width: <?= h($wStyle) ?>; margin: <?= $alignStyle ?>;">
                            <?php if ($isVideo):
                                $attrs = !empty($b['autoplay']) ? 'autoplay loop muted playsinline' : 'controls';
                                ?>
                                <video src="<?= h($b['src']) ?>" <?= $attrs ?> style="width:100%; display:block;"></video>
                            <?php else: ?>
                                <img src="<?= h($b['src']) ?>" alt="Img">
                            <?php endif; ?>

                            <?php if (!empty($b['caption'])): ?>
                                <figcaption><?= h($b['caption']) ?></figcaption><?php endif; ?>
                        </figure>
                    </div>
                </section>
            <?php endif; ?>
        <?php endforeach; ?>

        <!-- Gallery always visible if exists -->
    </main>

    <footer class="project-footer">
        <p>© <?= date('Y') ?> <?= h($config['site_name']) ?>, All Rights Reserved.</p>
        <img src="/uploads/logo.svg" class="footer-logo">
    </footer>
    <script src="script/test.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            const header = document.querySelector('.project-header');
            const hero = document.querySelector('.project-hero');
            const footer = document.querySelector('.project-footer');

            if (!header || !hero) return;

            const observer = new IntersectionObserver(([entry]) => {
                // hero 还占屏幕上方 >40%：认为在 hero 区 → header 用浅色
                if (entry.intersectionRatio > 0.4) {
                    header.classList.remove('on-light');
                    if (footer) footer.classList.remove('on-light');

                    const logoh = header.querySelector('.header-logo');
                    const logof = footer ? footer.querySelector('.footer-logo') : null;
                    if (logof) logof.classList.remove('dark-mode');
                    if (logoh) logoh.classList.remove('dark-mode');
                    // header.classList.remove('on-light');
                    // footer.querySelector(".project-footer").classList.remove('on-light');
                    // header.querySelector('.header-logo').classList.remove('dark-mode');
                } else {
                    // hero 基本滚走 → header 在白底上 → 用深色
                    header.classList.add('on-light');
                    if (footer) footer.classList.add('on-light');

                    const logoh = header.querySelector('.header-logo');
                    const logof = footer ? footer.querySelector('.footer-logo') : null;
                    if (logof) logof.classList.add('dark-mode');
                    if (logoh) logoh.classList.add('dark-mode');
                    // header.classList.add('on-light');
                    // header.querySelector('.header-logo').classList.add('dark-mode');
                    // footer.querySelector(".project-footer").classList.add('on-light');
                }
            }, {
                threshold: [0.4]
            });

            observer.observe(hero);
        });
    </script>


</body>

</html>