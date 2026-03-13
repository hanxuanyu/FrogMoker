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
     * 参数类型（TEXT / TEXTAREA / BOOLEAN / SELECT / MAP / ARRAY / NUMBER）
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

    /**
     * 参数联动配置（可选）
     */
    private ParamDependency dependency;

    /**
     * 占位符文本（用于输入框提示）
     */
    private String placeholder;

    /**
     * 对于 MAP 类型，键的标签
     */
    private String keyLabel;

    /**
     * 对于 MAP 类型，值的标签
     */
    private String valueLabel;

    /**
     * 对于 ARRAY 类型，元素的标签
     */
    private String itemLabel;

    // 便捷构造函数（向后兼容）
    public ProtocolClientParamDescriptor(String name, String label, String description,
                                          ParamType paramType, boolean required,
                                          String defaultValue, List<SelectOption> options) {
        this.name = name;
        this.label = label;
        this.description = description;
        this.paramType = paramType;
        this.required = required;
        this.defaultValue = defaultValue;
        this.options = options;
    }
}
