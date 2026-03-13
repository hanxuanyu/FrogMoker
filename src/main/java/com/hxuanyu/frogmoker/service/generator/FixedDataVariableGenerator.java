package com.hxuanyu.frogmoker.service.generator;

import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Collections;
import java.util.Map;

@Component
public class FixedDataVariableGenerator implements VariableValueGenerator {

    public static final String TYPE = "FIXED";

    @Override
    public String getType() {
        return TYPE;
    }

    @Override
    public VariableGeneratorDescriptor getDescriptor() {
        return new VariableGeneratorDescriptor(
                TYPE,
                "固定数据",
                "每次生成固定的值",
                Arrays.asList(
                        new VariableGeneratorParamDescriptor("value", "固定值", "固定值内容", true, "")
                )
        );
    }

    @Override
    public String generate(Long variableId, Map<String, String> params) {
        return params.getOrDefault("value", "");
    }
}
