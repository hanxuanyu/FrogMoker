package com.hxuanyu.frogmoker.service.client;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 协议客户端描述信息
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProtocolClientDescriptor {

    /**
     * 协议类型（如 HTTP）
     */
    private String protocol;

    /**
     * 协议名称（如 HTTP 客户端）
     */
    private String name;

    /**
     * 协议说明
     */
    private String description;

    /**
     * 客户端参数描述列表
     */
    private List<ProtocolClientParamDescriptor> params;
}
