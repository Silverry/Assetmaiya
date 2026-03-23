# CHANGELOG

## [v1.0.5] - 2026-03-23 — 首页卡片视图重构

### 变更范围
- **`js/app.js`**：
  - 卡片信息精简：仅展示类别角标、图片占位区、资产名称，去掉大小/日期/标签
  - 卡片比例按激活类别动态切换：场景 `16:9`、角色 `9:16`、全部/其他 `1:1`
  - 移除列表视图（`viewMode` state + 列表渲染分支），仅保留卡片视图
  - 移除排序切换（`sortBy` state + 下拉选择器），固定为上传时间倒序
  - 新增布局切换按钮组：**多列**（`auto-fill minmax(180px,1fr)`，快速浏览）和 **3列**（`repeat(3,1fr)`，宽卡片）

## [v1.0.4] - 2026-03-23 — Design Playground

### 变更范围
- **新增 `design-playground.html`**（独立工具文件，不影响主应用）：
  - 单文件交互式设计沙盒，无外部依赖，可在浏览器直接打开
  - 实时预览组件：资产卡片（×3）、标签弹窗、按钮组、徽章、输入框
  - 可调节控件：主色 + 高亮色（色块快选 + 颜色选择器）、基础/大/Checkbox 圆角、卡片/弹窗/按钮间距、五类字体大小、缩略图尺寸
  - 内置 6 套预设：默认 / 圆润 / 极简 / 科技蓝 / 暖棕 / 紫墨
  - 底部提示词栏：自动生成可直接粘贴给 Claude 的 `theme.js` 修改指令，带一键复制

### 不在本次范围内
- 未修改主应用任何文件（`js/`、`css/`、`index.html` 均未变动）

## [v1.0.3] - 2026-03-22 — 初始化 Git 本地版本管理

### 变更范围
- **版本控制初始化**：
  - 在本地项目根目录初始化 Git 仓库。
  - 创建 `.gitignore` 文件，忽略系统缓存（.DS_Store 等）和 IDE 临时文件，确保可运行的 `index.html` 被纳入管理。
  - 已完成首次全量代码提交（`feat: 初始化版本管理 - 导入现有项目`）。
- **流程规范更新**：
  - **`CLAUDE.md`**：新增「8. Git 版本管理规范」说明本地提交、切换回滚等命令，确保新会话可识别配置。
  - **`_agent/workflows/session-start.md`**：更新「每次 session 结束的标准收尾动作」，加入要求进行 Git 提交的显式指令。

## [v1.0.2] - 2026-03-22 — 防御性空值处理

### 变更范围
- **`js/theme.js`**（3 处）：
  - `ft()`: 对 `f?.type` 添加可选链 + 空值合并，防止 file 对象缺少 type 属性时崩溃
  - `isValid()`: 同上，先判断 `f?.type` 存在再执行 MIME 匹配
  - `readEntries()`: 末尾兜底 `return Promise.resolve([])` 替代裸 `[]`，保持返回类型一致为 Promise
- **`js/components.js`**（4 处）：
  - TagModal 内 `cntG()` / `sgCnt` / 标签数显示 / 标签列表渲染：`sg.tagObjs` → `(sg.tagObjs ?? [])`
- **`js/pages.js`**（7 处）：
  - TagSidebar: `dimCnt()` / `grpCnt()` / 搜索过滤 / 标签数显示 / 标签列表渲染中 `g.tagObjs` → `(g.tagObjs ?? [])`
  - DetailPanel: `asset.file.name` → `asset.file?.name`；`asset.tags` → `(asset.tags ?? [])`
- **`js/upload.js`**（4 处）：
  - AssetCard: 标签计数、标签列表渲染、标签移除中 `asset.tags` → `(asset.tags ?? [])`
  - BatchBar: `bTags.map()` → `(bTags ?? []).map()`
  - 上传校验: `a.tags.some()` → `(a.tags ?? []).some()`
- **`js/app.js`**（6 处）：
  - 筛选管线: `a.tags.includes()` → `(a.tags ?? []).includes()`
  - 筛选栏: `Array.from(selectedTags)` → `Array.from(selectedTags ?? [])`
  - 网格视图: `a.tags.length` / `a.tags.slice()` → `(a.tags ?? [])` 兜底（3 处）
  - 列表视图: 同上（2 处）
  - 渲染入口: `document.getElementById('root')` 添加存在性判断

### 不在本次范围内
- 未修改任何功能逻辑
- 未修改 MOCK_ 数据
- 未修改函数命名和结构

