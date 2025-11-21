-- db/project_template.sql
-- 通用：按 slug upsert 一个项目 + 映射标签 + 元数据
-- 用法：复制到新文件，替换占位符，再执行：
--   sqlite3 data/portfolio.sqlite ".read db/your_new_project.sql"

PRAGMA foreign_keys = ON;
BEGIN TRANSACTION;

-- 1) upsert 项目（按 slug 唯一）
--    说明：如果 slug 存在就更新，否则插入。
INSERT INTO projects (title, slug, description, tags, image_url, gallery_json, meta_json, url, year, month, featured, order_index, created_at, updated_at)
SELECT :title, :slug, :desc, :tags_csv, :hero, :gallery_json, :meta_json, :url, :year, :month, :featured, :order_idx, datetime('now','localtime'), datetime('now','localtime')
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE slug = :slug);

UPDATE projects SET
  title=:title,
  description=:desc,
  tags=:tags_csv,
  image_url=:hero,
  gallery_json=:gallery_json,
  meta_json=:meta_json,
  url=:url,
  year=:year,
  month=:month,
  featured=:featured,
  order_index=:order_idx,
  updated_at=datetime('now','localtime')
WHERE slug=:slug;

-- 2) 绑定规范化标签（若需要）
--    首先确保标签存在
INSERT OR IGNORE INTO tags(name) VALUES
  (lower('Assistive Tech')),
  (lower('HCI')),
  (lower('Computer Vision')),
  (lower('On-device')),
  (lower('Haptics')),
  (lower('Wearable'));

--    然后按 slug 绑定（按需修改标签名）
WITH p AS (
  SELECT id FROM projects WHERE slug = :slug
),
 t AS (
  SELECT id FROM tags WHERE name IN (
    lower('Assistive Tech'), lower('HCI'), lower('Computer Vision'), lower('On-device'), lower('Haptics'), lower('Wearable')
  )
)
INSERT OR IGNORE INTO project_tags(project_id, tag_id)
SELECT p.id, t.id FROM p CROSS JOIN t;

COMMIT;

-- 参数提示（把下方 JSON 复制到一个 .sqlvars 或手动替换）
-- :slug         = 'your-project-slug'
-- :title        = 'Your Project Title'
-- :desc         = 'One-line description'
-- :tags_csv     = 'ai,assistive,hci'           -- 旧 CSV，可留空或保持同步
-- :hero         = '/uploads/your-hero.jpg'
-- :gallery_json = '[{"src":"/uploads/1.jpg","caption":""}]'
-- :meta_json    = '{"subtitle":"...","overview":"..."}'
-- :url          = 'https://example.com'
-- :year         = 2025
-- :month        = NULL                       -- 1-12 或 NULL
-- :featured     = 1                          -- 0/1
-- :order_idx    = 100