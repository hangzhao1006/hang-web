# 消除漸變條帶（Gradient Banding）解決方案

## 問題原因
CSS 漸變在某些情況下會出現明顯的色帶（banding），特別是：
- 漸變跨度大（從透明到不透明）
- 顏色變化緩慢的區域
- 低色深的顯示器

## 解決方案

### ✅ 當前方案：雙層交叉抖動
已應用在 `project.css` 的 `.hero-gradient` 中。

```css
/* 第一層抖動：45° 方向 */
.hero-gradient::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.5;
  background-image: repeating-linear-gradient(
    45deg,
    rgba(255,255,255,0) 0px,
    rgba(255,255,255,0) 1px,
    rgba(255,255,255,0.5) 1px,
    rgba(255,255,255,0.5) 2px
  );
}

/* 第二層抖動：-45° 方向 */
.hero-gradient::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.4;
  background-image: repeating-linear-gradient(
    -45deg,
    rgba(255,255,255,0) 0px,
    rgba(255,255,255,0) 1px,
    rgba(255,255,255,0.5) 1px,
    rgba(255,255,255,0.5) 2px
  );
}
```

---

### 方案 B：使用 SVG 噪點（最自然）

如果條帶還是明顯，用 SVG 噪點效果最好：

```css
.hero-gradient::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.15;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E");
  background-size: 200px 200px;
}
```

**優點：**
- 最自然的抖動效果
- 不會有明顯的線條紋理
- 檔案很小（inline SVG）

**缺點：**
- 需要調整 `baseFrequency` 和 `opacity` 來達到最佳效果

---

### 方案 C：增加漸變層級（最簡單）

不加抖動，而是增加更多漸變色階：

```css
.hero-gradient {
  background: linear-gradient(
    to bottom,
    rgba(255,255,255,0.00) 0%,
    rgba(255,255,255,0.02) 20%,
    rgba(255,255,255,0.04) 35%,
    rgba(255,255,255,0.06) 45%,
    rgba(255,255,255,0.08) 52%,
    rgba(255,255,255,0.11) 58%,
    rgba(255,255,255,0.14) 63%,
    rgba(255,255,255,0.17) 68%,
    rgba(255,255,255,0.22) 73%,
    rgba(255,255,255,0.28) 78%,
    rgba(255,255,255,0.35) 82%,
    rgba(255,255,255,0.43) 86%,
    rgba(255,255,255,0.52) 90%,
    rgba(255,255,255,0.65) 94%,
    rgba(255,255,255,0.80) 97%,
    rgba(255,255,255,1.00) 100%
  );
}
```

**優點：**
- 不需要偽元素
- 性能最好

**缺點：**
- 在某些顯示器上還是會有輕微條帶
- 代碼較長

---

### 方案 D：使用圖片遮罩

創建一個漸變 PNG 並使用噪點濾鏡：

1. 用 Photoshop/Figma 創建漸變
2. 添加 1-3% 的噪點
3. 導出為 PNG
4. 使用為背景圖片

```css
.hero-gradient {
  background-image: url('/assets/gradient-with-noise.png');
  background-size: 100% 100%;
}
```

**優點：**
- 完全控制效果
- 支援複雜的抖動算法

**缺點：**
- 需要額外的 HTTP 請求
- 檔案大小較大

---

## 參數調整指南

### 調整抖動強度

**如果紋理太明顯：**
```css
opacity: 0.2;  /* 降低 opacity */
```

**如果條帶還是明顯：**
```css
opacity: 0.7;  /* 提高 opacity */
```

### 調整紋理密度

**紋理太粗：**
```css
/* 縮小間隔 */
repeating-linear-gradient(
  45deg,
  rgba(255,255,255,0) 0px,
  rgba(255,255,255,0.5) 1px,
  rgba(255,255,255,0) 1px
);
```

**紋理太細：**
```css
/* 擴大間隔 */
repeating-linear-gradient(
  45deg,
  rgba(255,255,255,0) 0px,
  rgba(255,255,255,0) 2px,
  rgba(255,255,255,0.5) 2px,
  rgba(255,255,255,0.5) 4px
);
```

---

## 推薦設定（按效果排序）

1. **最自然：** 方案 B (SVG 噪點)
2. **最平衡：** 當前雙層交叉抖動
3. **最簡單：** 方案 C (增加色階)
4. **最可控：** 方案 D (圖片)

試試看哪個最適合你的設計！
