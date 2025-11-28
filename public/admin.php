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
      // include 'tool' and 'month' so meta_tool and meta_month from the form are saved into meta_json
      foreach (['subtitle', 'role', 'duration', 'team', 'client', 'hero_media', 'tool', 'month'] as $k) {
        if (!empty($_POST["meta_{$k}"]))
          $meta[$k] = trim($_POST["meta_{$k}"]);
      }
      if (isset($_POST["visual_hero_height"]))
        $meta['hero_height'] = $_POST["visual_hero_height"];
      if (isset($_POST["visual_hero_scale"]))
        $meta['hero_scale'] = $_POST["visual_hero_scale"];
      if (isset($_POST["visual_hero_pos_y"]))
        $meta['hero_pos_y'] = $_POST["visual_hero_pos_y"];
      if (isset($_POST["visual_hero_pos_x"]))
        $meta['hero_pos_x'] = $_POST["visual_hero_pos_x"];
      if (isset($_POST["visual_hero_style"]))
        $meta['hero_style'] = $_POST["visual_hero_style"];
      if (isset($_POST["visual_cover_scale"]))
        $meta['cover_scale'] = $_POST["visual_cover_scale"];
      if (isset($_POST["visual_cover_pos_y"]))
        $meta['cover_pos_y'] = $_POST["visual_cover_pos_y"];
      if (!empty($_POST['meta_links_json']))
        $meta['links'] = json_decode($_POST['meta_links_json'], true);

      // Custom Hero Fields (动态字段)
      if (!empty($_POST['hero_fields_json'])) {
        $heroFields = json_decode($_POST['hero_fields_json'], true);
        if (is_array($heroFields)) {
          $meta['hero_fields'] = $heroFields;
        }
      }

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
  <link href="https://unpkg.com/cropperjs@1.5.13/dist/cropper.min.css" rel="stylesheet">
  <script src="https://unpkg.com/cropperjs@1.5.13/dist/cropper.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>

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
          $heroFields = $meta['hero_fields'] ?? [];
          $heroFieldsJson = htmlspecialchars(json_encode($heroFields), ENT_QUOTES, 'UTF-8');
          $hHeight = $meta['hero_height'] ?? 85;
          $hScale = $meta['hero_scale'] ?? 1.0;
          $hPosY = $meta['hero_pos_y'] ?? 50;
          $hPosX = $meta['hero_pos_x'] ?? 50;
          $hStyle = $meta['hero_style'] ?? 'creative';
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
                    <div class="form-group"><label>Month</label><input name="meta_month" type="text"
                        value="<?= htmlspecialchars($meta['month'] ?? '') ?>" placeholder="e.g. Jan, 01, Spring">
                    </div>
                    <div class="form-group"><label>Role</label><input name="meta_role"
                        value="<?= htmlspecialchars($meta['role'] ?? '') ?>"></div>
                    <div class="form-group full"><label>Tools (comma-separated)</label><input name="meta_tool"
                        value="<?= htmlspecialchars($meta['tool'] ?? '') ?>" placeholder="e.g. Python, OpenCV, Blender">
                    </div>
                    <div class="form-group full"><label>Client</label><input name="meta_client"
                        value="<?= htmlspecialchars($meta['client'] ?? '') ?>"></div>
                    <div class="form-group full"><label>Tags</label><input name="tags"
                        value="<?= htmlspecialchars($p['tags']) ?>"></div>
                    <div class="form-group full"><label class="checkbox-label"><input type="checkbox" name="featured"
                          value="1" <?= $p['featured'] ? 'checked' : '' ?>> Featured</label></div>
                  </div>

                  <div class="divider"><span>Custom Hero Fields</span></div>
                  <div class="hero-fields-container" id="hero-fields-container-<?= $p['id'] ?>"></div>
                  <input type="hidden" name="hero_fields_json" id="hero-fields-input-<?= $p['id'] ?>"
                    value="<?= $heroFieldsJson ?>">
                  <div class="add-block-bar">
                    <button type="button" class="add-block-btn" onclick="addHeroField(<?= $p['id'] ?>)">+ Add Hero Field</button>
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
                    <button type="button" class="add-block-btn" onclick="addBlock(<?= $p['id'] ?>, 'image_grid')" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">📸 Image Grid</button>
                    <button type="button" class="add-block-btn" onclick="addBlock(<?= $p['id'] ?>, 'gallery')" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;">🎞️ Gallery</button>
                    <button type="button" class="add-block-btn" onclick="addBlock(<?= $p['id'] ?>, 'two_column')" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white;">📱 Two Column</button>
                  </div>
                  <div class="help-text" style="margin-top: 15px; padding: 12px; background: #f8f9fa; border-left: 3px solid #667eea; border-radius: 4px; font-size: 0.85rem;">
                    <strong>🆕 Image Grid:</strong> Create flexible photo layouts. Use <code>grid_layout</code>: "2x2", "3x1", "custom". For custom grids, set <code>width</code> and <code>height</code> in each image object.
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
                  </div>

                  <div class="divider"><span>Hero Visuals</span></div>
                  <div class="form-group"><label>Hero Image/Video URL (leave empty to use Cover URL)</label><input
                      name="meta_hero_media" value="<?= htmlspecialchars($meta['hero_media'] ?? '') ?>"
                      class="hero-url-input" data-project="<?= $p['id'] ?>" placeholder="/uploads/hero.jpg or .mp4"></div>

                  <!-- Visual Focus Picker for Hero -->
                  <div class="focus-picker-container">
                    <label>Adjust Hero Focus & Scale (drag the crosshair)</label>
                    <div class="focus-picker hero-picker" id="hero-picker-<?= $p['id'] ?>" data-type="hero"
                      data-project="<?= $p['id'] ?>">
                      <?php $heroPreviewSrc = ($meta['hero_media'] ?? '') ?: $p['image_url'] ?: '/uploads/placeholder.jpg'; ?>
                      <img src="<?= htmlspecialchars($heroPreviewSrc) ?>" class="focus-preview-img" alt="Hero preview">
                      <div class="focus-crosshair" style="left: <?= $hPosX ?>%; top: <?= $hPosY ?>%;">
                        <div class="crosshair-h"></div>
                        <div class="crosshair-v"></div>
                      </div>
                    </div>
                  </div>

                  <div class="visual-controls">
                    <div class="visual-col">
                      <div class="range-header"><span>Style</span></div>
                      <select name="visual_hero_style" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ddd;">
                        <option value="creative" <?= $hStyle === 'creative' ? 'selected' : '' ?>>Creative (Full-width, Artistic)</option>
                        <option value="professional" <?= $hStyle === 'professional' ? 'selected' : '' ?>>Professional (Centered, Tech)</option>
                      </select>
                    </div>
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
                        min="0" max="100" step="1" value="<?= $hPosY ?>" data-project="<?= $p['id'] ?>"
                        oninput="updateHeroFocusY(<?= $p['id'] ?>, this.value)">
                    </div>
                    <div class="visual-col">
                      <div class="range-header"><span>Focus X</span><span class="range-val"
                          id="px-<?= $p['id'] ?>"><?= $hPosX ?>%</span></div><input type="range" name="visual_hero_pos_x"
                        min="0" max="100" step="1" value="<?= $hPosX ?>" data-project="<?= $p['id'] ?>"
                        oninput="updateHeroFocusX(<?= $p['id'] ?>, this.value)">
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

  <div id="crop-modal" class="crop-modal hidden">
    <div class="crop-modal-backdrop"></div>
    <div class="crop-modal-dialog">
      <div class="crop-modal-header">
        <h3>Crop Image</h3>
        <button type="button" id="crop-close">×</button>
      </div>
      <div class="crop-modal-body">
        <img id="crop-image" src="" alt="Crop target">
      </div>
      <div class="crop-modal-footer">
        <div class="crop-aspect-toolbar">
          <button type="button" class="aspect-btn is-active" data-ratio="free">Free</button>
          <button type="button" class="aspect-btn" data-ratio="1">1 : 1</button>
          <button type="button" class="aspect-btn" data-ratio="1.7777778">16 : 9</button>
          <button type="button" class="aspect-btn" data-ratio="1.3333333">4 : 3</button>
          <button type="button" class="aspect-btn" data-ratio="1.5">3 : 2</button>
          <button type="button" class="aspect-btn" data-ratio="0.5625">9 : 16</button>
          <button type="button" class="aspect-btn" data-ratio="2.4">2.4 : 1</button>
        </div>

        <button type="button" id="crop-save" class="btn-primary">Save Crop</button>
      </div>


    </div>
  </div>

  <script src="https://unpkg.com/easymde/dist/easymde.min.js"></script>
  <script src="https://unpkg.com/cropperjs@1.5.13/dist/cropper.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
  <script src="script/admin.js?v=<?= time() ?>"></script>
</body>

</html>