# WebSocket 协议客户端示例

## 概述

WebSocket 协议客户端是一个经典的通信协议实现示例，展示了如何使用 `ProtocolClientParamBuilder` 链式调用来创建协议客户端。

## 特性

- **全双工通信**：支持客户端和服务器之间的双向实时通信
- **灵活配置**：支持自定义请求头、子协议、超时时间等
- **响应收集**：可配置等待服务器响应的消息数量
- **自动兼容前端**：无需修改前端代码，参数表单自动生成

## 参数说明

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| url | TEXT | 是 | - | WebSocket 服务器地址（ws:// 或 wss://） |
| message | TEXTAREA | 是 | - | 要发送的消息内容 |
| connectTimeout | NUMBER | 否 | 5000 | 建立连接的超时时间（毫秒） |
| responseTimeout | NUMBER | 否 | 10000 | 等待服务器响应的超时时间（毫秒） |
| headers | MAP | 否 | {} | WebSocket 握手时的自定义 HTTP 请求头 |
| subProtocol | TEXT | 否 | - | WebSocket 子协议（如 mqtt、stomp） |
| waitForResponse | BOOLEAN | 否 | true | 发送消息后是否等待服务器响应 |
| expectedMessages | NUMBER | 否 | 1 | 期望接收的响应消息数量（仅当 waitForResponse=true 时显示） |

## 参数联动示例

`expectedMessages` 参数使用了参数联动功能，仅在 `waitForResponse` 为 `true` 时显示：

```java
number("expectedMessages", "期望响应数")
    .description("期望接收的响应消息数量")
    .defaultValue("1")
    .placeholder("1")
    .dependsOn("waitForResponse", "true")
    .build()
```

## 测试方法

### 1. 使用内置的 Echo 服务器

应用启动后会自动提供一个 Echo WebSocket 服务器，地址为：

```
ws://localhost:8080/ws/echo
```

该服务器会将接收到的消息原样返回（添加 "Echo: " 前缀）。

### 2. 测试步骤

1. **启动应用**
   ```bash
   mvn spring-boot:run
   ```

2. **访问前端页面**
   - 打开浏览器访问：http://localhost:8080
   - 进入"报文发送"页面

3. **选择 WebSocket 协议**
   - 在协议选择 Tabs 中点击"WebSocket 客户端"

4. **配置参数**
   - WebSocket 地址：`ws://localhost:8080/ws/echo`
   - 消息内容：`Hello, WebSocket!`
   - 其他参数使用默认值

5. **发送请求**
   - 点击"发送请求"按钮
   - 查看响应结果，应该显示：`Echo: Hello, WebSocket!`

### 3. 测试多条响应消息

如果 WebSocket 服务器会返回多条消息，可以配置 `expectedMessages` 参数：

1. 将 `waitForResponse` 设置为 `true`（默认）
2. 将 `expectedMessages` 设置为期望的消息数量（如 `3`）
3. 客户端会等待接收指定数量的消息后返回

## 代码实现亮点

### 1. 使用 Builder 模式

```java
text("url", "WebSocket 地址")
    .description("WebSocket 服务器地址，支持 ws:// 和 wss:// 协议")
    .required()
    .placeholder("ws://localhost:8080/ws")
    .build()
```

相比传统方式，代码更简洁、可读性更强。

### 2. 参数联动

```java
number("expectedMessages", "期望响应数")
    .description("期望接收的响应消息数量")
    .defaultValue("1")
    .placeholder("1")
    .dependsOn("waitForResponse", "true")  // 仅在 waitForResponse=true 时显示
    .build()
```

前端会自动根据依赖条件显示/隐藏参数。

### 3. 异步响应收集

使用 `CompletableFuture` 收集 WebSocket 响应消息：

```java
CompletableFuture<String> responseFuture = new CompletableFuture<>();
StringBuilder responseBuilder = new StringBuilder();
final int[] messageCount = {0};

TextWebSocketHandler handler = new TextWebSocketHandler() {
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        messageCount[0]++;
        responseBuilder.append(message.getPayload());

        if (messageCount[0] >= expectedMessages) {
            responseFuture.complete(responseBuilder.toString());
        }
    }
};
```

### 4. 超时处理

支持连接超时和响应超时：

```java
// 连接超时
session = client.doHandshake(handler, null, uri)
    .get(connectTimeout, TimeUnit.MILLISECONDS);

// 响应超时
responseContent = responseFuture.get(responseTimeout, TimeUnit.MILLISECONDS);
```

## 扩展建议

可以基于此示例扩展更多功能：

1. **支持二进制消息**：添加 `messageType` 参数，支持文本和二进制消息
2. **支持 Ping/Pong**：添加心跳检测功能
3. **支持持久连接**：保持连接打开，支持多次消息发送
4. **支持 SSL/TLS**：配置 wss:// 协议的证书验证

## 前端兼容性

该 WebSocket 客户端**无需任何前端修改**即可使用：

- ✅ 参数表单自动生成
- ✅ 参数联动自动生效
- ✅ 模板选择自动集成（TEXTAREA 类型）
- ✅ 协议切换自动适配

如果需要为 WebSocket 添加专门的请求预览界面，可以参考 `HttpRequestPreview` 组件的实现。

## 日志输出

应用运行时会输出详细的日志信息：

```
INFO  WebSocketProtocolClient - Connecting to WebSocket. url=ws://localhost:8080/ws/echo, waitForResponse=true, expectedMessages=1
INFO  WebSocketProtocolClient - WebSocket connected. sessionId=xxx
INFO  WebSocketProtocolClient - WebSocket message sent. messageLength=18
INFO  WebSocketProtocolClient - Received 1 WebSocket messages
INFO  WebSocketProtocolClient - WebSocket request completed. url=ws://localhost:8080/ws/echo, duration=123ms
```

## 总结

这个 WebSocket 客户端示例展示了：

1. 如何使用 `ProtocolClientParamBuilder` 链式调用创建参数
2. 如何实现参数联动（`dependsOn`）
3. 如何处理异步通信和响应收集
4. 如何实现超时控制
5. 前端如何自动兼容新协议

开发者可以参考此示例快速实现其他协议客户端（如 MQTT、AMQP、gRPC 等）。
