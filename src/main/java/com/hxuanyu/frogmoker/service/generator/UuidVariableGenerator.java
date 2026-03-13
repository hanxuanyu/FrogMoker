package com.hxuanyu.frogmoker.service.generator;

import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Map;
import java.util.UUID;

@Component
public class UuidVariableGenerator implements VariableValueGenerator {

    public static final String TYPE = "UUID";

    @Override
    public String getType() {
        return TYPE;
    }

    @Override
    public VariableGeneratorDescriptor getDescriptor() {
        return new VariableGeneratorDescriptor(
                TYPE,
                "UUID",
                "每次调用生成一个随机 UUID",
                Arrays.asList(
                        VariableGeneratorParamDescriptor.bool("uppercase", "大写", "是否将 UUID 转为大写字母", false),
                        VariableGeneratorParamDescriptor.bool("removeDash", "去除连字符", "是否去除 UUID 中的 - 连字符", false)
                )
        );
    }

    @Override
    public String generate(Long variableId, Map<String, String> params) {
        String uuid = UUID.randomUUID().toString();
        if ("true".equalsIgnoreCase(params.getOrDefault("removeDash", "false"))) {
            uuid = uuid.replace("-", "");
        }
        if ("true".equalsIgnoreCase(params.getOrDefault("uppercase", "false"))) {
            uuid = uuid.toUpperCase();
        }
        return uuid;
    }
}
