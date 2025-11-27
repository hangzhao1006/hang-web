// ====== Global stores for blocks & galleries ======
const projectBlocks = {};
const projectGalleries = {};

// ====== Project card expand / collapse ======
function toggleEdit(id) {
  const card = document.getElementById('project-' + id);
  if (!card) return;

  card.classList.toggle('collapsed');

  // 展开的时候再初始化
  if (!card.classList.contains('collapsed')) {
    // Blocks
    if (!projectBlocks[id]) {
      const raw = document.getElementById('blocks-input-' + id)?.value || '[]';
      try {
        projectBlocks[id] = raw ? JSON.parse(raw) : [];
      } catch (e) {
        projectBlocks[id] = [];
      }
      renderBlocks(id);
    }

    // Gallery
    if (!projectGalleries[id]) {
      const rawG = document.getElementById('gallery-input-' + id)?.value || '[]';
      try {
        let g = rawG ? JSON.parse(rawG) : [];
        // projectGalleries[id] = g.map(x =>
        //   typeof x === 'string'
        //     ? { src: x, caption: '', cropX: 50, cropY: 50, scale: 1.0 }
        //     : {
        //       src: x.src || '',
        //       caption: x.caption || '',
        //       cropX: x.cropX ?? 50,
        //       cropY: x.cropY ?? 50,
        //       scale: x.scale ?? 1.0
        //     }
        // );
        projectGalleries[id] = g.map(x =>
          typeof x === 'string'
            ? { src: x, caption: '', originalSrc: x }
            : {
              src: x.src || '',
              caption: x.caption || '',
              originalSrc: x.originalSrc || x.src || ''
            }
        );
      } catch (e) {
        projectGalleries[id] = [];
      }
      renderGallery(id);
    }
  }
}

function switchTab(id, tabName) {
  const card = document.getElementById('project-' + id);
  if (!card) return;

  const btns = card.querySelectorAll('.tab-btn');
  const panes = card.querySelectorAll('.tab-pane');

  btns.forEach(b => b.classList.remove('active'));
  panes.forEach(p => p.classList.remove('active'));

  // 使用当前点击的按钮
  if (window.event && window.event.target) {
    window.event.target.classList.add('active');
  }

  const pane = card.querySelector(`[data-tab="${tabName}-${id}"]`);
  if (pane) pane.classList.add('active');
}

// ====== BLOCK LOGIC ======
function addBlock(id, type, insertAtIndex = null) {
  if (!projectBlocks[id]) projectBlocks[id] = [];
  const newBlock = { type, id: Date.now() };

  if (type === 'text') {
    newBlock.label = '';
    newBlock.sections = [{ subtitle: '', content: '' }];
  } else if (type === 'image') {
    newBlock.src = '';
    newBlock.caption = '';
    newBlock.width = '100';
    newBlock.layout = 'center';
  } else if (type === 'video') {
    newBlock.src = '';
    newBlock.caption = '';
    newBlock.width = '100';
    newBlock.layout = 'center';
    newBlock.autoplay = false;
    newBlock.radius = 8; // 默认8px圆角
  } else if (type === 'image_grid') {
    newBlock.label = '';
    newBlock.layout = 'center';
    newBlock.rows = 2;
    newBlock.cols = 3;
    newBlock.cells = {};
  } else if (type === 'gallery') {
    newBlock.label = 'Gallery';
    newBlock.layout = 'center';
    newBlock.images = [
      { src: '', caption: '' },
      { src: '', caption: '' }
    ];
  } else if (type === 'two_column') {
    newBlock.label = '';
    newBlock.leftType = 'text'; // 'text' or 'image'
    newBlock.rightType = 'image'; // 'text' or 'image'
    newBlock.leftContent = '';
    newBlock.rightContent = '';
    newBlock.columnRatio = '50-50'; // '50-50', '40-60', '60-40', '30-70', '70-30'
  }

  // Insert at specific index or push to end
  if (insertAtIndex !== null && insertAtIndex >= 0) {
    projectBlocks[id].splice(insertAtIndex, 0, newBlock);
  } else {
    projectBlocks[id].push(newBlock);
  }

  renderBlocks(id);
}

// Show insert menu at specific position
function showInsertMenu(pid, insertIndex) {
  const menu = document.getElementById(`insert-menu-${pid}-${insertIndex}`);
  if (menu) {
    menu.classList.toggle('active');
  }
}

// Toggle block collapse state
function toggleBlockCollapse(pid, index, event) {
  // Don't collapse if clicking on input fields, buttons, or drag handle
  if (event.target.tagName === 'INPUT' ||
      event.target.tagName === 'TEXTAREA' ||
      event.target.tagName === 'BUTTON' ||
      event.target.tagName === 'SELECT' ||
      event.target.classList.contains('block-handle') ||
      event.target.classList.contains('delete-btn')) {
    return;
  }

  const blockEl = document.querySelector(`[data-block-id="${pid}-${index}"]`);
  if (blockEl) {
    blockEl.classList.toggle('collapsed');
  }
}

function addSection(pid, blockIdx) {
  projectBlocks[pid][blockIdx].sections.push({ subtitle: '', content: '' });
  syncBlocksJson(pid);
  renderBlocks(pid);
}

function removeSection(pid, blockIdx, secIdx) {
  const sections = projectBlocks[pid][blockIdx].sections;
  if (sections.length <= 1) {
    alert('Keep at least one paragraph');
    return;
  }
  sections.splice(secIdx, 1);
  syncBlocksJson(pid);
  renderBlocks(pid);
}

function removeBlock(pid, idx) {
  if (!confirm('Remove block?')) return;
  projectBlocks[pid].splice(idx, 1);
  syncBlocksJson(pid);
  renderBlocks(pid);
}

