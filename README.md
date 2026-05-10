# AI-Manifold GitHub Pages 优化修正版

这是为 GitHub Pages 优化后的版本，可直接部署到仓库根目录。

## 上传方式

把本文件夹中的以下内容上传到你的 GitHub 仓库根目录：

- `index.html`
- `assets/`
- `css/`
- `js/`
- `README.md`（可选）

上传后提交 commit，GitHub Pages 会自动更新。

## 本版修正

- 修复“AI 处理增益 ≈ n/K”公式排版，避免 K 偏移过大。
- 恢复并增强背景的流动粒子、流形光带和聚合动画。
- 保留优化：图片 WebP、懒加载、CSS/JS 拆分、Canvas 控制帧率。
- 最终高信噪比亮点仍在页面正中央。

## 推荐上传结构

```text
AI-Manifold/
  index.html
  assets/
  css/
  js/
  README.md
```

## v3 修复说明

- 修复“AI 处理增益 ≈ n / K”公式：改为稳定的一行排版，避免 n/K 被字体和行高挤歪。
- 恢复并增强动态流形背景：粒子数量适度增加、流形光带层数恢复、中央聚合光丝更明显。
- 保持优化结构：图片仍为 WebP 外部资源，`loading=lazy`，CSS/JS 拆分，适合 GitHub Pages。
