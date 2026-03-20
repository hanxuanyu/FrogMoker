package com.hxuanyu.frogmocker.service.server;

import com.hxuanyu.frogmocker.service.common.ComponentDescriptor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;
import com.hxuanyu.frogmocker.service.common.ParamDescriptor;

/**
 * 协议服务端描述信息
 */
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ProtocolServerDescriptor extends ComponentDescriptor {

    /**
     * 是否支持请求匹配器（大部分服务端都支持）
     */
    private boolean supportsMatcher = true;

    /**
     * 是否支持自定义 UI（用于特殊协议的高级配置）
     */
    private boolean supportsCustomUI = false;

    /**
     * 自定义 UI 组件名称（前端使用）
     */
    private String customUIComponent;

    /**
     * 响应配置参数描述
     */
    private List<ParamDescriptor> responseParams;

    public ProtocolServerDescriptor(String protocol, String name, String description,
                                   List<ParamDescriptor> params) {
        super(protocol, name, description, params);
    }

    /**
     * 获取协议类型（兼容旧代码）
     */
    public String getProtocol() {
        return getType();
    }

    /**
     * 设置协议类型（兼容旧代码）
     */
    public void setProtocol(String protocol) {
        setType(protocol);
    }
}
