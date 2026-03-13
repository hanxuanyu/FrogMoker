package com.hxuanyu.frogmoker.service.generator;

import com.hxuanyu.frogmoker.common.BusinessException;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class VariableGeneratorRegistry {

    private final Map<String, VariableValueGenerator> generatorMap;

    public VariableGeneratorRegistry(List<VariableValueGenerator> generators) {
        this.generatorMap = generators.stream()
                .collect(Collectors.toMap(VariableValueGenerator::getType, Function.identity()));
    }

    public VariableValueGenerator getGenerator(String type) {
        VariableValueGenerator generator = generatorMap.get(type);
        if (generator == null) {
            throw new BusinessException("不支持的生成器类型: " + type);
        }
        return generator;
    }

    public List<VariableGeneratorDescriptor> listDescriptors() {
        return new ArrayList<>(generatorMap.values()).stream()
                .map(VariableValueGenerator::getDescriptor)
                .collect(Collectors.toList());
    }

    public boolean exists(String type) {
        return generatorMap.containsKey(type);
    }
}
