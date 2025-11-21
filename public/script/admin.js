document.addEventListener('DOMContentLoaded', () => {
  // Helpers
  const qs = s => document.querySelector(s);
  const qsa = s => Array.from(document.querySelectorAll(s));
  const isValidUrl = (u) => {
    try { new URL(u); return true; } catch(e){ return false; }
  };

  // Elements
  const linksWrap = qs('#linksWrap');
  const addLinkBtn = qs('#addLinkBtn');
  const metaLinksField = qs('#meta_links');

  const galleryWrap = qs('#galleryWrap');
  const addGalleryBtn = qs('#addGalleryBtn');
  const galleryField = qs('#gallery_json');

  const tagsInput = qs('#tagsInput');
  const tagsChips = qs('#tagsChips');

  // hydrate existing data from hidden fields (if any)
  try {
    const existingLinks = metaLinksField.value ? JSON.parse(metaLinksField.value) : [];
    existingLinks.forEach(l => addLinkRow(l.label || '', l.url || ''));
  } catch(e) { /* ignore parse error */ }

  try {
    const existingGallery = galleryField.value ? JSON.parse(galleryField.value) : [];
    existingGallery.forEach(u => addGalleryRow(u));
  } catch(e){}

  // Tags initial chips
  const initTags = (tagsInput.value || '').split(',').map(s=>s.trim()).filter(Boolean);
  initTags.forEach(t => createTagChip(t));
  updateTagsInputFromChips();

  // Link row factory
  function addLinkRow(label = '', url = '') {
    const row = document.createElement('div');
    row.className = 'repeat-row';
    row.innerHTML = `
      <input class="link-label" placeholder="label (eg. demo)" value="${escapeHtml(label)}">
      <input class="link-url" placeholder="https://..." value="${escapeHtml(url)}">
      <button type="button" class="remove-row">×</button>
      <div class="row-error" aria-hidden="true"></div>
    `;
    linksWrap.appendChild(row);
    row.querySelector('.remove-row').addEventListener('click', () => row.remove());
  }

  function addGalleryRow(url = '') {
    const row = document.createElement('div');
    row.className = 'repeat-row';
    row.innerHTML = `
      <input class="gallery-url" placeholder="/uploads/..." value="${escapeHtml(url)}">
      <button type="button" class="remove-row">×</button>
      <div class="row-error" aria-hidden="true"></div>
    `;
    galleryWrap.appendChild(row);
    row.querySelector('.remove-row').addEventListener('click', () => row.remove());
  }

  addLinkBtn.addEventListener('click', () => addLinkRow());
  addGalleryBtn.addEventListener('click', () => addGalleryRow());

  // tags chips
  tagsInput.addEventListener('change', () => {
    [].forEach.call(tagsChips.querySelectorAll('.chip'), c => c.remove());
    (tagsInput.value || '').split(',').map(s=>s.trim()).filter(Boolean).forEach(createTagChip);
    updateTagsInputFromChips();
  });

  function createTagChip(text) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = text;
    const btn = document.createElement('span');
    btn.className = 'chip-x';
    btn.textContent = '×';
    chip.appendChild(btn);
    chip.addEventListener('click', () => {
      chip.remove();
      updateTagsInputFromChips();
    });
    tagsChips.appendChild(chip);
  }

  function updateTagsInputFromChips() {
    const values = Array.from(tagsChips.querySelectorAll('.chip')).map(c => c.firstChild.textContent || c.childNodes[0].textContent);
    tagsInput.value = values.join(',');
  }

  // Before submit: serialize links and gallery, validate basic urls
  const forms = qsa('form');
  forms.forEach(form => {
    form.addEventListener('submit', (ev) => {
      // serialize links
      const links = [];
      linksWrap.querySelectorAll('.repeat-row').forEach(r => {
        const l = r.querySelector('.link-label').value.trim();
        const u = r.querySelector('.link-url').value.trim();
        const errEl = r.querySelector('.row-error');
        errEl.textContent = '';
        if (!l && !u) return;
        if (u && !isValidUrl(u)) {
          ev.preventDefault();
          errEl.textContent = 'Invalid URL';
          errEl.setAttribute('aria-hidden', 'false');
        } else {
          links.push({ label: l, url: u });
        }
      });

      // serialize gallery
      const gallery = [];
      galleryWrap.querySelectorAll('.repeat-row').forEach(r => {
        const u = r.querySelector('.gallery-url').value.trim();
        const errEl = r.querySelector('.row-error');
        errEl.textContent = '';
        if (!u) return;
        // allow relative paths starting with / or http(s)
        if (!u.startsWith('/') && !isValidUrl(u)) {
          ev.preventDefault();
          errEl.textContent = 'Invalid URL or path';
          errEl.setAttribute('aria-hidden', 'false');
        } else {
          gallery.push(u);
        }
      });

      if (ev.defaultPrevented) {
        window.scrollTo({ top: form.getBoundingClientRect().top + window.scrollY - 20, behavior: 'smooth' });
        return;
      }

      metaLinksField.value = JSON.stringify(links);
      galleryField.value = JSON.stringify(gallery);
      updateTagsInputFromChips();
    });
  });

  // small helper
  function escapeHtml(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
});