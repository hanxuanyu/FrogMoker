package com.hxuanyu.frogmocker.service.generator;

import java.util.Map;

/**
 * 变量值生成器接口，所有生成器均需实现此接口。
 * 新增生成器只需实现本接口并注册为Spring Bean即可自动被发现。
 */
public interface VariableValueGenerator {

    /**
     * 返回生成器类型标识（唯一，大写下划线风格，如 FIXED / SEQUENCE）
     */
    String getType();

    /**
     * 返回生成器的描述信息（名称、说明、支持的参数）
     */
    VariableGeneratorDescriptor getDescriptor();

    /**
     * 根据参数生成变量值
     *
     * @param variableId 变量ID（用于有状态生成器，如序列号）
     * @param params     生成器参数（key=参数名, value=参数值）
     * @return 生成的变量值字符串
     */
    String generate(Long variableId, Map<String, String> params);
}
