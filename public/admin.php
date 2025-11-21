<?php
session_start();
require __DIR__ . '/../src/functions.php';
$config = require __DIR__ . '/../src/config.php';
ensure_schema();

if (empty($_SESSION['csrf'])) {
  $_SESSION['csrf'] = bin2hex(random_bytes(16));
}
function require_csrf()
{
  if (!hash_equals($_SESSION['csrf'] ?? '', $_POST['csrf'] ?? '')) {
    http_response_code(400);
    exit('Bad CSRF');
  }
}

// ... (上传逻辑保持不变) ...
function optional_cover_upload_set_url(int $projectId): void
{
  if (!isset($_FILES['cover']) || $_FILES['cover']['error'] !== UPLOAD_ERR_OK)
    return;
  $tmp = $_FILES['cover']['tmp_name'];
  $ext = pathinfo($_FILES['cover']['name'], PATHINFO_EXTENSION);
  if (!in_array(strtolower($ext), ['jpg', 'jpeg', 'png', 'webp', 'gif']))
    return;
  $dirFs = __DIR__ . '/uploads/projects';
  if (!is_dir($dirFs))
    mkdir($dirFs, 0775, true);
  $destWeb = "/uploads/projects/{$projectId}." . time() . ".{$ext}";
  if (move_uploaded_file($tmp, $dirFs . "/" . basename($destWeb))) {
    $p = find_project_by_id_or_slug($projectId);
    if ($p) {
      $p['image_url'] = $destWeb;
      update_project($projectId, $p);
    }
  }
}

