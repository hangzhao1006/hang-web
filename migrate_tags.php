<?php
require __DIR__ . '/src/functions.php';
ensure_schema();

$pdo = get_pdo();
$rows = $pdo->query("SELECT id, tags FROM projects")->fetchAll();
foreach ($rows as $r) {
  upsert_tags_for_project((int)$r['id'], (string)$r['tags']);
}
echo "Tags migrated from projects.tags to tags/project_tags.\n";
