package com.hxuanyu.frogmocker.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
@Schema(description = "渲染报文模板请求（使用已保存的变量生成器生成值并填充）")
public class RenderTemplateRequest {

    @NotNull(message = "模板ID不能为空")
    @Schema(description = "模板ID")
    private Long templateId;
}