$is_logged_in = !empty($_SESSION['admin_ok']);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $act = $_POST['action'] ?? '';
  if ($act === 'login') {
    if (hash_equals($config['admin_password'], $_POST['password'] ?? '')) {
      $_SESSION['admin_ok'] = true;
      header('Location: admin.php');
      exit;
    }
  }
  if ($is_logged_in && in_array($act, ['create', 'update', 'delete'], true)) {
    require_csrf();
    function collect_meta_data()
    {
      $meta = [];
      foreach (['subtitle', 'role', 'duration', 'team', 'client', 'hero_media'] as $k) {
        if (!empty($_POST["meta_{$k}"]))
          $meta[$k] = trim($_POST["meta_{$k}"]);
      }
      if (isset($_POST["visual_hero_height"]))
        $meta['hero_height'] = $_POST["visual_hero_height"];
      if (isset($_POST["visual_hero_scale"]))
        $meta['hero_scale'] = $_POST["visual_hero_scale"];
      if (isset($_POST["visual_hero_pos_y"]))
        $meta['hero_pos_y'] = $_POST["visual_hero_pos_y"];
      if (!empty($_POST['meta_links_json']))
        $meta['links'] = json_decode($_POST['meta_links_json'], true);

      // Blocks JSON
      if (!empty($_POST['content_blocks_json'])) {
        $raw = json_decode($_POST['content_blocks_json'], true);
        // 数据清洗：如果是 text 类型，确保有 sections 数组
        if (is_array($raw)) {
          foreach ($raw as &$b) {
            if ($b['type'] === 'text' && !isset($b['sections'])) {
              // 兼容旧数据：转为 sections 格式
              $b['sections'] = [
                [
                  'subtitle' => $b['subtitle'] ?? '',
                  'content' => $b['content'] ?? ''
                ]
              ];
              unset($b['subtitle'], $b['content']);
            }
          }
          $meta['blocks'] = $raw;
        }
      }
      return $meta;
    }
    if ($act === 'create') {
      $_POST['meta'] = collect_meta_data();
      if (!empty($_POST['gallery_json_str']))
        $_POST['gallery'] = json_decode($_POST['gallery_json_str'], true);
      $id = create_project($_POST);
      optional_cover_upload_set_url($id);
      upsert_tags_for_project($id, $_POST['tags'] ?? '');
      header('Location: admin.php');
      exit;
    }
    if ($act === 'update') {
      $id = (int) $_POST['id'];
      $_POST['meta'] = collect_meta_data();
      if (!empty($_POST['gallery_json_str']))
        $_POST['gallery'] = json_decode($_POST['gallery_json_str'], true);
      update_project($id, $_POST);
      upsert_tags_for_project($id, $_POST['tags'] ?? '');
      optional_cover_upload_set_url($id);
      header("Location: admin.php#project-{$id}");
      exit;
    }
    if ($act === 'delete') {
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
  <title>Admin</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="css/admin.css?v=<?= time() ?>">
  <link rel="stylesheet" href="https://unpkg.com/easymde/dist/easymde.min.css">
  <script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
  <style>
    /* 样式微调：支持嵌套的 Section */
    .sub-sections-container {
      border-left: 2px solid #eee;
      padding-left: 15px;
      margin-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .sub-section-item {
      background: #fcfcfc;
      border: 1px solid #eee;
      padding: 10px;
      border-radius: 4px;
      position: relative;
    }

    .sub-section-header {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 5px;
    }

    .remove-section-btn {
      color: #ff6b6b;
      cursor: pointer;
      border: none;
      background: none;
      font-size: 1.2rem;
      line-height: 1;
    }

    .add-section-btn {
      font-size: 0.8rem;
      color: #007aff;
      cursor: pointer;
      background: none;
      border: 1px dashed #007aff;
      padding: 5px;
      border-radius: 4px;
      width: 100%;
      margin-top: 10px;
    }

    .add-section-btn:hover {
      background: #f0f8ff;
    }
  </style>
</head>

<body class="admin-page">

  <header class="admin-header">
    <div class="header-inner">
      <h1>CMS / <?= htmlspecialchars($config['site_name']) ?></h1>
      <nav><a href="index.php" target="_blank" class="btn-text">View Site ↗</a><?php if ($is_logged_in): ?><a
            href="admin.php?action=logout" class="btn-text danger">Logout</a><?php endif; ?></nav>
    </div>
  </header>

  <main class="admin-container">
    <?php if (!$is_logged_in): ?>
      <div class="login-card">
        <form method="post"><input type="hidden" name="action" value="login"><input type="password" name="password"
            placeholder="Password" required autofocus><button class="btn-primary" type="submit">Login</button></form>
      </div>
    <?php else: ?>
      <!-- ... Create Form 省略 (保持不变) ... -->
      <div class="actions-bar"><button class="btn-primary"
          onclick="document.getElementById('create-form').classList.toggle('hidden')">+ New Project</button></div>
      <div id="create-form" class="editor-card hidden">
        <div class="card-body">
          <form method="post" enctype="multipart/form-data"><input type="hidden" name="csrf"
              value="<?= htmlspecialchars($_SESSION['csrf']) ?>"><input type="hidden" name="action" value="create">
            <div class="form-grid">
              <div class="form-group"><label>Title</label><input name="title" required></div>
              <div class="form-group"><label>Year</label><input name="year" value="<?= date('Y') ?>"></div>
            </div><button class="btn-primary" type="submit">Create Draft</button>
          </form>
        </div>
      </div>

      <div class="project-list">
        <?php foreach ($projects as $p):
          $meta = !empty($p['meta_json']) ? json_decode($p['meta_json'], true) : [];
          $galleryJson = $p['gallery_json'] ?: '[]';
          $linksJson = isset($meta['links']) ? json_encode($meta['links']) : '{}';
          $blocks = $meta['blocks'] ?? [];

          // 简单数据迁移：将旧的单内容 text 块转为 sections 结构，方便前端统一处理
          foreach ($blocks as &$b) {
            if ($b['type'] === 'text' && !isset($b['sections'])) {
              $b['sections'] = [
                [
                  'subtitle' => $b['subtitle'] ?? '',
                  'content' => $b['content'] ?? ''
                ]
              ];
            }
          }
          unset($b); // 解除引用
      
          $blocksJson = htmlspecialchars(json_encode($blocks), ENT_QUOTES, 'UTF-8');
          $hHeight = $meta['hero_height'] ?? 85;
          $hScale = $meta['hero_scale'] ?? 1.0;
          $hPosY = $meta['hero_pos_y'] ?? 50;
          ?>
          <div class="editor-card collapsed" id="project-<?= $p['id'] ?>">
            <div class="card-header" onclick="toggleEdit(<?= $p['id'] ?>)">
              <div class="header-info"><span class="id">#<?= $p['id'] ?></span><strong
                  class="title"><?= htmlspecialchars($p['title']) ?></strong></div><span class="arrow">▼</span>
            </div>
            <div class="card-body">
              <form method="post" enctype="multipart/form-data" class="project-form">
                <input type="hidden" name="csrf" value="<?= htmlspecialchars($_SESSION['csrf']) ?>">
                <input type="hidden" name="action" value="update">
                <input type="hidden" name="id" value="<?= $p['id'] ?>">
                <div class="tabs-nav">
                  <button type="button" class="tab-btn active" onclick="switchTab(<?= $p['id'] ?>, 'basic')">Info</button>
                  <button type="button" class="tab-btn" onclick="switchTab(<?= $p['id'] ?>, 'story')">Story Builder</button>
                  <button type="button" class="tab-btn" onclick="switchTab(<?= $p['id'] ?>, 'media')">Visuals</button>
                </div>
                <!-- Tab 1 & 3 省略，保持原样 -->
                <div class="tab-pane active" data-tab="basic-<?= $p['id'] ?>">
                  <div class="form-grid">
                    <div class="form-group full"><label>Title</label><input name="title"
                        value="<?= htmlspecialchars($p['title']) ?>"></div>
                    <div class="form-group full"><label>Subtitle</label><input name="meta_subtitle"
                        value="<?= htmlspecialchars($meta['subtitle'] ?? '') ?>"></div>
                    <div class="form-group"><label>Slug</label><input name="slug"
                        value="<?= htmlspecialchars($p['slug']) ?>"></div>
                    <div class="form-group"><label>Year</label><input name="year" value="<?= $p['year'] ?>"></div>
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
                <div class="tab-pane" data-tab="media-<?= $p['id'] ?>">
                  <div class="form-group"><label>Cover URL</label><input name="image_url"
                      value="<?= htmlspecialchars($p['image_url']) ?>"><input type="file" name="cover" accept="image/*"
                      style="margin-top:5px;"></div>
                  <div class="divider"><span>Hero Visuals</span></div>
                  <div class="visual-controls">
                    <div class="visual-col">
                      <div class="range-header"><span>Height</span><span class="range-val"
                          id="hv-<?= $p['id'] ?>"><?= $hHeight ?>vh</span></div><input type="range"
                        name="visual_hero_height" min="50" max="100" step="5" value="<?= $hHeight ?>"
                        oninput="document.getElementById('hv-<?= $p['id'] ?>').innerText=this.value+'vh'">
                    </div>
                    <div class="visual-col">
                      <div class="range-header"><span>Scale</span><span class="range-val"
                          id="sv-<?= $p['id'] ?>"><?= $hScale ?>x</span></div><input type="range" name="visual_hero_scale"
                        min="1.0" max="3.0" step="0.1" value="<?= $hScale ?>"
                        oninput="document.getElementById('sv-<?= $p['id'] ?>').innerText=this.value+'x'">
                    </div>
                    <div class="visual-col">
                      <div class="range-header"><span>Focus Y</span><span class="range-val"
                          id="pv-<?= $p['id'] ?>"><?= $hPosY ?>%</span></div><input type="range" name="visual_hero_pos_y"
                        min="0" max="100" step="5" value="<?= $hPosY ?>"
                        oninput="document.getElementById('pv-<?= $p['id'] ?>').innerText=this.value+'%'">
                    </div>
                  </div>
                  <div class="divider"><span>Links/Gallery</span></div>
                  <div class="form-group"><textarea name="meta_links_json" rows="2"
                      class="code-font"><?= htmlspecialchars($linksJson) ?></textarea></div>
                  <div class="form-group"><textarea name="gallery_json_str" rows="2"
                      class="code-font"><?= htmlspecialchars($galleryJson) ?></textarea></div>
                </div>

                <!-- Tab 2: Story Builder (Enhanced) -->
                <div class="tab-pane" data-tab="story-<?= $p['id'] ?>">
                  <div class="form-group"><label>Overview</label><textarea name="description" class="simple-editor"
                      rows="3"><?= htmlspecialchars($p['description']) ?></textarea></div>
                  <div class="divider"><span>Blocks</span></div>
                  <div class="blocks-container" id="blocks-container-<?= $p['id'] ?>"></div>
                  <input type="hidden" name="content_blocks_json" id="blocks-input-<?= $p['id'] ?>"
                    value="<?= $blocksJson ?>">
                  <div class="add-block-bar">
                    <button type="button" class="add-block-btn" onclick="addBlock(<?= $p['id'] ?>, 'text')">Text
                      Group</button>
                    <button type="button" class="add-block-btn" onclick="addBlock(<?= $p['id'] ?>, 'image')">Image</button>
                  </div>
                </div>

                <div class="card-actions"><button type="button" class="btn-primary"
                    onclick="submitProjectForm(<?= $p['id'] ?>)">Save</button><button type="submit"
                    formaction="?action=delete" name="action" value="delete" class="btn-danger"
                    onclick="return confirm('Delete?');">Delete</button></div>
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
        try { projectBlocks[id] = raw ? JSON.parse(raw) : []; } catch (e) { projectBlocks[id] = []; }
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
      if (type === 'text') {
        newBlock.label = '';
        // 初始化一个 section
        newBlock.sections = [{ subtitle: '', content: '' }];
      }
      if (type === 'image') { newBlock.src = ''; newBlock.caption = ''; newBlock.width = '100'; newBlock.layout = 'center'; }
      projectBlocks[id].push(newBlock);
      renderBlocks(id);
    }

    function removeBlock(pid, idx) {
      if (!confirm('Remove block?')) return;
      projectBlocks[pid].splice(idx, 1);
      renderBlocks(pid);
    }

    // 新增：添加子段落
    function addSection(pid, blockIdx) {
      projectBlocks[pid][blockIdx].sections.push({ subtitle: '', content: '' });
      renderBlocks(pid);
    }
    // 新增：移除子段落
    function removeSection(pid, blockIdx, sectionIdx) {
      projectBlocks[pid][blockIdx].sections.splice(sectionIdx, 1);
      renderBlocks(pid);
    }

    function updateBlockData(pid, idx, field, value) {
      if (projectBlocks[pid][idx]) {
        projectBlocks[pid][idx][field] = value;
        syncJson(pid);
      }
    }

    function updateSectionData(pid, blockIdx, secIdx, field, value) {
      if (projectBlocks[pid][blockIdx] && projectBlocks[pid][blockIdx].sections[secIdx]) {
        projectBlocks[pid][blockIdx].sections[secIdx][field] = value;
        syncJson(pid);
      }
    }

    function syncJson(pid) {
      document.getElementById('blocks-input-' + pid).value = JSON.stringify(projectBlocks[pid]);
    }

    function renderBlocks(id) {
      const container = document.getElementById('blocks-container-' + id);
      container.innerHTML = '';
      projectBlocks[id].forEach((block, index) => {
        const el = document.createElement('div');
        el.className = 'content-block-item';

        let html = `<div class="block-header"><div><span class="block-handle">☰</span> <span class="block-type">${block.type}</span></div><button type="button" class="delete-btn" onclick="removeBlock(${id}, ${index})">×</button></div>`;

        if (block.type === 'text') {
          // 主标题
          html += `<div class="form-group"><input placeholder="Main Section Title (e.g. Process)" value="${escapeHtml(block.label || '')}" onchange="updateBlockData(${id}, ${index}, 'label', this.value)" style="font-weight:bold;"></div>`;

          // 子段落容器
          html += `<div class="sub-sections-container">`;
          const sections = block.sections || [];
          sections.forEach((sec, sIdx) => {
            html += `
                    <div class="sub-section-item">
                        <div class="sub-section-header"><button type="button" class="delete-btn" style="font-size:1rem;" onclick="removeSection(${id}, ${index}, ${sIdx})">×</button></div>
                        <div class="form-group"><input placeholder="Subtitle (Optional)" value="${escapeHtml(sec.subtitle || '')}" onchange="updateSectionData(${id}, ${index}, ${sIdx}, 'subtitle', this.value)"></div>
                        <div class="form-group"><textarea class="mde-${id}-${index}-${sIdx}">${escapeHtml(sec.content || '')}</textarea></div>
                    </div>
                `;
          });
          html += `</div>`;
          html += `<button type="button" class="add-section-btn" onclick="addSection(${id}, ${index})">+ Add another paragraph/subtitle</button>`;

        } else if (block.type === 'image') {
          // ... Image block logic (unchanged) ...
          const w = block.width || 100;
          const imgSrc = escapeHtml(block.src || '');
          const layout = block.layout || 'center';
          const previewClass = layout === 'left' ? 'preview-container mode-left' : 'preview-container';
          const alignStyle = layout === 'center' ? 'margin: 0 auto;' : 'margin: 0;';

          html += `
                <div class="form-group"><input placeholder="Image URL" value="${imgSrc}" onchange="updateBlockData(${id}, ${index}, 'src', this.value)" oninput="this.parentElement.nextElementSibling.querySelector('img').src = this.value"></div>
                <div class="${previewClass}"><img src="${imgSrc}" class="block-img-preview" alt="Preview" style="width:${w}%; ${alignStyle}"></div>
                <div class="form-group"><input placeholder="Caption" value="${escapeHtml(block.caption || '')}" onchange="updateBlockData(${id}, ${index}, 'caption', this.value)"></div>
                <div class="visual-controls">
                    <div class="visual-col"><div class="range-header"><span>Width</span><span class="range-val">${w}%</span></div><input type="range" min="20" max="100" step="5" value="${w}" oninput="this.parentElement.querySelector('.range-val').innerText=this.value+'%'; updateBlockData(${id}, ${index}, 'width', this.value); this.closest('.content-block-item').querySelector('.block-img-preview').style.width = this.value + '%';"></div>
                    <div class="visual-col"><label style="font-size:0.7rem;color:#888;">Align</label><select onchange="updateBlockData(${id}, ${index}, 'layout', this.value); const c = this.closest('.content-block-item').querySelector('.preview-container'); const i = c.querySelector('img'); if(this.value==='left'){c.classList.add('mode-left');i.style.margin='0';}else{c.classList.remove('mode-left');i.style.margin='0 auto';}" style="width:100%"><option value="center" ${layout == 'center' ? 'selected' : ''}>Center</option><option value="left" ${layout == 'left' ? 'selected' : ''}>Left</option></select></div>
                </div>
            `;
        }
        el.innerHTML = html;
        container.appendChild(el);

        // Init Editors
        if (block.type === 'text' && block.sections) {
          block.sections.forEach((sec, sIdx) => {
            const ta = el.querySelector(`textarea.mde-${id}-${index}-${sIdx}`);
            new EasyMDE({ element: ta, status: false, spellChecker: false, minHeight: "100px", toolbar: ["bold", "italic", "unordered-list", "link", "preview"], forceSync: true })
              .codemirror.on("change", (cm) => updateSectionData(id, index, sIdx, 'content', cm.getValue()));
          });
        }
      });
      syncJson(id);

      new Sortable(container, {
        handle: '.block-header', onEnd: function (evt) {
          const item = projectBlocks[id].splice(evt.oldIndex, 1)[0];
          projectBlocks[id].splice(evt.newIndex, 0, item);
          syncJson(id);
          renderBlocks(id);
        }
      });
    }

    function submitProjectForm(id) {
      syncJson(id);
      document.querySelector(`#project-${id} form`).submit();
    }

    function escapeHtml(text) {
      if (!text) return '';
      return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
  </script>
</body>

</html>