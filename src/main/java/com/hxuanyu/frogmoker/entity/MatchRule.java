package com.hxuanyu.frogmoker.entity;

import com.baomidou.mybatisplus.annotation.*;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 匹配规则实体
 */
@Data
@TableName("match_rule")
@Schema(description = "匹配规则实体")
public class MatchRule {

    @TableId(type = IdType.AUTO)
    @Schema(description = "主键ID")
    private Long id;

    @Schema(description = "实例ID")
    private Long instanceId;

    @Schema(description = "规则名称")
    private String name;

    @Schema(description = "规则描述")
    private String description;

    @Schema(description = "优先级（数字越大优先级越高）")
    private Integer priority;

    @Schema(description = "匹配条件（JSON格式）")
    @TableField("`condition`")
    private String condition;

    @Schema(description = "响应配置（JSON格式）")
    private String response;

    @Schema(description = "是否启用")
    private Boolean enabled;

    @TableField(fill = FieldFill.INSERT)
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;
}
