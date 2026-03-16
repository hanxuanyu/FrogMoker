package com.hxuanyu.frogmoker.entity;

import com.baomidou.mybatisplus.annotation.*;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 服务端实例实体
 */
@Data
@TableName("server_instance")
@Schema(description = "服务端实例实体")
public class ServerInstance {

    @TableId(type = IdType.AUTO)
    @Schema(description = "主键ID")
    private Long id;

    @Schema(description = "实例名称")
    private String name;

    @Schema(description = "实例描述")
    private String description;

    @Schema(description = "协议类型")
    private String protocol;

    @Schema(description = "启动参数（JSON格式）")
    private String params;

    @Schema(description = "运行状态：STOPPED / RUNNING / FAILED")
    private String status;

    @Schema(description = "启动时间")
    private LocalDateTime startTime;

    @Schema(description = "停止时间")
    private LocalDateTime stopTime;

    @Schema(description = "错误信息")
    private String errorMessage;

    @TableField(fill = FieldFill.INSERT)
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;
}
