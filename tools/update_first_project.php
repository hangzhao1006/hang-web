<?php
// Temporary script: update first project with structured meta
require __DIR__ . '/../src/functions.php';
ensure_schema();
$projects = get_projects(false);
if (empty($projects)) {
  echo "No projects found\n";
  exit(1);
}
$first = $projects[0];
$id = (int)$first['id'];

// Prepare structured meta based on existing data
$meta = [
  'subtitle' => '中英文可选：举例 — 一个用 AI 辅助的视觉交互原型',
  'role' => 'Lead Designer / Researcher',
  'duration' => '2024.02–2024.05 (8 weeks)',
  'team' => 'Individual',
  'client' => 'Internal / Student Project',
  'tools_tech' => 'Figma, React, SQLite, Python (numpy, scikit-learn)',
  'overview' => substr(trim($first['description'] ?? ''), 0, 600),
  'process' => [
    'research' => ['interviews', 'literature review', 'data analysis'],
    'ideation' => ['sketching', 'low-fi prototypes', 'storyboards'],
    'prototype' => ['interactive React prototype', 'A/B testing']
  ],
  'outcomes' => [
    'metrics' => [
      ['name' => 'User satisfaction', 'value' => '4.2 / 5'],
      ['name' => 'Task completion', 'value' => '92%']
    ]
  ],
  'links' => [
    'demo' => $first['url'] ?: '',
    'github' => '',
  ],
];

// keep existing gallery if present
$gallery = [];
if (!empty($first['gallery_json'])) {
  $g = json_decode($first['gallery_json'], true);
  if (is_array($g)) $gallery = $g;
}

$update = $first;
$update['meta'] = $meta;
$update['gallery'] = $gallery;

update_project($id, $update);

echo "Updated project id={$id}, title={$first['title']}\n";
echo "meta_json written.\n";
?>