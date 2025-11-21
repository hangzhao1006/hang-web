<?php
require __DIR__ . '/../src/functions.php';
ensure_schema();
$projects = get_projects(false);
if (empty($projects)) { echo "No projects\n"; exit(1); }
$first = $projects[0];
$id = (int)$first['id'];
$desc = trim($first['description'] ?? '');
if ($desc === '') { echo "Project description empty\n"; exit(1); }

$headings = [
  'TL;DR', 'Project Overview', 'Background / Problem', 'Goals', 'My Role',
  'Solution Overview', 'Hardware Prototype', 'Processing Pipeline', 'Haptic mapping',
  'Process (summary)', 'Process', 'Results & Impact', 'Next Steps', 'Media', 'Accessibility & Ethics', 'Acknowledgements'
];

function extract_sections($text, $headings) {
  $lower = strtolower($text);
  $positions = [];
  foreach ($headings as $h) {
    $pos = stripos($text, $h);
    if ($pos !== false) $positions[$pos] = $h;
  }
  ksort($positions);
  $sections = [];
  $keys = array_keys($positions);
  for ($i = 0; $i < count($keys); $i++) {
    $start = $keys[$i];
    $h = $positions[$start];
    $startAfter = $start + strlen($h);
    $end = ($i+1 < count($keys)) ? $keys[$i+1] : strlen($text);
    $content = trim(substr($text, $startAfter, $end - $startAfter));
    // remove leading colon or dash and newlines
    $content = preg_replace('/^[:\-\s]+/', '', $content);
    $sections[$h] = trim($content);
  }
  return $sections;
}

$sections = extract_sections($desc, $headings);

// Helper to extract list items from a paragraph (lines starting with - or numbered)
function extract_list($s) {
  if (!$s) return [];
  $lines = preg_split('/\r?\n/', $s);
  $out = [];
  foreach ($lines as $ln) {
    $ln = trim($ln);
    if ($ln === '') continue;
    // remove leading bullet or numbering
    $ln = preg_replace('/^\s*([\-\*]|\d+\.|\d+\))\s*/', '', $ln);
    $out[] = $ln;
  }
  return $out;
}

$meta = [];
$meta['subtitle'] = $sections['TL;DR'] ?? '';
$meta['overview'] = $sections['Project Overview'] ?? ($sections['Solution Overview'] ?? '');
$meta['problem_statement'] = $sections['Background / Problem'] ?? '';
$meta['goals'] = extract_list($sections['Goals'] ?? '');
$meta['my_role'] = $sections['My Role'] ?? '';
$meta['hardware'] = $sections['Hardware Prototype'] ?? '';
$meta['pipeline'] = $sections['Processing Pipeline'] ?? '';
$meta['haptic_mapping'] = $sections['Haptic mapping'] ?? '';
$meta['process'] = extract_list($sections['Process (summary)'] ?? ($sections['Process'] ?? ''));
$meta['outcomes'] = $sections['Results & Impact'] ?? '';
$meta['next_steps'] = $sections['Next Steps'] ?? '';
$meta['media_notes'] = $sections['Media'] ?? '';
$meta['accessibility'] = $sections['Accessibility & Ethics'] ?? '';
$meta['acknowledgements'] = $sections['Acknowledgements'] ?? '';

// small heuristics: extract Keywords line from overview or solution overview
if (!empty($meta['overview'])) {
  if (preg_match('/Keywords?:\s*(.+)/i', $meta['overview'], $m)) {
    $meta['keywords'] = array_map('trim', explode(',', $m[1]));
  }
}
if (empty($meta['keywords']) && preg_match('/Keywords?:\s*(.+)/i', $desc, $m2)) {
  $meta['keywords'] = array_map('trim', explode(',', $m2[1]));
}

// set duration if year present
if (!empty($first['year'])) $meta['year'] = (int)$first['year'];

// merge into project and update
$update = $first;
$update['meta'] = $meta;
update_project($id, $update);

echo "Structured meta written for project id={$id}, title={$first['title']}\n";
print_r($meta);
?>