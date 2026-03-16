package com.hxuanyu.frogmoker.service.generator;

import com.hxuanyu.frogmoker.service.common.ComponentDescriptor;
import com.hxuanyu.frogmoker.service.common.ParamDescriptor;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 变量生成器描述信息
 */
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Schema(description = "变量生成器描述信息")
public class VariableGeneratorDescriptor extends ComponentDescriptor {

    public VariableGeneratorDescriptor(String type, String name, String description, List<ParamDescriptor> params) {
        super(type, name, description, params);
    }
}
