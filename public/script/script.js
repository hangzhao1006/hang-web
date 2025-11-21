// --- Spring helper -----------------------------------------------------------
function makeSpring({ value = 0, stiffness = 900, damping = 60, precision = 0.001 }) {
  let x = value;        // position
  let v = 0;            // velocity
  let target = value;
  let raf = null;
  const subs = new Set();

  function step(t) {
    // fixed timestep ~ 1/60
    const dt = 1 / 60;
    const k = stiffness;
    const c = damping;

    // spring-damper: a = -k(x - target) - c*v
    const a = -k * (x - target) - c * v;
    v += a * dt;
    x += v * dt;

    subs.forEach(fn => fn(x));

    if (Math.abs(v) > precision || Math.abs(x - target) > precision) {
      raf = requestAnimationFrame(step);
    } else {
      x = target; v = 0;
      subs.forEach(fn => fn(x));
      raf = null;
    }
  }

  return {
    setTarget(t) {
      target = t;
      if (!raf) raf = requestAnimationFrame(step);
    },
    on(fn) { subs.add(fn); return () => subs.delete(fn); },
    get value() { return x; }
  };
}

// --- Cards -------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // 遵循“减少动态效果”
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    // 三个弹簧：Y 平移、整体缩放、3D 倾斜
    // 更慢的位移/缩放/倾斜弹簧（频率更低、阻尼更大）
    const sy = makeSpring({ value: 0, stiffness: 600, damping: 85 }); // Y 位移
    const ss = makeSpring({ value: 1, stiffness: 520, damping: 90 }); // 卡片整体缩放
    const sImg = makeSpring({ value: 1, stiffness: 500, damping: 95 }); // 图片缩放
    const stiltX = makeSpring({ value: 0, stiffness: 520, damping: 80 }); // 3D 倾斜 X
    const stiltY = makeSpring({ value: 0, stiffness: 520, damping: 80 }); // 3D 倾斜 Y


    const img = card.querySelector('img');


    // 渲染函数（每次任意弹簧更新都会执行）
    function render() {
      card.style.setProperty('--ty', `${sy.value}px`);
      card.style.setProperty('--s', ss.value.toFixed(3));
      card.style.setProperty('--rx', `${stiltX.value}deg`);
      card.style.setProperty('--ry', `${stiltY.value}deg`);
      if (img) { img.style.transform = `scale(${sImg.value}) translateZ(1px)`; }
    }


    sy.on(render); ss.on(render); stiltX.on(render); stiltY.on(render); sImg.on(render);

    // 进入/离开：像琴键回弹
    const enter = () => {
      if (reduced) return;
      sy.setTarget(-8);     // 上弹
      ss.setTarget(1.025);   // 轻微放大
      sImg.setTarget(1.04);  // 图像更轻的放大
    };
    const leave = () => {
      sy.setTarget(0);
      ss.setTarget(1);
      sImg.setTarget(1);
      stiltX.setTarget(0);
      stiltY.setTarget(0);
    };

    // 跟随指针的 3D 倾斜（像手指按压的角度）
    function onMove(e) {
      if (reduced) return;
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX ?? (e.touches && e.touches[0].clientX)) - cx;
      const dy = (e.clientY ?? (e.touches && e.touches[0].clientY)) - cy;
      // 角度缩放，限制最大 6 度
      const maxDeg = 4;
      stiltY.setTarget(Math.max(-maxDeg, Math.min(maxDeg, (dx / rect.width) * maxDeg)));
      stiltX.setTarget(Math.max(-maxDeg, Math.min(maxDeg, (-dy / rect.height) * maxDeg)));
    }

    // Pointer 事件兼容鼠标+触屏
    card.addEventListener('pointerenter', enter);
    card.addEventListener('pointerleave', leave);
    card.addEventListener('pointermove', onMove, { passive: true });

    // 初始一次渲染
    render();
  });
});

