package com.hxuanyu.frogmocker.service.server;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 服务端运行状态
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServerStatus {

    /**
     * 是否正在运行
     */
    private boolean running;

    /**
     * 启动时间（毫秒时间戳）
     */
    private Long startTime;

    /**
     * 监听地址（如 http://0.0.0.0:8081）
     */
    private String listenAddress;

    /**
     * 错误信息（如果启动失败）
     */
    private String errorMessage;

    /**
     * 接收到的请求总数
     */
    private long totalRequests;

    /**
     * 最后一次请求时间
     */
    private Long lastRequestTime;
}
