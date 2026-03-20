# FrogMoker 开发文档

## 项目简介

FrogMoker 是一个 Mock 测试工具，提供报文管理、服务模拟和客户端模拟三大功能。当前已实现**报文管理**和**报文发送**模块，支持 JSON/XML 报文模板的增删改查、变量占位与渲染，以及通过多种协议客户端发送报文。

---

## 技术栈

| 层次 | 技术 |
|------|------|
| 后端框架 | Spring Boot 2.x |
| 持久层 | MyBatis-Plus 3.5.5 + MySQL（兼容 SQLite） |
| 接口文档 | Knife4j 4.4.0 + SpringDoc OpenAPI 3 |
| 前端框架 | React 19 + TypeScript + Vite |
| UI 组件库 | Tailwind CSS v4 + shadcn/ui |
| 主题系统 | 支持浅色/深色/跟随系统 |
| 代码编辑器 | CodeMirror 6（@uiw/react-codemirror） |
| HTTP 客户端 | Axios |

---

## 项目结构

```
FrogMoker/
├── frontend/                      # 前端源码（React + Vite）
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── index.ts           # 后端 API 封装（axios）
│   │   ├── components/
│   │   │   ├── ui/                # shadcn/ui 基础组件
│   │   │   ├── Layout.tsx         # 主布局（侧边栏 + 顶部导航栏）
│   │   │   ├── ThemeSwitcher.tsx  # 主题切换器（悬停展开式）
│   │   │   ├── ThemeToggle.tsx    # 主题切换按钮（简单循环式）
│   │   │   ├── theme-provider.tsx # 主题上下文提供者
│   │   │   ├── TemplateFormDialog.tsx  # 新建/编辑报文模板弹窗
│   │   │   └── VariableEditor.tsx # 变量生成器配置组件
│   │   ├── pages/
│   │   │   ├── TemplatesPage.tsx  # 报文模板列表页
│   │   │   └── SenderPage.tsx     # 报文发送页
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
    │   ├── ProtocolClientController.java   # 协议客户端 REST 接口
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

### 协议客户端接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/protocol-clients` | 获取所有可用协议客户端描述 |
| POST | `/api/v1/protocol-clients/send` | 发送报文 |

---

## 占位符格式

| 报文类型 | 占位符格式 | 示例 |
|----------|-----------|------|
| JSON | `{{变量名}}` | `{"name": "{{userName}}"}` |
| XML | `${变量名}` | `<name>${userName}</name>` |

---

## 数据存储

- 数据源配置在 `application.yml` 的 `spring.datasource` 节点
- 默认使用 MySQL，连接地址为 `192.168.31.40:3306/frogmocker`
- 默认账号密码均为 `frogmocker`
- 应用启动时会按数据库类型自动执行 `schema-mysql.sql` 或 `schema-sqlite.sql`，在空库中自动建表
- 如需切回 SQLite，可将 `spring.datasource.url` 改为 `jdbc:sqlite:data/db/frogmoker.db`，并将 `driver-class-name` 改为 `org.sqlite.JDBC`

---

## 开发指南：新增变量生成器

变量生成器采用**接口 + Spring Bean 自动发现**的扩展机制，新增生成器只需以下三步。

### 第一步：实现 `VariableValueGenerator` 接口

在 `service/generator/` 目录下新建生成器类，实现以下三个方法：

```java
package com.hxuanyu.frogmocker.service.generator;

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

## 开发指南：新增协议客户端

协议客户端负责通过特定协议发送报文，支持丰富的参数类型和参数联动机制。系统采用**接口 + Spring Bean 自动发现**的扩展机制，新增客户端只需实现接口并注册为 Spring Bean。

### 第一步：实现 `ProtocolClient` 接口

在 `service/client/` 目录下新建客户端类，实现以下三个方法：

```java
package com.hxuanyu.frogmocker.service.client;

import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Map;

@Component  // 必须注册为 Spring Bean，Registry 会自动发现
public class CustomProtocolClient implements ProtocolClient {

    private static final String PROTOCOL = "CUSTOM";

    /**
     * 协议标识，全局唯一，建议使用大写
     */
    @Override
    public String getProtocol() {
        return PROTOCOL;
    }

