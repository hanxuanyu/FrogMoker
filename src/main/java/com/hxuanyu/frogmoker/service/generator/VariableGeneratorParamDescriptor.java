package com.hxuanyu.frogmoker.service.generator;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    @Schema(description = "是否必填")
    private boolean required;

    @Schema(description = "默认值")
    private String defaultValue;

    public VariableGeneratorParamDescriptor(String name, String label, String description, boolean required, String defaultValue) {
        this.name = name;
        this.label = label;
        this.description = description;
        this.required = required;
        this.defaultValue = defaultValue;
    }
}
