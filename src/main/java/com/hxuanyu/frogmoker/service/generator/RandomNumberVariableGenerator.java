package com.hxuanyu.frogmoker.service.generator;

import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@Component
public class RandomNumberVariableGenerator implements VariableValueGenerator {

    public static final String TYPE = "RANDOM_NUMBER";

    @Override
    public String getType() {
        return TYPE;
    }

    @Override
    public VariableGeneratorDescriptor getDescriptor() {
        return new VariableGeneratorDescriptor(
                TYPE,
                "随机数",
                "生成指定范围内的随机整数",
                Arrays.asList(
                        VariableGeneratorParamDescriptor.text("min", "最小值", "随机数的最小值（含）", false, "0"),
                        VariableGeneratorParamDescriptor.text("max", "最大值", "随机数的最大值（含）", false, "9999")
                )
        );
    }

    @Override
    public String generate(Long variableId, Map<String, String> params) {
        long min = parseLong(params.getOrDefault("min", "0"), 0L);
        long max = parseLong(params.getOrDefault("max", "9999"), 9999L);
        if (min > max) {
            long tmp = min;
            min = max;
            max = tmp;
        }
        long result = ThreadLocalRandom.current().nextLong(min, max + 1);
        return String.valueOf(result);
    }

    private long parseLong(String value, long defaultValue) {
        try {
            return Long.parseLong(value);
        } catch (Exception e) {
            return defaultValue;
        }
    }
}
