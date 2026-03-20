package com.hxuanyu.frogmocker.service.server;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 匹配条件
 * 支持简单条件和组合条件（AND/OR）
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchCondition {

    /**
     * 条件类型
     */
    private ConditionType type;

    /**
     * 字段名（简单条件时使用）
     * 支持：method, path, header.xxx, query.xxx, body
     */
    private String field;

    /**
     * 操作符（简单条件时使用）
     */
    private Operator operator;

    /**
     * 期望值（简单条件时使用）
     */
    private String value;

    /**
     * 子条件列表（组合条件时使用）
     */
    private List<MatchCondition> children;

    public enum ConditionType {
        /** 简单条件 */
        SIMPLE,
        /** AND 组合 */
        AND,
        /** OR 组合 */
        OR
    }

    public enum Operator {
        /** 等于 */
        EQUALS,
        /** 包含 */
        CONTAINS,
        /** 正则匹配 */
        REGEX,
        /** 字段存在 */
        EXISTS,
        /** 不等于 */
        NOT_EQUALS,
        /** 不包含 */
        NOT_CONTAINS
    }
}
