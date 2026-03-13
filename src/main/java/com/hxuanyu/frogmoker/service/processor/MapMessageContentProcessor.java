package com.hxuanyu.frogmoker.service.processor;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * MAP 类型报文内容处理器
 * 用于处理键值对形式的报文，如 HTTP 表单参数
 * 格式：{"key1": "{{var1}}", "key2": "value2"}
 */
@Slf4j
@Component
public class MapMessageContentProcessor implements MessageContentProcessor {

    private static final String MESSAGE_TYPE = "MAP";
    private static final Pattern VARIABLE_PATTERN = Pattern.compile("\\{\\{([^}]+)}}");
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String getMessageType() {
        return MESSAGE_TYPE;
    }

    @Override
    public String format(String content) {
        try {
            // 解析 JSON 为 Map
            Map<String, String> map = objectMapper.readValue(content, new TypeReference<Map<String, String>>() {});
            // 格式化输出
            String formatted = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(map);
            log.debug("Formatted MAP content successfully. originalLength={}, formattedLength={}",
                    safeLength(content), safeLength(formatted));
            return formatted;
        } catch (Exception e) {
            log.warn("Failed to format MAP content, returning original content. contentLength={}", safeLength(content), e);
            return content;
        }
    }

    @Override
    public List<String> parseVariables(String content) {
        Set<String> variables = new LinkedHashSet<>();

        try {
            // 解析 JSON 为 Map
            Map<String, String> map = objectMapper.readValue(content, new TypeReference<Map<String, String>>() {});

            // 从每个值中提取变量
            for (String value : map.values()) {
                if (value != null) {
                    Matcher matcher = VARIABLE_PATTERN.matcher(value);
                    while (matcher.find()) {
                        variables.add(matcher.group(1));
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to parse MAP content: {}", content, e);
        }

        return new ArrayList<>(variables);
    }

    @Override
    public String render(String content, Map<String, String> variableValues) {
        try {
            // 解析 JSON 为 Map
            Map<String, String> map = objectMapper.readValue(content, new TypeReference<Map<String, String>>() {});

            // 替换每个值中的变量
            Map<String, String> renderedMap = new LinkedHashMap<>();
            for (Map.Entry<String, String> entry : map.entrySet()) {
                String value = entry.getValue();
                if (value != null) {
                    // 替换所有变量占位符
                    for (Map.Entry<String, String> varEntry : variableValues.entrySet()) {
                        String placeholder = "{{" + varEntry.getKey() + "}}";
                        value = value.replace(placeholder, varEntry.getValue());
                    }
                }
                renderedMap.put(entry.getKey(), value);
            }

            // 转换回 JSON
            return objectMapper.writeValueAsString(renderedMap);
        } catch (Exception e) {
            log.error("Failed to render MAP content: {}", content, e);
            return content;
        }
    }

    private int safeLength(String value) {
        return value == null ? 0 : value.length();
    }
}
