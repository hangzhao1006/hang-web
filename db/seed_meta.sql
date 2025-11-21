-- db/seed_meta.sql
-- 用途：按 slug 更新某些结构化字段（写入到 meta_json）。
-- 说明：保持 JSON 合法；支持简单字段覆盖（如 subtitle/overview/year 等）。
-- 使用：sqlite3 data/portfolio.sqlite ".read db/seed_meta.sql"

PRAGMA foreign_keys = ON;
BEGIN TRANSACTION;

-- 工具函数（SQLite 无原生 JSON_MERGE；这里直接整体替换为简化）
-- 将下面 JSON 文本替换成你需要的内容。

-- 示例：更新 tuchsure 的 meta_json
UPDATE projects
SET meta_json = '{
  "subtitle": "See-through-the-hand glove: palm camera + on-device perception, spoken + haptic feedback.",
  "overview": "Year: 2024\nRole: System design / Interaction / Prototyping\nKeywords: Assistive Tech, HCI, CV, Haptics",
  "when": "2024-06 · Featured"
}'
WHERE slug = 'tuchsure';

COMMIT;

-- 可选：校验
-- SELECT slug, substr(meta_json,1,200) FROM projects WHERE slug='tuchsure';