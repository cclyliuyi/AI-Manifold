# AI-Manifold 优化版网页项目

这是为 GitHub Pages 优化后的版本。

## 上传方式

把本文件夹中的以下内容上传到你的 GitHub 仓库根目录：

- `index.html`
- `assets/`
- `css/`
- `js/`

上传后提交 commit，GitHub Pages 会自动更新。

## 优化点

- 图片从 PNG 转为 WebP，并从 HTML 中拆出，不再 Base64 内嵌。
- 图片使用 `loading="lazy"` 和 `decoding="async"`。
- CSS 与 JS 拆分，浏览器可以缓存。
- Canvas 动态背景降低 DPR、粒子数、流形曲线层数，并限制约 30 FPS。
- 保留滚动演化、中央高信噪比亮点和艺术化流形背景。
