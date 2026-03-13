package com.hxuanyu.frogmoker.service.generator;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Map;

@Component
public class TimestampVariableGenerator implements VariableValueGenerator {

    public static final String TYPE = "TIMESTAMP";

    @Override
    public String getType() {
        return TYPE;
    }

    @Override
    public VariableGeneratorDescriptor getDescriptor() {
        return new VariableGeneratorDescriptor(
                TYPE,
                "时间戳",
                "生成当前时间的时间戳或格式化日期字符串",
                Arrays.asList(
                        new VariableGeneratorParamDescriptor("format", "格式", "日期格式模板，如 yyyy-MM-dd HH:mm:ss；留空则输出毫秒时间戳", false, ""),
                        new VariableGeneratorParamDescriptor("offsetSeconds", "偏移秒数", "相对当前时间的偏移秒数，可为负数", false, "0")
                )
        );
    }

    @Override
    public String generate(Long variableId, Map<String, String> params) {
        long offset = parseLong(params.getOrDefault("offsetSeconds", "0"), 0L);
        LocalDateTime now = LocalDateTime.now().plusSeconds(offset);
        String format = params.getOrDefault("format", "");
        if (format == null || format.isEmpty()) {
            // 输出毫秒时间戳
            java.time.Instant instant = now.atZone(java.time.ZoneId.systemDefault()).toInstant();
            return String.valueOf(instant.toEpochMilli());
        }
        try {
            return now.format(DateTimeFormatter.ofPattern(format));
        } catch (Exception e) {
            return now.toString();
        }
    }

    private long parseLong(String value, long defaultValue) {
        try {
            return Long.parseLong(value);
        } catch (Exception e) {
            return defaultValue;
        }
    }
}
