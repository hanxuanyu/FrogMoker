package com.hxuanyu.frogmocker.entity;

import com.baomidou.mybatisplus.annotation.*;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 请求日志实体
 */
@Data
@TableName("request_log")
@Schema(description = "请求日志实体")
public class RequestLog {

    @TableId(type = IdType.AUTO)
    @Schema(description = "主键ID")
    private Long id;

    @Schema(description = "实例ID")
    private Long instanceId;

    @Schema(description = "请求方法")
    private String method;

    @Schema(description = "请求路径")
    private String path;

    @Schema(description = "请求头（JSON格式）")
    private String headers;

    @Schema(description = "查询参数（JSON格式）")
    private String queryParams;

    @Schema(description = "请求体")
    private String body;

    @Schema(description = "响应状态码")
    private Integer statusCode;

    @Schema(description = "处理耗时（毫秒）")
    private Integer duration;

    @Schema(description = "匹配的规则ID")
    private Long matchedRuleId;

    @TableField(fill = FieldFill.INSERT)
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
}
