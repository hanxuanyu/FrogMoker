package com.hxuanyu.frogmocker.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Schema(description = "报文模板详情")
public class MessageTemplateDetailResponse {

    @Schema(description = "模板ID")
    private Long id;

    @Schema(description = "模板名称")
    private String name;

    @Schema(description = "模板描述")
    private String description;

    @Schema(description = "模板分组")
    private String groupName;

    @Schema(description = "报文类型：XML / JSON")
    private String messageType;

    @Schema(description = "报文内容（含占位符）")
    private String content;

    @Schema(description = "模板标签")
    private List<String> tags;

    @Schema(description = "变量列表")
    private List<TemplateVariableResponse> variables;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;

    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;
}
