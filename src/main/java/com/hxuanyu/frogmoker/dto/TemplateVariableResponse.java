package com.hxuanyu.frogmoker.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.Map;

@Data
@Schema(description = "模板变量响应")
public class TemplateVariableResponse {

    @Schema(description = "变量ID")
    private Long id;

    @Schema(description = "变量名称")
    private String variableName;

    @Schema(description = "生成器类型")
    private String generatorType;

    @Schema(description = "生成器参数")
    private Map<String, String> generatorParams;
}
