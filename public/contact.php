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
  <link rel="stylesheet" href="/css/style.css">
  <style>.page{max-width:760px;margin:32px auto;padding:0 16px;line-height:1.7;}</style>
</head>
<body>
<header>
  <h1><?= htmlspecialchars($config['site_name']) ?></h1>
  <p><a class="btn" href="/">Home</a></p>
</header>
<main class="page">
  <h2>Contact</h2>
  <p>Email: <a href="mailto:you@example.com">you@example.com</a></p>
  <p>LinkedIn / Instagram / GitHub: <a href="#" target="_blank" rel="noopener">link</a></p>
</main>
<footer><p>© <?= date('Y') ?> <?= htmlspecialchars($config['site_name']) ?></p></footer>
</body>
</html>
