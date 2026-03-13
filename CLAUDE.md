# FrogMoker 项目记忆

## 项目概述
FrogMoker 是一个报文管理和发送工具，支持 JSON/XML 格式的报文模板管理和多协议发送。

## 技术栈
- 后端：Java + Spring Boot 2.x + MyBatis-Plus + SQLite
- 前端：React 19 + TypeScript + Vite
- UI 框架：shadcn/ui + Tailwind CSS v4
- 代码编辑器：CodeMirror 6
- 主题系统：支持浅色/深色/跟随系统

## 项目结构
- `/frontend` - 前端代码
- `/frontend/src/components` - 通用组件
- `/frontend/src/pages` - 页面组件
- `/frontend/src/components/Layout.tsx` - 主布局组件
- `/frontend/src/components/ThemeSwitcher.tsx` - 主题切换组件（悬停展开式）
- `/frontend/src/components/ThemeToggle.tsx` - 主题切换按钮（简单循环式）
- `/src/main/java/com/hxuanyu/frogmoker` - 后端代码

## 布局设计原则
1. 左侧侧边栏固定，支持折叠/展开（宽度：展开 208px，折叠 64px）
2. 顶部导航栏固定（高度：57px），包含：
    - 菜单按钮
    - 页面标题和描述（整合了原本在页面内的标题区域）
    - 页面操作按钮（由各页面通过 context 传递）
    - 主题切换器（缩小 90%）
    - 帮助按钮（下拉菜单）
3. 右侧内容区域可滚动
4. 重要操作按钮（如发送按钮）应固定在底部，避免被滚动隐藏
5. CodeMirror 编辑器应占满容器，不留白边
6. CodeMirror 根据主题自动切换浅色/深色模式

## 主题系统
- 使用 ThemeProvider 提供全局主题上下文
- 支持三种模式：浅色、深色、跟随系统
- 快捷键 `d` 可快速切换主题
- CodeMirror 编辑器会根据主题自动切换颜色方案
- ThemeSwitcher 组件：桌面端悬停展开，移动端点击循环切换

## 页面结构
- 页面不再包含独立的标题区域，标题和操作按钮统一在顶部导航栏展示
- 页面通过 `useOutletContext` 将操作按钮传递给 Layout
- 页面内容区域直接从顶部开始，空间利用更高效

## 文档更新规范
**重要：每次修改代码后，必须同步更新相关文档**

### 需要更新的文档
1. **README.md** - 项目说明文档
    - 功能特性变更时更新"特性"章节
    - 新增页面/模块时更新"界面预览"章节
    - 技术栈变更时更新"技术栈"章节
    - 新增核心功能时更新"核心功能"章节

2. **DEV.md** - 开发文档
    - 项目结构变更时更新"项目结构"章节
    - 新增 API 接口时更新"接口说明"章节
    - 技术栈升级时更新"技术栈"章节
    - 新增扩展点时添加对应的"开发指南"章节

### 更新时机
- 添加新功能：立即更新 README.md 的特性列表和 DEV.md 的相关章节
- 修改 UI 布局：更新 DEV.md 的项目结构和组件说明
- 新增 API：更新 DEV.md 的接口说明表格
- 技术栈变更：同时更新 README.md 和 DEV.md 的技术栈章节
- 重构代码：检查并更新所有受影响的文档章节

### 更新原则
- 保持文档与代码同步，避免文档过时
- 使用清晰的表格和列表组织信息
- 提供足够的示例代码和说明
- 标注版本信息和更新日期（如有必要）

## 用户偏好
- 界面语言：中文
- 注重视觉美观和操作便利性
- 默认使用浅色主题
- 代码风格：简洁、模块化、易扩展
