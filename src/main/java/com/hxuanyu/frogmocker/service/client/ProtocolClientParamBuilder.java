package com.hxuanyu.frogmocker.service.client;

import com.hxuanyu.frogmocker.service.common.*;

import java.util.List;

/**
 * 协议客户端参数描述构建器
 * 提供链式调用方式简化参数配置
 * @deprecated 使用 {@link ParamDescriptorBuilder} 替代
 */
@Deprecated
public class ProtocolClientParamBuilder {

    private final ParamDescriptorBuilder delegate;

    private ProtocolClientParamBuilder(ParamDescriptorBuilder delegate) {
        this.delegate = delegate;
    }

    /**
     * 创建文本类型参数
     */
    public static ProtocolClientParamBuilder text(String name, String label) {
        return new ProtocolClientParamBuilder(ParamDescriptorBuilder.text(name, label));
    }

    /**
     * 创建多行文本类型参数
     */
    public static ProtocolClientParamBuilder textarea(String name, String label) {
        return new ProtocolClientParamBuilder(ParamDescriptorBuilder.textarea(name, label));
    }

    /**
     * 创建数字类型参数
     */
    public static ProtocolClientParamBuilder number(String name, String label) {
        return new ProtocolClientParamBuilder(ParamDescriptorBuilder.number(name, label));
    }

    /**
     * 创建布尔类型参数
     */
    public static ProtocolClientParamBuilder bool(String name, String label) {
        return new ProtocolClientParamBuilder(ParamDescriptorBuilder.bool(name, label));
    }

    /**
     * 创建下拉选择类型参数
     */
    public static ProtocolClientParamBuilder select(String name, String label) {
        return new ProtocolClientParamBuilder(ParamDescriptorBuilder.select(name, label));
    }

    /**
     * 创建键值对映射类型参数
     */
    public static ProtocolClientParamBuilder map(String name, String label) {
        return new ProtocolClientParamBuilder(ParamDescriptorBuilder.map(name, label));
    }

    /**
     * 创建数组列表类型参数
     */
    public static ProtocolClientParamBuilder array(String name, String label) {
        return new ProtocolClientParamBuilder(ParamDescriptorBuilder.array(name, label));
    }

    public ProtocolClientParamBuilder name(String name) {
        delegate.name(name);
        return this;
    }

    public ProtocolClientParamBuilder label(String label) {
        delegate.label(label);
        return this;
    }

    public ProtocolClientParamBuilder description(String description) {
        delegate.description(description);
        return this;
    }

    public ProtocolClientParamBuilder paramType(ParamType paramType) {
        delegate.paramType(paramType);
        return this;
    }

    public ProtocolClientParamBuilder required(boolean required) {
        delegate.required(required);
        return this;
    }

    public ProtocolClientParamBuilder required() {
        delegate.required();
        return this;
    }

    public ProtocolClientParamBuilder defaultValue(String defaultValue) {
        delegate.defaultValue(defaultValue);
        return this;
    }

    public ProtocolClientParamBuilder placeholder(String placeholder) {
        delegate.placeholder(placeholder);
        return this;
    }

    public ProtocolClientParamBuilder options(SelectOption... options) {
        delegate.options(options);
        return this;
    }

    public ProtocolClientParamBuilder options(List<SelectOption> options) {
        delegate.options(options);
        return this;
    }

    public ProtocolClientParamBuilder options(String... values) {
        delegate.options(values);
        return this;
    }

    public ProtocolClientParamBuilder keyLabel(String keyLabel) {
        delegate.keyLabel(keyLabel);
        return this;
    }

    public ProtocolClientParamBuilder valueLabel(String valueLabel) {
        delegate.valueLabel(valueLabel);
        return this;
    }

    public ProtocolClientParamBuilder mapLabels(String keyLabel, String valueLabel) {
        delegate.mapLabels(keyLabel, valueLabel);
        return this;
    }

    public ProtocolClientParamBuilder itemLabel(String itemLabel) {
        delegate.itemLabel(itemLabel);
        return this;
    }

    public ProtocolClientParamBuilder dependency(com.hxuanyu.frogmocker.service.common.ParamDependency dependency) {
        delegate.dependency(dependency);
        return this;
    }

    /**
     * 创建单个依赖条件（EQUALS）
     */
    public ProtocolClientParamBuilder dependsOn(String paramName, String... expectedValues) {
        delegate.dependsOn(paramName, expectedValues);
        return this;
    }

    /**
     * 创建单个依赖条件（指定条件类型）
     */
    public ProtocolClientParamBuilder dependsOn(String paramName, com.hxuanyu.frogmocker.service.common.ParamDependency.DependencyCondition condition, String... expectedValues) {
        delegate.dependsOn(paramName, condition, expectedValues);
        return this;
    }

    /**
     * 创建多依赖条件（AND 逻辑）
     */
    public ProtocolClientParamBuilder dependsOnAll(com.hxuanyu.frogmocker.service.common.ParamDependency... dependencies) {
        delegate.dependsOnAll(dependencies);
        return this;
    }

    /**
     * 创建多依赖条件（OR 逻辑）
     */
    public ProtocolClientParamBuilder dependsOnAny(com.hxuanyu.frogmocker.service.common.ParamDependency... dependencies) {
        delegate.dependsOnAny(dependencies);
        return this;
    }

    public ParamDescriptor build() {
        return delegate.build();
    }

    /**
     * 依赖条件构建器（用于多依赖场景）
     */
    public static class DependencyBuilder {

        public static com.hxuanyu.frogmocker.service.common.ParamDependency equals(String paramName, String... expectedValues) {
            return ParamDescriptorBuilder.DependencyBuilder.equals(paramName, expectedValues);
        }

        public static com.hxuanyu.frogmocker.service.common.ParamDependency notEquals(String paramName, String... expectedValues) {
            return ParamDescriptorBuilder.DependencyBuilder.notEquals(paramName, expectedValues);
        }

        public static com.hxuanyu.frogmocker.service.common.ParamDependency notEmpty(String paramName) {
            return ParamDescriptorBuilder.DependencyBuilder.notEmpty(paramName);
        }

        public static com.hxuanyu.frogmocker.service.common.ParamDependency isEmpty(String paramName) {
            return ParamDescriptorBuilder.DependencyBuilder.isEmpty(paramName);
        }
    }
}
