package com.hxuanyu.frogmoker.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.Map;

/**
 * 创建服务端实例请求
 */
@Data
@Schema(description = "创建服务端实例请求")
public class CreateServerInstanceRequest {

    @NotBlank(message = "实例名称不能为空")
    @Schema(description = "实例名称")
    private String name;

    @Schema(description = "实例描述")
    private String description;

    @NotBlank(message = "协议类型不能为空")
    @Schema(description = "协议类型（如 HTTP）")
    private String protocol;

    @NotNull(message = "启动参数不能为空")
    @Schema(description = "启动参数（键值对）")
    private Map<String, String> params;
}
