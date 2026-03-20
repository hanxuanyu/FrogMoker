package com.hxuanyu.frogmocker.service.common;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 下拉选项（通用）
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "下拉选项")
public class SelectOption {

    @Schema(description = "选项值")
    private String value;

    @Schema(description = "选项显示标签")
    private String label;
}
