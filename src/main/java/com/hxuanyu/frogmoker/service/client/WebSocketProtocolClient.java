package com.hxuanyu.frogmoker.service.client;

import com.hxuanyu.frogmoker.service.common.SelectOption;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.net.URI;
import java.util.Arrays;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import static com.hxuanyu.frogmoker.service.client.ProtocolClientParamBuilder.*;

/**
 * WebSocket 协议客户端实现
 * 支持 WebSocket 连接、消息发送和接收
 */
@Slf4j
@Component
public class WebSocketProtocolClient implements ProtocolClient {

    private static final String PROTOCOL = "WEBSOCKET";

    // StandardWebSocketClient 本身无状态，仅作为连接工厂，复用同一实例即可
    private final StandardWebSocketClient wsClient = new StandardWebSocketClient();

    @Override
    public String getProtocol() {
        return PROTOCOL;
    }

    @Override
    public ProtocolClientDescriptor getDescriptor() {
        return new ProtocolClientDescriptor(
                PROTOCOL,
                "WebSocket 客户端",
                "通过 WebSocket 协议建立连接并发送消息，支持实时双向通信",
                Arrays.asList(
                        // WebSocket URL
                        text("url", "WebSocket 地址")
                                .description("WebSocket 服务器地址，支持 ws:// 和 wss:// 协议")
                                .required()
                                .placeholder("ws://localhost:8080/ws")
                                .build(),

                        // 消息内容
                        textarea("message", "消息内容")
                                .description("要发送的消息内容，支持文本格式")
                                .required()
                                .placeholder("输入要发送的消息...")
                                .build(),

                        // 连接超时时间
                        number("connectTimeout", "连接超时")
                                .description("建立连接的超时时间（毫秒）")
                                .defaultValue("5000")
                                .placeholder("5000")
                                .build(),

                        // 等待响应时间
                        number("responseTimeout", "响应超时")
                                .description("等待服务器响应的超时时间（毫秒）")
                                .defaultValue("10000")
                                .placeholder("10000")
                                .build(),

                        // 自定义请求头
                        map("headers", "自定义请求头")
                                .description("WebSocket 握手时的自定义 HTTP 请求头，键值对格式")
                                .mapLabels("请求头名称", "请求头值")
                                .build(),

                        // 子协议
                        text("subProtocol", "子协议")
                                .description("WebSocket 子协议（可选），如 mqtt、stomp 等")
                                .placeholder("mqtt")
                                .build(),

                        // 是否等待响应
                        bool("waitForResponse", "等待响应")
                                .description("发送消息后是否等待服务器响应")
                                .defaultValue("true")
                                .build(),

                        // 响应消息数量
                        number("expectedMessages", "期望响应数")
                                .description("期望接收的响应消息数量")
                                .defaultValue("1")
                                .placeholder("1")
                                .dependsOn("waitForResponse", "true")
                                .build()
                )
        );
    }

    @Override
    public ClientResponse send(String message, Map<String, String> params) {
        long startTime = System.currentTimeMillis();
        String url = params.get("url");
        String messageContent = params.getOrDefault("message", message);
        int connectTimeout = Integer.parseInt(params.getOrDefault("connectTimeout", "5000"));
        int responseTimeout = Integer.parseInt(params.getOrDefault("responseTimeout", "10000"));
        boolean waitForResponse = Boolean.parseBoolean(params.getOrDefault("waitForResponse", "true"));
        int expectedMessages = Integer.parseInt(params.getOrDefault("expectedMessages", "1"));
        String subProtocol = params.get("subProtocol");

        log.info("Connecting to WebSocket. url={}, waitForResponse={}, expectedMessages={}",
                url, waitForResponse, expectedMessages);

        WebSocketSession session = null;
        try {
            // 创建响应收集器
            CompletableFuture<String> responseFuture = new CompletableFuture<>();
            StringBuilder responseBuilder = new StringBuilder();
            final int[] messageCount = {0};

            // 创建 WebSocket 处理器
            TextWebSocketHandler handler = new TextWebSocketHandler() {
                @Override
                protected void handleTextMessage(WebSocketSession session, TextMessage message) {
                    String payload = message.getPayload();
                    log.debug("Received WebSocket message: {}", payload);

                    messageCount[0]++;
                    if (responseBuilder.length() > 0) {
                        responseBuilder.append("\n---\n");
                    }
                    responseBuilder.append(payload);

                    // 如果收到足够的消息，完成 Future
                    if (messageCount[0] >= expectedMessages) {
                        responseFuture.complete(responseBuilder.toString());
                    }
                }

                @Override
                public void afterConnectionEstablished(WebSocketSession session) {
                    log.debug("WebSocket connection established. sessionId={}", session.getId());
                }

                @Override
                public void handleTransportError(WebSocketSession session, Throwable exception) {
                    log.error("WebSocket transport error", exception);
                    responseFuture.completeExceptionally(exception);
                }
            };

            // 建立连接
            URI uri = new URI(url);
            session = wsClient.doHandshake(handler, null, uri).get(connectTimeout, TimeUnit.MILLISECONDS);

            log.info("WebSocket connected. sessionId={}", session.getId());

            // 发送消息
            session.sendMessage(new TextMessage(messageContent));
            log.info("WebSocket message sent. messageLength={}", messageContent.length());

            String responseContent = null;
            if (waitForResponse) {
                // 等待响应
                try {
                    responseContent = responseFuture.get(responseTimeout, TimeUnit.MILLISECONDS);
                    log.info("Received {} WebSocket messages", messageCount[0]);
                } catch (Exception e) {
                    log.warn("Timeout waiting for WebSocket response or error occurred", e);
                    if (messageCount[0] > 0) {
                        // 如果已经收到部分消息，返回已收到的内容
                        responseContent = responseBuilder.toString();
                    } else {
                        responseContent = "未收到服务器响应（超时或连接关闭）";
                    }
                }
            } else {
                responseContent = "消息已发送（未等待响应）";
            }

            long duration = System.currentTimeMillis() - startTime;
            log.info("WebSocket request completed. url={}, duration={}ms", url, duration);

            return ClientResponse.success(200, responseContent, duration);

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("WebSocket request failed. url={}, duration={}ms", url, duration, e);
            return ClientResponse.failure("WebSocket 请求失败: " + e.getMessage(), duration);
        } finally {
            // 关闭连接
            if (session != null && session.isOpen()) {
                try {
                    session.close();
                    log.debug("WebSocket connection closed");
                } catch (Exception e) {
                    log.warn("Error closing WebSocket connection", e);
                }
            }
        }
    }
}
