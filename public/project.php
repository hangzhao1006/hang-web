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

// Visual Params
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
    <nav class="project-nav"><a href="index.php" class="back-link"><span class="icon">←</span> Back</a></nav>

    <header class="project-hero" style="height: <?= h($heroHeight) ?>;">
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
                <div class="hud-item"><label>Year</label><span><?= h($project['year']) ?></span></div>
                <div class="hud-item"><label>Role</label><span><?= h(g('role')) ?></span></div>
                <div class="hud-item"><label>Context</label><span><?= h(g('client')) ?></span></div>
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

        <?php
        $blocks = $meta['blocks'] ?? [];
        foreach ($blocks as $b):
            ?>
            <?php if ($b['type'] === 'text'): ?>
                <section class="content-row">
                    <!-- 左侧主标题 -->
                    <div class="row-label">
                        <?= h($b['label']) ?>
                    </div>
                    <!-- 右侧内容：循环渲染 Subtitle + Content -->
                    <div class="row-content">
                        <?php
                        // 兼容旧数据：如果只有 content，没有 sections，构造一个临时 section
                        $sections = $b['sections'] ?? [['subtitle' => $b['subtitle'] ?? '', 'content' => $b['content'] ?? '']];

                        foreach ($sections as $sec):
                            ?>
                            <div class="text-section-block" style="margin-bottom: 40px;">
                                <?php if (!empty($sec['subtitle'])): ?>
                                    <h4 class="content-subtitle"><?= h($sec['subtitle']) ?></h4>
                                <?php endif; ?>
                                <div class="content-markdown">
                                    <?= render_markdown($sec['content']) ?>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </section>

            <?php elseif ($b['type'] === 'image'): ?>
                <?php
                $wVal = $b['width'] ?? 100;
                $wStyle = $wVal . '%';
                $layout = $b['layout'] ?? 'center';
                $rowClass = ($layout === 'center') ? 'content-row image-row mode-center' : 'content-row image-row';
                $alignStyle = ($layout === 'center') ? '0 auto' : '0';
                ?>
                <section class="<?= $rowClass ?>">
                    <div class="row-label"><?= h($b['label'] ?? '') ?></div>
                    <div class="row-content">
                        <figure class="large-image" style="width: <?= h($wStyle) ?>; margin: <?= $alignStyle ?>;">
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