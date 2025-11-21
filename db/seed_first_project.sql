-- db/seed_first_project.sql
-- 示例：第一个项目（tuchsure）的最小可编辑模板
-- 用法：直接执行或复制此文件改 slug/title 等
--   sqlite3 data/portfolio.sqlite ".read db/seed_first_project.sql"

PRAGMA foreign_keys = ON;
BEGIN TRANSACTION;

-- 1) upsert 项目（按 slug 唯一）
INSERT INTO projects (title, slug, description, tags, image_url, gallery_json, meta_json, url, year, month, featured, order_index, created_at, updated_at)
SELECT 'Tuchsure — AI Visual Assistive Glove', 'tuchsure',
       'An AI-powered glove with camera + on-device perception, delivering audio + haptic feedback.',
       'ai,assistive,hci,embedded',
       '/uploads/1.4.JPG',
       '[{"src":"/uploads/tuchsure-01-hero.jpeg","caption":"Overall glove + palm camera layout"},
         {"src":"/uploads/tuchsure-02-detail1.jpeg","caption":"Fingertip motor positions and direction mapping"},
         {"src":"/uploads/tuchsure-03-detail2.jpeg","caption":"Shelf scenario: read label / short GIF"},
         {"src":"/uploads/tuchsure-04-thumb.jpeg","caption":"Corridor scenario: obstacle avoidance"}]',
       '{"subtitle":"See-through-the-hand glove: palm camera + on-device perception, spoken + haptic feedback.",
         "when":"2024-06 · Featured",
         "overview":"Year: 2024\nRole: System design / Interaction / Prototyping / Usability testing\nKeywords: Assistive Tech, HCI, Computer Vision, On-device, Haptics, Wearable"}',
       NULL,
       2024,
       NULL,
       1,
       120,
       datetime('now','localtime'), datetime('now','localtime')
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE slug = 'tuchsure');

UPDATE projects SET
  title='Tuchsure — AI Visual Assistive Glove',
  description='An AI-powered glove with camera + on-device perception, delivering audio + haptic feedback.',
  tags='ai,assistive,hci,embedded',
  image_url='/uploads/1.4.JPG',
  gallery_json='[{"src":"/uploads/tuchsure-01-hero.jpeg","caption":"Overall glove + palm camera layout"},{"src":"/uploads/tuchsure-02-detail1.jpeg","caption":"Fingertip motor positions and direction mapping"},{"src":"/uploads/tuchsure-03-detail2.jpeg","caption":"Shelf scenario: read label / short GIF"},{"src":"/uploads/tuchsure-04-thumb.jpeg","caption":"Corridor scenario: obstacle avoidance"}]',
  meta_json='{"subtitle":"See-through-the-hand glove: palm camera + on-device perception, spoken + haptic feedback.","when":"2024-06 · Featured","overview":"Year: 2024\nRole: System design / Interaction / Prototyping / Usability testing\nKeywords: Assistive Tech, HCI, Computer Vision, On-device, Haptics, Wearable"}',
  url=NULL,
  year=2024,
  month=NULL,
  featured=1,
  order_index=120,
  updated_at=datetime('now','localtime')
WHERE slug='tuchsure';

-- 2) 插入常用标签 + 绑定到 tuchsure
INSERT OR IGNORE INTO tags(name) VALUES
  (lower('Assistive Tech')),(lower('HCI')),(lower('Computer Vision')),(lower('On-device')),(lower('Haptics')),(lower('Wearable'));

WITH p AS (SELECT id FROM projects WHERE slug='tuchsure'),
     t AS (SELECT id FROM tags WHERE name IN (lower('Assistive Tech'), lower('HCI'), lower('Computer Vision'), lower('On-device'), lower('Haptics'), lower('Wearable')))
INSERT OR IGNORE INTO project_tags(project_id, tag_id)
SELECT p.id, t.id FROM p CROSS JOIN t;

COMMIT;

-- 可选：校验
-- SELECT slug, substr(meta_json,1,180) FROM projects WHERE slug='tuchsure';
-- SELECT p.slug, GROUP_CONCAT(t.name, ', ') FROM projects p LEFT JOIN project_tags pt ON pt.project_id=p.id LEFT JOIN tags t ON t.id=pt.tag_id WHERE p.slug='tuchsure' GROUP BY p.id;