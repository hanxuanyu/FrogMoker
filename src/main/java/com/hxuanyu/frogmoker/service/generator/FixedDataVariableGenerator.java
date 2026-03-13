package com.hxuanyu.frogmoker.service.generator;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Map;

@Slf4j
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
                "每次调用返回同样的固定字符串",
                Collections.singletonList(
                        VariableGeneratorParamDescriptor.text("value", "固定值", "每次生成时返回的固定字符串内容", true, "")
                )
        );
    }

    @Override
    public String generate(Long variableId, Map<String, String> params) {
        String value = params.getOrDefault("value", "");
        log.debug("Generated fixed variable value. variableId={}, length={}, preview={}",
                variableId, value.length(), summarize(value));
        return value;
    }

    private String summarize(String value) {
        if (value == null || value.length() <= 48) {
            return value;
        }
        return value.substring(0, 45) + "...";
    }
}
