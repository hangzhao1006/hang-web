<?php
session_start();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['ok' => false, 'error' => 'POST only']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    echo json_encode(['ok' => false, 'error' => 'Bad JSON']);
    exit;
}

$srcWeb = $input['src'] ?? '';
$x      = (float) ($input['x'] ?? 0);
$y      = (float) ($input['y'] ?? 0);
$w      = (float) ($input['width'] ?? 0);
$h      = (float) ($input['height'] ?? 0);

if (!$srcWeb || $w <= 0 || $h <= 0) {
    echo json_encode(['ok' => false, 'error' => 'Missing params']);
    exit;
}

// 只允许裁 /uploads 下的东西，避免乱操作
if (strpos($srcWeb, '/uploads/') !== 0) {
    echo json_encode(['ok' => false, 'error' => 'Invalid path']);
    exit;
}

// 物理路径，例如 /…/public/uploads/xxx.jpg
$srcFs = __DIR__ . $srcWeb;
if (!file_exists($srcFs)) {
    echo json_encode(['ok' => false, 'error' => 'Source not found']);
    exit;
}

$info = getimagesize($srcFs);
if (!$info) {
    echo json_encode(['ok' => false, 'error' => 'Not an image']);
    exit;
}

$mime = $info['mime'];
switch ($mime) {
    case 'image/jpeg':
        $srcIm = imagecreatefromjpeg($srcFs);
        $ext   = 'jpg';
        break;
    case 'image/png':
        $srcIm = imagecreatefrompng($srcFs);
        $ext   = 'png';
        break;
    case 'image/gif':
        $srcIm = imagecreatefromgif($srcFs);
        $ext   = 'gif';
        break;
    default:
        echo json_encode(['ok' => false, 'error' => 'Unsupported type']);
        exit;
}

if (!$srcIm) {
    echo json_encode(['ok' => false, 'error' => 'Create image failed']);
    exit;
}

// 目标文件命名：把 “原文件名” 中的 -crop-时间戳 去掉，然后统一变成 “原名-crop.ext”
$pi   = pathinfo($srcFs);
// e.g. j1-crop-1763  →  j1
$baseNoCrop = preg_replace('/-crop-\d+$/', '', $pi['filename']);
$cropName   = $baseNoCrop . '-crop.' . $ext;

// 物理路径 & Web 路径
$destFs  = $pi['dirname'] . DIRECTORY_SEPARATOR . $cropName;
$destWeb = dirname($srcWeb) . '/' . $cropName;

// 创建目标画布（按裁剪尺寸真实像素输出）
$dstIm = imagecreatetruecolor((int)$w, (int)$h);

// PNG / GIF 透明处理
if ($mime === 'image/png' || $mime === 'image/gif') {
    imagecolortransparent($dstIm, imagecolorallocatealpha($dstIm, 0, 0, 0, 127));
    imagealphablending($dstIm, false);
    imagesavealpha($dstIm, true);
}

// 执行像素级裁剪
imagecopyresampled(
    $dstIm, $srcIm,
    0, 0,
    (int)$x, (int)$y,
    (int)$w, (int)$h,
    (int)$w, (int)$h
);

// 覆盖写入（不存在就新建，存在就替换）
switch ($mime) {
    case 'image/jpeg':
        imagejpeg($dstIm, $destFs, 90);
        break;
    case 'image/png':
        imagepng($dstIm, $destFs);
        break;
    case 'image/gif':
        imagegif($dstIm, $destFs);
        break;
}

imagedestroy($srcIm);
imagedestroy($dstIm);

echo json_encode([
    'ok'  => true,
    'url' => $destWeb  // 前端会把这个写回 gallery / block 里
]);