    /**
     * 返回客户端的描述信息，供前端展示参数配置表单
     */
    @Override
    public ProtocolClientDescriptor getDescriptor() {
        return new ProtocolClientDescriptor(
                PROTOCOL,
                "自定义协议客户端",
                "通过自定义协议发送报文",
                Arrays.asList(
                        // 参数描述列表，详见下文
                )
        );
    }

    /**
     * 发送报文的核心逻辑
     *
     * @param message 报文内容（可能为空字符串，取决于是否提供模板或自定义内容）
     * @param params  客户端参数 Map，key 与 getDescriptor() 中的参数 name 对应
     * @return 发送结果，包含成功状态、响应内容、耗时等信息
     */
    @Override
    public ClientResponse send(String message, Map<String, String> params) {
        long startTime = System.currentTimeMillis();

        try {
            // 1. 从 params 中获取参数值
            String host = params.get("host");
            String port = params.get("port");

            // 2. 实现具体的发送逻辑
            // ...

            long duration = System.currentTimeMillis() - startTime;
            return ClientResponse.success(200, "响应内容", duration);

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            return ClientResponse.failure("发送失败: " + e.getMessage(), duration);
        }
    }
}
```

### 第二步：配置参数描述

参数描述决定了前端如何展示配置表单。系统支持多种参数类型和参数联动机制。

**推荐使用 `ProtocolClientParamBuilder` 链式调用来简化参数配置。**

#### 支持的参数类型

| 类型 | 说明 | 前端展示 | 数据格式 | 适用场景 |
|------|------|---------|---------|---------|
| `TEXT` | 单行文本 | 输入框 | 字符串 | URL、主机名、端口等 |
| `TEXTAREA` | 多行文本 | 文本域（支持模板选择和格式化） | 字符串 | 请求体、报文内容等 |
| `NUMBER` | 数字 | 数字输入框 | 字符串（需转换） | 超时时间、端口号等 |
| `BOOLEAN` | 布尔值 | 开关 | "true" 或 "false" | 开关选项 |
| `SELECT` | 下拉选择 | 下拉框 | 选项值 | 请求方法、编码类型等 |
| `MAP` | 键值对映射 | 键值对编辑器（支持模板选择） | JSON 字符串 | 请求头、查询参数等 |
| `ARRAY` | 数组列表 | 列表编辑器 | JSON 字符串 | 标签列表、多选项等 |

#### 使用 Builder 模式创建参数

使用静态导入简化代码：

```java

```

**基本参数示例：**

```java
// TEXT 类型 - 单行文本
text("url", "请求地址")
    .description("完整的 HTTP/HTTPS 地址")
    .required()
    .placeholder("http://localhost:8080/api/test")
    .build()

// SELECT 类型 - 下拉选择
select("method", "请求方法")
    .description("HTTP 请求方法")
    .required()
    .defaultValue("POST")
    .options(
        new SelectOption("GET", "GET"),
        new SelectOption("POST", "POST"),
        new SelectOption("PUT", "PUT")
    )
    .build()

// 或使用快捷方法（值和标签相同）
select("method", "请求方法")
    .description("HTTP 请求方法")
    .required()
    .defaultValue("POST")
    .options("GET", "POST", "PUT", "DELETE")
    .build()

// TEXTAREA 类型 - 多行文本
textarea("body", "请求体")
    .description("请求体内容，支持 JSON/XML/文本等格式")
    .placeholder("输入请求体内容...")
    .build()

// MAP 类型 - 键值对
map("headers", "自定义请求头")
    .description("额外的 HTTP 请求头，键值对格式")
    .mapLabels("请求头名称", "请求头值")
    .build()

// NUMBER 类型 - 数字
number("timeout", "超时时间")
    .description("请求超时时间（毫秒）")
    .defaultValue("30000")
    .placeholder("30000")
    .build()

// BOOLEAN 类型 - 布尔值
bool("followRedirects", "跟随重定向")
    .description("是否自动跟随 HTTP 重定向")
    .defaultValue("true")
    .build()

// ARRAY 类型 - 数组列表
array("tags", "标签列表")
    .description("多个标签，数组格式")
    .itemLabel("标签")
    .build()
