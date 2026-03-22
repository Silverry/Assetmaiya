# 资产管理中心 - 项目指南

## 1. 项目整体架构

### 技术栈
- **框架**: React 18 (CDN UMD)
- **JSX 编译**: Babel Standalone (浏览器端实时编译)
- **样式方案**: JS 内联样式对象 + 少量 CSS 工具类
- **构建工具**: `构建.command` — 将 js/ + css/ 内联到 index.html，零 Node 依赖
- **开发运行**: `python3 -m http.server 8080` (见 `启动.command`)
- **直接打开**: 双击 `构建.command` 构建后，双击 `index.html` 用 Chrome 直接打开

### 目录结构
```
assetproject/
├── index.html              # 构建产物（内联版），可双击用 Chrome 打开
├── 构建.command             # 双击构建：将 js/ + css/ 内联到 index.html
├── 启动.command             # macOS 一键启动本地服务器
├── CLAUDE.md                # 本文件
├── css/
│   └── styles.css           # 全局样式：reset、滚动条、hover 工具类、动画关键帧
└── js/
    ├── data.js              # 数据层：CATEGORIES、TAG_DIMS、ENTITIES、INITIAL_ASSETS + Asset 类型定义
    ├── theme.js             # 设计令牌：颜色 V、字体、图标库 I、工具函数
    ├── components.js        # 可复用 UI 组件：CBox、Badge、Thumb、CategorySelect、EntityPicker、TagModal
    ├── pages.js             # 主界面组件：TagSidebar、DetailPanel
    ├── upload.js            # 上传流程组件：AssetCard、BatchBar、UploadApp、UploadModal
    ├── settings.js          # 系统设置组件：SettingsModal
    └── app.js               # 主应用组件 App + ReactDOM.render
```

### 核心模块职责
| 模块 | 职责 |
|------|------|
| `data.js` | 定义所有 mock 数据实体和标签体系，提供 `tagById()` 等查询函数，定义 `Asset` JSDoc 类型 |
| `theme.js` | 设计令牌 `V`、字体常量、SVG 图标库 `I`、按钮样式 `btnStyle()`、工具函数 |
| `components.js` | 原子级/分子级可复用组件，通过 props 接收数据，不依赖全局状态 |
| `pages.js` | 主界面页面组件：标签筛选侧栏、资产详情面板 |
| `upload.js` | 上传流程相关组件：资产卡片、批量操作、上传界面及弹窗 |
| `settings.js` | 系统设置弹窗：类别管理、标签树管理 |
| `app.js` | 根组件 `App`，管理全局状态（资产列表、筛选、分页），渲染布局 |

### JS 加载顺序
`index.html` 按以下顺序同步加载并合并编译：
```
data.js → theme.js → components.js → pages.js → upload.js → settings.js → app.js
```
所有文件共享全局作用域（无 import/export），后加载的文件可引用先加载文件中定义的变量。新增文件时需在 `index.html` 的 `scripts` 数组中注册。

## 2. 数据流说明

### 状态管理
- 使用 React `useState` / `useMemo` / `useCallback`，无外部状态库
- 全局状态集中在 `App` 组件：`assets`, `search`, `activeCat`, `selectedTags`, `viewMode`, `selected`, `sortBy`, `page`
- 子组件通过 props + callback 与父组件通信

### Mock 数据位置
所有 mock 数据在 `js/data.js`：
- `CATEGORIES` — 资产类别（场景/角色/生物/道具）
- `TAG_DIMS` — 标签维度树（12 个维度，80+ 标签组，1000+ 标签）
- `ENTITIES` — 实体列表（场景/角色/道具实例）
- `INITIAL_ASSETS` — 自动生成的 80+ 条示例资产
- `ALL_TAGS` / `TM` — 由 `rebuildTags()` 构建的平铺标签索引

### 核心类型定义
`Asset` 类型（JSDoc 定义在 `data.js`）：
```
{ id, name, type, catId, tags[], entId, size, date, color, file? }
```

### 数据流转
```
data.js (CATEGORIES, TAG_DIMS, ENTITIES, INITIAL_ASSETS)
  ↓
app.js App 组件
  ├── assets state ← INITIAL_ASSETS (初始) + UploadApp 上传新增
  ├── filtered (useMemo) ← 经 search / activeCat / selectedTags / sortBy 过滤排序
  └── 通过 props 下发给子组件
```

设置页 `SettingsModal` 直接修改全局变量 `CATEGORIES` / `TAG_DIMS`，通过 `window.dispatchEvent('app_data_updated')` 通知 `App` 刷新。

## 3. 新增页面标准步骤

1. **创建页面组件文件** — 在 `js/` 下新建文件（如 `js/xxx.js`），编写函数组件
2. **在 index.html 注册** — 在 `scripts` 数组中添加文件路径（注意加载顺序：放在 `components.js` 之后、`app.js` 之前）
3. **在 App 中注册** — 在 `js/app.js` 的 `App` 组件中：
   - 新增 `showXxx` state 控制显隐
   - 在 JSX 中添加条件渲染 `{showXxx && <XxxModal onClose={...} />}`
   - 在顶部栏或其他位置添加触发按钮
4. **如需 mock 数据** — 在 `js/data.js` 中定义数据结构

> 当前无路由库，页面切换通过 Modal 叠加或 state 条件渲染实现。

## 4. 新增字段标准步骤

以「给资产新增一个字段」为例：