// public/script.js
// public/script.js



// public/script.js
document.addEventListener('DOMContentLoaded', () => {
  const screens = document.querySelector('.screens');
  if (!screens) return;
  const cards = Array.from(screens.querySelectorAll('.card'));

  /* ---------- 无缝/梯度参数 ---------- */
  const CENTER   = 1.05;   // hover 卡片放大
  const SHRINK_1 = 0.015;  // 相邻缩小量
  const DECAY    = 0.55;   // 距离衰减
  const MIN_S    = 0.999;  // 远处最小缩放

  const scaleAtDistance = d => {
    if (d === 0) return CENTER;
    const shrink = SHRINK_1 * Math.pow(DECAY, d - 1);
    return Math.max(1 - shrink, MIN_S);
  };
  const filterAtDistance = d => {
    if (d === 0) return 'none';
    const k = Math.pow(DECAY, d - 1);
    const b = 1 - 0.06 * k;    // 亮度 0.94~1
    const s = 1 - 0.05 * k;    // 饱和 0.95~1
    return `brightness(${b}) saturate(${s})`;
  };
  const inwardShift = (hoverIdx, idx, scale, width) => {
    if (idx === hoverIdx) return 0;
    const dir = idx < hoverIdx ? +1 : -1;
    const shrink = (1 - scale) * width / 2;
    return dir * shrink; // 往中心“吸”回去
  };

  /* ---------- 量尺：用于无缝补偿 ---------- */
  function measure() { cards.forEach(c => c._w = c.getBoundingClientRect().width); }
  measure();
  window.addEventListener('resize', measure);

  /* ---------- 时间轴：构建 + 句柄 ---------- */
  const timelineEl = document.getElementById('timeline');
  let ticksWrap = null, cursorEl = null;
  let highlightYear = () => {}; // 默认空实现，避免未定义
  let highlightKey = () => {}; // composite key highlighter (YYYY or YYYY-MM)

  if (timelineEl && cards.length) {
  // Keep year-month keys in the same order as cards appear (left → right).
  // Key format: "YYYY-MM" when month exists, else "YYYY". This keeps timeline aligned to card order.
  const keys = [...new Set(cards.map(c => {
    const y = c.dataset.year ? String(+c.dataset.year) : '';
    const m = c.dataset.month ? String(+c.dataset.month).padStart(2, '0') : '';
    return m ? `${y}-${m}` : y;
  }))].filter(k => k);

    // 写入骨架后再取节点（避免 null）
    timelineEl.innerHTML = `
      <div class="track"></div>
      <div class="ticks"></div>
      <div class="cursor"></div>
    `;
    ticksWrap = timelineEl.querySelector('.ticks');
    cursorEl  = timelineEl.querySelector('.cursor');
    // ensure ticksWrap is positioned so cursor can be placed absolutely relative to it
    ticksWrap.style.position = ticksWrap.style.position || 'relative';
    // rely on CSS for cursor sizing/appearance; ensure it's not pointer-interactive
    cursorEl.style.pointerEvents = 'none';

    // 渲染刻度（year or year-month）
    ticksWrap.innerHTML = keys.map(k => {
      return `
      <div class="tick" data-ym="${k}">
        <span class="dot"></span><span class="label">${k}</span>
      </div>
    `
    }).join('');
    // append cursor into ticksWrap after populating ticks to avoid it being removed by innerHTML
    try { ticksWrap.appendChild(cursorEl); } catch (err) { /* ignore if already moved */ }
    console.debug('timeline keys:', keys);

    function moveCursorToTick(tick){
      ticksWrap.querySelectorAll('.tick').forEach(t => t.classList.toggle('active', t === tick));
      // compute position relative to ticksWrap using bounding rects (robust across layout)
      const r = tick.getBoundingClientRect();
      const w = ticksWrap.getBoundingClientRect();
  // cursor size comes from CSS; fall back to 4px width (half = 2)
  const cursorHalf = (cursorEl.offsetWidth || 4) / 2;
  const x = (r.left - w.left) + (r.width / 2) - cursorHalf;
  // position via left so the cursor stays in ticksWrap coordinate space
  cursorEl.style.left = `${x}px`;
    }
    // highlight by composite key (YYYY or YYYY-MM)
    highlightKey = (key) => {
      // try exact match first
      let tick = ticksWrap.querySelector(`.tick[data-ym="${key}"]`);
      if (!tick) {
        // fallback: try matching by year only (key may be 'YYYY' or 'YYYY-MM')
        const yearOnly = String(key).split('-')[0];
        tick = ticksWrap.querySelector(`.tick[data-ym^="${yearOnly}"]`);
      }
      if (tick) moveCursorToTick(tick);
    };

    // 时间轴 → 控制中心卡
    function pickCardIndexForKey(key) {
      const indices = cards
        .map((c, i) => ({ i, k: (c.dataset.month ? (String(+c.dataset.year) + '-' + String(+c.dataset.month).padStart(2,'0')) : String(+c.dataset.year)) }))
        .filter(x => x.k === key)
        .map(x => x.i);
      if (!indices.length) return -1;
      if (indices.length === 1) return indices[0];
      // 多张同年：选择靠近 screens 中心的卡片
      const screensRect = screens.getBoundingClientRect();
      const centerX = screensRect.left + screensRect.width / 2;
      let best = indices[0];
      let bestDist = Infinity;
      indices.forEach(i => {
        const r = cards[i].getBoundingClientRect();
        const cardCenter = r.left + r.width / 2;
        const dist = Math.abs(cardCenter - centerX);
        if (dist < bestDist) { bestDist = dist; best = i; }
      });
      return best;
    }

    ticksWrap.addEventListener('pointerover', (e) => {
      const t = e.target.closest('.tick'); if (!t) return;
      const key = t.dataset.ym;
      const idx = pickCardIndexForKey(key);
      console.debug('tick hover', key, '-> idx', idx);
      if (idx >= 0) applyHover(idx);
    });
    // click/tap center the chosen card
    ticksWrap.addEventListener('pointerdown', (e) => {
      const t = e.target.closest('.tick'); if (!t) return;
      const key = t.dataset.ym;
      const idx = pickCardIndexForKey(key);
      if (idx >= 0) {
        const card = cards[idx];
        if (card && card.scrollIntoView) {
          card.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'center'});
        }
        applyHover(idx);
      }
    });
    timelineEl.addEventListener('pointerleave', () => {
      if (!screens.matches(':hover')) resetAll();
    });
  }

  /* ---------- 视图联动 ---------- */
  function applyHover(i){
    cards.forEach((c, j) => {
      const d = Math.abs(j - i);
      const s = scaleAtDistance(d);
      c.style.setProperty('--k', s);
      c.style.setProperty('--shift', inwardShift(i, j, s, c._w) + 'px');
      c.style.filter = filterAtDistance(d);
      c.classList.toggle('is-hovered', j === i);
    });
    // 同步时间轴 using composite key
    if (typeof highlightKey === 'function') {
      const y = cards[i].dataset.year ? String(+cards[i].dataset.year) : '';
      const m = cards[i].dataset.month ? String(+cards[i].dataset.month).padStart(2,'0') : '';
      const key = m ? `${y}-${m}` : y;
      highlightKey(key);
    }
  }
  function resetAll(){
    cards.forEach(c => {
      c.style.removeProperty('--k');
      c.style.removeProperty('--shift');
      c.style.removeProperty('filter');
      c.classList.remove('is-hovered');
    });
  }

  cards.forEach((card, i) => {
    card.addEventListener('pointerenter', () => applyHover(i));
    card.addEventListener('pointerleave', () => {
      requestAnimationFrame(() => { if (!screens.matches(':hover')) resetAll(); });
    });
  });
});

