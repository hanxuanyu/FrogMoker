package com.hxuanyu.frogmoker.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import java.util.Map;

@Data
@Schema(description = "模板变量请求")
public class TemplateVariableRequest {

    @NotBlank(message = "变量名不能为空")
    @Schema(description = "变量名称")
    private String variableName;

    @NotBlank(message = "生成器类型不能为空")
    @Schema(description = "生成器类型，如 FIXED / SEQUENCE")
    private String generatorType;

    @Schema(description = "生成器参数")
    private Map<String, String> generatorParams;
}
