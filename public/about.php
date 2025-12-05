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

    <!-- 引入样式 -->
    <link rel="stylesheet" href="/css/test.css?v=<?= time() ?>"> <!-- 基础重置 -->
    <link rel="stylesheet" href="/css/about.css?v=<?= time() ?>"> <!-- 专属样式 -->
</head>

<body class="about-page">

    <!-- 1. 鼠标 (黑色版) -->
    <div id="cursor-wrapper">
        <div class="cursor-main"></div>
        <div class="cursor-reflection"></div>
    </div>

    <!-- 2. 悬浮返回 -->
    <nav class="fixed-nav">
        <a href="/" class="back-link">
            <span class="icon">←</span> <span class="text">Home</span>
        </a>
    </nav>

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
                <p>
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
                    <span>Human–Computer Interaction</span>
                    <span>Assistive Tech</span>
                    <span>Wearable Interfaces</span>
                    <span>Computer Vision on Edge</span>
                    <span>Haptics/Audio Feedback</span>
                    <span>Interactive Installations</span>
                </div>
            </div>

            <!-- Education -->
            <div class="block">
                <h3>Education</h3>
                <div class="resume-item">
                    <div class="year">2025–Now</div>
                    <div class="details">
                        <strong>Harvard GSD</strong><br>
                        MDes (Mediums) · Boston
                    </div>
                </div>
                <div class="resume-item">
                    <div class="year">2020–2025</div>
                    <div class="details">
                        <strong>Tsinghua University</strong><br>
                        B.F.A. Info Design & B.A. Economics · GPA 3.87/4.0
                    </div>
                </div>
                <div class="resume-item">
                    <div class="year">2023–2024</div>
                    <div class="details">
                        <strong>Cornell University</strong><br>
                        Exchange in Info Sci, Systems & Technology
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
                    <span class="label">Programming</span>
                    <span class="value">
                        Python, C++, JavaScript, PHP, SQL/SQLite
                    </span>
                </div>

                <div class="skill-row">
                    <span class="label">MLOps</span>
                    <span class="value">
                        Containerized ML (Docker & Compose),
                        Model Deployment on Vertex AI,
                        GitHub Actions CI/CD,
                        Vector Databases (Chroma),
                        RAG Pipelines, Data Versioning (DVC)
                    </span>
                </div>

                <div class="skill-row">
                    <span class="label">AI & Vision</span>
                    <span class="value">
                        OpenCV, CLIP, Data Visualization, YOLOv8 Edge Deployment (RK3588/RKNN)
                    </span>
                </div>

                <div class="skill-row">
                    <span class="label">Computational Design</span>
                    <span class="value">
                        Rhino + Grasshopper, Parametric Modeling,
                        Geometry Optimization, Simulation for Fabrication
                    </span>
                </div>

                <div class="skill-row">
                    <span class="label">Design & Media</span>
                    <span class="value">
                        Figma (UI/UX), Blender, 360 Fusion,
                        Adobe AE/PR/PS/AI
                    </span>
                </div>

                <div class="skill-row">
                    <span class="label">Fabrication</span>
                    <span class="value">
                        3D Printing, CNC (Mastercam),
                        Laser Cutting, Physical Prototyping
                    </span>
                </div>

                <div class="skill-row">
                    <span class="label">Hardware</span>
                    <span class="value">
                        ESP32/Arduino, PPG/GSR/IMU Sensors,
                        Wearables, Basic PCB Design
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