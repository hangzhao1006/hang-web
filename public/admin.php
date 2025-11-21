<?php
session_start();
require __DIR__ . '/../src/functions.php';
$config = require __DIR__ . '/../src/config.php';
ensure_schema();

// 生成 CSRF（如果还没有）
if (empty($_SESSION['csrf'])) {
  $_SESSION['csrf'] = bin2hex(random_bytes(16));
}

// 简单校验函数
function require_csrf()
{
  if (!hash_equals($_SESSION['csrf'] ?? '', $_POST['csrf'] ?? '')) {
    http_response_code(400);
    exit('Bad CSRF token');
  }
}

function optional_cover_upload_set_url(int $projectId): void
{
  if (!isset($_FILES['cover']) || $_FILES['cover']['error'] !== UPLOAD_ERR_OK)
    return;

  // 1) 基础校验
  $tmp = $_FILES['cover']['tmp_name'];
  $orig = $_FILES['cover']['name'];
  $size = $_FILES['cover']['size'] ?? 0;

  if ($size > 6 * 1024 * 1024)
    return; // 6MB 限制，按需调

  // 检测 MIME，保证是图片
  $finfo = finfo_open(FILEINFO_MIME_TYPE);
  $mime = finfo_file($finfo, $tmp);
  finfo_close($finfo);
  $ok = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
  if (!isset($ok[$mime]))
    return;

  $ext = $ok[$mime];

  // 2) 目标路径
  $dirFs = __DIR__ . '/uploads/projects';
  if (!is_dir($dirFs))
    mkdir($dirFs, 0775, true);
  $destFs = $dirFs . "/{$projectId}.{$ext}";
  $destWeb = "/uploads/projects/{$projectId}.{$ext}";

  // 3) 保存并更新数据库的 image_url
  if (move_uploaded_file($tmp, $destFs)) {
    $p = find_project_by_id_or_slug($projectId);
    if ($p) {
      $p['image_url'] = $destWeb;       // 用新文件覆盖 URL
      update_project($projectId, $p);
    }
  }
}


$is_logged_in = !empty($_SESSION['admin_ok']);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $act = $_POST['action'] ?? '';
  if (in_array($act, ['login', 'create', 'update', 'delete'], true)) {
    require_csrf();
  }
}

if (isset($_POST['action']) && $_POST['action'] === 'login') {
  if (hash_equals($config['admin_password'], $_POST['password'] ?? '')) {
    $_SESSION['admin_ok'] = true;
    header('Location: /admin.php');
    exit;
  } else {
    $error = 'Wrong password.';
  }
}



if ($is_logged_in) {
  // 处理增删改

  // 从 POST 中组装 meta 字段（subtitle, role, duration, team, client, overview, links）
  function assemble_meta_from_post(): array {
    $m = [];
    $keys = ['subtitle','role','duration','team','client','overview','tools_tech'];
    foreach ($keys as $k) {
      if (!empty($_POST["meta_{$k}"])) $m[$k] = trim($_POST["meta_{$k}"]);
    }
    // links: accept either JSON in meta_links or separate link_* inputs
    if (!empty($_POST['meta_links'])) {
      $decoded = json_decode($_POST['meta_links'], true);
      if (is_array($decoded)) $m['links'] = $decoded;
    } else {
      $linkKeys = ['demo','video','github','behance','paper','press'];
      foreach ($linkKeys as $lk) {
        if (!empty($_POST["link_{$lk}"])) {
          $m['links'][$lk] = trim($_POST["link_{$lk}"]);
        }
      }
    }
    return $m;
  }

  if (($_POST['action'] ?? '') === 'create') {
    // assemble meta
    $_POST['meta'] = assemble_meta_from_post();
    $id = create_project($_POST);             // 仍以表单里的 image_url 为主
    optional_cover_upload_set_url($id);
    upsert_tags_for_project($id, $_POST['tags'] ?? '');

    header('Location: /admin.php');
    exit;
  }
  if (($_POST['action'] ?? '') === 'update' && !empty($_POST['id'])) {
    $id = (int) $_POST['id'];
    $_POST['meta'] = assemble_meta_from_post();
    update_project($id, $_POST);      
    upsert_tags_for_project($id, $_POST['tags'] ?? '');        // 仍然先用 URL 值
    optional_cover_upload_set_url($id);       // 若上传文件，则替换为本地文件
    header('Location: /admin.php');
    exit;
  }
  if (($_POST['action'] ?? '') === 'delete' && !empty($_POST['id'])) {
    delete_project((int) $_POST['id']);
    header('Location: /admin.php');
    exit;
  }
  if (($_GET['action'] ?? '') === 'logout') {
    session_destroy();
    header('Location:/admin.php');
    exit;
  }
  $projects = get_projects(false);
}
?>
<!doctype html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <title>Admin — <?= htmlspecialchars($config['site_name']) ?></title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/css/style.css">
  <link rel="stylesheet" href="/css/admin.css">
