<?php
require __DIR__ . '/../src/functions.php';
$config = require __DIR__ . '/../src/config.php';
?>
<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <title>About — <?= htmlspecialchars($config['site_name']) ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" type="image/svg+xml" href="/logo.svg">

    <!-- 引入样式 -->
    <link rel="stylesheet" href="/css/test.css?v=<?= time() ?>">
    <link rel="stylesheet" href="/css/about.css?v=<?= time() ?>">
</head>

<body class="about-page">

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
            <a href="/admin.php">Admin</a>
        </nav>
    </header>

    <main class="about-container">

        <!-- 左侧：个人形象与简介 (Sticky) -->
        <aside class="about-sidebar">
            <div class="profile-visual">
                <img src="/uploads/portrait.JPG" alt="Hang Zhao" class="avatar">
                <div class="caption">Designer / Technologist</div>
            </div>

            <div class="bio-text">
                <h1>Hi, I’m Hang.</h1>
                <p class="lead">
                    I explore the seam between <strong>assistive technology</strong>, <strong>interactive
                        media</strong>, and <strong>AI-driven sensing</strong>.
                </p>
                <p class="lead">
                    I build things you can wear, touch, and hear: from tactile guidance gloves to time-perception
                    devices and data-driven light installations.
                </p>

                <div class="contact-links">
                    <a href="mailto:hangzhao1006@gmail.com" class="btn-pill">Email Me ↗</a>
                    <a href="https://www.linkedin.com/in/hang-zhao-131b43364/" target="_blank" class="btn-pill">LinkedIn
                        ↗</a>
                </div>
            </div>
        </aside>

        <!-- 右侧：详细履历 (Scrollable) -->
        <section class="about-content">

            <!-- Focus Areas -->
            <div class="block">
                <h3>Focus</h3>
                <div class="tags-cloud">
                    <span>Multimodal AI  </span>
                    <span>Full-Stack AI Systems</span>
                    <span>ML Systems </span>
                    <span>Embedded Sensing</span>
                    <span>Computer Vision</span>
                    <span>Human-Centered AI Systems</span>
                </div>
            </div>

            <!-- Education -->
            <div class="block">
                <h3>Education</h3>
                <div class="resume-item">
                    <div class="year">2025–Now</div>
                    <div class="details">
                        <strong>Harvard GSD</strong><br>
                        Master in Design Studies(Mediums) · Boston, USA
                    </div>
                </div>
                <div class="resume-item">
                    <div class="year">2025–Now</div>
                    <div class="details">
                        <strong>MIT</strong><br>
                        Cross-registration student  
                        Computer Science & AI & Media Arts and Sciences · Boston, USA
                    </div>
                </div>
                <div class="resume-item">
                    <div class="year">2020–2025</div>
                    <div class="details">
                        <strong>Tsinghua University</strong><br>
                        B.F.A. Information Design & B.A. Economics · GPA 3.9/4.0 · Beijing, China
                    </div>
                </div>
                <div class="resume-item">
                    <div class="year">2023–2024</div>
                    <div class="details">
                        <strong>Cornell University</strong><br>
                        Exchange in Info Sci, Systems & Technology · Ithaca, USA
                    </div>
                </div>
            </div>

            <!-- Experience -->
            <div class="block">
                <h3>Experience</h3>
                <div class="resume-item">
                    <div class="year">2023 Summer</div>
                    <div class="details">
                        <strong>To Be Updated</strong><br>
                        XXX
                    </div>
                </div>
                <div class="resume-item">
                    <div class="year">2022 Summer</div>
                    <div class="details">
                        <strong>To Be Updated</strong><br>
                        XXX
                    </div>
                </div>
            </div>

            <!-- Selected Projects (Mini List) -->
            <div class="block">
                <h3>Selected Works</h3>
                <ul class="text-list">
                    <li>
                        <strong>Tuchsure</strong> — AI visual assistive glove combining palm camera, on-device
                        recognition, and fingertip haptics.
                    </li>
                    <li>
                        <strong>Ehoura</strong> — A handheld “sundial” for astronauts to recalibrate time perception.
                    </li>
                    <li>
                        <strong>SeePal</strong> — Navigation aid for BLV users; iterative tests improved indoor
                        wayfinding.
                    </li>
                </ul>
            </div>

            <!-- Exhibitions -->
            <div class="block">
                <h3>Exhibitions & Awards</h3>
                <ul class="text-list">
                    <li>Beijing International Design Week — <i>The Futurescaping</i></li>
                    <li>Cross-Strait Youth Summit: Tech-Art Fusion Exhibition</li>
                    <li>International exhibition at SUTD, Singapore</li>
                    <li>Tsinghua Comprehensive Excellence Scholarship (Top 1%)</li>
                </ul>
            </div>

            <!-- Skills -->

            <div class="block">
                <h3>Skills</h3>

                <div class="skill-row">
                    <span class="label">AI & ML Systems</span>
                    <span class="value">
                        PyTorch, 
                        RAG Pipelines, 
                        Vector Databases (Chroma), 
                        Model Deployment (Vertex AI), 
                        CI/CD (GitHub Actions), 
                        Docker & Compose, 
                        Data Versioning (DVC)
                    </span>
                </div>

                <div class="skill-row">
                    <span class="label">Computer Vision & Edge AI</span>
                    <span class="value">
                        OpenCV, CLIP, YOLOv8 Edge Deployment (RK3588 / RKNN), Real-Time Inference
                    </span>
                </div>

                <div class="skill-row">
                    <span class="label">Embedded & Sensing Systems</span>
                    <span class="value">
                        ESP32 / Arduino, Sensor Fusion (PPG / GSR / IMU), Wearable Systems, Edge Devices
                    </span>
                </div>

                <div class="skill-row">
                    <span class="label">Full-Stack AI Systems</span>
                    <span class="value">
                        JavaScript, React, PHP, SQL / SQLite, API Development
                    </span>
                </div>

                <div class="skill-row">
                    <span class="label">Design & Interaction</span>
                    <span class="value">
                        Figma, Blender, Fusion 360, Adobe AE/PR/PS/AI
                    </span>
                </div>

                <div class="skill-row">
                    <span class="label">Programming</span>
                    <span class="value">
                        Python, C++, R, JavaScript, PHP, SQL/SQLite, HTML, CSS, React
                    </span>
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