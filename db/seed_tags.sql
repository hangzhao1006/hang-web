-- db/seed_tags.sql
-- 用途：一次性插入常用类别（tags）。可多次运行，已存在的会被忽略。
-- 使用：sqlite3 data/portfolio.sqlite ".read db/seed_tags.sql"

PRAGMA foreign_keys = ON;
BEGIN TRANSACTION;

-- 约定采用小写、连字符/空格均可；建议统一使用小写，避免重复。
INSERT OR IGNORE INTO tags(name) VALUES
  (lower('Assistive Tech')),
  (lower('HCI')),
  (lower('Computer Vision')),
  (lower('On-device')),
  (lower('Haptics')),
  (lower('Wearable')),
  (lower('Product')),
  (lower('Interaction')),
  (lower('Embedded')),
  (lower('OCR')),
  (lower('TTS')),
  (lower('Prototyping')),
  (lower('Usability Testing')),
  (lower('Accessibility'));

COMMIT;

-- 可选：查看插入结果
-- SELECT id, name FROM tags ORDER BY name;