1. **`js/data.js`** — 在 `Asset` JSDoc typedef 中添加字段说明，在 `INITIAL_ASSETS` 生成逻辑中添加该字段的 mock 值
2. **`js/upload.js`** — 在 `AssetCard` 中添加字段的编辑 UI
3. **`js/pages.js`** — 在 `DetailPanel` 中添加字段的展示 UI
4. **`js/app.js`** — 如需全局筛选/排序，在 `App` 的 `filtered` useMemo 中处理

以「新增标签维度」为例：
1. **`js/data.js`** — 在 `TAG_DIMS` 数组中添加新维度对象
2. 无需改其他代码，`rebuildTags()` 会自动处理

## 5. 命名规范和文件组织约定

### 命名规范
- **组件**: PascalCase 函数组件（`TagModal`, `AssetCard`）
- **变量/函数**: camelCase（`toggleTag`, `selectedTags`）
- **常量**: UPPER_SNAKE_CASE（`CATEGORIES`, `TAG_DIMS`, `ALL_TAGS`）
- **设计令牌**: 短缩写对象 `V`（`V.bg`, `V.border`, `V.ring`）
- **图标库**: 短缩写对象 `I`（`I.Search`, `I.Upload`）
- **CSS 类名**: kebab-case（`hover-dim`, `app-grid-card`）

### 文件组织
- 数据层和视图层严格分离
- `data.js` 只定义数据结构和查询函数，不含 JSX
- `theme.js` 只定义视觉常量和工具函数（图标除外——图标是 JSX 但属于设计系统）
- `components.js` 中的组件通过 props 接口通信，不直接读写全局 state
- 页面级组件按功能域拆分为独立文件（`pages.js`、`upload.js`、`settings.js`），每个文件控制在 300 行以内
- 新增功能域时创建新文件，避免单个文件过长

## 6. 打包成单 HTML 的注意事项

### 当前已满足的条件
- 零 Node 依赖，所有库通过 CDN `<script>` 引入
- 无 `import` / `export`，所有文件通过全局变量通信
- 样式使用 JS 内联 + 一个 CSS 文件，无预处理器
- 无文件系统（`fs`）或 Node 运行时依赖
- 无 `fetch()` 调用，`file://` 协议下可正常运行

### 构建方式
双击 `构建.command` 即可，它会：
1. 将 `css/styles.css` 内联到 `<style>` 标签
2. 按加载顺序拼合所有 JS 文件，放入 `<script type="text/babel">`
3. CDN 依赖（React、ReactDOM、Babel）保持 `<script src>` 引用

### 开发流程
1. 编辑 `js/` 下的源文件
2. 双击 `构建.command` 重新生成 `index.html`
3. 双击 `index.html` 在 Chrome 中查看

> 也可以用 `启动.command` 启动本地服务器，直接加载 js/ 源文件，免去每次构建（但 `index.html` 内容需为内联版或 XHR 加载版）。

### 注意事项
- 新增 JS 文件后，需在 `构建.command` 的文件列表中注册
- 避免在代码中使用 `fetch()` 加载本地文件（会在 `file://` 协议下失败）
- Chrome 在 `file://` 下禁止 XHR，因此必须使用内联版 index.html

## 7. 维护规范

### CHANGELOG.md 更新规则
每次完成代码改动后，必须同步更新 CHANGELOG.md：
- 新增功能/页面/流程 → 新建版本条目
- 在现有页面加字段或小改动 → 追加到当前版本条目
- 架构调整 → 新建版本条目，标注"架构变更"

### CLAUDE.md 更新规则
凡改动影响以下内容，必须同步更新对应章节：
- 目录结构变化
- 新增/删除页面
- 数据结构变化
- 新增可复用组件

### 每次 session 结束的标准收尾动作
1. 更新 CHANGELOG.md
2. 更新 CLAUDE.md 受影响章节
3. 输出改动文件清单
4. **执行 Git 提交**（见下方 Git 规范）

## 8. Git 版本管理规范

本项目已初始化 Git 仓库（本地），所有代码改动必须在 session 结束时提交。

### 每次 session 结束必须执行 Git 提交

```bash
cd '/Users/silverry/Library/Mobile Documents/com~apple~CloudDocs/资产库/assetproject'
git add -A
git commit -m "<类型>: <改动摘要>"
```

### Commit Message 格式规范

| 类型 | 含义 | 示例 |
|------|------|------|
| `feat` | 新功能/新页面 | `feat: 新增资产批量导出功能` |
| `fix` | 修复 Bug | `fix: 修复标签筛选不生效问题` |
| `style` | UI 样式调整 | `style: 调整详情面板配色` |
| `refactor` | 重构（不改变功能）| `refactor: 拆分 app.js 为独立模块` |
| `docs` | 更新文档 | `docs: 更新 CLAUDE.md 架构说明` |
| `chore` | 构建/维护 | `chore: 更新 .gitignore` |

### 查看历史版本

```bash
git log --oneline         # 查看提交历史
git diff HEAD~1           # 查看上一次改了什么
git checkout <hash> -- js/app.js  # 恢复某个文件到指定版本
git checkout <hash>       # 切换到某个历史版本（只读查看）
git checkout main         # 回到最新版本
```

### 回滚到历史版本

```bash
# 查找并切换到目标版本
git log --oneline
git revert <hash>         # 安全回滚：创建新提交来撤销指定版本的改动（推荐）
# 或
git reset --hard <hash>   # 强制回滚到指定版本（会丢失之后的提交，谨慎使用）
```

> ⚠️ **注意**：`git reset --hard` 会永久丢失回滚点之后的提交。如果只是想查看历史代码，优先用 `git checkout <hash>` 查看，再 `git checkout main` 返回。

### 不需要推送远程

本项目当前使用**纯本地 Git**，不需要 push 到 GitHub/GitLab，历史版本保存在本地 `.git/` 目录中。
