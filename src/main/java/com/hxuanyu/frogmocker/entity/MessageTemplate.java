package com.hxuanyu.frogmocker.entity;

import com.baomidou.mybatisplus.annotation.*;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("message_template")
@Schema(description = "报文模板实体")
public class MessageTemplate {

    @TableId(type = IdType.AUTO)
    @Schema(description = "主键ID")
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

    @TableField("tags")
    @Schema(description = "模板标签(JSON数组)")
    private String tagsJson;

    @TableField(fill = FieldFill.INSERT)
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;
}
