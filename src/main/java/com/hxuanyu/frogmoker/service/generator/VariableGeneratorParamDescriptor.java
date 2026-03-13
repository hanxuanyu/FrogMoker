package com.hxuanyu.frogmoker.service.generator;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Arrays;
import java.util.List;

@Data
@NoArgsConstructor
@Schema(description = "变量生成器参数描述")
public class VariableGeneratorParamDescriptor {

    @Schema(description = "参数名称（英文key）")
    private String name;

    @Schema(description = "参数显示标签")
    private String label;

    @Schema(description = "参数说明")
    private String description;

    @Schema(description = "参数类型：TEXT / BOOLEAN / SELECT")
    private ParamType paramType;

    @Schema(description = "是否必填")
    private boolean required;

    @Schema(description = "默认值")
    private String defaultValue;

    @Schema(description = "下拉选项列表（paramType=SELECT 时有效）")
    private List<SelectOption> options;

    // ---- 全参构造 ----
    public VariableGeneratorParamDescriptor(String name, String label, String description,
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

    // ---- 静态工厂：文本输入 ----
    public static VariableGeneratorParamDescriptor text(String name, String label,
                                                        String description, boolean required,
                                                        String defaultValue) {
        return new VariableGeneratorParamDescriptor(name, label, description,
                ParamType.TEXT, required, defaultValue, null);
    }

    // ---- 静态工厂：布尔开关 ----
    public static VariableGeneratorParamDescriptor bool(String name, String label,
                                                        String description, boolean defaultValue) {
        return new VariableGeneratorParamDescriptor(name, label, description,
                ParamType.BOOLEAN, false, String.valueOf(defaultValue), null);
    }

    // ---- 静态工厂：下拉选择 ----
    public static VariableGeneratorParamDescriptor select(String name, String label,
                                                          String description, boolean required,
                                                          String defaultValue, SelectOption... options) {
        return new VariableGeneratorParamDescriptor(name, label, description,
                ParamType.SELECT, required, defaultValue, Arrays.asList(options));
    }
}
