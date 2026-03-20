package com.hxuanyu.frogmocker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * 发送报文请求
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {

    /**
     * 模板ID（可选，如果提供则使用模板渲染）
     */
    private Long templateId;

    /**
     * 自定义报文内容（可选，如果不使用模板则直接发送此内容）
     */
    private String customContent;

    /**
     * 协议类型（如 HTTP）
     */
    private String protocol;

    /**
     * 客户端参数（如 url, method 等）
     */
    private Map<String, String> clientParams;

    /**
     * 使用报文模板的客户端参数，key 为参数名，value 为模板 ID
     */
    private Map<String, Long> parameterTemplates;
}