function updateBlockData(pid, idx, field, value) {
  if (!projectBlocks[pid][idx]) return;
  projectBlocks[pid][idx][field] = value;
  syncBlocksJson(pid);
}

function updateSectionData(pid, blockIdx, secIdx, field, value) {
  const block = projectBlocks[pid][blockIdx];
  if (!block || !block.sections || !block.sections[secIdx]) return;
  block.sections[secIdx][field] = value;
  syncBlocksJson(pid);
}

function syncBlocksJson(pid) {
  const input = document.getElementById('blocks-input-' + pid);
  if (!input) return;
  input.value = JSON.stringify(projectBlocks[pid] || []);
}

// ====== GALLERY LOGIC ======
function addGalleryItem(id) {
  if (!projectGalleries[id]) projectGalleries[id] = [];
  projectGalleries[id].push({
    src: '',
    caption: '',
    cropX: 50,
    cropY: 50,
    scale: 1.0
  });
  renderGallery(id);
}

function removeGalleryItem(pid, idx) {
  if (!confirm('Remove image?')) return;
  projectGalleries[pid].splice(idx, 1);
  renderGallery(pid);
}

function updateGalleryData(pid, idx, field, value) {
  if (!projectGalleries[pid][idx]) return;
  // 允许数字字段（将来扩展 cropX/Y/scale）
  projectGalleries[pid][idx][field] = Number.isNaN(+value) ? value : +value;
  syncGalleryJson(pid);
}

function syncGalleryJson(pid) {
  const input = document.getElementById('gallery-input-' + pid);
  if (!input) return;
  input.value = JSON.stringify(projectGalleries[pid] || []);
}

function renderGallery(id) {
  const container = document.getElementById('gallery-list-' + id);
  if (!container) return;

  container.innerHTML = '';

  (projectGalleries[id] || []).forEach((item, index) => {
    const el = document.createElement('div');
    el.className = 'gallery-item';

    const src = escapeHtml(item.src || '');
    const caption = escapeHtml(item.caption || '');

    el.innerHTML = `
      <button type="button" class="del-gal-btn"
              onclick="removeGalleryItem(${id}, ${index})">×</button>

      <img src="${src}" class="gallery-thumb"
           onerror="this.style.background='#eee'">

      <input class="gallery-input" placeholder="Image URL"
             value="${src}"
             onchange="updateGalleryData(${id}, ${index}, 'src', this.value)"
             oninput="this.previousElementSibling.src = this.value">

      <input class="gallery-input" placeholder="Caption"
             value="${caption}"
             onchange="updateGalleryData(${id}, ${index}, 'caption', this.value)">

      <div class="gallery-controls">
        <button type="button"
                onclick="startCropGallery(${id}, ${index})"
                style="font-size:0.75rem; padding:4px 8px;">
          Crop
        </button>
        <button type="button"
                onclick="resetGalleryToOriginal(${id}, ${index})"
                style="font-size:0.75rem; padding:4px 8px;">
          Reset
        </button>
      </div>
    `;

    container.appendChild(el);
  });

  syncGalleryJson(id);

  if (typeof Sortable !== 'undefined') {
    new Sortable(container, {
      animation: 150,
      onEnd: function (evt) {
        const item = projectGalleries[id].splice(evt.oldIndex, 1)[0];
        projectGalleries[id].splice(evt.newIndex, 0, item);
        syncGalleryJson(id);
      }
    });
  }
}


function resetGalleryToOriginal(pid, idx) {
  const item = projectGalleries[pid][idx];
  if (!item || !item.src) return;

  const orig = getOriginalPath(item.src); // /uploads/j1-crop.jpg -> /uploads/j1.jpg
  updateGalleryData(pid, idx, 'src', orig);
  renderGallery(pid);
}