---

## [v1.0.1] - 2026-03-22 — Dead Code 清除 + 注释质量优化

### 变更范围
- **Dead Code 清除（任务1）**：
  - `js/theme.js`: 删除未使用的图标 `I.FolderOpen`（~1行定义）
  - `css/styles.css`: 删除未使用的 CSS 规则 `.hover-badge-close`（~3行）
  - `js/app.js`: 标注 `updateKey` 为 `[UNCERTAIN]`（值未被直接读取，仅通过 setter 触发 re-render）
  - 所有删除位置保留 `// [REMOVED]` 标注说明原因
- **注释质量优化（任务2）**：
  - 7 个 JS 文件顶部增加模块职责、依赖关系、被依赖关系说明
  - `app.js` 中 App 组件的 13 个 useState 字段增加写入方/读取方标注
  - 10 个超过 15 行的函数增加 JSDoc 格式的功能、参数、副作用说明
  - 5 处非显而易见的条件判断增加行内注释
- **兼容性问题**：未发现违反单文件 HTML 约束的代码（无 fetch、无 import、无外部文件引用）

### 不在本次范围内
- 未修改任何功能逻辑
- 未删除任何 MOCK_ 前缀变量
- 未调整代码结构和执行顺序

---

## [v1.0] - 2026-03-22

### 背景
初始基线版本。纯前端资产管理原型，用于产品演示和功能迭代。React 18 + Babel Standalone 浏览器端编译，零 Node 依赖，支持双击 index.html 直接打开。

### 变更范围
- 页面：
  - **主界面（App）** — 资产列表（网格/列表双视图）、搜索、分类 Tab 切换、标签筛选、排序、分页
  - **标签筛选侧栏（TagSidebar）** — 三级树形结构（维度→组→标签），支持搜索、折叠、多选筛选
  - **资产详情面板（DetailPanel）** — 预览（支持全屏）、基本信息展示、标签编辑、下载、删除
  - **上传流程（UploadApp/UploadModal）** — 拖拽/选择文件及文件夹上传，单个资产设置类别和标签，批量操作栏，必选标签校验
  - **系统设置（SettingsModal）** — 类别管理（CRUD）、标签维度树管理（维度→组→标签的增改，必选维度标记）
  - **标签选择弹窗（TagModal）** — 按维度分 Tab 浏览，支持搜索、全选/清空、已选预览
- 数据：
  - `js/data.js` — CATEGORIES（4 类别）、TAG_DIMS（14 维度、80+ 标签组、1000+ 标签）、ENTITIES（5 实体）、INITIAL_ASSETS（80+ 自动生成演示资产）
  - Asset JSDoc 类型定义：id、name、type、catId、tags、entId、size、date、color、file
  - `rebuildTags()` 构建平铺标签索引 ALL_TAGS / TM，`tagById()` 查询函数
- 组件：
  - `js/components.js` — CBox（复选框）、Badge（标签徽章）、Thumb（文件缩略图）、CategorySelect（类别下拉）、EntityPicker（实体选择器）、TagModal（标签选择弹窗）
  - `js/theme.js` — 设计令牌 V、字体常量、SVG 图标库 I（20 个图标）、btnStyle() 按钮样式生成器、fmtSz() 文件大小格式化、uid() 随机 ID、readEntries() 目录递归读取
- 架构：
  - 7 个 JS 源文件按功能域拆分，每文件 ≤300 行
  - `构建.command` 一键内联构建
  - 全局作用域共享，无 import/export，支持打包成单 HTML

### 不在本次范围内
- 真实 API 对接（当前为纯 mock 数据）
- 用户登录/权限系统
- 资产版本管理
- 批量导入/导出
- 数据持久化（刷新后重置为初始数据）

### 验收标准
- [x] 主界面资产列表正常展示，网格/列表视图切换正常
- [x] 搜索、分类切换、标签筛选、排序功能正常
- [x] 分页功能正常，支持 30/50/100 条/页切换
- [x] 上传流程：拖拽/选择文件、设置类别和标签、批量操作、必选标签校验
- [x] 资产详情面板：预览、全屏、下载、删除、标签编辑
- [x] 系统设置：类别增改、标签维度树增改、必选维度标记
- [x] 双击 `构建.command` 后双击 `index.html` 可在 Chrome 中正常打开
- [ ] 真实文件上传后的持久化存储
- [ ] 实体关联功能的完整 UI 展示（当前隐藏）
