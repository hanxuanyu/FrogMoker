# FrogMoker

<div align="center">

一个现代化的 Mock 测试工具，提供报文管理、协议客户端模拟等功能

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-2.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

</div>

## ✨ 特性

- 🎯 **报文模板管理** - 支持 JSON/XML 格式报文的增删改查
- 🔄 **变量占位符** - 灵活的变量系统，支持固定值、序列号等多种生成器
- 📤 **协议客户端** - 内置 HTTP 客户端，支持扩展其他协议
- 🎨 **现代化 UI** - 基于 React + Tailwind CSS，支持深浅色主题
- 📝 **代码编辑器** - 集成 CodeMirror，提供语法高亮和自动补全
- 🚀 **开箱即用** - 使用 SQLite，无需额外配置数据库

## 🖥️ 界面预览

### 报文管理
- 报文模板列表展示
- 支持展开/折叠查看详情
- 实时预览和渲染

### 报文发送
- 左侧配置区域：选择模板、配置协议参数
- 右侧预览区域：上半部分显示请求内容，下半部分显示响应结果
- 支持自定义报文输入
- 响应内容支持格式化和复制

### 主题系统
- 浅色模式
- 深色模式
- 跟随系统
- 悬停展开式主题切换器

## 🚀 快速开始

### 环境要求

- JDK 8+
- Node.js 16+
- Maven 3.6+

### 本地运行

1. **克隆项目**
```bash
git clone https://github.com/hanxuanyu/FrogMoker.git
cd FrogMoker
```

2. **启动后端**
```bash
mvn spring-boot:run
```

3. **启动前端（开发模式）**
```bash
cd frontend
npm install
npm run dev
```

4. **访问应用**
- 前端界面：http://localhost:5173
- 后端 API：http://localhost:8080
- API 文档：http://localhost:8080/doc.html

### 生产部署

```bash
# 构建前端
cd frontend
npm run build

# 打包后端（包含前端静态资源）
cd ..
mvn package

# 运行
java -jar target/FrogMoker-*.jar
```

访问 http://localhost:8080 即可使用完整应用。

## 📚 技术栈

### 后端
- **框架**: Spring Boot 2.x
- **持久层**: MyBatis-Plus + SQLite（可切换 MySQL）
- **API 文档**: Knife4j + SpringDoc OpenAPI 3

### 前端
- **框架**: React 19 + TypeScript
- **构建工具**: Vite
- **UI 组件**: Tailwind CSS v4 + shadcn/ui
- **代码编辑器**: CodeMirror 6
- **主题系统**: 支持浅色/深色/跟随系统
- **HTTP 客户端**: Axios

## 📖 核心功能

### 1. 报文模板管理

支持创建、编辑、删除报文模板，模板内容支持变量占位符：

- **JSON 格式**: 使用 `{{变量名}}` 作为占位符
- **XML 格式**: 使用 `${变量名}` 作为占位符

### 2. 变量生成器

内置多种变量生成器，支持扩展：

| 生成器 | 说明 | 参数 |
|--------|------|------|
| 固定值 | 每次返回相同的值 | value（必填） |
| 序列号 | 自增序列号，支持前缀和补零 | prefix、padding、step |

### 3. 协议客户端

支持通过不同协议发送报文：

- **HTTP 客户端**: 支持 GET/POST/PUT/DELETE 等方法
- **扩展性**: 可通过实现 `ProtocolClient` 接口添加新协议

### 4. 界面特性

- **响应式布局**: 适配不同屏幕尺寸
- **侧边栏**: 支持折叠/展开
- **主题切换**: 浅色/深色/跟随系统
- **代码编辑器**: 语法高亮、自动补全、格式化
- **实时预览**: 报文渲染结果实时展示

## 🔧 扩展开发

### 新增变量生成器

1. 实现 `VariableValueGenerator` 接口
2. 添加 `@Component` 注解
3. 实现 `getType()`、`getDescriptor()` 和 `generate()` 方法

详见 [DEV.md](DEV.md#开发指南新增变量生成器)

### 新增协议客户端

1. 实现 `ProtocolClient` 接口
2. 添加 `@Component` 注解
3. 实现协议相关的发送逻辑

系统会自动发现并注册新的协议客户端。

## 📁 项目结构

```
FrogMoker/
├── frontend/              # 前端源码
│   ├── src/
│   │   ├── components/    # React 组件
│   │   ├── pages/         # 页面组件
│   │   ├── api/           # API 封装
│   │   └── types/         # TypeScript 类型
│   └── package.json
├── src/main/java/         # 后端源码
│   └── com/hxuanyu/frogmoker/
│       ├── controller/    # 控制器
│       ├── service/       # 业务逻辑
│       ├── entity/        # 数据实体
│       └── config/        # 配置类
├── data/                  # 运行时数据（自动创建）
│   └── db/
│       └── frogmoker.db   # SQLite 数据库
├── DEV.md                 # 开发文档
└── README.md              # 项目说明
```

## 📝 API 文档

启动应用后访问 http://localhost:8080/doc.html 查看完整的 API 文档。

主要接口：

- `/api/v1/message-templates` - 报文模板管理
- `/api/v1/protocol-clients` - 协议客户端

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

[MIT License](LICENSE)

## 🔗 相关链接

- [开发文档](DEV.md)
- [问题反馈](https://github.com/hanxuanyu/FrogMoker/issues)
- [GitHub 仓库](https://github.com/hanxuanyu/FrogMoker)

---

<div align="center">
Made with ❤️ by hxuanyu
</div>
