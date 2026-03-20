package com.hxuanyu.frogmocker.service.server;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * 默认请求匹配器实现
 */
@Component
public class DefaultRequestMatcher implements RequestMatcher {

    @Override
    public MatchRule findMatchingRule(ServerRequest request, List<MatchRule> rules) {
        for (MatchRule rule : rules) {
            if (rule.isEnabled() && matches(request, rule)) {
                return rule;
            }
        }
        return null;
    }

    @Override
    public boolean matches(ServerRequest request, MatchRule rule) {
        if (rule.getCondition() == null) {
            return false;
        }
        return evaluateCondition(request, rule.getCondition());
    }

    /**
     * 评估条件
     */
    private boolean evaluateCondition(ServerRequest request, MatchCondition condition) {
        switch (condition.getType()) {
            case SIMPLE:
                return evaluateSimpleCondition(request, condition);
            case AND:
                return evaluateAndCondition(request, condition);
            case OR:
                return evaluateOrCondition(request, condition);
            default:
                return false;
        }
    }

    /**
     * 评估简单条件
     */
    private boolean evaluateSimpleCondition(ServerRequest request, MatchCondition condition) {
        String fieldValue = extractFieldValue(request, condition.getField());
        String expectedValue = condition.getValue();

        switch (condition.getOperator()) {
            case EQUALS:
                return fieldValue != null && fieldValue.equals(expectedValue);
            case NOT_EQUALS:
                return fieldValue == null || !fieldValue.equals(expectedValue);
            case CONTAINS:
                return fieldValue != null && fieldValue.contains(expectedValue);
            case NOT_CONTAINS:
                return fieldValue == null || !fieldValue.contains(expectedValue);
            case REGEX:
                return fieldValue != null && Pattern.matches(expectedValue, fieldValue);
            case EXISTS:
                return fieldValue != null;
            default:
                return false;
        }
    }

    /**
     * 评估 AND 条件
     */
    private boolean evaluateAndCondition(ServerRequest request, MatchCondition condition) {
        if (condition.getChildren() == null || condition.getChildren().isEmpty()) {
            return false;
        }
        for (MatchCondition child : condition.getChildren()) {
            if (!evaluateCondition(request, child)) {
                return false;
            }
        }
        return true;
    }

    /**
     * 评估 OR 条件
     */
    private boolean evaluateOrCondition(ServerRequest request, MatchCondition condition) {
        if (condition.getChildren() == null || condition.getChildren().isEmpty()) {
            return false;
        }
        for (MatchCondition child : condition.getChildren()) {
            if (evaluateCondition(request, child)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 提取字段值
     * 支持：method, path, header.xxx, query.xxx, body
     */
    private String extractFieldValue(ServerRequest request, String field) {
        if (field == null) {
            return null;
        }

        if ("method".equals(field)) {
            return request.getMethod();
        } else if ("path".equals(field)) {
            return request.getPath();
        } else if ("body".equals(field)) {
            return request.getBody();
        } else if (field.startsWith("header.")) {
            String headerName = field.substring(7);
            Map<String, String> headers = request.getHeaders();
            return headers != null ? headers.get(headerName) : null;
        } else if (field.startsWith("query.")) {
            String paramName = field.substring(6);
            Map<String, String> queryParams = request.getQueryParams();
            return queryParams != null ? queryParams.get(paramName) : null;
        }

        return null;
    }
}
