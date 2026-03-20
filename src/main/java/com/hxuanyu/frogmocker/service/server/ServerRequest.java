package com.hxuanyu.frogmocker.service.server;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * 服务端请求上下文
 * 封装请求的所有信息，用于匹配规则
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServerRequest {

    /**
     * 请求方法（如 GET、POST）
     */
    private String method;

    /**
     * 请求路径（如 /api/users）
     */
    private String path;

    /**
     * 请求头
     */
    private Map<String, String> headers;

    /**
     * 查询参数
     */
    private Map<String, String> queryParams;

    /**
     * 请求体
     */
    private String body;

    /**
     * 客户端 IP
     */
    private String clientIp;
}
