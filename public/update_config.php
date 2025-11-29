<?php
session_start();
require __DIR__ . '/../src/functions.php';

// 檢查是否登入
if (empty($_SESSION['admin_ok'])) {
  http_response_code(403);
  exit(json_encode(['ok' => false, 'error' => 'Not authenticated']));
}

// 只接受 POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  exit(json_encode(['ok' => false, 'error' => 'Method not allowed']));
}

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['background_style']) && in_array($data['background_style'], ['full', 'compact'])) {
  $configPath = __DIR__ . '/../src/config.php';
  $config = require $configPath;
  $config['background_style'] = $data['background_style'];

  // 重寫配置文件
  $content = "<?php\n// 基本配置\nreturn [\n";
  foreach ($config as $key => $value) {
    $content .= "  '{$key}' => ";
    if (is_bool($value)) {
      $content .= $value ? 'true' : 'false';
    } elseif (is_numeric($value)) {
      $content .= $value;
    } else {
      $content .= "'" . addslashes($value) . "'";
    }

    // 添加註釋
    if ($key === 'admin_password') {
      $content .= ", // 极简后台密码（建议用更复杂的；演示用）\n";
    } elseif ($key === 'site_name') {
      $content .= ", // 站点基本信息\n";
    } elseif ($key === 'background_style') {
      $content .= ", // 'full' 或 'compact'\n";
    } else {
      $content .= ",\n";
    }
  }
  $content .= "];\n";

  file_put_contents($configPath, $content);

  echo json_encode(['ok' => true, 'background_style' => $data['background_style']]);
} else {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Invalid background_style']);
}
