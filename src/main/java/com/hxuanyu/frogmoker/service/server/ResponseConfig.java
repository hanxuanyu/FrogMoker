package com.hxuanyu.frogmoker.service.server;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * 响应配置
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResponseConfig {

    /**
     * HTTP 状态码
     */
    private int statusCode = 200;

    /**
     * 响应头
     */
    private Map<String, String> headers;

    /**
     * 响应体
     */
    private String body;

    /**
     * 延迟时间（毫秒）
     */
    private Integer delay;
}
