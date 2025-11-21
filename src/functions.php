<?php
require_once __DIR__ . '/db.php';

function now(): string
{
  return date('Y-m-d H:i:s');
}

// 创建表（幂等）
function ensure_schema(): void
{
  $pdo = get_pdo();
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE,
      description TEXT,
      tags TEXT,                 
      image_url TEXT,            
      gallery_json TEXT,         
      meta_json TEXT,            
      url TEXT,                  
       year INTEGER,
       month INTEGER,
      featured INTEGER DEFAULT 0,
      order_index INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
    CREATE INDEX IF NOT EXISTS idx_projects_order ON projects(order_index);
    
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );
    CREATE TABLE IF NOT EXISTS project_tags (
      project_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (project_id, tag_id),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id)     REFERENCES tags(id)     ON DELETE CASCADE
    );
  ");

  // 新增：规范化标签表
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );
    CREATE TABLE IF NOT EXISTS project_tags (
      project_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (project_id, tag_id),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id)     REFERENCES tags(id)     ON DELETE CASCADE
    );
  ");

  // 如果旧表里没有某些列，尝试添加（兼容旧数据库）
  $cols = $pdo->query("PRAGMA table_info(projects)")->fetchAll(PDO::FETCH_ASSOC);
  $existing = [];
  foreach ($cols as $col) {
    $existing[$col['name']] = true;
  }

  if (empty($existing['month'])) {
    $pdo->exec("ALTER TABLE projects ADD COLUMN month INTEGER;");
  }
  if (empty($existing['meta_json'])) {
    $pdo->exec("ALTER TABLE projects ADD COLUMN meta_json TEXT;");
  }

  // 直接编辑的便捷字段
  $convenienceCols = [
    'subtitle',      // 副标题（纯文本）
    'links',         // JSON 对象字符串
    'tools',         // JSON 数组字符串
    'hero_media'     // JSON 对象字符串 {src,alt} 或 {type:"video",src}
  ];
  foreach ($convenienceCols as $cc) {
    if (empty($existing[$cc])) {
      $pdo->exec("ALTER TABLE projects ADD COLUMN {$cc} TEXT;");
    }
  }

  // Details 字段作为独立列，便于直接编辑
  $detailCols = [
    'background_problem',
    'design_goals',
    'solution_overview',
    'interaction_design',
    'pipeline',
    'prototype_highlights',
    'usability_testing',
    'outcomes',
    'ethics',
    'next_steps',
    'media_notes',
    'acknowledgements',
    'contact'
  ];
  foreach ($detailCols as $dc) {
    if (empty($existing[$dc])) {
      $pdo->exec("ALTER TABLE projects ADD COLUMN {$dc} TEXT;");
    }
  }
}

// 基础校验与清洗
function slugify(string $s): string
{
  $s = strtolower(trim($s));
  $s = preg_replace('/[^a-z0-9-]+/', '-', $s);
  return trim($s, '-');
}
// CRUD
function create_project(array $data): int
{
  $pdo = get_pdo();
  $stmt = $pdo->prepare("INSERT INTO projects (title, slug, description, tags, image_url, gallery_json, meta_json, url, year, month, featured, order_index, created_at, updated_at) VALUES (:title, :slug, :description, :tags, :image_url, :gallery_json, :meta_json, :url, :year, :month, :featured, :order_index, :created_at, :updated_at)");
  $stmt->execute([
    ':title' => $data['title'],
    ':slug' => $data['slug'] ?: slugify($data['title']),
    ':description' => $data['description'] ?? '',
    ':tags' => $data['tags'] ?? '',
    ':image_url' => $data['image_url'] ?? '',
    ':gallery_json' => isset($data['gallery']) ? json_encode($data['gallery']) : '[]',
    ':meta_json' => isset($data['meta']) ? json_encode($data['meta']) : '{}',
    ':url' => $data['url'] ?? '',
    ':year' => (int) ($data['year'] ?? date('Y')),
    ':month' => norm_month($data['month'] ?? null),
    ':featured' => !empty($data['featured']) ? 1 : 0,
    ':order_index' => (int) ($data['order_index'] ?? 0),
    ':created_at' => now(),
    ':updated_at' => now()
  ]);
  return (int) $pdo->lastInsertId();
}

