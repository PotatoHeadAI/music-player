# 🎵 Music Player (Headless UI + UnoCSS + Iconify)

一个部署在 **GitHub Pages** 上的纯前端音乐播放网站：支持播放列表、上一首/下一首、进度条、音量控制、静音、本地音频拖拽导入、以及通过 URL 添加歌曲。

> 说明：GitHub Pages 不能运行后端，因此这里采用 **浏览器 Audio API** 在前端完成播放逻辑；项目使用 Node.js 工具链（Vite）进行开发与构建。

## ✨ Features

- 播放/暂停、上一首/下一首
- 进度条拖动快进/快退
- 音量调节、静音
- 播放列表管理（点击切歌、删除）
- **本地音频导入**：选择文件或拖拽音频文件导入（不会上传）
- **URL 添加歌曲**：Headless UI 弹窗输入可直链的音频地址
- 本地保存：播放列表 & 音量会保存在 LocalStorage

## 🧱 Tech Stack

- React + TypeScript
- Vite
- **Headless UI**（Dialog）
- **UnoCSS**（utility-first）
- **Iconify**（`preset-icons` + `@iconify-json/mdi`）

## 🚀 Development

```bash
pnpm install
pnpm dev
```

## 🏗️ Build

```bash
pnpm build
pnpm preview
```

## 📦 Deploy to GitHub Pages

本项目已为 GitHub Pages 做了基础配置：
- `vite.config.ts` 设置 `base: './'`

发布方式：
1. Push 到 GitHub
2. 在仓库 Settings → Pages 选择从 `main` 分支部署（根目录 `/`），或使用 GitHub Actions 部署 `dist/`

## ⚠️ Notes

- 通过 URL 播放音频可能会受到 **跨域 (CORS)** 限制；建议使用允许跨域的音频源，或直接导入本地音频文件。

## 📄 License

MIT
