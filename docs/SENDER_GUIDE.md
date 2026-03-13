# 报文发送功能使用说明

## 功能概述

报文发送功能支持通过多种协议客户端发送渲染后的报文模板，并展示响应结果。系统采用可扩展的客户端架构，便于后续添加新的协议支持。

## 架构设计

### 后端架构

#### 1. 客户端接口层
- `ProtocolClient`: 协议客户端接口，定义所有客户端的通用行为
- `ProtocolClientDescriptor`: 客户端描述信息（协议名称、参数配置等）
- `ProtocolClientParamDescriptor`: 客户端参数描述
- `ClientResponse`: 统一的响应结果封装

#### 2. 客户端注册中心
- `ProtocolClientRegistry`: 自动发现并注册所有实现了 `ProtocolClient` 接口的 Spring Bean
- 提供客户端查询、验证和描述信息获取功能

#### 3. HTTP 客户端实现
- `HttpProtocolClient`: HTTP/HTTPS 协议客户端实现
- 支持 GET、POST、PUT、DELETE、PATCH 方法
- 支持自定义请求头和 Content-Type
- 使用 Spring RestTemplate 实现（兼容 Java 8）

#### 4. 服务层
- `MessageSenderService`: 报文发送服务
  - 模板渲染
  - 参数验证
  - 客户端调用
  - 响应封装

#### 5. 控制器层
- `MessageSenderController`: 提供 REST API
  - `GET /api/v1/sender/protocols`: 获取支持的协议列表
  - `POST /api/v1/sender/send`: 发送报文

### 前端架构

#### 1. 页面组件
- `SenderPage`: 报文发送主页面
  - 模板选择
  - 协议选择
  - 参数配置
  - 发送操作
  - 响应展示

#### 2. API 层
- `senderApi.listProtocols()`: 获取协议列表
- `senderApi.send()`: 发送报文

#### 3. 类型定义
- `ProtocolClientDescriptor`: 协议客户端描述
- `SendMessageRequest`: 发送请求
- `SendMessageResponse`: 发送响应

## 使用方法

### 1. 启动应用

```bash
# 后端
cd C:/workspace/project/java/FrogMoker
mvn spring-boot:run

# 前端（开发模式）
cd frontend
npm run dev
```

### 2. 访问发送页面

打开浏览器访问 `http://localhost:5173/sender`

### 3. 发送报文

1. 选择报文模板
2. 选择协议类型（当前支持 HTTP）
3. 配置协议参数：
   - 请求地址：目标服务器 URL
   - 请求方法：GET/POST/PUT/DELETE/PATCH
   - Content-Type：请求内容类型
   - 自定义请求头（可选）：格式为 `Key1:Value1,Key2:Value2`
4. 点击"发送报文"按钮
5. 查看响应结果

## 扩展新协议

### 1. 创建客户端实现类

```java
@Slf4j
@Component
public class TcpProtocolClient implements ProtocolClient {

    @Override
    public String getProtocol() {
        return "TCP";
    }

    @Override
    public ProtocolClientDescriptor getDescriptor() {
        return new ProtocolClientDescriptor(
            "TCP",
            "TCP 客户端",
            "通过 TCP 协议发送数据",
            Arrays.asList(
                new ProtocolClientParamDescriptor(
                    "host",
                    "主机地址",
                    "目标服务器地址",
                    ParamType.TEXT,
                    true,
                    "",
                    null
                ),
                new ProtocolClientParamDescriptor(
                    "port",
                    "端口号",
                    "目标服务器端口",
                    ParamType.TEXT,
                    true,
                    "8080",
                    null
                )
            )
        );
    }

    @Override
    public ClientResponse send(String message, Map<String, String> params) {
        // 实现 TCP 发送逻辑
        // ...
    }
}
```

### 2. 自动注册

将类标注为 `@Component`，Spring 会自动扫描并注册到 `ProtocolClientRegistry`。

### 3. 前端自动适配

前端会自动从后端获取协议列表和参数配置，无需修改前端代码。

## 技术特点

1. **高度解耦**：客户端实现与业务逻辑分离
2. **易于扩展**：新增协议只需实现接口并注册为 Bean
3. **参数灵活**：支持 TEXT、BOOLEAN、SELECT 三种参数类型
4. **自动发现**：Spring 自动扫描并注册所有客户端实现
5. **统一响应**：所有协议使用统一的响应格式
6. **前端适配**：前端根据后端描述自动生成表单

## API 文档

访问 `http://localhost:8080/doc.html` 查看完整的 API 文档（Knife4j）。
