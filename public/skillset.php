<?php
require __DIR__ . '/../src/functions.php';
$config = require __DIR__ . '/../src/config.php';
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Skillset — <?= htmlspecialchars($config['site_name']) ?></title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/svg+xml" href="/logo.svg">
  <link rel="stylesheet" href="/css/test.css?v=<?= time() ?>">
  <style>
    body { background: #090909; color: #fff; margin: 0; }
    .skillset-page { background: #090909; min-height: 100vh; }
    .skillset-container {
      width: 90%;
      padding: 100px 0 60px;
      box-sizing: border-box;
    }
    .skillset-title {
      font-family: 'Intrepid', sans-serif;
      font-size: 0.8rem;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: rgba(255,255,255,0.2);
      margin-bottom: 30px;
      padding: 0 40px;
    }
    #react-root { width: 100%; }
  </style>
</head>
<body class="skillset-page">

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
    <a href="/skillset.php">Skillset</a>
    <a href="/admin.php">Admin</a>
  </nav>

  <header class="project-header is-dark">
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

  <div class="skillset-container">
    <div class="skillset-title">Curriculum Architecture · Multimodal Transformer</div>
    <div id="react-root"></div>
  </div>

  <script src="/script/test.js" defer></script>

  <!-- React + Babel CDN -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script type="text/babel">
    // inline render after Babel compiles this block
    const { useState, useRef, useEffect, useCallback } = React;
  </script>
  <script type="text/babel" src="/script/nn_preview.jsx" data-plugins="transform-react-jsx"></script>
  <script type="text/babel">
    ReactDOM.createRoot(document.getElementById('react-root')).render(
      React.createElement(window.NNSelfAttn)
    );
  </script>

</body>
</html>
