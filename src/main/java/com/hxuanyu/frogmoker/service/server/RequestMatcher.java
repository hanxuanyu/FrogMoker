package com.hxuanyu.frogmoker.service.server;

import java.util.List;

/**
 * 请求匹配器接口
 */
public interface RequestMatcher {

    /**
     * 查找匹配的规则
     * @param request 请求上下文
     * @param rules 规则列表（已按优先级排序）
     * @return 匹配的规则，如果没有匹配则返回 null
     */
    MatchRule findMatchingRule(ServerRequest request, List<MatchRule> rules);

    /**
     * 检查单个规则是否匹配
     * @param request 请求上下文
     * @param rule 规则
     * @return 是否匹配
     */
    boolean matches(ServerRequest request, MatchRule rule);
}
