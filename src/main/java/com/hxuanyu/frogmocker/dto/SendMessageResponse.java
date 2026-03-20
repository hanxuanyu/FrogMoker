package com.hxuanyu.frogmocker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * 发送报文响应
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageResponse {

    /**
     * 是否成功
     */
    private boolean success;

    /**
     * 状态码
     */
    private Integer statusCode;

    /**
     * 发送的报文内容
     */
    private String sentMessage;

    /**
     * 实际发送时使用的客户端参数
     */
    private Map<String, String> sentClientParams;

    /**
     * 响应内容
     */
    private String responseContent;

    /**
     * 错误信息
     */
    private String errorMessage;

    /**
     * 耗时（毫秒）
     */
    private Long duration;
}