```

### 第三步：实现参数联动

参数联动允许根据其他参数的值动态显示或隐藏当前参数，提供更好的用户体验。

#### 单依赖条件

使用 `dependsOn()` 方法创建简单的依赖关系：

```java
// 仅在 method 为 GET 或 HEAD 时显示 queryParams
map("queryParams", "查询参数")
    .description("URL 查询参数，键值对格式")
    .mapLabels("参数名", "参数值")
    .dependsOn("method", "GET", "HEAD")  // 默认使用 EQUALS 条件
    .build()

// 指定依赖条件类型
textarea("body", "请求体")
    .description("请求体内容")
    .dependsOn("method", ParamDependency.DependencyCondition.NOT_EQUALS, "GET", "HEAD")
    .build()
```

#### 多依赖条件（AND/OR 逻辑）

使用 `DependencyBuilder` 创建复杂的依赖关系：

```java
// 仅在 method 为 POST/PUT/PATCH/DELETE 且 contentType 不是 form-urlencoded 时显示 body
textarea("body", "请求体")
    .description("请求体内容，支持 JSON/XML/文本等格式")
    .placeholder("输入请求体内容...")
    .dependsOnAll(  // AND 逻辑：所有条件都满足
        DependencyBuilder.equals("method", "POST", "PUT", "PATCH", "DELETE"),
        DependencyBuilder.notEquals("contentType", "application/x-www-form-urlencoded")
    )
    .build()

// OR 逻辑：任一条件满足
textarea("notes", "备注")
    .description("额外说明")
    .dependsOnAny(  // OR 逻辑：任一条件满足
        DependencyBuilder.equals("type", "custom"),
        DependencyBuilder.notEmpty("errorMessage")
    )
    .build()
```

#### DependencyBuilder 提供的方法

| 方法 | 说明 | 示例 |
|------|------|------|
| `equals(paramName, values...)` | 等于任一期望值 | `equals("method", "POST", "PUT")` |
| `notEquals(paramName, values...)` | 不等于任一期望值 | `notEquals("type", "auto")` |
| `notEmpty(paramName)` | 参数不为空 | `notEmpty("url")` |
| `isEmpty(paramName)` | 参数为空 | `isEmpty("customUrl")` |

#### 依赖条件类型

| 条件类型 | 说明 | 使用场景 |
|---------|------|---------|
| `EQUALS` | 等于任一期望值时显示 | 根据选择的方法显示不同参数 |
| `NOT_EQUALS` | 不等于任一期望值时显示 | 排除特定选项时显示 |
| `NOT_EMPTY` | 依赖参数不为空时显示 | 需要先填写某个参数才显示后续参数 |
| `IS_EMPTY` | 依赖参数为空时显示 | 提供默认选项或备选方案 |

#### 组合逻辑

| 逻辑类型 | 说明 | 使用场景 |
|---------|------|---------|
| `AND` | 所有依赖条件都满足时显示 | 需要同时满足多个条件 |
| `OR` | 任一依赖条件满足时显示 | 满足其中一个条件即可 |

### 第四步：处理参数值

在 `send()` 方法中，使用 `ParamParser` 工具类解析复杂类型参数：

```java
@Override
public ClientResponse send(String message, Map<String, String> params) {
    // 获取简单类型参数
    String url = params.get("url");
    String method = params.getOrDefault("method", "POST");
    String timeout = params.getOrDefault("timeout", "30000");
    boolean followRedirects = Boolean.parseBoolean(params.getOrDefault("followRedirects", "true"));

    // 解析 MAP 类型参数
    String headersJson = params.get("headers");
    if (headersJson != null && !headersJson.trim().isEmpty()) {
        Map<String, String> headers = ParamParser.parseMap(headersJson);
        headers.forEach((key, value) -> {
            // 使用解析后的键值对
        });
    }

    // 解析 ARRAY 类型参数
    String tagsJson = params.get("tags");
    if (tagsJson != null && !tagsJson.trim().isEmpty()) {
        List<String> tags = ParamParser.parseArray(tagsJson);
        tags.forEach(tag -> {
            // 使用解析后的数组元素
        });
    }

    // 实现发送逻辑...
}
```

### 第五步：返回响应结果

使用 `ClientResponse` 构建响应：

```java
// 成功响应
return ClientResponse.success(statusCode, responseContent, duration);

