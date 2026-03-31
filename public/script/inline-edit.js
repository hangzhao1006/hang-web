(() => {
  const fab     = document.getElementById('edit-fab');
  const saveBar = document.getElementById('edit-save-bar');
  const saveDot = saveBar?.querySelector('.save-dot');
  const saveMsg = saveBar?.querySelector('.save-msg');
  if (!fab) return;

  const PROJECT_ID = fab.dataset.projectId;
  let editMode = false;
  let saveTimer = null;

  fab.addEventListener('click', () => {
    editMode = !editMode;
    document.body.classList.toggle('edit-mode', editMode);
    fab.title = editMode ? 'Exit edit mode' : 'Edit page';
    fab.classList.toggle('active', editMode);

    document.querySelectorAll('[data-field]').forEach(el => {
      el.contentEditable = editMode ? 'true' : 'false';
    });

    if (!editMode) {
      saveBar.classList.remove('visible');
    }
  });

  // Save on blur or Enter (for single-line fields)
  document.addEventListener('blur', async e => {
    if (!editMode) return;
    const el = e.target.closest('[data-field]');
    if (!el) return;
    await save(el.dataset.field, el.innerText.trim(), el);
  }, true);

  document.addEventListener('keydown', e => {
    if (!editMode) return;
    const el = e.target.closest('[data-field]');
    if (!el) return;
    // Escape → revert
    if (e.key === 'Escape') {
      el.innerText = el.dataset.original;
      el.blur();
    }
  });

  // Store original values when edit mode starts
  document.body.addEventListener('focus', e => {
    const el = e.target.closest('[data-field]');
    if (el && el.dataset.original === undefined) {
      el.dataset.original = el.innerText.trim();
    }
  }, true);

  async function save(field, value, el) {
    if (value === el.dataset.original) return; // no change

    showSaving();
    try {
      const res = await fetch('/api/save_field.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: parseInt(PROJECT_ID), field, value })
      });
      const data = await res.json();
      if (data.ok) {
        el.dataset.original = value;
        showSaved();
      } else {
        showError(data.error || 'Error');
      }
    } catch {
      showError('Network error');
    }
  }

  function showSaving() {
    saveBar.classList.add('visible');
    saveDot.className = 'save-dot';
    saveMsg.textContent = 'Saving…';
    clearTimeout(saveTimer);
  }
  function showSaved() {
    saveDot.className = 'save-dot saved';
    saveMsg.textContent = 'Saved';
    saveTimer = setTimeout(() => saveBar.classList.remove('visible'), 2000);
  }
  function showError(msg) {
    saveDot.className = 'save-dot';
    saveDot.style.background = '#eb5757';
    saveMsg.textContent = msg;
  }
})();
