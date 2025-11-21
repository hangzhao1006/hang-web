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
    <link rel="stylesheet" href="/css/style.css">
    <style>
        .page {
            max-width: 1200px;
            margin: 32px auto;
            padding: 0 20px;
            line-height: 1.85;
            color: #eaeaea;
        }

        .page h2 {
            margin-top: 0
        }

        .lead {
            font-size: 1.05rem;
            opacity: .95
        }

        .meta {
            opacity: .85
        }

        .split {
            display: grid;
            grid-template-columns: 1.25fr .75fr;
            gap: 28px;
            align-items: start;
        }

        .cardish {
            background: rgba(255, 255, 255, .06);
            border: 1px solid rgba(255, 255, 255, .12);
            border-radius: 12px;
            padding: 14px
        }

        .pill {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 999px;
            background: rgba(255, 255, 255, .14);
            border: 1px solid rgba(255, 255, 255, .18);
            font-size: .9rem;
            margin: 4px 6px 0 0
        }

        .list {
            margin: .25rem 0 1rem 0;
            padding-left: 1.1rem
        }

        .list li {
            margin: .25rem 0
        }

        @media (max-width:960px) {
            .split {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>

<body>
    <header>
        <h1><?= htmlspecialchars($config['site_name']) ?></h1>
        <p><a class="btn" href="/">Home</a></p>
    </header>

    <main class="page">
        <h2>About</h2>
        <div class="bio-head">
            <div class="avatar-wrap">
                <img class="avatar" src="/uploads/portrait.JPG" alt="Portrait of Hang Zhao" width="160" height="160"
                    loading="lazy" decoding="async">
            </div>
            <p class="lead">
                Hi! I’m Hang Zhao — a designer/technologist exploring the seam between
                <b>assistive technology</b>, <b>interactive media</b>, and <b>AI-driven sensing</b>.
                I build things you can wear, touch, and hear…
            </p>
        </div>

        <p class="lead">
            Hi! I’m Hang Zhao — a designer/technologist exploring the seam between <b>assistive technology</b>,
            <b>interactive media</b>, and <b>AI-driven sensing</b>.
            I build things you can wear, touch, and hear: from tactile guidance gloves to time-perception devices and
            data-driven light installations.
        </p>

        <div class="split">
            <section>
                <h3>Focus</h3>
                <div class="cardish">
                    <p class="meta">
                        Human–Computer Interaction · Wearable & Tangible Interfaces · Computer Vision on Edge ·
                        Haptics/Audio Feedback ·
                        Installation & Light · Research through Making
                    </p>
                    <div>
                        <span class="pill">Assistive Tech</span>
                        <span class="pill">AI + Sensing</span>
                        <span class="pill">On-device</span>
                        <span class="pill">Haptics</span>
                        <span class="pill">Interactive Installations</span>
                    </div>
                </div>

                <h3>Selected Projects</h3>
                <ul class="list">
                    <li><b>Tuchsure</b> — AI visual assistive glove combining palm camera, on-device recognition, and
                        fingertip haptics.</li>
                    <li><b>Ehoura</b> — a handheld “sundial” for astronauts to recalibrate time perception via
                        multi-sensor cues.</li>
                    <li><b>SeePal</b> — navigation aid for BLV users; iterative tests improved indoor navigation and
                        obstacle avoidance.</li>
                </ul>

                <h3>Exhibitions & Recognition</h3>
                <ul class="list">
                    <li>Beijing International Design Week — <i>The Futurescaping</i> (Mars Diary, curation & interactive
                        installations).</li>
                    <li>Cross-Strait Youth Summit: Tech-Art Fusion Exhibition（展出 Tuchsure）。</li>
                    <li>International exhibition at SUTD, Singapore（Mars Diary）。</li>
                    <li>Tsinghua Comprehensive Excellence Scholarship（2021, 2023, Top 1%）等。</li>
                </ul>
            </section>

            <section>
                <h3>Education</h3>
                <ul class="list">
                    <li><b>Harvard GSD</b> — MDes (Mediums) · Boston · 2025–</li>
                    <li><b>Tsinghua University</b> — B.F.A. Art & Technology (Info Design), B.A. Economics & Finance ·
                        GPA 3.87/4.0（专业 4.0/4.0）</li>
                    <li><b>Cornell University</b> — College of Engineering · Exchange in Information Science, Systems &
                        Technology · 2023–2024</li>
                </ul>

                <h3>Experience</h3>
                <ul class="list">
                    <li><b>Chery Automobile iCar</b> — summer intern：promo video (VFX/music) & four interactive
                        installations showcased at BJDW.</li>
                    <li><b>Suzhou Museum — New Media Center</b>：interactive wearable components（Arduino +
                        textiles），video production.</li>
                </ul>

                <h3>Skills</h3>
                <p class="meta">
                    <b>Code</b> · Python, C++, JS/HTML/CSS, PHP, SQLite<br>
                    <b>Design</b> · Adobe AE/PR/PS/AI, Blender, Figma, Fusion<br>
                    <b>Hardware</b> · Arduino/ESP32, sensors, wearables, prototyping<br>
                    <b>Languages</b> · Mandarin (native), English (fluent)
                </p>

                <h3>Contact</h3>
                <p class="meta">
                    Email: <a href="mailto:hang_zhao@gsd.harvard.edu">hang_zhao@gsd.harvard.edu</a> / <a
                        href="mailto:hangzhao1006@gmail.com">hangzhao1006@gmail.com</a>
                </p>
            </section>
        </div>
    </main>

    <footer>
        <p>© <?= date('Y') ?> <?= htmlspecialchars($config['site_name']) ?></p>
    </footer>
</body>

</html>