<?php
header('Content-Type: application/json');
require __DIR__ . '/../../src/functions.php';

if (!is_admin()) {
    http_response_code(401);
    exit(json_encode(['error' => 'Unauthorized']));
}

$body = json_decode(file_get_contents('php://input'), true);
$project_id = (int)($body['project_id'] ?? 0);
$field      = $body['field'] ?? '';
$value      = $body['value'] ?? '';

if (!$project_id || !$field) {
    http_response_code(400);
    exit(json_encode(['error' => 'Missing params']));
}

$project = find_project_by_id_or_slug($project_id);
if (!$project) {
    http_response_code(404);
    exit(json_encode(['error' => 'Not found']));
}

// Top-level fields
$top_fields = ['title', 'description', 'year'];

// Meta fields (stored in meta_json)
$meta_fields = ['subtitle', 'role', 'client', 'duration', 'team'];

if (in_array($field, $top_fields)) {
    $project[$field] = $value;
    update_project($project_id, $project);
} elseif (in_array($field, $meta_fields)) {
    $meta = !empty($project['meta_json']) ? (json_decode($project['meta_json'], true) ?: []) : [];
    $meta[$field] = $value;
    $project['meta_json'] = json_encode($meta, JSON_UNESCAPED_UNICODE);
    update_project($project_id, $project);
} else {
    http_response_code(400);
    exit(json_encode(['error' => 'Field not allowed']));
}

echo json_encode(['ok' => true]);