// ====== BLOCKS RENDER ======
function renderBlocks(id) {
  const container = document.getElementById('blocks-container-' + id);
  if (!container) return;

  container.innerHTML = '';

  (projectBlocks[id] || []).forEach((block, index) => {
    // Add insert button before this block
    if (index === 0) {
      const insertBtn = document.createElement('div');
      insertBtn.className = 'insert-block-divider';
      insertBtn.innerHTML = `
        <div class="insert-trigger" onclick="showInsertMenu(${id}, ${index})">
          <span>+ Insert Block Here</span>
        </div>
        <div class="insert-menu" id="insert-menu-${id}-${index}">
          <button onclick="addBlock(${id}, 'text', ${index}); showInsertMenu(${id}, ${index});">Text Group</button>
          <button onclick="addBlock(${id}, 'image', ${index}); showInsertMenu(${id}, ${index});">Image</button>
          <button onclick="addBlock(${id}, 'video', ${index}); showInsertMenu(${id}, ${index});">Video</button>
          <button onclick="addBlock(${id}, 'image_grid', ${index}); showInsertMenu(${id}, ${index});">Image Grid</button>
          <button onclick="addBlock(${id}, 'gallery', ${index}); showInsertMenu(${id}, ${index});">Gallery</button>
          <button onclick="addBlock(${id}, 'two_column', ${index}); showInsertMenu(${id}, ${index});">Two Column</button>
        </div>
      `;
      container.appendChild(insertBtn);
    }

    const el = document.createElement('div');
    el.className = 'content-block-item collapsed'; // 默认折叠
    el.setAttribute('data-block-id', `${id}-${index}`);

    let html = `
      <div class="block-header" onclick="toggleBlockCollapse(${id}, ${index}, event)">
        <div>
          <span class="block-handle">☰</span>
          <span class="block-number">#${index + 1}</span>
          <span class="block-type">${block.type}</span>
          <span class="collapse-indicator">▼</span>
        </div>
        <button type="button" class="delete-btn" onclick="event.stopPropagation(); removeBlock(${id}, ${index})">×</button>
      </div>
      <div class="block-content">
    `;

    if (block.type === 'text') {
      html += `
        <div class="form-group">
          <input placeholder="Main Title"
                 value="${escapeHtml(block.label || '')}"
                 onchange="updateBlockData(${id}, ${index}, 'label', this.value)"
                 style="font-weight:bold;">
        </div>
        <div class="sub-sections-container">
      `;

      const sections = block.sections || [{ subtitle: '', content: '' }];
      sections.forEach((sec, sIdx) => {
        html += `
          <div class="sub-section-item">
            <div class="sub-section-header">
              <button type="button" class="delete-section-btn"
                      onclick="removeSection(${id}, ${index}, ${sIdx})">×</button>
            </div>
            <div class="form-group">
              <input placeholder="Subtitle"
                     value="${escapeHtml(sec.subtitle || '')}"
                     onchange="updateSectionData(${id}, ${index}, ${sIdx}, 'subtitle', this.value)"
                     style="font-size:0.9rem; color:#555;">
            </div>
            <div class="form-group">
              <textarea class="mde-${id}-${index}-${sIdx}">${escapeHtml(sec.content || '')}</textarea>
            </div>
          </div>
        `;
      });

      html += `
        </div>
        <button type="button" class="add-section-btn"
                onclick="addSection(${id}, ${index})">+ Add Paragraph</button>
      `;
    } else if (block.type === 'image' || block.type === 'video') {
      const w = block.width || 100;
      const src = escapeHtml(block.src || '');
      const layout = block.layout || 'center';
      const isVideo = block.type === 'video';
      const justifyClass = layout === 'left' ? 'mode-left' : '';

      const previewHtml = isVideo
        ? (src ? `<video src="${src}" class="block-img-preview"
                         controls style="width:${w}%; max-height:200px;"></video>` : '')
        : `<div class="preview-container ${justifyClass}">
             <img src="${src}" class="block-img-preview" alt="Preview" style="width:${w}%">
           </div>`;

      html += `
        <div class="form-group">
          <input placeholder="${isVideo ? 'Video URL' : 'Image URL'}"
                 value="${src}"
                 onchange="updateBlockData(${id}, ${index}, 'src', this.value)">
        </div>
        ${previewHtml}
        <div class="form-group">
          <input placeholder="Caption"
                 value="${escapeHtml(block.caption || '')}"
                 onchange="updateBlockData(${id}, ${index}, 'caption', this.value)">
        </div>
        <div class="visual-controls">
          <div class="visual-col">
            <div class="range-header">
              <span>Width</span>
              <span class="range-val">${w}%</span>
            </div>
            <input type="range" min="20" max="100" step="5" value="${w}"
                   oninput="this.parentElement.querySelector('.range-val').innerText=this.value+'%';
                            updateBlockData(${id}, ${index}, 'width', this.value);">
          </div>
          <div class="visual-col">
            <label style="font-size:0.7rem;color:#888;">Align</label>
            <select onchange="updateBlockData(${id}, ${index}, 'layout', this.value);" style="width:100%">
              <option value="center" ${layout === 'center' ? 'selected' : ''}>Center</option>
              <option value="left"   ${layout === 'left' ? 'selected' : ''}>Left</option>
            </select>
          </div>
          ${isVideo ? `
            <div class="visual-col" style="display:flex; align-items:center;">
              <label class="toggle-label">
                <input type="checkbox" ${block.autoplay ? 'checked' : ''}
                       onchange="updateBlockData(${id}, ${index}, 'autoplay', this.checked)">
                Autoplay
              </label>
            </div>
            <div class="visual-col">
              <div class="range-header">
                <span>Radius</span>
                <span class="range-val">${block.radius || 8}px</span>
              </div>
              <input type="range" min="0" max="50" step="1" value="${block.radius || 8}"
                     oninput="this.parentElement.querySelector('.range-val').innerText=this.value+'px';
                              updateBlockData(${id}, ${index}, 'radius', this.value);">
            </div>
          ` : ''}
        </div>
      `;

      if (!isVideo) {
        html += `
          <div style="margin-top:8px;">
            <button type="button"
                    onclick="startCropBlock(${id}, ${index})"
                    style="font-size:0.75rem; padding:4px 8px;">
              Crop Image
            </button>
          </div>
        `;
      }
    } else if (block.type === 'image_grid') {
      const rows = block.rows || 2;
      const cols = block.cols || 2;
      const cells = block.cells || {};

      html += `
        <div class="form-group">
          <label>Label</label>
          <input placeholder="Section label" value="${escapeHtml(block.label || '')}"
                 onchange="updateBlockData(${id}, ${index}, 'label', this.value)">
        </div>

        <div class="grid-table-editor">
          <div class="grid-controls">
            <div class="grid-size-controls">
              <label>Rows:
                <input type="number" min="1" max="8" value="${rows}"
                       onchange="updateGridSize(${id}, ${index}, 'rows', this.value)"
                       style="width: 60px;">
              </label>
              <label style="margin-left: 15px;">Cols:
                <input type="number" min="1" max="6" value="${cols}"
                       onchange="updateGridSize(${id}, ${index}, 'cols', this.value)"
                       style="width: 60px;">
              </label>
            </div>
            <button type="button" class="grid-btn" onclick="clearAllCells(${id}, ${index})">
              🗑️ Clear All
            </button>
          </div>

          <div class="grid-table" data-project="${id}" data-block="${index}">
            ${generateGridTable(id, index, rows, cols, cells)}
          </div>

          <div class="grid-help">
            💡 Click a cell to add/edit image. Click and drag across cells to merge them.
          </div>
        </div>
      `;
    } else if (block.type === 'gallery') {
      const images = block.images || [];
      const label = block.label || 'Gallery';
      const validImages = images.filter(img => {
        const src = typeof img === 'string' ? img : (img.src || '');
        return src.trim() !== '';
      });

      html += `
        <div class="form-group">
          <label>Label</label>
          <input placeholder="Gallery title" value="${escapeHtml(label)}"
                 onchange="updateBlockData(${id}, ${index}, 'label', this.value)">
        </div>

        ${validImages.length > 0 ? `
        <div class="gallery-preview" style="margin-bottom: 20px; background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <div class="gallery-slider" id="admin-gallery-slider-${id}-${index}" style="max-width: 600px; margin: 0 auto;">
            <div class="gallery-viewport" style="overflow: hidden; border-radius: 8px;">
              <div class="slider-track" style="display: flex; transition: transform 0.3s ease;">
                ${validImages.map((img, idx) => {
                  const src = typeof img === 'string' ? img : (img.src || '');
                  const caption = typeof img === 'object' ? (img.caption || '') : '';
                  return `
                    <div class="slide" style="min-width: 100%; position: relative;">
                      <img src="${escapeHtml(src)}" style="width: 100%; height: auto; display: block;">
                      ${caption ? `<div style="padding: 10px; background: rgba(0,0,0,0.7); color: white; text-align: center;">${escapeHtml(caption)}</div>` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
            ${validImages.length > 1 ? `
            <div class="slider-controls" style="display: flex; justify-content: center; align-items: center; gap: 15px; margin-top: 15px;">
              <button class="prev-btn" onclick="changeSlide('admin-gallery-slider-${id}-${index}', -1)"
                      style="padding: 8px 16px; background: white; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">←</button>
              <span class="slide-counter" style="font-size: 0.9rem; color: #666;">1 / ${validImages.length}</span>
              <button class="next-btn" onclick="changeSlide('admin-gallery-slider-${id}-${index}', 1)"
                      style="padding: 8px 16px; background: white; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">→</button>
            </div>
            ` : ''}
          </div>
        </div>
        ` : ''}

        <div class="gallery-images-list" id="gallery-block-${id}-${index}">
          ${images.map((img, imgIdx) => {
            const imgSrc = typeof img === 'string' ? img : (img.src || '');
            const caption = typeof img === 'object' ? (img.caption || '') : '';
            const cropData = (typeof img === 'object' && img.crop) ? img.crop : null;

            return `
              <div class="gallery-item-block" data-index="${imgIdx}" style="margin-bottom: 15px; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; background: white;">
                <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px;">
                  <span class="drag-handle" style="cursor: move; font-size: 1.2rem;">⋮⋮</span>
                  <span style="font-weight: 600; color: #f093fb;">Image ${imgIdx + 1}</span>
                  ${cropData ? '<span style="font-size: 0.7rem; color: #28a745; margin-left: 5px;">✓ Cropped</span>' : ''}
                  <button type="button" class="grid-delete-btn"
                          onclick="deleteGalleryImage(${id}, ${index}, ${imgIdx})"
                          style="margin-left: auto;">🗑️</button>
                </div>
                <input type="text" placeholder="Image URL or paste to upload" value="${escapeHtml(imgSrc)}"
                       onchange="updateGalleryImage(${id}, ${index}, ${imgIdx}, 'src', this.value)"
                       style="width: 100%; margin-bottom: 8px;">
                <input type="text" placeholder="Caption (optional)" value="${escapeHtml(caption)}"
                       onchange="updateGalleryImage(${id}, ${index}, ${imgIdx}, 'caption', this.value)"
                       style="width: 100%; margin-bottom: 8px;">
                ${imgSrc ? `
                  <div style="position: relative;">
                    <img src="${escapeHtml(imgSrc)}" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 4px; display: block;">
                    <button type="button" class="crop-btn-overlay"
                            onclick="openGalleryCrop(${id}, ${index}, ${imgIdx}, '${escapeHtml(imgSrc).replace(/'/g, "\\'")}')">
                      ✂️ Crop
                    </button>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>

        <button type="button" class="grid-btn" onclick="addGalleryImage(${id}, ${index})"
                style="width: 100%; margin-top: 10px;">
          ➕ Add Image
        </button>
      `;
    } else if (block.type === 'two_column') {
      const label = block.label || '';
      const leftType = block.leftType || 'text';
      const rightType = block.rightType || 'image';
      const leftContent = block.leftContent || '';
      const rightContent = block.rightContent || '';
      const columnRatio = block.columnRatio || '50-50';

      html += `
        <div class="form-group">
          <label>Label (optional)</label>
          <input placeholder="Section title" value="${escapeHtml(label)}"
                 onchange="updateBlockData(${id}, ${index}, 'label', this.value)">
        </div>

        <div class="two-column-editor">
          <div class="column-settings" style="display: flex; gap: 15px; margin-bottom: 15px;">
            <div style="flex: 1;">
              <label style="font-size: 0.75rem; color: #888;">Left Column</label>
              <select onchange="updateBlockData(${id}, ${index}, 'leftType', this.value); renderBlocks(${id});" style="width: 100%;">
                <option value="text" ${leftType === 'text' ? 'selected' : ''}>Text</option>
                <option value="image" ${leftType === 'image' ? 'selected' : ''}>Image</option>
              </select>
            </div>
            <div style="flex: 1;">
              <label style="font-size: 0.75rem; color: #888;">Right Column</label>
              <select onchange="updateBlockData(${id}, ${index}, 'rightType', this.value); renderBlocks(${id});" style="width: 100%;">
                <option value="text" ${rightType === 'text' ? 'selected' : ''}>Text</option>
                <option value="image" ${rightType === 'image' ? 'selected' : ''}>Image</option>
              </select>
            </div>
            <div style="flex: 1;">
              <label style="font-size: 0.75rem; color: #888;">Column Ratio</label>
              <select onchange="updateBlockData(${id}, ${index}, 'columnRatio', this.value);" style="width: 100%;">
                <option value="30-70" ${columnRatio === '30-70' ? 'selected' : ''}>30% - 70%</option>
                <option value="40-60" ${columnRatio === '40-60' ? 'selected' : ''}>40% - 60%</option>
                <option value="50-50" ${columnRatio === '50-50' ? 'selected' : ''}>50% - 50%</option>
                <option value="60-40" ${columnRatio === '60-40' ? 'selected' : ''}>60% - 40%</option>
                <option value="70-30" ${columnRatio === '70-30' ? 'selected' : ''}>70% - 30%</option>
              </select>
            </div>
          </div>

          <div class="two-column-content" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div class="column-left">
              <label style="font-weight: 600; margin-bottom: 8px; display: block;">Left: ${leftType === 'text' ? 'Text' : 'Image'}</label>
              ${leftType === 'text' ? `
                <textarea class="mde-two-col-left-${id}-${index}"
                          style="width: 100%; min-height: 200px;">${escapeHtml(leftContent)}</textarea>
              ` : `
                <input type="text" placeholder="Image URL" value="${escapeHtml(leftContent)}"
                       onchange="updateBlockData(${id}, ${index}, 'leftContent', this.value); renderBlocks(${id});"
                       style="width: 100%; margin-bottom: 8px;">
                ${leftContent ? `<img src="${escapeHtml(leftContent)}" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 4px;">` : ''}
              `}
            </div>
            <div class="column-right">
              <label style="font-weight: 600; margin-bottom: 8px; display: block;">Right: ${rightType === 'text' ? 'Text' : 'Image'}</label>
              ${rightType === 'text' ? `
                <textarea class="mde-two-col-right-${id}-${index}"
                          style="width: 100%; min-height: 200px;">${escapeHtml(rightContent)}</textarea>
              ` : `
                <input type="text" placeholder="Image URL" value="${escapeHtml(rightContent)}"
                       onchange="updateBlockData(${id}, ${index}, 'rightContent', this.value); renderBlocks(${id});"
                       style="width: 100%; margin-bottom: 8px;">
                ${rightContent ? `<img src="${escapeHtml(rightContent)}" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 4px;">` : ''}
              `}
            </div>
          </div>
        </div>
      `;
    }

    html += `</div>`; // Close block-content

    el.innerHTML = html;
    container.appendChild(el);

    // Add insert button after this block
    const insertBtnAfter = document.createElement('div');
    insertBtnAfter.className = 'insert-block-divider';
    insertBtnAfter.innerHTML = `
      <div class="insert-trigger" onclick="showInsertMenu(${id}, ${index + 1})">
        <span>+ Insert Block Here</span>
      </div>
      <div class="insert-menu" id="insert-menu-${id}-${index + 1}">
        <button onclick="addBlock(${id}, 'text', ${index + 1}); showInsertMenu(${id}, ${index + 1});">Text Group</button>
        <button onclick="addBlock(${id}, 'image', ${index + 1}); showInsertMenu(${id}, ${index + 1});">Image</button>
        <button onclick="addBlock(${id}, 'video', ${index + 1}); showInsertMenu(${id}, ${index + 1});">Video</button>
        <button onclick="addBlock(${id}, 'image_grid', ${index + 1}); showInsertMenu(${id}, ${index + 1});">Image Grid</button>
        <button onclick="addBlock(${id}, 'gallery', ${index + 1}); showInsertMenu(${id}, ${index + 1});">Gallery</button>
        <button onclick="addBlock(${id}, 'two_column', ${index + 1}); showInsertMenu(${id}, ${index + 1});">Two Column</button>
      </div>
    `;
    container.appendChild(insertBtnAfter);

    // init EasyMDE for text sections
    if (block.type === 'text') {
      const sections = block.sections || [{}];
      sections.forEach((_, sIdx) => {
        const ta = el.querySelector(`textarea.mde-${id}-${index}-${sIdx}`);
        if (ta && typeof EasyMDE !== 'undefined') {
          const mde = new EasyMDE({
            element: ta,
            status: false,
            spellChecker: false,
            minHeight: "100px",
            toolbar: ["bold", "italic", "unordered-list", "link", "preview"],
            forceSync: true
          });
          mde.codemirror.on("change", (cm) => {
            updateSectionData(id, index, sIdx, 'content', cm.getValue());
          });
        }
      });
    }

    // init EasyMDE for two_column text areas
    if (block.type === 'two_column') {
      if (block.leftType === 'text') {
        const taLeft = el.querySelector(`textarea.mde-two-col-left-${id}-${index}`);
        if (taLeft && typeof EasyMDE !== 'undefined') {
          const mdeLeft = new EasyMDE({
            element: taLeft,
            status: false,
            spellChecker: false,
            minHeight: "150px",
            toolbar: ["bold", "italic", "unordered-list", "link", "preview"],
            forceSync: true
          });
          mdeLeft.codemirror.on("change", (cm) => {
            updateBlockData(id, index, 'leftContent', cm.getValue());
          });
        }
      }
      if (block.rightType === 'text') {
        const taRight = el.querySelector(`textarea.mde-two-col-right-${id}-${index}`);
        if (taRight && typeof EasyMDE !== 'undefined') {
          const mdeRight = new EasyMDE({
            element: taRight,
            status: false,
            spellChecker: false,
            minHeight: "150px",
            toolbar: ["bold", "italic", "unordered-list", "link", "preview"],
            forceSync: true
          });
          mdeRight.codemirror.on("change", (cm) => {
            updateBlockData(id, index, 'rightContent', cm.getValue());
          });
        }
      }
    }
  });

  syncBlocksJson(id);

  if (typeof Sortable !== 'undefined') {
    new Sortable(container, {
      handle: '.block-handle', // 只在拖拽手柄上可以拖动
      animation: 150,
      draggable: '.content-block-item', // 只有 content-block-item 可以拖动
      onEnd: function (evt) {
        // 直接从DOM中读取新的顺序
        const blockItems = Array.from(container.children).filter(el =>
          el.classList.contains('content-block-item')
        );

        // 根据DOM顺序重新排列projectBlocks数组
        const newBlocks = blockItems.map(el => {
          const blockId = el.getAttribute('data-block-id');
          const idx = parseInt(blockId.split('-')[1]);
          return projectBlocks[id][idx];
        });

        projectBlocks[id] = newBlocks;
        syncBlocksJson(id);
        renderBlocks(id);
      }
    });
  }
}

// ====== CROP LOGIC ======
// 工具函数：把 xxx-crop.jpg → xxx.jpg
function getOriginalPath(url) {
  // 例如 /uploads/j1-crop.jpg → /uploads/j1.jpg
  return url.replace(/-crop(?=\.\w+$)/, '');
}

// ------- Gallery -------
function startCropGallery(pid, idx) {
  const item = projectGalleries[pid][idx];
  if (!item || !item.src) {
    alert('Please set image URL first.');
    return;
  }
  if (!item.src.startsWith('/uploads/')) {
    alert('Cropping only supports local /uploads images.');
    return;
  }

  // 如果还没保存 originalSrc，则记录一次
  if (!item.originalSrc) {
    item.originalSrc = item.src;
  }

  // 每次都从 originalSrc 开始裁剪
  const baseUrl = item.originalSrc || item.src;

  openCropperWithUrl(baseUrl, (newUrl) => {
    item.src = newUrl;       // 只更新当前显示的 src
    syncGalleryJson(pid);
    renderGallery(pid);
  });
}


// ------- Blocks -------
function startCropBlock(pid, idx) {
  const block = projectBlocks[pid][idx];
  if (!block || !block.src) {
    alert('Please set image URL first.');
    return;
  }
  if (!block.src.startsWith('/uploads/')) {
    alert('Cropping only supports local /uploads images.');
    return;
  }

  const origSrc = getOriginalPath(block.src);

  openCropperWithUrl(origSrc, (newUrl) => {
    updateBlockData(pid, idx, 'src', newUrl);
    renderBlocks(pid);
  });
}



let cropper = null;
let cropDoneCallback = null;

function openCropperWithUrl(imgUrl, onDone) {
  const modal = document.getElementById('crop-modal');
  const img = document.getElementById('crop-image');
  const closeBtn = document.getElementById('crop-close');
  const saveBtn = document.getElementById('crop-save');
  const backdrop = modal.querySelector('.crop-modal-backdrop');
  const aspectButtons = modal.querySelectorAll('.crop-aspect-toolbar .aspect-btn');

  cropDoneCallback = onDone;

  // 打开弹窗
  modal.classList.remove('hidden');

  // 初始化比例按钮，默认 Free 高亮
  aspectButtons.forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.ratio === 'free');
    // 每次打开都重置 onclick，避免重复 addEventListener
    btn.onclick = function () {
      if (!cropper) return;
      aspectButtons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const r = btn.dataset.ratio;
      if (r === 'free') {
        cropper.setAspectRatio(NaN);      // 自由比例
      } else {
        cropper.setAspectRatio(parseFloat(r));
      }
    };
  });

  // 加载图片并创建 Cropper
  img.onload = function () {
    if (cropper) {
      cropper.destroy();
    }
    cropper = new Cropper(img, {
      viewMode: 1,
      autoCropArea: 1,
      responsive: true,
      background: false
    });
  };
  img.src = imgUrl;

  function closeModal() {
    modal.classList.add('hidden');
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }
  }

  closeBtn.onclick = closeModal;
  backdrop.onclick = closeModal;

  saveBtn.onclick = async () => {
    if (!cropper) return;

    const data = cropper.getData(true); // {x,y,width,height}
    try {
      const res = await fetch('crop.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          src: imgUrl,
          x: data.x,
          y: data.y,
          width: data.width,
          height: data.height
        })
      });
      const json = await res.json();
      if (!json.ok) {
        alert('Crop failed: ' + (json.error || 'unknown'));
        return;
      }

      closeModal();

      if (typeof cropDoneCallback === 'function') {
        cropDoneCallback(json.url);
      }
    } catch (e) {
      console.error(e);
      alert('Crop request failed');
    }
  };
}


