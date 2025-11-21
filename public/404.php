<?php
require __DIR__ . '/../src/functions.php';
$config = require __DIR__ . '/../src/config.php';
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Not Found — <?= htmlspecialchars($config['site_name']) ?></title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/css/style.css">
  <style>
    .center { max-width: 720px; margin: 80px auto; text-align: center; padding: 0 16px; }
    .center a.btn { display:inline-block; padding:10px 16px; border:1px solid #222; border-radius:999px; text-decoration:none; }
    .muted{ opacity:.7; }
  </style>
</head>
<body>
  <header><h1>404</h1></header>
  <div class="center">
    <h2>Page not found</h2>
    <p class="muted">The page you’re looking for doesn’t exist.</p>
    <p><a class="btn" href="/">← Back to Home</a></p>
  </div>
</body>
</html>
