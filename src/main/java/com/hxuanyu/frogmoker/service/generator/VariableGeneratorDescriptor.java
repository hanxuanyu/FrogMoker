package com.hxuanyu.frogmoker.service.generator;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "变量生成器描述信息")
public class VariableGeneratorDescriptor {

    @Schema(description = "生成器类型标识，唯一键")
    private String type;

    @Schema(description = "生成器名称")
    private String name;

    @Schema(description = "生成器说明")
    private String description;

    @Schema(description = "支持的参数列表")
    private List<VariableGeneratorParamDescriptor> params;
}