// ====== Hero / cover focus pickers ======
document.addEventListener('DOMContentLoaded', function () {
  const pickers = document.querySelectorAll('.focus-picker');

  pickers.forEach(picker => {
    const crosshair = picker.querySelector('.focus-crosshair');
    const type = picker.dataset.type;
    const projectId = picker.dataset.project;

    picker.addEventListener('click', function (e) {
      const rect = picker.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const percentX = (x / rect.width) * 100;
      const percentY = (y / rect.height) * 100;

      crosshair.style.left = percentX + '%';
      crosshair.style.top = percentY + '%';

      if (type === 'cover') {
        const posYInput = document.querySelector(`.cover-posy-input[data-project="${projectId}"]`);
        const posYDisplay = document.getElementById(`cp-${projectId}`);
        if (posYInput) {
          posYInput.value = Math.round(percentY);
          if (posYDisplay) posYDisplay.textContent = Math.round(percentY) + '%';
        }
      } else if (type === 'hero') {
        const posXInput = document.querySelector(`input[name="visual_hero_pos_x"][data-project="${projectId}"]`);
        const posYInput = document.querySelector(`input[name="visual_hero_pos_y"][data-project="${projectId}"]`);
        const posXDisplay = document.getElementById(`px-${projectId}`);
        const posYDisplay = document.getElementById(`pv-${projectId}`);

        if (posXInput) posXInput.value = Math.round(percentX);
        if (posYInput) posYInput.value = Math.round(percentY);
        if (posXDisplay) posXDisplay.textContent = Math.round(percentX) + '%';
        if (posYDisplay) posYDisplay.textContent = Math.round(percentY) + '%';
      }
    });
  });
});

