/* script/test.js - With Infinite Gallery Loop */

const bg = document.getElementById('bg-layer');
const cursorWrapper = document.getElementById('cursor-wrapper');
const cursorMain = document.querySelector('.cursor-main');

// 1. 鼠标移动与视差 (保持不变)
document.addEventListener('mousemove', (e) => {
  const x = e.clientX;
  const y = e.clientY;

  if (cursorWrapper) {
    cursorWrapper.style.transform = `translate(${x}px, ${y}px)`;
  }
  if (bg) {
    const bgX = (x / window.innerWidth) * -20;
    const bgY = (y / window.innerHeight) * -20;
    bg.style.transform = `translate(${bgX}px, ${bgY}px)`;
  }
});

// 点击反馈
document.addEventListener('mousedown', () => {
  if (cursorMain) cursorMain.style.transform = 'scale(0.9)';
});
document.addEventListener('mouseup', () => {
  if (cursorMain) cursorMain.style.transform = 'scale(1)';
});

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