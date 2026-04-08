# Asset Manager

一个纯前端的资产管理原型，用来演示素材浏览、筛选、标签管理和上传流程。

## 特点

- React 18 CDN + Babel Standalone，零 Node 依赖
- `js/` 源文件按功能拆分，同时保留可直接运行的单文件 `index.html`
- 支持双击打开 `index.html` 预览，也支持通过 `构建.command` 重新内联构建
- 内置演示数据，适合做产品原型、交互讨论和设计迭代

## 快速开始

### 直接打开

1. 双击 `index.html`
2. 用 Chrome 打开即可预览

### 重新构建单文件版本

```bash
bash 构建.command
```

构建脚本会把 `css/` 和 `js/` 内联回 `index.html`，方便继续以单文件方式分发和预览。

## 目录结构

```text
assetproject/
├── index.html
├── design-playground.html
├── 构建.command
├── CHANGELOG.md
├── CLAUDE.md
├── README.md
├── css/
│   └── styles.css
└── js/
    ├── app.js
    ├── components.js
    ├── data.js
    ├── pages.js
    ├── settings.js
    ├── theme.js
    └── upload.js
```

## 开发约束

- 不使用 `import` / `export`
- 新增 JS 文件时，同时更新 `index.html` 和 `构建.command`
- 不使用 `fetch()` / XHR 读取本地文件，保证 `file://` 场景可运行

## 发布说明

- 仓库会忽略本地 AI / 自动化工具状态文件，避免把个人环境配置一并提交
- `index.html` 是可直接运行的分发版本，属于版本控制的一部分
