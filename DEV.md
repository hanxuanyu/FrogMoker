# FrogMoker 开发文档

## 项目简介

FrogMoker 是一个 Mock 测试工具，提供报文管理、服务模拟和客户端模拟三大功能。当前已实现**报文管理**模块，支持 JSON/XML 报文模板的增删改查、变量占位与渲染。

---

## 技术栈

| 层次 | 技术 |
|------|------|
| 后端框架 | Spring Boot 2.x |
| 持久层 | MyBatis-Plus 3.5.5 + SQLite（可平滑切换 MySQL） |
| 接口文档 | Knife4j 4.4.0 + SpringDoc OpenAPI 3 |
| 前端框架 | React 19 + TypeScript + Vite |
| UI 组件库 | Tailwind CSS v4 + shadcn/ui |
| 代码编辑器 | CodeMirror 6（@uiw/react-codemirror） |
| HTTP 客户端 | Axios |

---

## 项目结构

```
FrogMoker/
├── data/                          # 运行时数据目录（自动创建）
│   └── db/
│       └── frogmoker.db           # SQLite 数据库文件
├── frontend/                      # 前端源码（React + Vite）
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── index.ts           # 后端 API 封装（axios）
│   │   ├── components/
│   │   │   ├── ui/                # shadcn/ui 基础组件
│   │   │   ├── Layout.tsx         # 侧边栏导航布局
│   │   │   ├── TemplateFormDialog.tsx  # 新建/编辑报文模板弹窗
│   │   │   └── VariableEditor.tsx # 变量生成器配置组件
│   │   ├── pages/
│   │   │   └── TemplatesPage.tsx  # 报文模板列表页
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript 类型定义
│   │   ├── lib/
│   │   │   └── utils.ts           # 工具函数（cn 等）
│   │   ├── App.tsx                # 路由入口
│   │   ├── main.tsx               # 应用挂载点
│   │   └── index.css              # 全局样式
│   ├── package.json
│   └── vite.config.ts             # Vite 配置（代理、构建输出路径）
└── src/main/java/com/hxuanyu/frogmoker/
    ├── FrogMokerApplication.java  # 启动类，打印访问地址
    ├── common/                    # 公共基础类
    │   ├── Result.java            # 统一响应体
    │   ├── BusinessException.java # 业务异常
    │   └── GlobalExceptionHandler.java  # 全局异常处理
    ├── config/                    # 配置类
    │   ├── CorsConfig.java        # 跨域配置
    │   ├── DataSourceInitializer.java   # 启动时自动建表
    │   ├── MetaObjectHandlerConfig.java # 自动填充创建/更新时间
    │   ├── MybatisPlusConfig.java # MapperScan + 分页插件
    │   └── OpenApiConfig.java     # Knife4j/Swagger 配置
    ├── controller/                # 控制器层
    │   ├── MessageTemplateController.java  # 报文模板 REST 接口
    │   └── SpaController.java     # 前端 SPA 路由回退
    ├── dto/                       # 数据传输对象
    │   ├── FormatMessageRequest.java
    │   ├── MessageTemplateDetailResponse.java
    │   ├── MessageTemplateSummaryResponse.java
    │   ├── ParseVariablesRequest.java
    │   ├── RenderTemplateRequest.java
    │   ├── SaveMessageTemplateRequest.java
    │   ├── TemplateVariableRequest.java
    │   └── TemplateVariableResponse.java
    ├── entity/                    # 数据库实体
    │   ├── MessageTemplate.java   # 报文模板表
    │   ├── TemplateVariable.java  # 模板变量表
    │   └── GeneratorSequenceState.java  # 序列号生成器状态表
    ├── mapper/                    # MyBatis-Plus Mapper
    │   ├── MessageTemplateMapper.java
    │   ├── TemplateVariableMapper.java
    │   └── GeneratorSequenceStateMapper.java
    └── service/                   # 业务逻辑层
        ├── MessageTemplateService.java  # 报文模板核心业务
        ├── generator/             # 变量生成器体系
        │   ├── VariableValueGenerator.java        # 生成器接口（扩展点）
        │   ├── VariableGeneratorDescriptor.java   # 生成器描述信息
        │   ├── VariableGeneratorParamDescriptor.java  # 参数描述信息
        │   ├── VariableGeneratorRegistry.java     # 生成器注册中心
        │   ├── FixedDataVariableGenerator.java    # 内置：固定值生成器
        │   └── SequenceVariableGenerator.java     # 内置：序列号生成器
        └── processor/             # 报文内容处理器体系
            ├── MessageContentProcessor.java       # 处理器接口（扩展点）
            ├── MessageContentProcessorFactory.java # 处理器工厂
            ├── JsonMessageContentProcessor.java   # JSON 报文处理器（占位符 {{var}}）
            └── XmlMessageContentProcessor.java    # XML 报文处理器（占位符 ${var}）
```

---

## 接口说明

所有接口以 `/api/v1` 开头，启动后可通过以下地址访问：

- **接口文档（Knife4j）**：http://localhost:8080/doc.html
- **API 基础地址**：http://localhost:8080/api/v1

### 报文模板接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/message-templates` | 获取模板列表 |
| GET | `/api/v1/message-templates/{id}` | 获取模板详情 |
| POST | `/api/v1/message-templates` | 创建模板 |
| PUT | `/api/v1/message-templates/{id}` | 更新模板 |
| DELETE | `/api/v1/message-templates/{id}` | 删除模板 |
| POST | `/api/v1/message-templates/format` | 格式化报文内容 |
| POST | `/api/v1/message-templates/parse-variables` | 解析报文中的变量列表 |
| POST | `/api/v1/message-templates/render` | 渲染报文（填充变量值） |
| GET | `/api/v1/message-templates/generators` | 获取所有可用生成器描述 |

