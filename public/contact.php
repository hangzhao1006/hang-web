<?php
require __DIR__ . '/../src/functions.php';
$config = require __DIR__ . '/../src/config.php';
?>
<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <title>Contact — <?= htmlspecialchars($config['site_name']) ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" type="image/svg+xml" href="/logo.svg">

    <!-- 引入样式 -->
    <link rel="stylesheet" href="/css/test.css?v=<?= time() ?>">
    <link rel="stylesheet" href="/css/contact.css?v=<?= time() ?>">
</head>

<body class="contact-page">

    <!-- 1. 鼠标 (黑色版) -->
    <div id="cursor-wrapper">
        <div class="cursor-main"></div>
        <div class="cursor-reflection"></div>
    </div>

    <!-- Mobile Navigation -->
    <button class="mobile-nav-toggle" aria-label="Toggle navigation">
        <span></span><span></span><span></span>
    </button>
    <div class="mobile-nav-overlay"></div>
    <nav class="mobile-nav-menu">
        <a href="/">Selected Works</a>
        <a href="/about.php">About</a>
        <a href="/skillset.php">Skillset</a>
        <a href="/contact.php">Contact</a>
        <a href="/admin.php">Admin</a>
    </nav>

    <!-- Header -->
    <header class="project-header on-light">
        <h1>
            <img src="/logo.svg" alt="Hang Zhao Logo" class="header-logo">
            <span><?= htmlspecialchars($config['site_name']) ?></span>
        </h1>
        <nav class="nav">
            <a href="/">Selected Works</a>
            <a href="/about.php">About</a>
            <a href="/contact.php">Contact</a>
            <a href="/skillset.php">Skillset</a>
            <a href="/admin.php">Admin</a>
        </nav>
    </header>

    <main class="contact-container">
        
        <!-- 核心标语区 -->
        <section class="contact-hero">
            <h1>Let’s talk.</h1>
            <p class="lead">
                Open for freelance projects, collaborations, or just a coffee chat about creative tech.
            </p>
        </section>

        <!-- 联系方式列表 -->
        <section class="contact-links">
            
            <div class="link-group">
                <div class="label">Email</div>
                <a href="mailto:hangzhao1006@gmail.com" class="big-link">
                    hangzhao1006@gmail.com <span class="arrow">↗</span>
                </a>
                <a href="mailto:hang_zhao@gsd.harvard.edu" class="big-link">
                    hang_zhao@gsd.harvard.edu <span class="arrow">↗</span>
                </a>
            </div>

            <div class="link-group">
                <div class="label">Social</div>
                <div class="social-row">
                    <a href="https://www.linkedin.com/in/hang-zhao-131b43364/" target="_blank" class="social-link">LinkedIn ↗</a>
                    <a href="https://www.instagram.com/hang01060/?next=%2F" target="_blank" class="social-link">Instagram ↗</a>
                    <a href="https://github.com/hangzhao1006" target="_blank" class="social-link">GitHub ↗</a>
                </div>
            </div>

            <div class="link-group">
                <div class="label">Location</div>
                <div class="location-text">
                    Currently based in <br>
                    <strong>Shanghai / Boston</strong>
                </div>
            </div>

        </section>

    </main>

    <footer>
        <p>© <?= date('Y') ?> <?= htmlspecialchars($config['site_name']) ?>, All Rights Reserved.</p>
    </footer>

    <!-- 引入 JS -->
    <script src="/script/test.js"></script>
</body>
</html>