// 失败响应
return ClientResponse.failure(errorMessage, duration);
```

`ClientResponse` 包含以下字段：
- `success`: 是否成功
- `statusCode`: 状态码（可选）
- `content`: 响应内容
- `errorMessage`: 错误信息
- `duration`: 耗时（毫秒）

### 第六步：验证

重启应用后，调用以下接口确认新客户端已被注册：

```
GET /api/v1/sender/protocols
```

响应中应包含新客户端的 `protocol`、`name`、`description` 及参数列表。前端的发送页面会自动读取此接口，无需修改前端代码即可展示新客户端的参数配置表单。

### 完整示例：HTTP 客户端

参考 `HttpProtocolClient` 的实现（`service/client/HttpProtocolClient.java`），它展示了：

1. **多种参数类型的使用**
   - TEXT: url
   - SELECT: method, contentType
   - TEXTAREA: body
   - MAP: headers, queryParams, formData
   - NUMBER: timeout
   - BOOLEAN: followRedirects

2. **复杂的参数联动**
   - queryParams 仅在 GET/HEAD 方法时显示
   - contentType 仅在 POST/PUT/PATCH/DELETE 方法时显示
   - body 仅在非 GET/HEAD 且 contentType 不是 form-urlencoded 时显示
   - formData 仅在 POST/PUT/PATCH/DELETE 且 contentType 是 form-urlencoded 时显示

3. **MAP 类型参数的处理**
   - 解析 headers、queryParams、formData
   - 构建 URL 查询字符串
   - 构建 form-urlencoded 请求体

4. **友好的用户体验**
   - 清晰的参数标签和描述
   - 合理的默认值
   - 有用的占位符提示

### 注意事项

1. **协议标识唯一性**：`getProtocol()` 返回的标识必须全局唯一，建议使用大写字母
2. **参数名称一致性**：`getDescriptor()` 中的参数 name 必须与 `send()` 方法中 `params.get()` 的 key 一致
3. **必填参数验证**：框架会自动验证必填参数，无需在 `send()` 方法中重复验证
4. **隐藏参数不传递**：前端会根据依赖条件自动隐藏参数，隐藏的参数不会出现在预览中，也不会传递给后端
5. **异常处理**：`send()` 方法应捕获所有异常并返回 `ClientResponse.failure()`，避免抛出未处理的异常
6. **日志记录**：建议使用 `@Slf4j` 注解，在关键步骤记录日志，便于调试和监控

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


---

## 前端兼容性说明

### 新增协议客户端后，前端是否需要修改？

**答案：大部分情况下不需要修改前端代码，前端会自动兼容新协议。**

系统采用**元数据驱动**的设计理念，前端通过读取后端提供的协议描述信息（`ProtocolClientDescriptor`）动态渲染配置表单。

#### 自动兼容的功能

1. **参数表单自动生成**
   - 前端根据 `params` 列表自动渲染对应的输入组件
   - 支持所有参数类型：TEXT、TEXTAREA、NUMBER、BOOLEAN、SELECT、MAP、ARRAY
   - 自动处理必填验证、默认值、占位符等

2. **参数联动自动生效**
   - 前端根据 `dependency` 配置自动显示/隐藏参数
   - 支持单依赖和多依赖（AND/OR 逻辑）
   - 隐藏的参数不会出现在请求预览中，也不会传递给后端

3. **模板选择自动集成**
   - TEXTAREA 和 MAP 类型参数自动支持模板选择
   - TEXTAREA 类型自动支持格式化功能
   - 无需额外配置

4. **协议切换自动适配**
   - 前端通过 Tabs 组件展示所有可用协议
   - 切换协议时自动加载对应的参数配置
   - 参数值自动重置为默认值

#### 需要前端开发的场景

只有以下特殊场景需要针对性开发前端逻辑：

1. **自定义请求预览（可选）**
   - 系统已提供 `GenericRequestPreview` 通用预览组件，自动展示所有参数
   - 如果需要为特定协议提供更专业的预览界面（如 HTTP 的详细请求预览），可以添加自定义预览组件
   - 需要在 `SenderPage.tsx` 中添加对应的预览组件
   - 示例：
     ```typescript
     {selectedProtocol === "HTTP" ? (
       <HttpRequestPreview ... />
     ) : selectedProtocol === "CUSTOM" ? (
       <CustomRequestPreview ... />
     ) : (
       <GenericRequestPreview ... />  // 默认使用通用预览
     )}
     ```

2. **特殊的参数输入组件**
   - 如果现有的 7 种参数类型无法满足需求
   - 需要扩展 `renderParamInput()` 方法添加新的参数类型
   - 同时需要在后端添加对应的 `ParamType` 枚举值

3. **协议特定的交互逻辑**
   - 如果协议需要特殊的用户交互流程（如文件上传、实时连接等）
   - 需要单独开发对应的交互组件

#### 通用请求预览

系统提供了 `GenericRequestPreview` 组件，为所有协议自动生成请求预览界面：

**功能特性：**
- 自动展示协议信息（名称、描述）
- 智能分组显示参数（简单参数和复杂参数）
- 根据参数类型自动选择最佳展示方式：
  - TEXT/NUMBER：内联显示
  - BOOLEAN：Badge 显示
  - SELECT：Badge 显示
  - MAP/ARRAY：表格展示
  - TEXTAREA：代码编辑器或文本块展示（自动检测 JSON 格式）
- 自动隐藏空值参数
- 自动应用参数联动规则
- 支持深色/浅色主题

**展示效果：**
- 协议信息卡片：显示协议标识、名称和描述
- 简单参数卡片：紧凑展示所有简单类型参数
- 复杂参数卡片：每个复杂参数独立展示，提供更多空间

这意味着新增协议后，即使不开发自定义预览组件，用户也能看到清晰、专业的请求预览界面。

#### 验证前端兼容性

新增协议后，按以下步骤验证前端兼容性：

1. **启动应用**
   ```bash
   mvn spring-boot:run
   ```

2. **访问发送页面**
   - 打开 http://localhost:8080
   - 进入"报文发送"页面

3. **检查协议显示**
   - 确认新协议出现在协议选择 Tabs 中
   - 切换到新协议，检查参数表单是否正确渲染

4. **测试参数联动**
   - 修改依赖参数的值，观察被依赖参数是否正确显示/隐藏
   - 检查隐藏参数是否从预览中消失

5. **测试发送功能**
   - 填写必填参数
   - 点击"发送请求"按钮
   - 检查响应结果是否正确显示

#### 最佳实践

1. **优先使用现有参数类型**
   - 7 种参数类型已覆盖大部分场景
   - 合理使用 MAP 和 ARRAY 类型可以避免扩展新类型

2. **充分利用参数联动**
   - 通过参数联动简化用户操作
   - 避免显示不相关的参数

3. **提供清晰的参数描述**
   - `label`：简短的参数名称
   - `description`：详细的参数说明
   - `placeholder`：示例值或输入提示

4. **合理设置默认值**
   - 为常用参数提供合理的默认值
   - 减少用户的配置工作量

#### 示例：完全自动兼容的协议

以下是一个无需前端修改即可使用的协议示例：

```java
@Component
public class TcpProtocolClient implements ProtocolClient {

    @Override
    public ProtocolClientDescriptor getDescriptor() {
        return new ProtocolClientDescriptor(
            "TCP",
            "TCP 客户端",
            "通过 TCP 协议发送数据",
            Arrays.asList(
                text("host", "主机地址")
                    .description("目标服务器地址")
                    .required()
                    .placeholder("127.0.0.1")
                    .build(),

                number("port", "端口号")
                    .description("目标服务器端口")
                    .required()
                    .defaultValue("8080")
                    .build(),

                textarea("data", "发送数据")
                    .description("要发送的数据内容")
                    .required()
                    .placeholder("输入数据...")
                    .build(),

                number("timeout", "超时时间")
                    .description("连接超时时间（毫秒）")
                    .defaultValue("5000")
                    .build()
            )
        );
    }

    // ... send() 方法实现
}
```

这个协议无需任何前端修改，重启应用后即可在前端使用，所有参数会自动渲染为对应的输入组件。
