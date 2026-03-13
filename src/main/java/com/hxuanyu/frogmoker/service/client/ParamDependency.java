package com.hxuanyu.frogmoker.service.client;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 参数联动配置
 * 用于定义参数之间的依赖关系，实现动态显示/隐藏
 * 支持单个依赖或多个依赖的组合（AND/OR 逻辑）
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParamDependency {

    /**
     * 依赖的参数名（单个依赖时使用）
     */
    private String dependsOn;

    /**
     * 依赖参数的期望值列表（满足其中之一即可显示当前参数）
     */
    private List<String> expectedValues;

    /**
     * 依赖条件类型
     */
    private DependencyCondition condition;

    /**
     * 多个依赖条件（用于复杂场景）
     */
    private List<ParamDependency> dependencies;

    /**
     * 多依赖的组合逻辑（AND 或 OR）
     */
    private CombineLogic combineLogic;

    public enum DependencyCondition {
        /** 等于任一期望值 */
        EQUALS,
        /** 不等于任一期望值 */
        NOT_EQUALS,
        /** 期望值不为空 */
        NOT_EMPTY,
        /** 期望值为空 */
        IS_EMPTY
    }

    public enum CombineLogic {
        /** 所有条件都满足 */
        AND,
        /** 任一条件满足 */
        OR
    }

    /**
     * 判断是否为多依赖模式
     */
    public boolean isMultiDependency() {
        return dependencies != null && !dependencies.isEmpty();
    }
}