---

## 占位符格式

| 报文类型 | 占位符格式 | 示例 |
|----------|-----------|------|
| JSON | `{{变量名}}` | `{"name": "{{userName}}"}` |
| XML | `${变量名}` | `<name>${userName}</name>` |

---

## 数据存储

- 数据库文件位于 `data/db/frogmoker.db`（应用启动时自动创建）
- 数据源配置在 `application.yml` 的 `spring.datasource` 节点
- 切换至 MySQL 只需修改 `application.yml` 中的 `url`、`driver-class-name` 及添加对应依赖，业务代码无需改动

---

## 开发指南：新增变量生成器

变量生成器采用**接口 + Spring Bean 自动发现**的扩展机制，新增生成器只需以下三步。

### 第一步：实现 `VariableValueGenerator` 接口

在 `service/generator/` 目录下新建生成器类，实现以下三个方法：

```java
package com.hxuanyu.frogmoker.service.generator;

import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;

@Component  // 必须注册为 Spring Bean，Registry 会自动发现
public class RandomUuidVariableGenerator implements VariableValueGenerator {

    /**
     * 生成器类型标识，全局唯一，建议使用大写下划线风格
     */
    @Override
    public String getType() {
        return "RANDOM_UUID";
    }

    /**
     * 返回生成器的描述信息，供前端展示参数配置表单
     */
    @Override
    public VariableGeneratorDescriptor getDescriptor() {
        return new VariableGeneratorDescriptor(
            getType(),
            "随机 UUID",
            "每次渲染时生成一个随机的 UUID 字符串",
            List.of(
                // 参数描述：name, label, description, required, defaultValue
                new VariableGeneratorParamDescriptor(
                    "uppercase",          // 参数 key（与 params.get("uppercase") 对应）
                    "大写",               // 前端显示的标签
                    "是否输出大写格式，填写 true 或 false",
                    false,                // 是否必填
                    "false"               // 默认值
                )
            )
        );
    }

    /**
     * 根据参数生成变量值
     *
     * @param variableId 变量 ID（有状态生成器可用此 ID 隔离状态，无状态生成器可忽略）
     * @param params     前端/用户配置的参数 Map，key 与 getDescriptor() 中的参数 name 对应
     * @return 生成的变量值字符串
     */
    @Override
    public String generate(Long variableId, Map<String, String> params) {
        String uuid = java.util.UUID.randomUUID().toString().replace("-", "");
        boolean uppercase = Boolean.parseBoolean(params.getOrDefault("uppercase", "false"));
        return uppercase ? uuid.toUpperCase() : uuid;
    }
}
```

### 第二步：（可选）有状态生成器的持久化

如果生成器需要跨请求保持状态（例如自增序列号），可参考 `SequenceVariableGenerator` 的实现：

- 使用 `GeneratorSequenceState` 实体和 `GeneratorSequenceStateMapper` 存储状态
- 以 `variableId` 作为状态隔离键，确保不同变量的序列互不干扰
- 在 `generate()` 方法中读取、更新并保存状态

### 第三步：验证

重启应用后，调用以下接口确认新生成器已被注册：

```
GET /api/v1/message-templates/generators
```

响应中应包含新生成器的 `type`、`name`、`description` 及参数列表。前端的变量配置弹窗会自动读取此接口，无需修改前端代码即可展示新生成器的参数配置表单。

---

### 内置生成器参考

| 类型标识 | 类名 | 说明 | 参数 |
|----------|------|------|------|
| `FIXED` | `FixedDataVariableGenerator` | 固定值，每次返回相同字符串 | `value`（必填）：固定值内容 |
| `SEQUENCE` | `SequenceVariableGenerator` | 自增序列号，支持前缀和补零 | `prefix`：前缀字符串；`padding`：补零位数；`step`：步长（默认 1） |

---

## 开发指南：新增报文处理器

报文处理器负责从报文内容中**解析变量**和**渲染变量**，不同报文格式对应不同处理器。

### 实现 `MessageContentProcessor` 接口

在 `service/processor/` 目录下新建处理器类：

```java
@Component
public class YamlMessageContentProcessor implements MessageContentProcessor {

    @Override
    public String getMessageType() {
        return "YAML";  // 对应 MessageTemplate.messageType 字段值
    }

    @Override
    public List<String> parseVariables(String content) {
        // 解析内容中的占位符，返回变量名列表
    }

    @Override
    public String render(String content, Map<String, String> variableValues) {
        // 将占位符替换为实际变量值，返回渲染后的内容
    }
}
```

`MessageContentProcessorFactory` 会自动发现所有实现了该接口的 Spring Bean，无需手动注册。

---

## 本地开发

### 后端

```bash
# 编译
mvn compile

# 运行测试
mvn test

# 启动应用（访问 http://localhost:8080）
mvn spring-boot:run
```

### 前端

```bash
cd frontend

# 安装依赖
npm install

# 开发模式（使用绝对路径 http://localhost:8080/api/v1 访问后端）
npm run dev

# 生产构建（产物直接输出到 src/main/resources/static，使用相对路径 /api/v1）
npm run build
```

### 一体化打包

```bash
# 先构建前端，再打包后端（前端产物已在 src/main/resources/static）
cd frontend && npm run build
cd .. && mvn package

# 运行 jar
java -jar target/FrogMoker-*.jar
```
