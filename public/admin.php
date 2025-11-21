<?php
session_start();
require __DIR__ . '/../src/functions.php';
$config = require __DIR__ . '/../src/config.php';
ensure_schema();

// CSRF Token
if (empty($_SESSION['csrf'])) {
  $_SESSION['csrf'] = bin2hex(random_bytes(16));
}

function require_csrf()
{
  if (!hash_equals($_SESSION['csrf'] ?? '', $_POST['csrf'] ?? '')) {
    http_response_code(400);
    exit('Bad CSRF token');
  }
}

// Upload Handler
function optional_cover_upload_set_url(int $projectId): void
{
  if (!isset($_FILES['cover']) || $_FILES['cover']['error'] !== UPLOAD_ERR_OK)
    return;
  $tmp = $_FILES['cover']['tmp_name'];
  $size = $_FILES['cover']['size'] ?? 0;
  if ($size > 6 * 1024 * 1024)
    return;

  $finfo = finfo_open(FILEINFO_MIME_TYPE);
  $mime = finfo_file($finfo, $tmp);
  finfo_close($finfo);
  $ok = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
  if (!isset($ok[$mime]))
    return;

  $ext = $ok[$mime];
  $dirFs = __DIR__ . '/uploads/projects';
  if (!is_dir($dirFs))
    mkdir($dirFs, 0775, true);
  $destFs = $dirFs . "/{$projectId}.{$ext}";
  $destWeb = "/uploads/projects/{$projectId}.{$ext}";

  if (move_uploaded_file($tmp, $destFs)) {
    $p = find_project_by_id_or_slug($projectId);
    if ($p) {
      $p['image_url'] = $destWeb;
      update_project($projectId, $p);
    }
  }
}

$is_logged_in = !empty($_SESSION['admin_ok']);

// POST Handling
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $act = $_POST['action'] ?? '';

  if ($act === 'login') {
    if (hash_equals($config['admin_password'], $_POST['password'] ?? '')) {
      $_SESSION['admin_ok'] = true;
      header('Location: admin.php');
      exit;
    } else {
      $error = 'Wrong password.';
    }
  }

  if ($is_logged_in && in_array($act, ['create', 'update', 'delete'], true)) {
    require_csrf();

    function collect_meta_data()
    {
      $meta = [];
      // 1. Basic Info
      $basic_keys = ['subtitle', 'role', 'duration', 'team', 'client', 'hero_media'];
      foreach ($basic_keys as $k) {
        if (!empty($_POST["meta_{$k}"]))
          $meta[$k] = trim($_POST["meta_{$k}"]);
      }

      // 2. Visual Tweaks (Height/Scale/Pos)
      // 我们接收原始滑块数值，保存时带上单位，方便前台直接用
      if (isset($_POST["visual_height_val"])) {
        $meta['hero_height'] = $_POST["visual_height_val"] . 'vh';
      }
      if (isset($_POST["visual_scale_val"])) {
        $meta['hero_scale'] = $_POST["visual_scale_val"];
      }
      if (isset($_POST["visual_pos_y_val"])) {
        // 将 0-100 的 Y 值转换为 CSS object-position: center Y%
        $meta['hero_pos'] = 'center ' . $_POST["visual_pos_y_val"] . '%';
      }

      // 3. Links
      if (!empty($_POST['meta_links_json'])) {
        $links = json_decode($_POST['meta_links_json'], true);
        if ($links)
          $meta['links'] = $links;
      }

      // 4. Content Blocks (Story Builder)
      if (!empty($_POST['content_blocks_json'])) {
        $blocks = json_decode($_POST['content_blocks_json'], true);
        if (is_array($blocks)) {
          $meta['blocks'] = $blocks;
        }
      }

      return $meta;
    }

    if ($act === 'create') {
      $_POST['meta'] = collect_meta_data();
      if (!empty($_POST['gallery_json_str'])) {
        $_POST['gallery'] = json_decode($_POST['gallery_json_str'], true);
      }
      $id = create_project($_POST);
      optional_cover_upload_set_url($id);
      upsert_tags_for_project($id, $_POST['tags'] ?? '');
      header('Location: admin.php');
      exit;
    }

    if ($act === 'update' && !empty($_POST['id'])) {
      $id = (int) $_POST['id'];
      $_POST['meta'] = collect_meta_data();
      if (!empty($_POST['gallery_json_str'])) {
        $_POST['gallery'] = json_decode($_POST['gallery_json_str'], true);
      }
      update_project($id, $_POST);
      upsert_tags_for_project($id, $_POST['tags'] ?? '');
      optional_cover_upload_set_url($id);
      header("Location: admin.php#project-{$id}");
      exit;
    }

    if ($act === 'delete' && !empty($_POST['id'])) {
      delete_project((int) $_POST['id']);
      header('Location: admin.php');
      exit;
    }
  }
}

