/* script/test.js - With Infinite Gallery Loop */

const bg = document.getElementById('bg-layer');
const cursorWrapper = document.getElementById('cursor-wrapper');
const cursorMain = document.querySelector('.cursor-main');

// 检测是否为 index 页面（通过 body class 中是否包含 bg-compact 或 bg-full）
const isIndexPage = document.body.classList.contains('bg-compact') || document.body.classList.contains('bg-full');

// 在 index 页面隐藏自定义鼠标，使用系统默认鼠标
if (isIndexPage && cursorWrapper) {
  cursorWrapper.style.display = 'none';
  document.body.style.cursor = 'default';
}

// Image loading handler for project covers
document.addEventListener('DOMContentLoaded', () => {
  const projectCovers = document.querySelectorAll('.project-cover');

  projectCovers.forEach(img => {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => {
        img.classList.add('loaded');
      });
      img.addEventListener('error', () => {
        img.classList.add('loaded'); // Show even on error
      });
    }
  });
});

// 1. 鼠标移动与视差
document.addEventListener('mousemove', (e) => {
  const x = e.clientX;
  const y = e.clientY;

  // 只在非 index 页面显示自定义鼠标
  if (!isIndexPage && cursorWrapper) {
    cursorWrapper.style.transform = `translate(${x}px, ${y}px)`;
  }

  if (bg) {
    const bgX = (x / window.innerWidth) * -20;
    const bgY = (y / window.innerHeight) * -20;
    bg.style.transform = `translate(${bgX}px, ${bgY}px)`;
  }
});

// 点击反馈 - 只在非 index 页面
if (!isIndexPage) {
  document.addEventListener('mousedown', () => {
    if (cursorMain) cursorMain.style.transform = 'scale(0.9)';
  });
  document.addEventListener('mouseup', () => {
    if (cursorMain) cursorMain.style.transform = 'scale(1)';
  });
}

// --- 2. 无缝循环画廊 (Infinite Gallery Slider) ---
document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('gallery-slider');
  if (!slider) return;

  const track = slider.querySelector('.slider-track');
  // 获取原始幻灯片列表
  let slides = Array.from(track.children);
  const prevBtn = slider.querySelector('.prev-btn');
  const nextBtn = slider.querySelector('.next-btn');
  const counter = slider.querySelector('.slide-counter');

  const totalRealSlides = slides.length;

  // 如果只有1张或0张图，不需要轮播
  if (totalRealSlides <= 1) {
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    return;
  }

  // --- 核心：克隆首尾实现无缝 ---
  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[totalRealSlides - 1].cloneNode(true);

  // 把“末尾的克隆”放到最前，把“开头的克隆”放到最后
  track.appendChild(firstClone);
  track.insertBefore(lastClone, slides[0]);

  // 现在的幻灯片总数是：1(克隆) + N(真实) + 1(克隆)
  const allSlides = track.children;

  // 初始位置：索引 1 (因为索引 0 是 lastClone)
  let currentIndex = 1;

  // 立即定位到第一张真实图片 (无动画)
  track.style.transform = `translateX(-100%)`;

  let isTransitioning = false;
  let autoPlayInterval;

  // 更新计数器 (1 / 5)
  function updateCounter() {
    if (!counter) return;
    // 计算真实索引
    let realIndex = currentIndex;
    if (currentIndex === 0) realIndex = totalRealSlides; // 在 cloneLast 上
    if (currentIndex === allSlides.length - 1) realIndex = 1; // 在 cloneFirst 上
    counter.innerText = `${realIndex} / ${totalRealSlides}`;
  }

  function moveToSlide(index) {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex = index;

    // 开启过渡动画
    track.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    updateCounter();
  }

  // 监听过渡结束：处理“瞬间归位”
  track.addEventListener('transitionend', () => {
    isTransitioning = false;

    // 如果滑到了最后一张（firstClone）
    if (allSlides[currentIndex] === firstClone) {
      track.style.transition = 'none'; // 关掉动画
      currentIndex = 1; // 瞬间跳回真实的 Index 1
      track.style.transform = `translateX(-100%)`;
    }

    // 如果滑到了第一张（lastClone）
    if (allSlides[currentIndex] === lastClone) {
      track.style.transition = 'none'; // 关掉动画
      currentIndex = allSlides.length - 2; // 瞬间跳回真实的 Last Index
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
  });

  function nextSlide() {
    if (currentIndex >= allSlides.length - 1) return;
    moveToSlide(currentIndex + 1);
  }

  function prevSlide() {
    if (currentIndex <= 0) return;
    moveToSlide(currentIndex - 1);
  }

  // 自动播放逻辑
  function startAutoPlay() {
    stopAutoPlay();
    autoPlayInterval = setInterval(nextSlide, 4000); // 4秒一次
  }

  function stopAutoPlay() {
    clearInterval(autoPlayInterval);
  }

  // 事件绑定
  if (nextBtn) nextBtn.addEventListener('click', () => {
    nextSlide();
    stopAutoPlay(); // 手动操作后暂停一会
  });

  if (prevBtn) prevBtn.addEventListener('click', () => {
    prevSlide();
    stopAutoPlay();
  });

  // 鼠标放上去暂停，移开继续
  slider.addEventListener('mouseenter', stopAutoPlay);
  slider.addEventListener('mouseleave', startAutoPlay);

  // 启动
  startAutoPlay();
  updateCounter();
});

