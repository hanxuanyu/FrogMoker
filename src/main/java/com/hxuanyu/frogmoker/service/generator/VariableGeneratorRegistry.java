package com.hxuanyu.frogmoker.service.generator;

import com.hxuanyu.frogmoker.common.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeSet;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Component
public class VariableGeneratorRegistry {

    private final Map<String, VariableValueGenerator> generatorMap;

    public VariableGeneratorRegistry(List<VariableValueGenerator> generators) {
        this.generatorMap = generators.stream()
                .collect(Collectors.toMap(
                        generator -> generator.getType().toUpperCase(Locale.ROOT),
                        Function.identity()));
        log.info("Registered variable generators. types={}", new TreeSet<String>(generatorMap.keySet()));
    }

    public VariableValueGenerator getGenerator(String type) {
        String normalizedType = type == null ? "" : type.toUpperCase(Locale.ROOT);
        VariableValueGenerator generator = generatorMap.get(normalizedType);
        if (generator == null) {
            log.warn("Unsupported variable generator requested. type={}", type);
            throw new BusinessException("不支持的生成器类型: " + type);
        }
        log.debug("Resolved variable generator. type={}, generator={}", normalizedType, generator.getClass().getSimpleName());
        return generator;
    }

    public List<VariableGeneratorDescriptor> listDescriptors() {
        log.debug("Collecting variable generator descriptors. count={}", generatorMap.size());
        return new ArrayList<VariableValueGenerator>(generatorMap.values()).stream()
                .map(VariableValueGenerator::getDescriptor)
                .collect(Collectors.toList());
    }

    public boolean exists(String type) {
        return generatorMap.containsKey(type == null ? "" : type.toUpperCase(Locale.ROOT));
    }
}
