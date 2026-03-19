package com.hxuanyu.frogmoker.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import java.util.List;

@Data
@Schema(description = "保存报文模板请求")
public class SaveMessageTemplateRequest {

    @NotBlank(message = "模板名称不能为空")
    @Schema(description = "模板名称")
    private String name;

    @Schema(description = "模板描述")
    private String description;

    @Schema(description = "模板分组")
    private String groupName;

    @NotBlank(message = "报文类型不能为空")
    @Schema(description = "报文类型：XML / JSON")
    private String messageType;

    @NotBlank(message = "报文内容不能为空")
    @Schema(description = "报文内容（含占位符）")
    private String content;

    @Valid
    @Schema(description = "变量列表")
    private List<TemplateVariableRequest> variables;

    @Schema(description = "模板标签")
    private List<String> tags;
}