// ====== Helpers ======
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function submitProjectForm(id) {
  syncBlocksJson(id);
  syncGalleryJson(id);
  const form = document.querySelector(`#project-${id} form`);
  if (form) form.submit();
}

// ====== GRID IMAGE FUNCTIONS ======
function addGridImage(pid, blockIdx) {
  const block = projectBlocks[pid][blockIdx];
  if (!block.images) block.images = [];
  
  block.images.push({
    src: '',
    caption: '',
    width: 1,
    height: 1
  });
  
  syncBlocksJson(pid);
  renderBlocks(pid);
}

// ====== GRID TABLE FUNCTIONS ======
function generateGridTable(pid, blockIdx, rows, cols, cells) {
  let html = '<table class="grid-editor-table">';

  for (let r = 0; r < rows; r++) {
    html += '<tr>';
    for (let c = 0; c < cols; c++) {
      const cellKey = `${r}-${c}`;
      const cell = cells[cellKey];

      // 检查这个单元格是否被合并
      if (cell && cell.hidden) {
        continue;
      }

      const rowspan = cell?.rowspan || 1;
      const colspan = cell?.colspan || 1;
      const imgSrc = cell?.src || '';
      const caption = cell?.caption || '';

      const cellClass = imgSrc ? 'has-image' : '';

      html += `
        <td class="grid-cell ${cellClass}"
            data-row="${r}"
            data-col="${c}"
            data-project="${pid}"
            data-block="${blockIdx}"
            rowspan="${rowspan}"
            colspan="${colspan}"
            onclick="openCellEditor(${pid}, ${blockIdx}, ${r}, ${c})">
          ${imgSrc ? `<img src="${escapeHtml(imgSrc)}" alt="">` : '<span class="cell-empty">+</span>'}
          ${caption ? `<div class="cell-caption">${escapeHtml(caption)}</div>` : ''}
          ${rowspan > 1 || colspan > 1 ? `<div class="cell-size">${colspan}×${rowspan}</div>` : ''}
        </td>
      `;
    }
    html += '</tr>';
  }

  html += '</table>';
  return html;
}

