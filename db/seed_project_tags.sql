-- db/seed_project_tags.sql
-- 用途：把指定项目与类别建立映射关系。
-- 说明：这里演示按 slug 查项目，避免 id 漂移；可重复执行（使用 INSERT OR IGNORE）。
-- 使用：sqlite3 data/portfolio.sqlite ".read db/seed_project_tags.sql"

PRAGMA foreign_keys = ON;
BEGIN TRANSACTION;

-- 1) 为 slug='tuchsure' 绑定若干标签
WITH p AS (
  SELECT id FROM projects WHERE slug = 'tuchsure'
),
 t AS (
  SELECT id FROM tags WHERE name IN (
    lower('Assistive Tech'), lower('HCI'), lower('Computer Vision'),
    lower('On-device'), lower('Haptics'), lower('Wearable')
  )
)
INSERT OR IGNORE INTO project_tags(project_id, tag_id)
SELECT p.id, t.id FROM p CROSS JOIN t;

-- 2) 其他项目（示例：ehoura）
-- WITH p AS (
--   SELECT id FROM projects WHERE slug = 'ehoura'
-- ),
--  t AS (
--   SELECT id FROM tags WHERE name IN (lower('Product'), lower('Interaction'))
-- )
-- INSERT OR IGNORE INTO project_tags(project_id, tag_id)
-- SELECT p.id, t.id FROM p CROSS JOIN t;

COMMIT;

-- 可选：查看映射结果
-- SELECT p.title, GROUP_CONCAT(t.name, ', ') AS tags
-- FROM projects p
-- LEFT JOIN project_tags pt ON pt.project_id = p.id
-- LEFT JOIN tags t ON t.id = pt.tag_id
-- GROUP BY p.id
-- ORDER BY p.id;