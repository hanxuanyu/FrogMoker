package com.hxuanyu.frogmoker.service.client;

import com.hxuanyu.frogmoker.service.generator.ParamType;
import com.hxuanyu.frogmoker.service.generator.SelectOption;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 协议客户端参数描述
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProtocolClientParamDescriptor {

    /**
     * 参数名（如 url, method）
     */
    private String name;

    /**
     * 参数标签（如 请求地址）
     */
    private String label;

    /**
     * 参数说明
     */
    private String description;

    /**
     * 参数类型（TEXT / BOOLEAN / SELECT）
     */
    private ParamType paramType;

    /**
     * 是否必填
     */
    private boolean required;

    /**
     * 默认值
     */
    private String defaultValue;

    /**
     * 下拉选项（仅当 paramType=SELECT 时有效）
     */
    private List<SelectOption> options;
}