function updateGridSize(pid, blockIdx, field, value) {
  const block = projectBlocks[pid][blockIdx];
  const newValue = Math.max(1, Math.min(field === 'rows' ? 8 : 6, parseInt(value) || 2));
  block[field] = newValue;

  // 清理超出范围的单元格
  if (block.cells) {
    const cells = block.cells;
    Object.keys(cells).forEach(key => {
      const [r, c] = key.split('-').map(Number);
      if (r >= block.rows || c >= block.cols) {
        delete cells[key];
      }
    });
  }

  syncBlocksJson(pid);
  renderBlocks(pid);
}

function openCellEditor(pid, blockIdx, row, col) {
  const block = projectBlocks[pid][blockIdx];
  if (!block.cells) block.cells = {};

  const cellKey = `${row}-${col}`;
  const cell = block.cells[cellKey] || { src: '', caption: '', rowspan: 1, colspan: 1 };

  const modal = document.createElement('div');
  modal.className = 'cell-editor-modal';
  modal.innerHTML = `
    <div class="cell-editor-content">
      <h3>Edit Cell (${row + 1}, ${col + 1})</h3>

      <div class="form-group">
        <label>Image URL</label>
        <input type="text" id="cell-src" value="${escapeHtml(cell.src || '')}"
               placeholder="Paste image URL">
      </div>

      <div class="form-group">
        <label>Caption (optional)</label>
        <input type="text" id="cell-caption" value="${escapeHtml(cell.caption || '')}"
               placeholder="Image description">
      </div>

      <div class="form-group">
        <label>Merge Cells</label>
        <div style="display: flex; gap: 10px;">
          <label>Width:
            <input type="number" id="cell-colspan" min="1" max="${block.cols - col}"
                   value="${cell.colspan || 1}" style="width: 60px;">
          </label>
          <label>Height:
            <input type="number" id="cell-rowspan" min="1" max="${block.rows - row}"
                   value="${cell.rowspan || 1}" style="width: 60px;">
          </label>
        </div>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn-primary" onclick="saveCellData(${pid}, ${blockIdx}, ${row}, ${col})">
          Save
        </button>
        <button type="button" class="btn-secondary" onclick="deleteCellData(${pid}, ${blockIdx}, ${row}, ${col})">
          Clear Cell
        </button>
        <button type="button" class="btn-secondary" onclick="closeModal()">
          Cancel
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('active'), 10);
}

function saveCellData(pid, blockIdx, row, col) {
  const block = projectBlocks[pid][blockIdx];
  if (!block.cells) block.cells = {};

  const cellKey = `${row}-${col}`;
  const src = document.getElementById('cell-src').value.trim();
  const caption = document.getElementById('cell-caption').value.trim();
  const colspan = parseInt(document.getElementById('cell-colspan').value) || 1;
  const rowspan = parseInt(document.getElementById('cell-rowspan').value) || 1;

  console.log(`Saving cell ${cellKey}: colspan=${colspan}, rowspan=${rowspan}`);

  // 清除之前被这个单元格占用的hidden标记
  Object.keys(block.cells).forEach(key => {
    if (block.cells[key].hidden && block.cells[key].parent === cellKey) {
      delete block.cells[key];
    }
  });

  if (src || caption) {
    block.cells[cellKey] = { src, caption, colspan, rowspan };

    // 标记被合并的单元格
    for (let r = row; r < row + rowspan; r++) {
      for (let c = col; c < col + colspan; c++) {
        if (r === row && c === col) continue;
        const mergedKey = `${r}-${c}`;
        block.cells[mergedKey] = { hidden: true, parent: cellKey };
      }
    }
  } else {
    delete block.cells[cellKey];
  }

  syncBlocksJson(pid);
  renderBlocks(pid);
  closeModal();
}

function deleteCellData(pid, blockIdx, row, col) {
  const block = projectBlocks[pid][blockIdx];
  if (!block.cells) return;

  const cellKey = `${row}-${col}`;

  // 清除被合并的单元格
  Object.keys(block.cells).forEach(key => {
    if (block.cells[key].hidden && block.cells[key].parent === cellKey) {
      delete block.cells[key];
    }
  });

  delete block.cells[cellKey];
  syncBlocksJson(pid);
  renderBlocks(pid);
  closeModal();
}

function clearAllCells(pid, blockIdx) {
  if (confirm('Clear all images from this grid?')) {
    const block = projectBlocks[pid][blockIdx];
    block.cells = {};
    syncBlocksJson(pid);
    renderBlocks(pid);
  }
}

function closeModal() {
  const modal = document.querySelector('.cell-editor-modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
}

// ====== GALLERY FUNCTIONS ======
function addGalleryImage(pid, blockIdx) {
  const block = projectBlocks[pid][blockIdx];
  if (!block.images) block.images = [];
  block.images.push({ src: '', caption: '' });
  syncBlocksJson(pid);
  renderBlocks(pid);
}

function updateGalleryImage(pid, blockIdx, imgIdx, field, value) {
  const block = projectBlocks[pid][blockIdx];
  if (!block.images || !block.images[imgIdx]) return;

  if (typeof block.images[imgIdx] === 'string') {
    block.images[imgIdx] = { src: block.images[imgIdx], caption: '' };
  }

  block.images[imgIdx][field] = value;
  syncBlocksJson(pid);
  renderBlocks(pid);
}

function deleteGalleryImage(pid, blockIdx, imgIdx) {
  const block = projectBlocks[pid][blockIdx];
  if (!block.images) return;

  if (confirm('Delete this image?')) {
    block.images.splice(imgIdx, 1);
    syncBlocksJson(pid);
    renderBlocks(pid);
  }
}

function openGalleryCrop(pid, blockIdx, imgIdx, imgSrc) {
  if (!imgSrc) {
    alert('Please add an image URL first');
    return;
  }

  openCropperWithUrl(imgSrc, (croppedCanvas) => {
    croppedCanvas.toBlob((blob) => {
      const formData = new FormData();
      formData.append('image', blob, 'cropped.jpg');

      fetch('upload_image.php', {
        method: 'POST',
        body: formData
      })
        .then(res => res.json())
        .then(data => {
          if (data.url) {
            const block = projectBlocks[pid][blockIdx];
            if (typeof block.images[imgIdx] === 'string') {
              block.images[imgIdx] = { src: data.url, caption: '', crop: true };
            } else {
              block.images[imgIdx].src = data.url;
              block.images[imgIdx].crop = true;
            }
            syncBlocksJson(pid);
            renderBlocks(pid);
          } else {
            alert('Upload failed: ' + (data.error || 'unknown'));
          }
        })
        .catch(err => {
          console.error(err);
          alert('Upload error');
        });
    }, 'image/jpeg', 0.95);
  });
}

// ====== Gallery Slider Functions (for admin preview) ======
const adminGalleryStates = {};

function initAdminGallerySlider(sliderId) {
  const slider = document.getElementById(sliderId);
  if (!slider) return;

  const slides = slider.querySelectorAll('.slide');
  if (slides.length === 0) return;

  adminGalleryStates[sliderId] = {
    currentIndex: 0,
    totalSlides: slides.length
  };

  showSlide(sliderId, 0);
}

function changeSlide(sliderId, direction) {
  let state = adminGalleryStates[sliderId];

  // Initialize if not exists
  if (!state) {
    initAdminGallerySlider(sliderId);
    state = adminGalleryStates[sliderId];
    if (!state) return;
  }

  state.currentIndex += direction;

  // Loop around
  if (state.currentIndex < 0) {
    state.currentIndex = state.totalSlides - 1;
  } else if (state.currentIndex >= state.totalSlides) {
    state.currentIndex = 0;
  }

  showSlide(sliderId, state.currentIndex);
}

function showSlide(sliderId, index) {
  const slider = document.getElementById(sliderId);
  if (!slider) return;

  const track = slider.querySelector('.slider-track');
  const slides = slider.querySelectorAll('.slide');
  const counter = slider.querySelector('.slide-counter');

  if (!track || slides.length === 0) return;

  // Move track
  const offset = -index * 100;
  track.style.transform = `translateX(${offset}%)`;

  // Update counter
  if (counter) {
    counter.textContent = `${index + 1} / ${slides.length}`;
  }

  // Update state
  if (adminGalleryStates[sliderId]) {
    adminGalleryStates[sliderId].currentIndex = index;
  }
}

