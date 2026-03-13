package com.hxuanyu.frogmoker.entity;

import com.baomidou.mybatisplus.annotation.*;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("generator_sequence_state")
@Schema(description = "序列号生成器状态")
public class GeneratorSequenceState {

    @TableId(type = IdType.AUTO)
    @Schema(description = "主键ID")
    private Long id;

    @Schema(description = "关联的变量ID")
    private Long variableId;

    @Schema(description = "当前序列值")
    private Long currentValue;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;
}