function update_project(int $id, array $data): void {
  $pdo = get_pdo();
  $stmt = $pdo->prepare("UPDATE projects SET title=:title, slug=:slug, description=:description, tags=:tags, image_url=:image_url, gallery_json=:gallery_json, url=:url, meta_json=:meta_json, year=:year, month=:month, featured=:featured, order_index=:order_index, updated_at=:updated_at WHERE id=:id");
  $stmt->execute([
    ':title' => $data['title'], ':slug' => $data['slug'] ?: slugify($data['title']), ':description' => $data['description'] ?? '', ':tags' => $data['tags'] ?? '', ':image_url' => $data['image_url'] ?? '', ':gallery_json' => isset($data['gallery']) ? json_encode($data['gallery']) : '[]', ':meta_json' => isset($data['meta']) ? json_encode($data['meta']) : '{}', ':url' => $data['url'] ?? '', ':year' => norm_year($data['year'] ?? null), ':month' => norm_month($data['month'] ?? null), ':featured' => !empty($data['featured']) ? 1 : 0, ':order_index' => (int)($data['order_index'] ?? 0), ':updated_at' => now(), ':id' => $id
  ]);
}

function delete_project(int $id): void
{
  $pdo = get_pdo();
  $stmt = $pdo->prepare("DELETE FROM projects WHERE id = :id");
  $stmt->execute([':id' => $id]);
}

// 查询
function get_projects(bool $only_featured = false): array
{
  $pdo = get_pdo();
  $sql = "SELECT * FROM projects ";
  if ($only_featured)
    $sql .= "WHERE featured = 1 ";
  $sql .= "ORDER BY featured DESC, order_index DESC, year DESC, id DESC";
  return $pdo->query($sql)->fetchAll();
}

function find_project_by_id_or_slug($id_or_slug): ?array
{
  $pdo = get_pdo();
  if (ctype_digit((string) $id_or_slug)) {
    $stmt = $pdo->prepare("SELECT * FROM projects WHERE id = :id");
    $stmt->execute([':id' => (int) $id_or_slug]);
  } else {
    $stmt = $pdo->prepare("SELECT * FROM projects WHERE slug = :slug");
    $stmt->execute([':slug' => (string) $id_or_slug]);
  }
  $row = $stmt->fetch();
  return $row ?: null;
}


function get_projects_filtered(array $q = []): array
{
  $pdo = get_pdo();
  $sql = "SELECT * FROM projects WHERE 1=1";
  $params = [];

  if (!empty($q['tag'])) {
    // 在逗号分隔的 tags 里模糊查（低成本版）
    $sql .= " AND (',' || lower(tags) || ',') LIKE :tag";
    $params[':tag'] = '%,' . strtolower($q['tag']) . ',%';
  }
  if (!empty($q['year'])) {
    $sql .= " AND year = :year";
    $params[':year'] = (int) $q['year'];
  }

  $sort = $q['sort'] ?? 'recent';
  if ($sort === 'alpha') {
    $sql .= " ORDER BY title COLLATE NOCASE ASC";
  } else {
    $sql .= " ORDER BY featured DESC, order_index DESC, year DESC, id DESC";
  }

  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  return $stmt->fetchAll();
}
//用 GET 参数做“筛选/排序”是最直观的 URL 交互；输出时一律 htmlspecialchars()（安全输出）。

