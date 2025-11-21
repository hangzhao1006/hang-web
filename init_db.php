<?php
require __DIR__ . '/src/functions.php';
ensure_schema();

// 示例数据（可删）
if (empty(get_projects())) {
  create_project([
    'title' => 'Tuchsure — AI Visual Assistive Glove',
    'slug' => 'tuchsure',
    'description' => 'An AI-powered glove with camera and haptic feedback for visually impaired users.',
    'tags' => 'AI,Assistive,HCI,Embedded',
    'image_url' => '/uploads/1.png',
    'gallery' => [
      'https://via.placeholder.com/800x600?text=Photo+1',
      'https://via.placeholder.com/800x600?text=Photo+2'
    ],
    'url' => 'https://example.com/tuchsure',
    'year' => 2025,
    'featured' => 1,
    'order_index' => 10,
  ]);

  create_project([
    'title' => 'Ehoura — Handheld Sundial for Astronaut Time Perception',
    'slug' => 'ehoura',
    'description' => 'A ring-like device visualizing sun & moon cycles to stabilize circadian rhythm in microgravity.',
    'tags' => 'Space,Interaction,Light,Product',
    'image_url' => 'https://via.placeholder.com/1200x675?text=Ehoura',
    'url' => 'https://example.com/ehoura',
    'year' => 2024,
    'featured' => 1,
    'order_index' => 8,
  ]);
}

echo "Database initialized and sample projects inserted.\n";
