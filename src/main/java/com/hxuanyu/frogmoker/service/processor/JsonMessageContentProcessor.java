package com.hxuanyu.frogmoker.service.processor;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
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
            Object object = objectMapper.readValue(content, Object.class);
            String formatted = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(object);
            log.debug("Formatted JSON content successfully. originalLength={}, formattedLength={}",
                    safeLength(content), safeLength(formatted));
            return formatted;
        } catch (Exception e) {
            log.warn("Failed to format JSON content, returning original content. contentLength={}", safeLength(content), e);
            return content;
        }
    }

    @Override
    public List<String> parseVariables(String content) {
        List<String> variables = new ArrayList<String>();
        Matcher matcher = PLACEHOLDER_PATTERN.matcher(content);
        while (matcher.find()) {
            String variableName = matcher.group(1).trim();
            if (!variables.contains(variableName)) {
                variables.add(variableName);
            }
        }
        log.debug("Parsed JSON template variables. count={}, variables={}", variables.size(), variables);
        return variables;
    }

    @Override
    public String render(String content, Map<String, String> variables) {
        StringBuffer buffer = new StringBuffer();
        Matcher matcher = PLACEHOLDER_PATTERN.matcher(content);
        while (matcher.find()) {
            String variableName = matcher.group(1).trim();
            String value = variables.getOrDefault(variableName, matcher.group(0));
            matcher.appendReplacement(buffer, Matcher.quoteReplacement(value));
        }
        matcher.appendTail(buffer);
        String rendered = buffer.toString();
        log.debug("Rendered JSON template content. variableCount={}, outputLength={}",
                variables.size(), safeLength(rendered));
        return rendered;
    }

    private int safeLength(String value) {
        return value == null ? 0 : value.length();
    }
}