if (($_GET['action'] ?? '') === 'logout') {
  session_destroy();
  header('Location: admin.php');
  exit;
}

$projects = $is_logged_in ? get_projects(false) : [];
?>
<!doctype html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <title>Admin — <?= htmlspecialchars($config['site_name']) ?></title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="css/admin.css?v=<?= time() ?>">
  <link rel="stylesheet" href="https://unpkg.com/easymde/dist/easymde.min.css">
  <script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>

  <style>
    /* Editors Tweak */
    .EasyMDEContainer .CodeMirror {
      border-color: #ddd;
      border-radius: 4px;
      font-family: monospace;
      font-size: 14px;
    }

    .editor-toolbar {
      border-color: #ddd;
      opacity: 0.6;
      transition: opacity 0.2s;
    }

    .editor-toolbar:hover {
      opacity: 1;
    }

    /* Block Builder Styles */
    .blocks-container {
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin-bottom: 20px;
      min-height: 50px;
      padding: 5px;
    }

    .content-block-item {
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 15px;
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.02);
    }

    .content-block-item.sortable-ghost {
      opacity: 0.4;
      border: 2px dashed #999;
      background: #f0f0f0;
    }

    .content-block-item.sortable-drag {
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
      transform: scale(1.02);
      cursor: grabbing;
    }

    .block-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5px;
      padding-bottom: 10px;
      border-bottom: 1px solid #f0f0f0;
      cursor: grab;
    }

    .block-handle {
      color: #ccc;
      margin-right: 10px;
      font-size: 1.2rem;
      user-select: none;
    }

    .block-type {
      font-size: 0.75rem;
      text-transform: uppercase;
      font-weight: bold;
      color: #666;
      background: #eee;
      padding: 3px 8px;
      border-radius: 4px;
    }

    /* Range Slider Controls */
    .range-control-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 15px;
    }

    .range-header {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: #666;
      font-weight: 500;
    }

    .range-val {
      color: #111;
      font-family: monospace;
      background: #eee;
      padding: 2px 6px;
      border-radius: 4px;
    }

    input[type=range] {
      -webkit-appearance: none;
      width: 100%;
      background: transparent;
    }

    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 16px;
      width: 16px;
      border-radius: 50%;
      background: #111;
      cursor: pointer;
      margin-top: -6px;
    }

    input[type=range]::-webkit-slider-runnable-track {
      width: 100%;
      height: 4px;
      cursor: pointer;
      background: #ddd;
      border-radius: 2px;
    }

    /* Visual Controls Panel */
    .visual-controls {
      background: #f9f9f9;
      padding: 15px;
      border-radius: 6px;
      border: 1px solid #eee;
      display: flex;
      gap: 20px;
    }

    .visual-col {
      flex: 1;
    }

    .add-block-bar {
      display: flex;
      gap: 10px;
      margin-top: 20px;
      border-top: 1px dashed #ddd;
      padding-top: 20px;
    }

    .add-block-btn {
      flex: 1;
      padding: 12px;
      background: #fff;
      border: 1px dashed #ccc;
      color: #666;
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .add-block-btn:hover {
      border-color: #333;
      color: #333;
      background: #fdfdfd;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
  </style>
</head>

<body class="admin-page">

  <header class="admin-header">
    <div class="header-inner">
      <h1>CMS / <?= htmlspecialchars($config['site_name']) ?></h1>
      <nav>
        <a href="index.php" target="_blank" class="btn-text">View Site ↗</a>
        <?php if ($is_logged_in): ?>
          <a href="admin.php?action=logout" class="btn-text danger">Logout</a>
        <?php endif; ?>
      </nav>
    </div>
  </header>

  <main class="admin-container">

    <?php if (!$is_logged_in): ?>
      <div class="login-card">
        <h2>Login</h2>
        <?php if (!empty($error)): ?>
          <div class="alert error"><?= htmlspecialchars($error) ?></div><?php endif; ?>
        <form method="post">
          <input type="hidden" name="csrf" value="<?= htmlspecialchars($_SESSION['csrf']) ?>">
          <input type="hidden" name="action" value="login">
          <div class="form-group"><input type="password" name="password" placeholder="Password" required autofocus></div>
          <button class="btn-primary" type="submit">Enter</button>
        </form>
      </div>
    <?php else: ?>

      <div class="actions-bar">
        <h2>Projects (<?= count($projects) ?>)</h2>
        <button class="btn-primary" onclick="document.getElementById('create-form').classList.toggle('hidden')">+ New
          Project</button>
      </div>

      <!-- Create Form (Standard) -->
      <div id="create-form" class="editor-card hidden">
        <div class="card-header">
          <h3>Create New Project</h3>
        </div>
        <div class="card-body" style="display:block;">
          <form method="post" enctype="multipart/form-data">
            <input type="hidden" name="csrf" value="<?= htmlspecialchars($_SESSION['csrf']) ?>">
            <input type="hidden" name="action" value="create">
            <div class="form-grid">
              <div class="form-group"><label>Title</label><input name="title" required></div>
              <div class="form-group"><label>Slug</label><input name="slug" placeholder="auto-generated"></div>
              <div class="form-group"><label>Year</label><input name="year" type="number" value="<?= date('Y') ?>"></div>
              <div class="form-group"><label>Tags</label><input name="tags"></div>
            </div>
            <div class="card-actions"><button class="btn-primary" type="submit">Create Draft</button></div>
          </form>
        </div>
      </div>

      <!-- Project List -->
      <div class="project-list">
        <?php foreach ($projects as $p):
          $meta = !empty($p['meta_json']) ? json_decode($p['meta_json'], true) : [];
          $galleryJson = $p['gallery_json'] ?: '[]';
          $linksJson = isset($meta['links']) ? json_encode($meta['links']) : '{}';
          $blocks = $meta['blocks'] ?? [];
          $blocksJson = htmlspecialchars(json_encode($blocks), ENT_QUOTES, 'UTF-8');

          // 解析视觉参数，转为纯数字供滑块使用
          $heroHeight = intval($meta['hero_height'] ?? 85); // default 85vh
          $heroScale = floatval($meta['hero_scale'] ?? 1.0);
          // 解析 pos (e.g. "center 20%") -> 取 20
          $heroPosRaw = $meta['hero_pos'] ?? 'center center';
          $heroPosY = 50; // default center
          if (preg_match('/center\s+(\d+)%/', $heroPosRaw, $m)) {
            $heroPosY = intval($m[1]);
          }
          ?>
          <div class="editor-card collapsed" id="project-<?= $p['id'] ?>">

            <div class="card-header" onclick="toggleEdit(<?= $p['id'] ?>)">
              <div class="header-info">
                <span class="id">#<?= $p['id'] ?></span>
                <strong class="title"><?= htmlspecialchars($p['title']) ?></strong>
                <span
                  class="status-badge <?= $p['featured'] ? 'featured' : '' ?>"><?= $p['featured'] ? 'Featured' : 'Standard' ?></span>
              </div>
              <span class="arrow">▼</span>
            </div>

            <div class="card-body">
              <form method="post" enctype="multipart/form-data" class="project-form" data-id="<?= $p['id'] ?>">
                <input type="hidden" name="csrf" value="<?= htmlspecialchars($_SESSION['csrf']) ?>">
                <input type="hidden" name="action" value="update">
                <input type="hidden" name="id" value="<?= $p['id'] ?>">

                <div class="tabs-nav">
                  <button type="button" class="tab-btn active" onclick="switchTab(<?= $p['id'] ?>, 'basic')">Basic
                    Info</button>
                  <button type="button" class="tab-btn" onclick="switchTab(<?= $p['id'] ?>, 'story')">Story Builder</button>
                  <button type="button" class="tab-btn" onclick="switchTab(<?= $p['id'] ?>, 'media')">Media &
                    Visuals</button>
                </div>

                <!-- Tab 1: Basic -->
                <div class="tab-pane active" data-tab="basic-<?= $p['id'] ?>">
                  <div class="form-grid">
                    <div class="form-group full"><label>Title</label><input name="title"
                        value="<?= htmlspecialchars($p['title']) ?>"></div>
                    <div class="form-group full"><label>Subtitle</label><input name="meta_subtitle"
                        value="<?= htmlspecialchars($meta['subtitle'] ?? '') ?>"></div>
                    <div class="form-group"><label>Slug</label><input name="slug"
                        value="<?= htmlspecialchars($p['slug']) ?>"></div>
                    <div class="form-group"><label>Year</label><input name="year" type="number" value="<?= $p['year'] ?>">
                    </div>
                    <div class="form-group"><label>Role</label><input name="meta_role"
                        value="<?= htmlspecialchars($meta['role'] ?? '') ?>"></div>
                    <div class="form-group"><label>Client</label><input name="meta_client"
                        value="<?= htmlspecialchars($meta['client'] ?? '') ?>"></div>
                    <div class="form-group full"><label>Tags</label><input name="tags"
                        value="<?= htmlspecialchars($p['tags']) ?>"></div>
                    <div class="form-group full"><label class="checkbox-label"><input type="checkbox" name="featured"
                          value="1" <?= $p['featured'] ? 'checked' : '' ?>> Featured</label></div>
                  </div>
                </div>

                <!-- Tab 2: Story Builder (Drag & Drop) -->
                <div class="tab-pane" data-tab="story-<?= $p['id'] ?>">
                  <div class="form-group">
                    <label>Overview (Short Intro)</label>
                    <textarea name="description" class="simple-editor"
                      rows="3"><?= htmlspecialchars($p['description']) ?></textarea>
                  </div>

                  <div class="divider"><span>Content Blocks (Drag to Reorder)</span></div>

                  <div class="blocks-container" id="blocks-container-<?= $p['id'] ?>"></div>
                  <input type="hidden" name="content_blocks_json" id="blocks-input-<?= $p['id'] ?>"
                    value="<?= $blocksJson ?>">

                  <div class="add-block-bar">
                    <button type="button" class="add-block-btn" onclick="addBlock(<?= $p['id'] ?>, 'text')"><span
                        class="icon">T</span> Text</button>
                    <button type="button" class="add-block-btn" onclick="addBlock(<?= $p['id'] ?>, 'image')"><span
                        class="icon">🖼️</span> Image</button>
                  </div>
                </div>

                <!-- Tab 3: Media & Visuals (The Figma Part) -->
                <div class="tab-pane" data-tab="media-<?= $p['id'] ?>">
                  <div class="form-group">
                    <label>Cover Image URL</label>
                    <input name="image_url" value="<?= htmlspecialchars($p['image_url']) ?>">
                    <div class="file-input-wrapper"><small>Or upload:</small><input type="file" name="cover"
                        accept="image/*"></div>
                  </div>

                  <div class="divider"><span>Hero Visual Tweaks (Figma Style)</span></div>
                  <div class="visual-controls">
                    <!-- Height Slider -->
                    <div class="visual-col">
                      <div class="range-control-group">
                        <div class="range-header"><span>Hero Height</span><span class="range-val"
                            id="val-height-<?= $p['id'] ?>"><?= $heroHeight ?>vh</span></div>
                        <input type="range" name="visual_height_val" min="50" max="100" step="5" value="<?= $heroHeight ?>"
                          oninput="document.getElementById('val-height-<?= $p['id'] ?>').innerText = this.value + 'vh'">
                      </div>
                    </div>
                    <!-- Position Y Slider -->
                    <div class="visual-col">
                      <div class="range-control-group">
                        <div class="range-header"><span>Focus Y (Top -> Bottom)</span><span class="range-val"
                            id="val-pos-<?= $p['id'] ?>"><?= $heroPosY ?>%</span></div>
                        <input type="range" name="visual_pos_y_val" min="0" max="100" step="1" value="<?= $heroPosY ?>"
                          oninput="document.getElementById('val-pos-<?= $p['id'] ?>').innerText = this.value + '%'">
                      </div>
                    </div>
                    <!-- Scale Slider -->
                    <div class="visual-col">
                      <div class="range-control-group">
                        <div class="range-header"><span>Scale (Zoom)</span><span class="range-val"
                            id="val-scale-<?= $p['id'] ?>"><?= $heroScale ?>x</span></div>
                        <input type="range" name="visual_scale_val" min="1.0" max="3.0" step="0.1" value="<?= $heroScale ?>"
                          oninput="document.getElementById('val-scale-<?= $p['id'] ?>').innerText = this.value + 'x'">
                      </div>
                    </div>
                  </div>

                  <div class="divider"><span>Links</span></div>
                  <div class="form-group">
                    <textarea name="meta_links_json" rows="3"
                      class="code-font"><?= htmlspecialchars($linksJson) ?></textarea>
                  </div>
                </div>

                <div class="card-actions">
                  <button type="button" class="btn-primary" onclick="submitProjectForm(<?= $p['id'] ?>)">Save
                    Changes</button>
                  <button type="submit" formaction="?action=delete" name="action" value="delete" class="btn-danger"
                    onclick="return confirm('Really delete?');">Delete</button>
                </div>
              </form>
            </div>
          </div>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </main>

  <script src="https://unpkg.com/easymde/dist/easymde.min.js"></script>
  <script>
    const projectBlocks = {};

    function toggleEdit(id) {
      const card = document.getElementById('project-' + id);
      card.classList.toggle('collapsed');
      if (!card.classList.contains('collapsed') && !projectBlocks[id]) {
        const raw = document.getElementById('blocks-input-' + id).value;
        try {
          projectBlocks[id] = raw ? JSON.parse(raw) : [];
        } catch (e) { projectBlocks[id] = []; }
        renderBlocks(id);
      }
    }

    function switchTab(id, tabName) {
      const card = document.getElementById('project-' + id);
      card.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      card.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      event.target.classList.add('active');
      card.querySelector(`[data-tab="${tabName}-${id}"]`).classList.add('active');
    }

    function addBlock(id, type) {
      const newBlock = { type: type, id: Date.now() };
      if (type === 'text') { newBlock.label = ''; newBlock.content = ''; }
      if (type === 'image') {
        newBlock.src = '';
        newBlock.caption = '';
        newBlock.width = '100'; // Numeric for slider
        newBlock.layout = 'center';
      }
      projectBlocks[id].push(newBlock);
      renderBlocks(id);
    }

    function removeBlock(projectId, blockIndex) {
      if (!confirm('Remove block?')) return;
      projectBlocks[projectId].splice(blockIndex, 1);
      renderBlocks(projectId);
    }

    function updateBlockData(projectId, blockIndex, field, value) {
      if (projectBlocks[projectId][blockIndex]) {
        projectBlocks[projectId][blockIndex][field] = value;
        document.getElementById('blocks-input-' + projectId).value = JSON.stringify(projectBlocks[projectId]);
      }
    }

    function renderBlocks(id) {
      const container = document.getElementById('blocks-container-' + id);
      container.innerHTML = '';
      const blocks = projectBlocks[id];

      blocks.forEach((block, index) => {
        const el = document.createElement('div');
        el.className = 'content-block-item';
        el.dataset.index = index;

        let html = `
                <div class="block-header">
                    <div style="display:flex; align-items:center;">
                        <span class="block-handle">☰</span>
                        <span class="block-type">${block.type}</span>
                    </div>
                    <button type="button" class="delete" onclick="removeBlock(${id}, ${index})">×</button>
                </div>
            `;

        if (block.type === 'text') {
          html += `
                    <div class="form-group"><input placeholder="Section Title" value="${escapeHtml(block.label || '')}" onchange="updateBlockData(${id}, ${index}, 'label', this.value)"></div>
                    <div class="form-group"><textarea class="mde-${id}-${index}">${escapeHtml(block.content || '')}</textarea></div>
                `;
        } else if (block.type === 'image') {
          const w = block.width || 100;
          html += `
                    <div class="form-group"><input placeholder="Image URL" value="${escapeHtml(block.src || '')}" onchange="updateBlockData(${id}, ${index}, 'src', this.value)"></div>
                    <div class="form-group"><input placeholder="Caption" value="${escapeHtml(block.caption || '')}" onchange="updateBlockData(${id}, ${index}, 'caption', this.value)"></div>
                    
                    <div class="visual-controls">
                        <div class="visual-col">
                            <div class="range-control-group">
                                <div class="range-header"><span>Width</span><span class="range-val">${w}%</span></div>
                                <input type="range" min="20" max="100" step="5" value="${w}" 
                                       oninput="this.previousElementSibling.querySelector('.range-val').innerText = this.value + '%'; updateBlockData(${id}, ${index}, 'width', this.value)">
                            </div>
                        </div>
                        <div class="visual-col">
                            <label style="font-size:0.7rem;color:#888;">Align</label>
                            <select onchange="updateBlockData(${id}, ${index}, 'layout', this.value)" style="width:100%">
                                <option value="center" ${block.layout == 'center' ? 'selected' : ''}>Center</option>
                                <option value="left" ${block.layout == 'left' ? 'selected' : ''}>Left</option>
                            </select>
                        </div>
                    </div>
                `;
        }
        el.innerHTML = html;
        container.appendChild(el);

        if (block.type === 'text') {
          const ta = el.querySelector(`textarea.mde-${id}-${index}`);
          const mde = new EasyMDE({
            element: ta, status: false, spellChecker: false, minHeight: "100px",
            toolbar: ["bold", "list-ul", "link", "preview"], forceSync: true
          });
          mde.codemirror.on("change", () => { updateBlockData(id, index, 'content', mde.value()); });
        }
      });

      document.getElementById('blocks-input-' + id).value = JSON.stringify(blocks);

      new Sortable(container, {
        handle: '.block-handle', animation: 150, ghostClass: 'sortable-ghost', dragClass: 'sortable-drag',
        onEnd: function (evt) {
          const item = projectBlocks[id].splice(evt.oldIndex, 1)[0];
          projectBlocks[id].splice(evt.newIndex, 0, item);
          document.getElementById('blocks-input-' + id).value = JSON.stringify(projectBlocks[id]);
          renderBlocks(id);
        }
      });
    }

    function submitProjectForm(id) {
      document.getElementById('blocks-input-' + id).value = JSON.stringify(projectBlocks[id] || []);
      document.querySelector(`#project-${id} form`).submit();
    }

    function escapeHtml(text) {
      if (!text) return '';
      return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    function updateBlockData(pid, idx, field, value) {
      if (projectBlocks[pid][idx]) {
        projectBlocks[pid][idx][field] = value;
        document.getElementById('blocks-input-' + pid).value = JSON.stringify(projectBlocks[pid]);
      }
    }

    // 【核心修改】更新后的 renderBlocks 函数
    function renderBlocks(id) {
      const container = document.getElementById('blocks-container-' + id);
      container.innerHTML = '';
      const blocks = projectBlocks[id];

      blocks.forEach((block, index) => {
        const el = document.createElement('div');
        el.className = 'content-block-item';

        // 【修改点 1】给删除按钮加上 class="delete-btn"
        let html = `<div class="block-header"><span class="block-type">${block.type}</span><button type="button" class="delete-btn" onclick="removeBlock(${id}, ${index})">×</button></div>`;

        if (block.type === 'text') {
          html += `
                <div class="form-group"><input placeholder="Title" value="${escapeHtml(block.label || '')}" onchange="updateBlockData(${id}, ${index}, 'label', this.value)"></div>
                <div class="form-group"><textarea class="mde-${id}-${index}">${escapeHtml(block.content || '')}</textarea></div>
            `;
        } else if (block.type === 'image') {
          const w = block.width || 100;
          const imgSrc = escapeHtml(block.src || '');
          html += `
                <div class="form-group">
                    <!-- 【修改点 2】输入框变化时，同时更新数据和预览图的 src -->
                    <input placeholder="Image URL" value="${imgSrc}" 
                           onchange="updateBlockData(${id}, ${index}, 'src', this.value)"
                           oninput="this.parentElement.nextElementSibling.src = this.value">
                </div>
                <!-- 【修改点 3】添加预览图标签 -->
                <img src="${imgSrc}" class="block-img-preview" alt="Preview">

                <div class="form-group"><input placeholder="Caption" value="${escapeHtml(block.caption || '')}" onchange="updateBlockData(${id}, ${index}, 'caption', this.value)"></div>
                <div class="visual-controls">
                    <div class="visual-col">
                        <div class="range-header"><span>Width</span><span class="range-val">${w}%</span></div>
                        <input type="range" min="20" max="100" step="10" value="${w}" oninput="this.previousElementSibling.querySelector('.range-val').innerText=this.value+'%'; updateBlockData(${id}, ${index}, 'width', this.value)">
                    </div>
                </div>
            `;
        }
        el.innerHTML = html;
        container.appendChild(el);

        if (block.type === 'text') {
          const ta = el.querySelector(`textarea.mde-${id}-${index}`);
          new EasyMDE({ element: ta, status: false, spellChecker: false, minHeight: "100px", forceSync: true })
            .codemirror.on("change", (cm) => updateBlockData(id, index, 'content', cm.getValue()));
        }
      });
      document.getElementById('blocks-input-' + id).value = JSON.stringify(blocks);
      new Sortable(container, {
        handle: '.block-header', onEnd: function (evt) {
          const item = projectBlocks[id].splice(evt.oldIndex, 1)[0];
          projectBlocks[id].splice(evt.newIndex, 0, item);
          document.getElementById('blocks-input-' + id).value = JSON.stringify(projectBlocks[id]);
          renderBlocks(id);
        }
      });
    }
  </script>
</body>

</html>