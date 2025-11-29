# 背景效果使用指南

## 概述

網站現在支援兩種背景效果，可以在 Admin 後台輕鬆切換：

### 1. **全屏背景 (BG.JPG)** - `full` 模式
- 使用現有的 `/uploads/BG.JPG` 作為背景圖片
- 全屏顯示，帶有扭曲濾鏡效果
- 適合展示攝影作品或藝術風格的背景

### 2. **縮短背景 (動態 JS)** - `compact` 模式
- 背景高度縮短至 40vh，剛好露出第一排作品
- 預設使用漸變色背景
- 包含動態 JavaScript 效果（可自訂）
- 適合更現代、簡約的風格

## 如何切換背景

1. 登入 Admin 後台：`/admin.php`
2. 在頂部的操作欄找到「背景樣式」選擇器
3. 選擇想要的背景模式：
   - **全屏背景 (BG.JPG)**
   - **縮短背景 (動態 JS)**
4. 系統會自動保存設定，並顯示「✓ 已保存」

## 技術細節

### 文件結構

```
src/config.php              # 背景設定存儲
public/update_config.php    # 背景切換 API
public/css/test.css         # 背景樣式定義
public/script/dynamic-bg.js # 動態背景效果（compact 模式）
```

### 配置文件

背景設定保存在 `src/config.php`：

```php
'background_style' => 'full', // 'full' 或 'compact'
```

### CSS 類別

系統會根據設定在 `<body>` 標籤添加對應的類別：
- `bg-full` - 全屏背景模式
- `bg-compact` - 縮短背景模式

## 自訂動態背景

如果你想自訂 `compact` 模式的動態背景效果，編輯 `public/script/dynamic-bg.js`：

### 當前效果
- 簡單的漸變動畫（色相循環）

### 可以實現的效果
1. **粒子動畫** - 使用 Canvas API 創建粒子系統
2. **波浪效果** - SVG 動畫或 CSS 動畫
3. **3D 效果** - 使用 Three.js
4. **幾何圖形** - Canvas 繪製動態圖形
5. **視差效果** - 根據滑鼠移動的視差

### 範例：修改漸變速度

```javascript
// 在 dynamic-bg.js 中找到這一行：
hue = (hue + 0.3) % 360;

// 修改數字來調整速度：
hue = (hue + 1) % 360;  // 更快
hue = (hue + 0.1) % 360;  // 更慢
```

### 範例：使用固定顏色

```javascript
// 替換 animateGradient 函數：
function animateGradient() {
  container.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)';
}
animateGradient();
```

## 預覽效果

- 前往首頁：`/index.php` 查看背景效果
- 每次切換背景後，重新整理首頁即可看到新效果

## 注意事項

1. **切換背景需要管理員權限**
2. **動態背景 JS 只在 compact 模式載入**，以優化性能
3. **配置會立即生效**，無需重啟服務器
4. **確保 `/uploads/BG.JPG` 存在**，以便 full 模式正常顯示

## 未來擴展

`dynamic-bg.js` 文件中包含了許多可以實現的效果的註釋範例，你可以：

1. 添加更多背景選項（例如：`full`, `compact`, `particles`, `waves`）
2. 為每個項目添加獨立的背景設定
3. 實現基於時間的自動切換
4. 根據用戶偏好儲存設定
