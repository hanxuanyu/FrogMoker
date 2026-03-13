package com.hxuanyu.frogmoker.service.generator;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Map;
import java.util.UUID;

@Slf4j
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
                        VariableGeneratorParamDescriptor.bool("uppercase", "大写", "是否将 UUID 转换为大写字母", false),
                        VariableGeneratorParamDescriptor.bool("removeDash", "去除连字符", "是否去除 UUID 中的连字符", false)
                )
        );
    }

    @Override
    public String generate(Long variableId, Map<String, String> params) {
        String uuid = UUID.randomUUID().toString();
        boolean removeDash = "true".equalsIgnoreCase(params.getOrDefault("removeDash", "false"));
        boolean uppercase = "true".equalsIgnoreCase(params.getOrDefault("uppercase", "false"));

        if (removeDash) {
            uuid = uuid.replace("-", "");
        }
        if (uppercase) {
            uuid = uuid.toUpperCase();
        }

        log.debug("Generated UUID value. variableId={}, removeDash={}, uppercase={}, preview={}",
                variableId, removeDash, uppercase, summarize(uuid));
        return uuid;
    }

    private String summarize(String value) {
        if (value == null || value.length() <= 48) {
            return value;
        }
        return value.substring(0, 45) + "...";
    }
}
