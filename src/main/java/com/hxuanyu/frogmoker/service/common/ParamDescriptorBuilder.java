package com.hxuanyu.frogmoker.service.common;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * 通用参数描述构建器
 * 提供链式调用方式简化参数配置
 * 用于客户端、服务端、生成器的参数构建
 */
public class ParamDescriptorBuilder {

    private final ParamDescriptor param;

    private ParamDescriptorBuilder() {
        this.param = new ParamDescriptor();
    }

    /**
     * 创建文本类型参数
     */
    public static ParamDescriptorBuilder text(String name, String label) {
        return new ParamDescriptorBuilder()
                .name(name)
                .label(label)
                .paramType(ParamType.TEXT);
    }

    /**
     * 创建多行文本类型参数
     */
    public static ParamDescriptorBuilder textarea(String name, String label) {
        return new ParamDescriptorBuilder()
                .name(name)
                .label(label)
                .paramType(ParamType.TEXTAREA);
    }

    /**
     * 创建数字类型参数
     */
    public static ParamDescriptorBuilder number(String name, String label) {
        return new ParamDescriptorBuilder()
                .name(name)
                .label(label)
                .paramType(ParamType.NUMBER);
    }

    /**
     * 创建布尔类型参数
     */
    public static ParamDescriptorBuilder bool(String name, String label) {
        return new ParamDescriptorBuilder()
                .name(name)
                .label(label)
                .paramType(ParamType.BOOLEAN);
    }

    /**
     * 创建下拉选择类型参数
     */
    public static ParamDescriptorBuilder select(String name, String label) {
        return new ParamDescriptorBuilder()
                .name(name)
                .label(label)
                .paramType(ParamType.SELECT);
    }

    /**
     * 创建键值对映射类型参数
     */
    public static ParamDescriptorBuilder map(String name, String label) {
        return new ParamDescriptorBuilder()
                .name(name)
                .label(label)
                .paramType(ParamType.MAP)
                .defaultValue("{}");
    }

    /**
     * 创建数组列表类型参数
     */
    public static ParamDescriptorBuilder array(String name, String label) {
        return new ParamDescriptorBuilder()
                .name(name)
                .label(label)
                .paramType(ParamType.ARRAY)
                .defaultValue("[]");
    }

    public ParamDescriptorBuilder name(String name) {
        param.setName(name);
        return this;
    }

    public ParamDescriptorBuilder label(String label) {
        param.setLabel(label);
        return this;
    }

    public ParamDescriptorBuilder description(String description) {
        param.setDescription(description);
        return this;
    }

    public ParamDescriptorBuilder paramType(ParamType paramType) {
        param.setParamType(paramType);
        return this;
    }

    public ParamDescriptorBuilder required(boolean required) {
        param.setRequired(required);
        return this;
    }

    public ParamDescriptorBuilder required() {
        return required(true);
    }

    public ParamDescriptorBuilder defaultValue(String defaultValue) {
        param.setDefaultValue(defaultValue);
        return this;
    }

    public ParamDescriptorBuilder placeholder(String placeholder) {
        param.setPlaceholder(placeholder);
        return this;
    }

    /**
     * 设置下拉选项（用于 SELECT 类型）
     */
    public ParamDescriptorBuilder options(SelectOption... options) {
        param.setOptions(Arrays.asList(options));
        return this;
    }

    /**
     * 设置下拉选项（用于 SELECT 类型）
     */
    public ParamDescriptorBuilder options(List<SelectOption> options) {
        param.setOptions(options);
        return this;
    }

    /**
     * 快速创建下拉选项（值和标签相同）
     */
    public ParamDescriptorBuilder options(String... values) {
        List<SelectOption> options = new ArrayList<>();
        for (String value : values) {
            options.add(new SelectOption(value, value));
        }
        param.setOptions(options);
        return this;
    }

    /**
     * 设置 MAP 类型的键标签
     */
    public ParamDescriptorBuilder keyLabel(String keyLabel) {
        param.setKeyLabel(keyLabel);
        return this;
    }

    /**
     * 设置 MAP 类型的值标签
     */
    public ParamDescriptorBuilder valueLabel(String valueLabel) {
        param.setValueLabel(valueLabel);
        return this;
    }

