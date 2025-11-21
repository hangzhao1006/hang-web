BEGIN TRANSACTION;

-- Optional: clean normalized tag tables first (safe even if empty)
DELETE FROM project_tags;
DELETE FROM tags;

-- Main table
DELETE FROM projects;

INSERT INTO projects
(title, slug, description, tags, image_url, gallery_json, url, year, month, featured, order_index, created_at, updated_at,
 subtitle, links, tools, hero_media)
VALUES
('Tuchsure — AI Visual Assistive Glove','tuchsure',
 'An AI-powered glove with palm camera and fingertip haptics...',
 'AI,Assistive,HCI,Embedded',
 '/uploads/1.4.JPG',
 '["/uploads/tuchsure-1.jpg","/uploads/tuchsure-2.jpg"]',
 NULL, 2025, 6, 1, 100,
 datetime('now','localtime'), datetime('now','localtime'),
 'Palm-camera glove with fingertip haptics',
 '{"github":"https://github.com/you/tuchsure"}',
 '[{"src":"/uploads/python.png","alt":"Python","href":"https://python.org"},{"src":"/uploads/opencv.png","alt":"OpenCV"},"Blender"]',
 '{"type":"image","src":"/uploads/tuchsure-01-hero.jpeg","alt":"Tuchsure hero"}'),

 -- 2) Ehoura
('Ehoura — Handheld Sundial for Astronaut Time Perception','ehoura',
 'A ring-like device that visualizes sun & moon cycles...',
 'Space,Interaction,Light,Product',
 '/uploads/2.2.JPG',
 '["/uploads/ehoura-1.jpg","/uploads/ehoura-2.jpg"]',
 'https://example.com/ehoura', 2024, 5, 1, 90,
 datetime('now','localtime'), datetime('now','localtime'),
 'Sun & moon cycles handheld visualization',
 '{}',
 '[{"src":"/uploads/arduino.png","alt":"Arduino"},{"src":"/uploads/cpp.png","alt":"C++"}]',
 '{"type":"image","src":"/uploads/2.2.JPG","alt":"Ehoura hero"}'),

-- 3) SerenEcho
('SerenEcho','serenecho',
 'Guqin-inspired interactive projection. Pressure and vibration sensing modulate ink-landscape visuals and sound textures, bridging ancient aesthetics and modern tech.',
 'Culture,Music,Projection,Sensors',
 '/uploads/3.11.PNG',
 '["/uploads/serenecho-1.jpg","/uploads/serenecho-2.jpg"]',
 NULL, 2024, 12, 0, 500, datetime('now','localtime'), datetime('now','localtime'),
 'Guqin-inspired interactive projection',
 '{}',
 '["Sensors","Projection"]',
 '{"type":"image","src":"/uploads/3.11.PNG","alt":"SerenEcho hero"}'),

-- 4) Symbiophony
('Symbiophony','symbiophony',
 'An immersive piece that turns voice into layered, nature-like soundscapes. Light and multi-channel audio respond to timbre and rhythm, inviting human–nature resonance.',
 'Installation,Audio-Visual,FFT,LEDs',
 '/uploads/4.2.JPG',
 '["/uploads/symbiophony-1.jpg","/uploads/symbiophony-2.jpg"]',
 NULL, 2024, 7, 0, 400, datetime('now','localtime'), datetime('now','localtime'),
 'Voice to nature-like soundscapes',
 '{}',
 '["FFT","LEDs"]',
 '{"type":"image","src":"/uploads/4.2.JPG","alt":"Symbiophony hero"}'),


-- 6) ShadowPlay
('ShadowPlay','shadowplay',
 'A gesture-sensing lantern that changes color and patterns with proximity and hand motion, designed to support engagement for children on the spectrum.',
 'Autism,Interaction,Education,Arduino',
 '/uploads/6.1.png',
 '["/uploads/shadowplay-1.jpg","/uploads/shadowplay-2.jpg"]',
 NULL, 2024, 4, 0, 300, datetime('now','localtime'), datetime('now','localtime'),
 'Gesture-sensing lantern',
 '{}',
 '[{"src":"/uploads/arduino.png","alt":"Arduino"},"Education"]',
 '{"type":"image","src":"/uploads/6.1.png","alt":"ShadowPlay hero"}'),

 -- 5) SeePal
('SeePal','seepal',
 'A guidance device for BLV users. Vision + dialogue + haptic alerts support indoor navigation and obstacle avoidance with concise, context-aware prompts.',
 'Accessibility,HCI,Vision,Haptics,AI',
 '/uploads/5.2.jpg',
 '["/uploads/seepal-1.jpg","/uploads/seepal-2.jpg"]',
 NULL, 2023, 12, 0, 200, datetime('now','localtime'), datetime('now','localtime'),
 'Indoor navigation with haptics',
 '{}',
 '["AI","Vision","Haptics"]',
 '{"type":"image","src":"/uploads/5.2.jpg","alt":"SeePal hero"}'),

-- 7) TideEcho
('TideEcho','tideecho',
 'A beach installation of light columns that maps wave energy, extreme tides, and human interaction into changing light—inviting reflection on sea-level rise.',
 'Installation,Climate,Light,Data',
 '/uploads/7.5.jpg',
 '["/uploads/tideecho-1.jpg","/uploads/tideecho-2.jpg"]',
 NULL, 2022, 5, 0, 100, datetime('now','localtime'), datetime('now','localtime'),
 'Mapping wave energy to light',
 '{}',
 '["Installation","Data"]',
 '{"type":"image","src":"/uploads/7.5.jpg","alt":"TideEcho hero"}');
COMMIT;
