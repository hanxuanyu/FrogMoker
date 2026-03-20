package com.hxuanyu.frogmocker.service.generator;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Map;

@Slf4j
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
                        VariableGeneratorParamDescriptor.text("format", "格式", "日期格式模板，例如 yyyy-MM-dd HH:mm:ss；留空则输出毫秒时间戳", false, ""),
                        VariableGeneratorParamDescriptor.text("offsetSeconds", "偏移秒数", "相对当前时间的偏移秒数，可为负数", false, "0")
                )
        );
    }

    @Override
    public String generate(Long variableId, Map<String, String> params) {
        long offsetSeconds = parseLong(params.getOrDefault("offsetSeconds", "0"), 0L);
        LocalDateTime dateTime = LocalDateTime.now().plusSeconds(offsetSeconds);
        String format = params.getOrDefault("format", "");

        if (format == null || format.isEmpty()) {
            Instant instant = dateTime.atZone(ZoneId.systemDefault()).toInstant();
            String result = String.valueOf(instant.toEpochMilli());
            log.debug("Generated timestamp value. variableId={}, offsetSeconds={}, result={}", variableId, offsetSeconds, result);
            return result;
        }

        try {
            String result = dateTime.format(DateTimeFormatter.ofPattern(format));
            log.debug("Generated formatted timestamp value. variableId={}, offsetSeconds={}, format={}, result={}",
                    variableId, offsetSeconds, format, result);
            return result;
        } catch (Exception e) {
            String fallback = dateTime.toString();
            log.warn("Invalid timestamp format configured, using LocalDateTime.toString(). variableId={}, format={}, fallback={}",
                    variableId, format, fallback, e);
            return fallback;
        }
    }

    private long parseLong(String value, long defaultValue) {
        try {
            return Long.parseLong(value);
        } catch (Exception e) {
            log.warn("Failed to parse long parameter for timestamp generator. value={}, defaultValue={}", value, defaultValue);
            return defaultValue;
        }
    }
}