function upsert_tags_for_project(int $project_id, string $csv): void
{
  $pdo = get_pdo();
  $pdo->prepare("DELETE FROM project_tags WHERE project_id = :pid")->execute([':pid' => $project_id]);

  $parts = array_filter(array_map(fn($s) => trim($s), explode(',', $csv)));
  foreach ($parts as $name) {
    if ($name === '')
      continue;
    $name_norm = strtolower($name);
    $pdo->prepare("INSERT OR IGNORE INTO tags(name) VALUES(:n)")->execute([':n' => $name_norm]);
    $tag_id = $pdo->query("SELECT id FROM tags WHERE name=" . $pdo->quote($name_norm))->fetchColumn();
    if ($tag_id) {
      $pdo->prepare("INSERT OR IGNORE INTO project_tags(project_id, tag_id) VALUES(:p,:t)")
        ->execute([':p' => $project_id, ':t' => $tag_id]);
    }
  }
}


function get_projects_filtered_joined(array $q = []): array
{
  $pdo = get_pdo();
  $sql = "
    SELECT p.*,
      COALESCE((
        SELECT GROUP_CONCAT(t.name, ', ')
        FROM project_tags pt
        JOIN tags t ON t.id = pt.tag_id
        WHERE pt.project_id = p.id
      ), '') AS tags_joined
    FROM projects p
    WHERE 1=1
  ";
  $params = [];

  if (!empty($q['tag'])) {
    // 规范化后建议精确匹配（小写）
    // Try normalized tag relation OR fallback to CSV in p.tags (legacy data)
    $sql .= " AND (
       EXISTS (
         SELECT 1 FROM project_tags pt
         JOIN tags t ON t.id = pt.tag_id
         WHERE pt.project_id = p.id AND lower(t.name) = :tag
       )
       OR lower(p.tags) LIKE :tag_like
    )";
    $params[':tag'] = strtolower($q['tag']);
    $params[':tag_like'] = '%' . strtolower($q['tag']) . '%';
  }

  if (!empty($q['year'])) {
    $sql .= " AND p.year = :year";
    $params[':year'] = (int) $q['year'];
  }

  $sort = $q['sort'] ?? 'recent';
  if ($sort === 'alpha') {
    $sql .= " ORDER BY p.title COLLATE NOCASE ASC";
  } else {
    $sql .= " ORDER BY p.featured DESC, p.order_index DESC, p.year DESC, p.id DESC";
  }

  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  return $stmt->fetchAll();
}

function norm_year($v)
{
  $v = trim((string) ($v ?? ''));
  if ($v === '' || !is_numeric($v))
    return null;
  $y = (int) $v;
  return ($y >= 1900 && $y <= 2100) ? $y : null;
}

function norm_month($v)
{
  $v = trim((string) ($v ?? ''));
  if ($v === '' || !is_numeric($v))
    return null;
  $m = (int) $v;
  return ($m >= 1 && $m <= 12) ? $m : null;
}

function render_markdown($text)
{
  if (!$text)
    return '';

  $text = htmlspecialchars($text, ENT_NOQUOTES, 'UTF-8');

  // Links
  $text = preg_replace('/\[([^\]]+)\]\(([^)]+)\)/', '<a href="$2" target="_blank" class="text-link">$1</a>', $text);

  // Bold
  $text = preg_replace('/\*\*([^\*]+)\*\*/', '<strong>$1</strong>', $text);

  // Lists
  $lines = explode("\n", $text);
  $inList = false;
  $out = [];

  foreach ($lines as $line) {
    $trim = trim($line);
    // Check for list item (dash or asterisk)
    if (preg_match('/^[-*]\s+(.*)$/', $trim, $matches)) {
      if (!$inList) {
        $out[] = '<ul>'; // No class needed, we use generic ul in CSS
        $inList = true;
      }
      $out[] = '<li>' . $matches[1] . '</li>';
    } else {
      if ($inList) {
        $out[] = '</ul>';
        $inList = false;
      }
      if ($trim !== '') {
        $out[] = '<p>' . $line . '</p>';
      }
    }
  }
  if ($inList)
    $out[] = '</ul>';

  return implode("\n", $out);
}