document.querySelector('.project-header h1')?.addEventListener('click', () => {
  window.location.href = 'index.php';
});


document.addEventListener("DOMContentLoaded", () => {
  const turb = document.getElementById("warpNoise");
  const disp = document.getElementById("warpDisp");

  if (!turb || !disp) return;

  let lastX = null;
  let lastY = null;

  // 基础水面强度
  const baseScale = 40;
  let targetScale = baseScale;
  let currentScale = baseScale;

  // 脉冲：鼠标划过时激起的一小段“水波”
  let pulse = 0;

  // 用于让水面自己轻轻流动
  let t = 0;

  window.addEventListener("mousemove", (e) => {
    const x = e.clientX;
    const y = e.clientY;

    if (lastX !== null && lastY !== null) {
      const dx = x - lastX;
      const dy = y - lastY;

      // 鼠标速度
      const speed = Math.sqrt(dx * dx + dy * dy);

      // 把速度映射成力度（上限限制一下）
      const strength = Math.min(speed * 1.2, 120);

      // 这一笔划造成的“冲击”
      pulse = Math.max(pulse, strength);

      // 用速度方向来拉长波纹（横着划 -> 横向拉长）
      const len = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      const nx = dx / len;
      const ny = dy / len;

      // baseFrequency 轻微偏向鼠标划动方向
      const baseFx = 0.003;
      const baseFy = 0.006;
      const anisotropy = 0.002; // 越大越夸张

      const fx = baseFx + nx * anisotropy;
      const fy = baseFy + Math.abs(ny) * anisotropy;

      turb.setAttribute("baseFrequency", `${fx} ${fy}`);
    }

    lastX = x;
    lastY = y;
  });

  window.addEventListener("mousedown", () => {
    // 按下的时候稍微再激烈一点
    pulse += 30;
  });

  function animate() {
    t += 0.004;

    // 即使不动鼠标，水面也有一点自己的流动
    const fxBase = 0.003 + Math.sin(t * 0.7) * 0.0008;
    const fyBase = 0.006 + Math.cos(t * 0.5) * 0.0012;

    // 这里不要覆盖鼠标刚刚写进去的方向，只做一个小幅叠加
    const currentFreq = turb.getAttribute("baseFrequency").split(" ");
    let fx = parseFloat(currentFreq[0] || fxBase);
    let fy = parseFloat(currentFreq[1] || fyBase);

    fx += Math.sin(t * 1.3) * 0.0005;
    fy += Math.cos(t * 1.1) * 0.0005;
    turb.setAttribute("baseFrequency", `${fx} ${fy}`);

    // pulse 逐帧衰减：像水面慢慢平静下来
    pulse *= 0.88;

    // 根据脉冲调节 displacement 的 scale
    targetScale = baseScale + pulse;
    currentScale += (targetScale - currentScale) * 0.15;

    disp.setAttribute("scale", currentScale.toFixed(1));

    requestAnimationFrame(animate);
  }

  animate();
});

// --- 3. Mobile Navigation Toggle ---
document.addEventListener('DOMContentLoaded', () => {
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const mobileMenu = document.querySelector('.mobile-nav-menu');
  const mobileOverlay = document.querySelector('.mobile-nav-overlay');

  if (mobileToggle && mobileMenu && mobileOverlay) {
    function toggleMobileNav() {
      mobileToggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      mobileOverlay.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    }

    mobileToggle.addEventListener('click', toggleMobileNav);
    mobileOverlay.addEventListener('click', toggleMobileNav);

    // Close menu when clicking a link
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', toggleMobileNav);
    });
  }
});
