<?php
declare(strict_types=1);

// public/script/seed.php  (位于 public/script)
$ROOT = realpath(__DIR__ . '/../../../'); // ← 往上3层到项目根
if (!$ROOT || !is_file($ROOT . '/src/functions.php')) {
  die("找不到项目根：期望在 $ROOT/src/functions.php");
}

require $ROOT . '/src/functions.php';
ensure_schema();

$initFile = $ROOT . '/db/init.sql';
if (!is_file($initFile)) die("找不到种子文件：$initFile");

$pdo = get_pdo();
$pdo->exec('PRAGMA foreign_keys = ON;');
$sql = file_get_contents($initFile);

$pdo->beginTransaction();
try {
  $pdo->exec($sql);

  $pdo->exec("DELETE FROM project_tags;");
  $pdo->exec("DELETE FROM tags;");
  $rows = $pdo->query("SELECT id, tags FROM projects")->fetchAll();
  foreach ($rows as $r) if (!empty($r['tags'])) {
    upsert_tags_for_project((int)$r['id'], $r['tags']);
  }

  $pdo->commit();
  echo "Seed OK\n";
} catch (Throwable $e) {
  $pdo->rollBack();
  echo "Seed failed: ".$e->getMessage()."\n";
  exit(1);
}
