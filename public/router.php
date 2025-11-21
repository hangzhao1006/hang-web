<?php
// public/router.php

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$file = __DIR__ . $path;

/**
 * 1) 现有静态/脚本文件直接交给内置服务器处理：
 *    - /css/... /script/... /uploads/... 等静态资源
 *    - /admin.php 这种真实存在的 PHP 文件
 */
if ($path !== '/' && file_exists($file) && !is_dir($file)) {
  return false;  // 让 php -S 自己去处理（会解析 PHP）
}

/** 2) 路由表（只保留一份清晰的映射） */
if ($path === '/' || $path === '') {
  require __DIR__ . '/index.php';
  exit;
}

if ($path === '/about') {
  require __DIR__ . '/about.php';
  exit;
}

if ($path === '/contact') {
  require __DIR__ . '/contact.php';
  exit;
}

/** 漂亮链接：/p/<slug> => project.php?slug=<slug> */
if (preg_match('#^/p/([A-Za-z0-9-]+)/?$#', $path, $m)) {
  $_GET['slug'] = $m[1];
  require __DIR__ . '/project.php';   // 你文件名是 project.php（单数）
  exit;
}

/** 3) 其他 → 404 */
http_response_code(404);
require __DIR__ . '/404.php';
