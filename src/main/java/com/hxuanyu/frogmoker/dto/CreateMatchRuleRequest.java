package com.hxuanyu.frogmoker.dto;

import com.hxuanyu.frogmoker.service.server.MatchCondition;
import com.hxuanyu.frogmoker.service.server.ResponseConfig;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

/**
 * 创建匹配规则请求
 */
@Data
@Schema(description = "创建匹配规则请求")
public class CreateMatchRuleRequest {

    @NotBlank(message = "规则名称不能为空")
    @Schema(description = "规则名称")
    private String name;

    @Schema(description = "规则描述")
    private String description;

    @Schema(description = "优先级（数字越大优先级越高）", defaultValue = "0")
    private Integer priority;

    @NotNull(message = "匹配条件不能为空")
    @Schema(description = "匹配条件")
    private MatchCondition condition;

    @NotNull(message = "响应配置不能为空")
    @Schema(description = "响应配置")
    private ResponseConfig response;
}
