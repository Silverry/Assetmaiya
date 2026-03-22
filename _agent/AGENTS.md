# assetproject 项目规范

本项目使用统一文档 `CLAUDE.md` 作为所有 AI 编程助手的项目规范。

**在开始任何代码修改前，必须读取并遵守 `CLAUDE.md` 中的所有规范。**

---

## 快速引用：核心约束

- **技术栈**: React 18 (CDN)，无构建工具，全局变量通信（无 import/export）
- **JS 加载顺序**: `data.js → theme.js → components.js → pages.js → upload.js → settings.js → app.js`
- **新文件**: 必须在 `index.html` 中注册，且在 `构建.command` 的文件列表中注册
- **单文件限制**: 每个 JS 文件控制在 300 行以内
- **不允许**: `fetch()`、`import/export`、Node 运行时依赖

## 每次 session 的收尾动作（强制执行）

完成代码改动后，**必须**按顺序执行：

1. **更新 `CHANGELOG.md`**
   - 新增功能/页面 → 新建版本条目
   - 在现有页面加字段或小改动 → 追加到当前版本条目
   - 架构调整 → 新建版本条目，标注"架构变更"

2. **更新 `CLAUDE.md`**（如改动影响以下内容）
   - 目录结构变化
   - 新增/删除页面
   - 数据结构变化
   - 新增可复用组件

3. **输出改动文件清单**

---

> 完整规范详见 [`CLAUDE.md`](../CLAUDE.md)