    /**
     * 设置 MAP 类型的键值标签
     */
    public ParamDescriptorBuilder mapLabels(String keyLabel, String valueLabel) {
        param.setKeyLabel(keyLabel);
        param.setValueLabel(valueLabel);
        return this;
    }

    /**
     * 设置 ARRAY 类型的项标签
     */
    public ParamDescriptorBuilder itemLabel(String itemLabel) {
        param.setItemLabel(itemLabel);
        return this;
    }

    /**
     * 设置参数依赖
     */
    public ParamDescriptorBuilder dependency(ParamDependency dependency) {
        param.setDependency(dependency);
        return this;
    }

    /**
     * 创建单个依赖条件（EQUALS）
     */
    public ParamDescriptorBuilder dependsOn(String paramName, String... expectedValues) {
        ParamDependency dependency = new ParamDependency();
        dependency.setDependsOn(paramName);
        dependency.setExpectedValues(Arrays.asList(expectedValues));
        dependency.setCondition(ParamDependency.DependencyCondition.EQUALS);
        param.setDependency(dependency);
        return this;
    }

    /**
     * 创建单个依赖条件（指定条件类型）
     */
    public ParamDescriptorBuilder dependsOn(String paramName, ParamDependency.DependencyCondition condition, String... expectedValues) {
        ParamDependency dependency = new ParamDependency();
        dependency.setDependsOn(paramName);
        dependency.setExpectedValues(Arrays.asList(expectedValues));
        dependency.setCondition(condition);
        param.setDependency(dependency);
        return this;
    }

    /**
     * 创建多依赖条件（AND 逻辑）
     */
    public ParamDescriptorBuilder dependsOnAll(ParamDependency... dependencies) {
        ParamDependency multiDependency = new ParamDependency();
        multiDependency.setDependencies(Arrays.asList(dependencies));
        multiDependency.setCombineLogic(ParamDependency.CombineLogic.AND);
        param.setDependency(multiDependency);
        return this;
    }

    /**
     * 创建多依赖条件（OR 逻辑）
     */
    public ParamDescriptorBuilder dependsOnAny(ParamDependency... dependencies) {
        ParamDependency multiDependency = new ParamDependency();
        multiDependency.setDependencies(Arrays.asList(dependencies));
        multiDependency.setCombineLogic(ParamDependency.CombineLogic.OR);
        param.setDependency(multiDependency);
        return this;
    }

    /**
     * 构建参数描述对象
     */
    public ParamDescriptor build() {
        return param;
    }

    /**
     * 依赖条件构建器（用于多依赖场景）
     */
    public static class DependencyBuilder {

        /**
         * 创建 EQUALS 依赖条件
         */
        public static ParamDependency equals(String paramName, String... expectedValues) {
            ParamDependency dependency = new ParamDependency();
            dependency.setDependsOn(paramName);
            dependency.setExpectedValues(Arrays.asList(expectedValues));
            dependency.setCondition(ParamDependency.DependencyCondition.EQUALS);
            return dependency;
        }

        /**
         * 创建 NOT_EQUALS 依赖条件
         */
        public static ParamDependency notEquals(String paramName, String... expectedValues) {
            ParamDependency dependency = new ParamDependency();
            dependency.setDependsOn(paramName);
            dependency.setExpectedValues(Arrays.asList(expectedValues));
            dependency.setCondition(ParamDependency.DependencyCondition.NOT_EQUALS);
            return dependency;
        }

        /**
         * 创建 NOT_EMPTY 依赖条件
         */
        public static ParamDependency notEmpty(String paramName) {
            ParamDependency dependency = new ParamDependency();
            dependency.setDependsOn(paramName);
            dependency.setCondition(ParamDependency.DependencyCondition.NOT_EMPTY);
            return dependency;
        }

        /**
         * 创建 IS_EMPTY 依赖条件
         */
        public static ParamDependency isEmpty(String paramName) {
            ParamDependency dependency = new ParamDependency();
            dependency.setDependsOn(paramName);
            dependency.setCondition(ParamDependency.DependencyCondition.IS_EMPTY);
            return dependency;
        }
    }
}
