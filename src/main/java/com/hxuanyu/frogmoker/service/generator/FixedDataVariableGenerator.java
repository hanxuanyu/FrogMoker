package com.hxuanyu.frogmoker.service.generator;

import org.springframework.stereotype.Component;

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
                "固定值",
                "每次调用返回相同的固定字符串",
                Collections.singletonList(
                        VariableGeneratorParamDescriptor.text("value", "固定值", "每次生成时返回的固定字符串内容", true, "")
                )
        );
    }

    @Override
    public String generate(Long variableId, Map<String, String> params) {
        return params.getOrDefault("value", "");
    }
}
