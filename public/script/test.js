/* script/test.js */

const bg = document.getElementById('bg-layer');
const cursorWrapper = document.getElementById('cursor-wrapper');
const cursorMain = document.querySelector('.cursor-main');

// 鼠标移动监听
document.addEventListener('mousemove', (e) => {
  const x = e.clientX;
  const y = e.clientY;
  
  // 1. 移动鼠标 (真身+倒影)
  if(cursorWrapper) {
      cursorWrapper.style.transform = `translate(${x}px, ${y}px)`;
  }
  
  // 2. 移动背景 (视差效果)
  const bgX = (x / window.innerWidth) * -20;
  const bgY = (y / window.innerHeight) * -20;
  if(bg) {
    bg.style.transform = `translate(${bgX}px, ${bgY}px)`;
  }
});

// 点击反馈
document.addEventListener('mousedown', () => {
    if(cursorMain) cursorMain.style.transform = 'scale(0.9)';
});

document.addEventListener('mouseup', () => {
    if(cursorMain) cursorMain.style.transform = 'scale(1)';
});