package com.hxuanyu.frogmocker.entity;

import com.baomidou.mybatisplus.annotation.*;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("template_variable")
@Schema(description = "模板变量实体")
public class TemplateVariable {

    @TableId(type = IdType.AUTO)
    @Schema(description = "主键ID")
    private Long id;

    @Schema(description = "所属模板ID")
    private Long templateId;

    @Schema(description = "变量名称（占位符中的名称）")
    private String variableName;

    @Schema(description = "生成器类型，如 FIXED / SEQUENCE")
    private String generatorType;

    @Schema(description = "生成器参数（JSON格式）")
    private String generatorParams;

    @TableField(fill = FieldFill.INSERT)
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;
}
