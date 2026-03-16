package com.hxuanyu.frogmoker.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import javax.validation.constraints.NotNull;

/**
 * 更新规则优先级请求
 */
@Data
@Schema(description = "更新规则优先级请求")
public class UpdateRulePriorityRequest {

    @NotNull(message = "优先级不能为空")
    @Schema(description = "优先级（数字越大优先级越高）")
    private Integer priority;
}
