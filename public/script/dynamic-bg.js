/**
 * 動態背景效果 - 佔位符
 *
 * 這個文件預留給未來的動態背景效果
 * 可以實現的效果包括：
 * - 粒子動畫
 * - 波浪效果
 * - 漸變動畫
 * - Canvas 繪圖
 * - Three.js 3D 效果
 */

(function() {
  'use strict';

  // 檢查是否為 compact 模式
  const isCompactMode = document.body.classList.contains('bg-compact');

  if (!isCompactMode) {
    return; // 只在 compact 模式下執行
  }

  const container = document.getElementById('dynamic-bg');

  if (!container) {
    console.warn('Dynamic background container not found');
    return;
  }

  // ====== 範例：簡單的漸變動畫 ======
  // 你可以替換成任何你想要的效果

  let hue = 0;

  function animateGradient() {
    hue = (hue + 0.3) % 360;

    const color1 = `hsl(${hue}, 70%, 60%)`;
    const color2 = `hsl(${(hue + 60) % 360}, 70%, 50%)`;

    container.style.background = `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;

    requestAnimationFrame(animateGradient);
  }

  // 啟動動畫
  animateGradient();

  console.log('✨ Dynamic background initialized');

  // ====== 未來可以添加的效果示例 ======

  /*
  // 粒子效果示例
  function createParticles() {
    const canvas = document.createElement('canvas');
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    // ... 粒子邏輯
  }

  // Three.js 示例
  function init3DBackground() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // ... Three.js 設置
  }
  */

})();
