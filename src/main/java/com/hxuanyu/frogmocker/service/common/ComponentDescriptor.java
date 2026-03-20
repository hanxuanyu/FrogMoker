package com.hxuanyu.frogmocker.service.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 通用组件描述
 * 用于客户端、服务端、生成器的组件描述
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComponentDescriptor {

    /**
     * 组件类型标识（如 HTTP、WebSocket、UUID）
     */
    private String type;

    /**
     * 组件名称（如 HTTP 客户端、UUID 生成器）
     */
    private String name;

    /**
     * 组件说明
     */
    private String description;

    /**
     * 参数列表
     */
    private List<ParamDescriptor> params;
}
