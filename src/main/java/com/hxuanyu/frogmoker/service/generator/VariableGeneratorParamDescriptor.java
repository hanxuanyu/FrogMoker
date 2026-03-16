package com.hxuanyu.frogmoker.service.generator;

import com.hxuanyu.frogmoker.service.common.ParamDescriptor;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.Arrays;
import java.util.List;

/**
 * 变量生成器参数描述
 * @deprecated 使用 {@link ParamDescriptor} 替代
 */
@Deprecated
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Schema(description = "变量生成器参数描述")
public class VariableGeneratorParamDescriptor extends ParamDescriptor {

    // ---- 全参构造 ----
    public VariableGeneratorParamDescriptor(String name, String label, String description,
                                            com.hxuanyu.frogmoker.service.common.ParamType paramType, boolean required,
                                            String defaultValue, List<com.hxuanyu.frogmoker.service.common.SelectOption> options) {
        super(name, label, description, paramType, required, defaultValue, options);
    }

    // ---- 静态工厂：文本输入 ----
    public static VariableGeneratorParamDescriptor text(String name, String label,
                                                        String description, boolean required,
                                                        String defaultValue) {
        VariableGeneratorParamDescriptor param = new VariableGeneratorParamDescriptor();
        param.setName(name);
        param.setLabel(label);
        param.setDescription(description);
        param.setParamType(com.hxuanyu.frogmoker.service.common.ParamType.TEXT);
        param.setRequired(required);
        param.setDefaultValue(defaultValue);
        return param;
    }

    // ---- 静态工厂：布尔开关 ----
    public static VariableGeneratorParamDescriptor bool(String name, String label,
                                                        String description, boolean defaultValue) {
        VariableGeneratorParamDescriptor param = new VariableGeneratorParamDescriptor();
        param.setName(name);
        param.setLabel(label);
        param.setDescription(description);
        param.setParamType(com.hxuanyu.frogmoker.service.common.ParamType.BOOLEAN);
        param.setRequired(false);
        param.setDefaultValue(String.valueOf(defaultValue));
        return param;
    }

    // ---- 静态工厂：下拉选择 ----
    public static VariableGeneratorParamDescriptor select(String name, String label,
                                                          String description, boolean required,
                                                          String defaultValue, com.hxuanyu.frogmoker.service.common.SelectOption... options) {
        VariableGeneratorParamDescriptor param = new VariableGeneratorParamDescriptor();
        param.setName(name);
        param.setLabel(label);
        param.setDescription(description);
        param.setParamType(com.hxuanyu.frogmoker.service.common.ParamType.SELECT);
        param.setRequired(required);
        param.setDefaultValue(defaultValue);
        param.setOptions(Arrays.asList(options));
        return param;
    }
}