</head>
<body>
  <header>
    <h1>Admin — <?= htmlspecialchars($config['site_name']) ?></h1>
    <?php if ($is_logged_in): ?>
      <p><a class="btn" href="/admin.php?action=logout">Logout</a> <a class="btn" href="/">View Site</a></p>
    <?php endif; ?>
  </header>

  <div class="container">
    <?php if (!$is_logged_in): ?>
      <?php if (!empty($error)): ?>
        <p style="color:#c00;"><?= htmlspecialchars($error) ?></p><?php endif; ?>
        <p><a class="btn" href="/">HOME</a></p>
      <form method="post">
        <input type="hidden" name="csrf" value="<?= htmlspecialchars($_SESSION['csrf']) ?>">

        <input type="hidden" name="action" value="login">
        <input type="password" name="password" placeholder="Admin Password" required>
        <button class="btn" type="submit">Login</button>
      </form>
    <?php else: ?>
      <h2>Create / Edit Project</h2>
      <form method="post" enctype="multipart/form-data">
        <input type="hidden" name="csrf" value="<?= htmlspecialchars($_SESSION['csrf']) ?>">

        <input type="hidden" name="action" value="create">
        <div class="row">
          <input name="title" placeholder="Title" required>
          <input name="slug" placeholder="Slug (optional, auto from title)">
        </div>
        <div class="row">
          <input name="year" type="number" placeholder="Year (e.g., 2025)">
          <input name="order_index" type="number" placeholder="Order (desc)">
        </div>
        <div class="row">
          <input name="tags" placeholder="Tags (comma-separated)">
          <input name="image_url" placeholder="Cover Image URL">
          <input type="file" name="cover" accept="image/*"> <!-- optional -->

        </div>
        <input name="url" placeholder="External URL (Behance/GitHub/Video)">
        <textarea name="description" rows="5" placeholder="Description"></textarea>

        <!-- 在 Create/Update 表单内相应位置，添加 Links 区块与 Gallery 区块 -->
        <section class="admin-panel">
          <!-- Meta / Links -->
          <div class="panel">
            <h3>Links（可重复）</h3>
            <div id="linksWrap" class="repeatable-wrap">
              <!-- existing links will be hydrated by JS -->
            </div>
            <div class="repeat-controls">
              <button type="button" id="addLinkBtn" class="btn">Add link</button>
            </div>
            <textarea id="meta_links" name="meta_links" class="hidden-field" aria-hidden="true"><?= htmlspecialchars($p['meta_json_links'] ?? '') ?></textarea>
          </div>

          <!-- Gallery -->
          <div class="panel">
            <h3>Gallery</h3>
            <div id="galleryWrap" class="repeatable-wrap"></div>
            <div class="repeat-controls">
              <button type="button" id="addGalleryBtn" class="btn">Add image</button>
            </div>
            <textarea id="gallery_json" name="gallery_json" class="hidden-field" aria-hidden="true"><?= htmlspecialchars($p['gallery_json'] ?? '') ?></textarea>
          </div>

          <!-- Tags (visual) -->
          <div class="panel">
            <h3>Tags</h3>
            <input id="tagsInput" type="text" name="tags" placeholder="Comma separated tags" value="<?= htmlspecialchars($p['tags'] ?? '') ?>">
            <div id="tagsChips" class="chips"></div>
          </div>
        </section>

        <div><button class="btn" type="submit">Create</button></div>
      </form>

      <h2 style="margin-top:24px;">Existing Projects</h2>
      <div class="grid">
        <?php foreach ($projects as $p): ?>
          <div class="card" style="padding:12px;">
            <div class="title"><?= htmlspecialchars($p['title']) ?></div>
            <div style="font-size:13px; opacity:.8;">#<?= (int) $p['id'] ?> · <?= (int) $p['year'] ?>
              <?= $p['featured'] ? '· Featured' : '' ?>
            </div>
            <form method="post" style="margin-top:8px;" enctype="multipart/form-data">
              <input type="hidden" name="csrf" value="<?= htmlspecialchars($_SESSION['csrf']) ?>">


              <input type="hidden" name="action" value="update">
              <input type="hidden" name="id" value="<?= (int) $p['id'] ?>">
                <?php $pmeta = !empty($p['meta_json']) ? json_decode($p['meta_json'], true) : []; ?>
                <div class="row">
                  <input name="title" value="<?= htmlspecialchars($p['title']) ?>">
                  <input name="slug" value="<?= htmlspecialchars($p['slug']) ?>">
                </div>
              <div class="row">
                <input name="year" type="number" value="<?= (int) $p['year'] ?>">
                <input name="order_index" type="number" value="<?= (int) $p['order_index'] ?>">
              </div>
              <div class="row">
                <input name="tags" value="<?= htmlspecialchars($p['tags']) ?>">
                <input name="image_url" value="<?= htmlspecialchars($p['image_url']) ?>">
              </div>
              <input name="url" value="<?= htmlspecialchars($p['url']) ?>">
              <textarea name="description" rows="3"><?= htmlspecialchars($p['description']) ?></textarea>

              <!-- 在 Create/Update 表单内相应位置，添加 Links 区块与 Gallery 区块 -->
              <section class="admin-panel">
                <!-- Meta / Links -->
                <div class="panel">
                  <h3>Links（可重复）</h3>
                  <div id="linksWrap" class="repeatable-wrap">
                    <!-- existing links will be hydrated by JS -->
                  </div>
                  <div class="repeat-controls">
                    <button type="button" id="addLinkBtn" class="btn">Add link</button>
                  </div>
                  <textarea id="meta_links" name="meta_links" class="hidden-field" aria-hidden="true"><?= htmlspecialchars($p['meta_json_links'] ?? '') ?></textarea>
                </div>

                <!-- Gallery -->
                <div class="panel">
                  <h3>Gallery</h3>
                  <div id="galleryWrap" class="repeatable-wrap"></div>
                  <div class="repeat-controls">
                    <button type="button" id="addGalleryBtn" class="btn">Add image</button>
                  </div>
                  <textarea id="gallery_json" name="gallery_json" class="hidden-field" aria-hidden="true"><?= htmlspecialchars($p['gallery_json'] ?? '') ?></textarea>
                </div>

                <!-- Tags (visual) -->
                <div class="panel">
                  <h3>Tags</h3>
                  <input id="tagsInput" type="text" name="tags" placeholder="Comma separated tags" value="<?= htmlspecialchars($p['tags'] ?? '') ?>">
                  <div id="tagsChips" class="chips"></div>
                </div>
              </section>

              <h4>Structured meta</h4>
              <input name="meta_subtitle" placeholder="Subtitle / TL;DR" value="<?= htmlspecialchars($pmeta['subtitle'] ?? '') ?>">
              <input name="meta_role" placeholder="Role" value="<?= htmlspecialchars($pmeta['role'] ?? '') ?>">
              <input name="meta_duration" placeholder="Duration" value="<?= htmlspecialchars($pmeta['duration'] ?? '') ?>">
              <input name="meta_team" placeholder="Team" value="<?= htmlspecialchars($pmeta['team'] ?? '') ?>">
              <input name="meta_client" placeholder="Client" value="<?= htmlspecialchars($pmeta['client'] ?? '') ?>">
              <textarea name="meta_overview" rows="3" placeholder="Overview"><?= htmlspecialchars($pmeta['overview'] ?? '') ?></textarea>
              <textarea name="meta_links" rows="3" placeholder='Links JSON'><?= htmlspecialchars(isset($pmeta['links']) ? json_encode($pmeta['links']) : '') ?></textarea>
              <label>
                <input type="checkbox" name="featured" value="1" <?= $p['featured'] ? 'checked' : '' ?>> Featured
              </label>
              <div style="margin-top:8px;">
                <button class="btn" type="submit">Save</button>
              </div>
            </form>
            <form method="post" onsubmit="return confirm('Delete this project?');" style="margin-top:8px;"
              enctype="multipart/form-data">
              <input type="hidden" name="csrf" value="<?= htmlspecialchars($_SESSION['csrf']) ?>">

              <input type="hidden" name="action" value="delete">
              <input type="hidden" name="id" value="<?= (int) $p['id'] ?>">
              <button class="btn" type="submit">Delete</button>
            </form>
          </div>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </div>

  <footer>
    <p>© <?= date('Y') ?> <?= htmlspecialchars($config['site_name']) ?></p>
  </footer>
  <script>
    // basic admin form helpers: validate meta_links is valid JSON before submit
    (function(){
      function safeParseJSON(s){ try { return JSON.parse(s); } catch(e){ return null; } }
      document.querySelectorAll('form').forEach(f => {
        f.addEventListener('submit', function(e){
          const el = f.querySelector('[name="meta_links"]');
          if (!el) return;
          const v = el.value.trim();
          if (!v) return; // empty is ok
          // if it looks like JSON (starts with { or [), try parse
          if (/^[\[{]/.test(v)) {
            const parsed = safeParseJSON(v);
            if (parsed === null) {
              e.preventDefault();
              alert('meta_links contains invalid JSON. Please fix or leave empty.');
              el.focus();
              return false;
            }
          }
          // otherwise allow (we accept key:value pairs entered manually)
        });
      });
    })();
  </script>
  <script src="/script/admin.js" defer></script>
</body>

</html>