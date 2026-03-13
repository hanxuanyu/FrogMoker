package com.hxuanyu.frogmoker.service.processor;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * JSON报文处理器，占位符格式：{{varName}}
 */
@Component
public class JsonMessageContentProcessor implements MessageContentProcessor {

    private static final Pattern PLACEHOLDER_PATTERN = Pattern.compile("\\{\\{([^}]+)}}");

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String getMessageType() {
        return "JSON";
    }

    @Override
    public String format(String content) {
        try {
            Object obj = objectMapper.readValue(content, Object.class);
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(obj);
        } catch (Exception e) {
            return content;
        }
    }

    @Override
    public List<String> parseVariables(String content) {
        List<String> variables = new ArrayList<>();
        Matcher matcher = PLACEHOLDER_PATTERN.matcher(content);
        while (matcher.find()) {
            String varName = matcher.group(1).trim();
            if (!variables.contains(varName)) {
                variables.add(varName);
            }
        }
        return variables;
    }

    @Override
    public String render(String content, Map<String, String> variables) {
        StringBuffer sb = new StringBuffer();
        Matcher matcher = PLACEHOLDER_PATTERN.matcher(content);
        while (matcher.find()) {
            String varName = matcher.group(1).trim();
            String value = variables.getOrDefault(varName, matcher.group(0));
            matcher.appendReplacement(sb, Matcher.quoteReplacement(value));
        }
        matcher.appendTail(sb);
        return sb.toString();
    }
}
