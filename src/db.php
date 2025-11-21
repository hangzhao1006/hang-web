<?php
function get_pdo(): PDO {
  static $pdo = null;
  if ($pdo) return $pdo;

  $config = require __DIR__ . '/config.php';
  $dsn = 'sqlite:' . $config['db_path'];

  // 确保 data 目录存在
  if (!file_exists(dirname($config['db_path']))) {
    mkdir(dirname($config['db_path']), 0775, true);
  }

  $pdo = new PDO($dsn, null, null, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);
  // 推荐启用外键
  $pdo->exec('PRAGMA foreign_keys = ON;');
  return $pdo;
}
