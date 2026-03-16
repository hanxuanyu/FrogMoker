package com.hxuanyu.frogmoker.service.client;

import com.hxuanyu.frogmoker.service.common.ComponentDescriptor;
import com.hxuanyu.frogmoker.service.common.ParamDescriptor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 协议客户端描述信息
 */
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ProtocolClientDescriptor extends ComponentDescriptor {

    public ProtocolClientDescriptor(String protocol, String name, String description, List<ParamDescriptor> params) {
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
