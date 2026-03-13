package com.hxuanyu.frogmoker.service.client;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 客户端响应结果
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClientResponse {

    /**
     * 是否成功
     */
    private boolean success;

    /**
     * HTTP状态码（HTTP协议）或其他协议的状态标识
     */
    private Integer statusCode;

    /**
     * 响应内容
     */
    private String content;

    /**
     * 错误信息（失败时）
     */
    private String errorMessage;

    /**
     * 耗时（毫秒）
     */
    private Long duration;

    public static ClientResponse success(Integer statusCode, String content, Long duration) {
        return new ClientResponse(true, statusCode, content, null, duration);
    }

    public static ClientResponse failure(String errorMessage, Long duration) {
        return new ClientResponse(false, null, null, errorMessage, duration);
    }
}
