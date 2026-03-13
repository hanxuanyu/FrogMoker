package com.hxuanyu.frogmoker.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
@Schema(description = "格式化报文请求")
public class FormatMessageRequest {

    @NotBlank(message = "报文类型不能为空")
    @Schema(description = "报文类型：XML / JSON")
    private String messageType;

    @NotBlank(message = "报文内容不能为空")
    @Schema(description = "报文内容")
    private String content;
}
