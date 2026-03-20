package com.hxuanyu.frogmocker.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.handler.TextWebSocketHandler;

/**
 * WebSocket 配置
 * 提供一个简单的 WebSocket 测试端点
 */
@Slf4j
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new EchoWebSocketHandler(), "/ws/echo")
                .setAllowedOrigins("*");
    }

    /**
     * Echo WebSocket 处理器
     * 接收消息后原样返回，用于测试
     */
    private static class EchoWebSocketHandler extends TextWebSocketHandler {

        @Override
        public void afterConnectionEstablished(WebSocketSession session) {
            log.info("WebSocket connection established. sessionId={}, remoteAddress={}",
                    session.getId(), session.getRemoteAddress());
        }

        @Override
        protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
            String payload = message.getPayload();
            log.info("Received WebSocket message. sessionId={}, message={}",
                    session.getId(), payload);

            // Echo 回消息
            String response = "Echo: " + payload;
            session.sendMessage(new TextMessage(response));
            log.info("Sent WebSocket response. sessionId={}, response={}",
                    session.getId(), response);
        }

        @Override
        public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
            log.info("WebSocket connection closed. sessionId={}, status={}",
                    session.getId(), status);
        }

        @Override
        public void handleTransportError(WebSocketSession session, Throwable exception) {
            log.error("WebSocket transport error. sessionId={}", session.getId(), exception);
        }
    }
}
