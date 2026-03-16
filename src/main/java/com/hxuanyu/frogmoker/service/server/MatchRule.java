package com.hxuanyu.frogmoker.service.server;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 匹配规则
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchRule {

    /**
     * 规则 ID
     */
    private Long id;

    /**
     * 实例 ID
     */
    private Long instanceId;

    /**
     * 规则名称
     */
    private String name;

    /**
     * 规则说明
     */
    private String description;

    /**
     * 优先级（数字越大优先级越高）
     */
    private int priority;

    /**
     * 匹配条件
     */
    private MatchCondition condition;

    /**
     * 响应配置
     */
    private ResponseConfig response;

    /**
     * 是否启用
     */
    private boolean enabled = true;
}
