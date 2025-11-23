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
    exit('Bad CSRF');
  }
}

// Upload Logic
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
      // include 'tool' so meta_tool from the form is saved into meta_json
      foreach (['subtitle', 'role', 'duration', 'team', 'client', 'hero_media', 'tool'] as $k) {
        if (!empty($_POST["meta_{$k}"]))
          $meta[$k] = trim($_POST["meta_{$k}"]);
      }
      if (isset($_POST["visual_hero_height"]))
        $meta['hero_height'] = $_POST["visual_hero_height"];
      if (isset($_POST["visual_hero_scale"]))
        $meta['hero_scale'] = $_POST["visual_hero_scale"];
      if (isset($_POST["visual_hero_pos_y"]))
        $meta['hero_pos_y'] = $_POST["visual_hero_pos_y"];
      if (isset($_POST["visual_cover_scale"]))
        $meta['cover_scale'] = $_POST["visual_cover_scale"];
      if (isset($_POST["visual_cover_pos_y"]))
        $meta['cover_pos_y'] = $_POST["visual_cover_pos_y"];
      if (!empty($_POST['meta_links_json']))
        $meta['links'] = json_decode($_POST['meta_links_json'], true);

      // Content Blocks
      if (!empty($_POST['content_blocks_json'])) {
        $raw = json_decode($_POST['content_blocks_json'], true);
        if (is_array($raw)) {
          foreach ($raw as &$b) {
            if ($b['type'] === 'text' && !isset($b['sections'])) {
              $b['sections'] = [['subtitle' => $b['subtitle'] ?? '', 'content' => $b['content'] ?? '']];
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
    /* Admin Styles */
    input[type=range] {
      -webkit-appearance: none;
      width: 100%;
      background: transparent;
      margin: 10px 0;
      cursor: grab;
    }

    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 16px;
      width: 16px;
      border-radius: 50%;
      background: #333;
      margin-top: -6px;
      border: 2px solid #fff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    input[type=range]::-webkit-slider-runnable-track {
      width: 100%;
      height: 4px;
      cursor: pointer;
      background: #ddd;
      border-radius: 2px;
    }

    .visual-controls {
      background: #f9f9f9;
      padding: 15px;
      border-radius: 6px;
      border: 1px solid #eee;
      display: flex;
      gap: 20px;
      margin-top: 5px;
    }

    .visual-col {
      flex: 1;
    }

    .range-header {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: #666;
      font-weight: 600;
      text-transform: uppercase;
    }

    .range-val {
      font-family: monospace;
      background: #eee;
      padding: 2px 6px;
      border-radius: 4px;
      color: #333;
      font-size: 0.8rem;
    }

    /* Block & Gallery Preview */
    .preview-container {
      border: 1px solid #ddd;
      background: #fff;
      background-image: radial-gradient(#e5e5e5 1px, transparent 1px);
      background-size: 10px 10px;
      padding: 20px;
      margin-top: 10px;
      border-radius: 4px;
      display: flex;
      justify-content: center;
    }

    .preview-container.mode-left {
      justify-content: flex-start;
    }

    .block-img-preview {
      display: block;
      max-width: 100%;
      height: auto;
      border: 1px solid #ccc;
      background: #fff;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
      transition: width 0.2s;
    }

    /* Subsections */
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

    .delete-section-btn {
      color: #ff6b6b;
      cursor: pointer;
      border: none;
      background: none;
      font-size: 1rem;
      line-height: 1;
    }

    .add-section-btn {
      font-size: 0.8rem;
      color: #007aff;
      cursor: pointer;
      background: none;
      border: 1px dashed #007aff;
      padding: 8px;
      border-radius: 4px;
      width: 100%;
      margin-top: 10px;
      transition: all 0.2s;
    }

    .add-section-btn:hover {
      background: #f0f8ff;
    }

    .add-block-bar {
      display: flex;
      gap: 10px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px dashed #ddd;
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

    .toggle-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      color: #444;
      cursor: pointer;
      margin-top: 10px;
    }

    .toggle-label input {
      width: auto;
      margin: 0;
    }

    /* Gallery List */
    .gallery-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }

    .gallery-item {
      background: #fff;
      border: 1px solid #eee;
      border-radius: 6px;
      padding: 10px;
      position: relative;
      cursor: grab;
    }

    .gallery-item:active {
      cursor: grabbing;
    }

    .gallery-thumb {
      width: 100%;
      height: 100px;
      object-fit: cover;
      border-radius: 4px;
      background: #f5f5f5;
      margin-bottom: 8px;
      border: 1px solid #eee;
    }

    .gallery-controls {
      display: flex;
      gap: 5px;
      margin-top: 5px;
    }

    .gallery-input {
      width: 100%;
      font-size: 0.8rem;
      padding: 4px;
      margin-bottom: 4px;
      border: 1px solid #ddd;
      border-radius: 3px;
    }

    .del-gal-btn {
      position: absolute;
      top: 5px;
      right: 5px;
      background: rgba(255, 255, 255, 0.9);
      color: #ff6b6b;
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      cursor: pointer;
      font-weight: bold;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
      </div><?php else: ?>
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

          foreach ($blocks as &$b) {
            if ($b['type'] === 'text' && !isset($b['sections'])) {
              $b['sections'] = [['subtitle' => $b['subtitle'] ?? '', 'content' => $b['content'] ?? '']];
            }
          }
          unset($b);

          $blocksJson = htmlspecialchars(json_encode($blocks), ENT_QUOTES, 'UTF-8');
          $hHeight = $meta['hero_height'] ?? 85;
          $hScale = $meta['hero_scale'] ?? 1.0;
          $hPosY = $meta['hero_pos_y'] ?? 50;
          $cScale = $meta['cover_scale'] ?? 1.0;
          $cPosY = $meta['cover_pos_y'] ?? 50;
          ?>
          <div class="editor-card collapsed" id="project-<?= $p['id'] ?>">
            <div class="card-header" onclick="toggleEdit(<?= $p['id'] ?>)">
              <div class="header-info"><span class="id">#<?= $p['id'] ?></span><strong
                  class="title"><?= htmlspecialchars($p['title']) ?></strong></div><span class="arrow">▼</span>
            </div>
            <div class="card-body">
              <form method="post" enctype="multipart/form-data" class="project-form">
                <input type="hidden" name="csrf" value="<?= htmlspecialchars($_SESSION['csrf']) ?>"><input type="hidden"
                  name="action" value="update"><input type="hidden" name="id" value="<?= $p['id'] ?>">
                <div class="tabs-nav"><button type="button" class="tab-btn active"
                    onclick="switchTab(<?= $p['id'] ?>, 'basic')">Info</button><button type="button" class="tab-btn"
                    onclick="switchTab(<?= $p['id'] ?>, 'story')">Story Builder</button><button type="button"
                    class="tab-btn" onclick="switchTab(<?= $p['id'] ?>, 'media')">Visuals & Gallery</button></div>

                <!-- Tab 1 -->
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
                    <div class="form-group full"><label>Tools (comma-separated)</label><input name="meta_tool"
                        value="<?= htmlspecialchars($meta['tool'] ?? '') ?>" placeholder="e.g. Python, OpenCV, Blender"></div>
                    <div class="form-group full"><label>Client</label><input name="meta_client"
                        value="<?= htmlspecialchars($meta['client'] ?? '') ?>"></div>
                    <div class="form-group full"><label>Tags</label><input name="tags"
                        value="<?= htmlspecialchars($p['tags']) ?>"></div>
                    <div class="form-group full"><label class="checkbox-label"><input type="checkbox" name="featured"
                          value="1" <?= $p['featured'] ? 'checked' : '' ?>> Featured</label></div>
                  </div>
                </div>

                <!-- Tab 2 -->
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
                    <button type="button" class="add-block-btn" onclick="addBlock(<?= $p['id'] ?>, 'video')">Video</button>
                  </div>
                </div>

                <!-- Tab 3 (Gallery Added Here) -->
                <div class="tab-pane" data-tab="media-<?= $p['id'] ?>">
                  <div class="form-group"><label>Cover URL (for project card)</label><input name="image_url"
                      value="<?= htmlspecialchars($p['image_url']) ?>"><input type="file" name="cover" accept="image/*"
                      style="margin-top:5px;"></div>

                  <div class="visual-controls">
                    <div class="visual-col">
                      <div class="range-header"><span>Cover Scale</span><span class="range-val"
                          id="cs-<?= $p['id'] ?>"><?= $cScale ?>x</span></div><input type="range" name="visual_cover_scale"
                        min="1.0" max="3.0" step="0.1" value="<?= $cScale ?>"
                        oninput="document.getElementById('cs-<?= $p['id'] ?>').innerText=this.value+'x'">
                    </div>
                    <div class="visual-col">
                      <div class="range-header"><span>Cover Focus Y</span><span class="range-val"
                          id="cp-<?= $p['id'] ?>"><?= $cPosY ?>%</span></div><input type="range" name="visual_cover_pos_y"
                        min="0" max="100" step="5" value="<?= $cPosY ?>"
                        oninput="document.getElementById('cp-<?= $p['id'] ?>').innerText=this.value+'%'">
                    </div>
                  </div>

                  <div class="divider"><span>Hero Visuals</span></div>
                  <div class="form-group"><label>Hero Image/Video URL (leave empty to use Cover URL)</label><input name="meta_hero_media"
                      value="<?= htmlspecialchars($meta['hero_media'] ?? '') ?>" placeholder="/uploads/hero.jpg or .mp4"></div>
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

                  <div class="divider"><span>Links</span></div>
                  <div class="form-group"><textarea name="meta_links_json" rows="2"
                      class="code-font"><?= htmlspecialchars($linksJson) ?></textarea></div>

                  <!-- 【新增】Gallery Visual Builder -->
                  <div class="divider"><span>Gallery Images</span></div>
                  <div class="gallery-list" id="gallery-list-<?= $p['id'] ?>"></div>
                  <input type="hidden" name="gallery_json_str" id="gallery-input-<?= $p['id'] ?>"
                    value="<?= htmlspecialchars($galleryJson) ?>">
                  <div class="add-block-bar">
                    <button type="button" class="add-block-btn" onclick="addGalleryItem(<?= $p['id'] ?>)">+ Add
                      Image</button>
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
    const projectGalleries = {}; // New store for galleries

    function toggleEdit(id) {
      const card = document.getElementById('project-' + id);
      card.classList.toggle('collapsed');
      if (!card.classList.contains('collapsed')) {
        // Load Blocks
        if (!projectBlocks[id]) {
          const raw = document.getElementById('blocks-input-' + id).value;
          try { projectBlocks[id] = raw ? JSON.parse(raw) : []; } catch (e) { projectBlocks[id] = []; }
          renderBlocks(id);
        }
        // Load Gallery
        if (!projectGalleries[id]) {
          const rawG = document.getElementById('gallery-input-' + id).value;
          try {
            let g = rawG ? JSON.parse(rawG) : [];
            // Normalize string array to object array
            projectGalleries[id] = g.map(x => typeof x === 'string' ? { src: x, caption: '' } : x);
          } catch (e) { projectGalleries[id] = []; }
          renderGallery(id);
        }
      }
    }

    function switchTab(id, tabName) { const card = document.getElementById('project-' + id); card.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); card.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active')); event.target.classList.add('active'); card.querySelector(`[data-tab="${tabName}-${id}"]`).classList.add('active'); }

    // --- BLOCK LOGIC ---
    function addBlock(id, type) {
      const newBlock = { type: type, id: Date.now() };
      if (type === 'text') { newBlock.label = ''; newBlock.sections = [{ subtitle: '', content: '' }]; }
      if (type === 'image') { newBlock.src = ''; newBlock.caption = ''; newBlock.width = '100'; newBlock.layout = 'center'; }
      if (type === 'video') { newBlock.src = ''; newBlock.caption = ''; newBlock.width = '100'; newBlock.layout = 'center'; newBlock.autoplay = false; }
      projectBlocks[id].push(newBlock);
      renderBlocks(id);
    }
    function addSection(pid, blockIdx) { projectBlocks[pid][blockIdx].sections.push({ subtitle: '', content: '' }); syncJson(pid); renderBlocks(pid); }
    function removeSection(pid, blockIdx, secIdx) { if (projectBlocks[pid][blockIdx].sections.length <= 1) { alert("Keep at least one section"); return; } projectBlocks[pid][blockIdx].sections.splice(secIdx, 1); syncJson(pid); renderBlocks(pid); }
    function removeBlock(pid, idx) { if (!confirm('Remove block?')) return; projectBlocks[pid].splice(idx, 1); renderBlocks(pid); }
    function updateBlockData(pid, idx, field, value) { if (projectBlocks[pid][idx]) { projectBlocks[pid][idx][field] = value; syncJson(pid); } }
    function updateSectionData(pid, blockIdx, secIdx, field, value) { if (projectBlocks[pid][blockIdx] && projectBlocks[pid][blockIdx].sections[secIdx]) { projectBlocks[pid][blockIdx].sections[secIdx][field] = value; syncJson(pid); } }
    function syncJson(pid) { document.getElementById('blocks-input-' + pid).value = JSON.stringify(projectBlocks[pid]); }

    // --- GALLERY LOGIC ---
    function addGalleryItem(id) {
      projectGalleries[id].push({ src: '', caption: '' });
      renderGallery(id);
    }
    function removeGalleryItem(pid, idx) {
      if (!confirm('Remove image?')) return;
      projectGalleries[pid].splice(idx, 1);
      renderGallery(pid);
    }
    function updateGalleryData(pid, idx, field, value) {
      projectGalleries[pid][idx][field] = value;
      syncGalleryJson(pid);
    }
    function syncGalleryJson(pid) {
      document.getElementById('gallery-input-' + pid).value = JSON.stringify(projectGalleries[pid]);
    }
    function renderGallery(id) {
      const container = document.getElementById('gallery-list-' + id);
      container.innerHTML = '';
      projectGalleries[id].forEach((item, index) => {
        const el = document.createElement('div');
        el.className = 'gallery-item';
        const imgSrc = escapeHtml(item.src);

        el.innerHTML = `
            <button type="button" class="del-gal-btn" onclick="removeGalleryItem(${id}, ${index})">×</button>
            <img src="${imgSrc}" class="gallery-thumb" onerror="this.style.background='#eee'">
            <input class="gallery-input" placeholder="Image URL" value="${imgSrc}" 
                   onchange="updateGalleryData(${id}, ${index}, 'src', this.value)"
                   oninput="this.previousElementSibling.src = this.value">
            <input class="gallery-input" placeholder="Caption" value="${escapeHtml(item.caption || '')}" 
                   onchange="updateGalleryData(${id}, ${index}, 'caption', this.value)">
        `;
        container.appendChild(el);
      });
      syncGalleryJson(id);
      new Sortable(container, {
        animation: 150, onEnd: function (evt) {
          const item = projectGalleries[id].splice(evt.oldIndex, 1)[0];
          projectGalleries[id].splice(evt.newIndex, 0, item);
          syncGalleryJson(id);
        }
      });
    }

    function renderBlocks(id) {
      const container = document.getElementById('blocks-container-' + id);
      container.innerHTML = '';
      projectBlocks[id].forEach((block, index) => {
        const el = document.createElement('div');
        el.className = 'content-block-item';
        let html = `<div class="block-header"><div><span class="block-handle">☰</span> <span class="block-type">${block.type}</span></div><button type="button" class="delete-btn" onclick="removeBlock(${id}, ${index})">×</button></div>`;

        if (block.type === 'text') {
          html += `<div class="form-group"><input placeholder="Main Title" value="${escapeHtml(block.label || '')}" onchange="updateBlockData(${id}, ${index}, 'label', this.value)" style="font-weight:bold;"></div>`;
          html += `<div class="sub-sections-container">`;
          const sections = block.sections || [{ subtitle: '', content: '' }];
          sections.forEach((sec, sIdx) => {
            html += `<div class="sub-section-item"><div class="sub-section-header"><button type="button" class="delete-section-btn" onclick="removeSection(${id}, ${index}, ${sIdx})">×</button></div><div class="form-group"><input placeholder="Subtitle" value="${escapeHtml(sec.subtitle || '')}" onchange="updateSectionData(${id}, ${index}, ${sIdx}, 'subtitle', this.value)" style="font-size:0.9rem; color:#555;"></div><div class="form-group"><textarea class="mde-${id}-${index}-${sIdx}">${escapeHtml(sec.content || '')}</textarea></div></div>`;
          });
          html += `</div><button type="button" class="add-section-btn" onclick="addSection(${id}, ${index})">+ Add Paragraph</button>`;
        } else if (block.type === 'image' || block.type === 'video') {
          const w = block.width || 100;
          const src = escapeHtml(block.src || '');
          const layout = block.layout || 'center';
          const justifyClass = layout === 'left' ? 'mode-left' : '';
          const isVideo = block.type === 'video';

          const previewHtml = isVideo
            ? (src ? `<video src="${src}" class="block-img-preview" controls style="width:${w}%; max-height:200px;"></video>` : '')
            : `<div class="preview-container ${justifyClass}"><img src="${src}" class="block-img-preview" alt="Preview" style="width:${w}%"></div>`;

          html += `
                <div class="form-group"><input placeholder="${isVideo ? 'Video URL' : 'Image URL'}" value="${src}" onchange="updateBlockData(${id}, ${index}, 'src', this.value)"></div>
                ${previewHtml}
                <div class="form-group"><input placeholder="Caption" value="${escapeHtml(block.caption || '')}" onchange="updateBlockData(${id}, ${index}, 'caption', this.value)"></div>
                <div class="visual-controls">
                    <div class="visual-col"><div class="range-header"><span>Width</span><span class="range-val">${w}%</span></div><input type="range" min="20" max="100" step="5" value="${w}" oninput="this.parentElement.querySelector('.range-val').innerText=this.value+'%'; updateBlockData(${id}, ${index}, 'width', this.value);"></div>
                    <div class="visual-col"><label style="font-size:0.7rem;color:#888;">Align</label><select onchange="updateBlockData(${id}, ${index}, 'layout', this.value);" style="width:100%"><option value="center" ${layout == 'center' ? 'selected' : ''}>Center</option><option value="left" ${layout == 'left' ? 'selected' : ''}>Left</option></select></div>
                    ${isVideo ? `<div class="visual-col" style="display:flex; align-items:center;"><label class="toggle-label"><input type="checkbox" ${block.autoplay ? 'checked' : ''} onchange="updateBlockData(${id}, ${index}, 'autoplay', this.checked)"> Autoplay</label></div>` : ''}
                </div>
            `;
        }
        el.innerHTML = html;
        container.appendChild(el);
        // Init MDE (omitted for brevity, same as before)
        if (block.type === 'text') {
          const sections = block.sections || [{}];
          sections.forEach((_, sIdx) => {
            const ta = el.querySelector(`textarea.mde-${id}-${index}-${sIdx}`);
            if (ta) new EasyMDE({ element: ta, status: false, spellChecker: false, minHeight: "100px", toolbar: ["bold", "italic", "unordered-list", "link", "preview"], forceSync: true }).codemirror.on("change", (cm) => updateSectionData(id, index, sIdx, 'content', cm.getValue()));
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
      syncGalleryJson(id);
      document.querySelector(`#project-${id} form`).submit();
    }

    function escapeHtml(text) { if (!text) return ''; return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"); }
  </script>
</body>

</html>