PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE,
      description TEXT,
      tags TEXT,                 -- 逗号分隔，或存 JSON
      image_url TEXT,            -- 首图
      gallery_json TEXT,         -- 其他图 JSON 数组
      meta_json TEXT,            -- 可扩展的结构化元数据（JSON），用于 subtitle/links/tools/process 等
      url TEXT,                  -- 外链（Behance/GitHub/视频等）
       year INTEGER,
       month INTEGER,
      featured INTEGER DEFAULT 0,
      order_index INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
INSERT INTO projects VALUES(1,'Tuchsure — AI Visual Assistive Glove','tuchsure','An AI-powered glove with camera and haptic feedback for visually impaired users.','AI,Assistive,HCI,Embedded','/uploads/1.png','["https:\/\/via.placeholder.com\/800x600?text=Photo+1","https:\/\/via.placeholder.com\/800x600?text=Photo+2"]','{}','https://example.com/tuchsure',2025,NULL,1,10,'2025-09-24 20:05:49','2025-09-24 20:05:49');
INSERT INTO projects VALUES(2,'Ehoura — Handheld Sundial for Astronaut Time Perception','ehoura','A ring-like device visualizing sun & moon cycles to stabilize circadian rhythm in microgravity.','Space,Interaction,Light,Product','https://via.placeholder.com/1200x675?text=Ehoura','[]','{}','https://example.com/ehoura',2024,NULL,1,8,'2025-09-24 20:05:49','2025-09-24 20:05:49');
CREATE TABLE tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );
CREATE TABLE project_tags (
      project_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (project_id, tag_id),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id)     REFERENCES tags(id)     ON DELETE CASCADE
    );
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('projects',2);
CREATE INDEX idx_projects_featured ON projects(featured);
CREATE INDEX idx_projects_order ON projects(order_index);
COMMIT;
