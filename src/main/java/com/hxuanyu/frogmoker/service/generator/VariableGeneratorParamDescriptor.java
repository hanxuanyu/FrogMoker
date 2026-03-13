package com.hxuanyu.frogmoker.service.generator;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "变量生成器参数描述")
public class VariableGeneratorParamDescriptor {

    @Schema(description = "参数名称")
    private String name;

    @Schema(description = "参数说明")
    private String description;

    @Schema(description = "是否必填")
    private boolean required;

    @Schema(description = "默认值")
    private String defaultValue;
}
