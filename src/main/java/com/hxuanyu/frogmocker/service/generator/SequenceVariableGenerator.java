package com.hxuanyu.frogmocker.service.generator;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.hxuanyu.frogmocker.entity.GeneratorSequenceState;
import com.hxuanyu.frogmocker.mapper.GeneratorSequenceStateMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class SequenceVariableGenerator implements VariableValueGenerator {

    public static final String TYPE = "SEQUENCE";

    private final GeneratorSequenceStateMapper sequenceStateMapper;

    @Override
    public String getType() {
        return TYPE;
    }

    @Override
    public VariableGeneratorDescriptor getDescriptor() {
        return new VariableGeneratorDescriptor(
                TYPE,
                "序列号",
                "每次调用自动递增，支持前缀和补零",
                Arrays.asList(
                        VariableGeneratorParamDescriptor.text("prefix", "前缀", "序列号前缀，例如 ORD、SEQ，留空则无前缀", false, ""),
                        VariableGeneratorParamDescriptor.text("datePattern", "日期模板", "在前缀后追加日期，例如 yyyyMMdd，留空则不追加", false, ""),
                        VariableGeneratorParamDescriptor.text("padding", "补零位数", "数字部分的最小位数，不足时左侧补零，例如 4 输出 0001", false, "4"),
                        VariableGeneratorParamDescriptor.text("step", "步长", "每次递增的步长，默认 1", false, "1")
                )
        );
    }

    @Override
    public String generate(Long variableId, Map<String, String> params) {
        String prefix = params.getOrDefault("prefix", "");
        String datePattern = params.getOrDefault("datePattern", "");
        int padding = parseInt(params.getOrDefault("padding", "4"), 4);
        int step = parseInt(params.getOrDefault("step", "1"), 1);
        if (step <= 0) {
            log.debug("Sequence generator received non-positive step, fallback to default. variableId={}, step={}", variableId, step);
            step = 1;
        }

        GeneratorSequenceState state = sequenceStateMapper.selectOne(
                new LambdaQueryWrapper<GeneratorSequenceState>()
                        .eq(GeneratorSequenceState::getVariableId, variableId));

        long nextValue;
        if (state == null) {
            state = new GeneratorSequenceState();
            state.setVariableId(variableId);
            state.setCurrentValue((long) step);
            sequenceStateMapper.insert(state);
            nextValue = step;
            log.debug("Initialized sequence state. variableId={}, currentValue={}", variableId, nextValue);
        } else {
            nextValue = state.getCurrentValue() + step;
            state.setCurrentValue(nextValue);
            sequenceStateMapper.updateById(state);
            log.debug("Updated sequence state. variableId={}, currentValue={}", variableId, nextValue);
        }

        StringBuilder builder = new StringBuilder();
        builder.append(prefix);
        if (datePattern != null && !datePattern.isEmpty()) {
            try {
                builder.append(LocalDateTime.now().format(DateTimeFormatter.ofPattern(datePattern)));
            } catch (Exception e) {
                log.warn("Invalid date pattern configured for sequence generator. variableId={}, datePattern={}", variableId, datePattern, e);
            }
        }

        String number = String.valueOf(nextValue);
        if (padding > number.length()) {
            for (int i = 0; i < padding - number.length(); i++) {
                builder.append('0');
            }
        }
        builder.append(number);

        String result = builder.toString();
        log.debug("Generated sequence value. variableId={}, prefix={}, datePattern={}, padding={}, step={}, result={}",
                variableId, prefix, datePattern, padding, step, result);
        return result;
    }

    private int parseInt(String value, int defaultValue) {
        try {
            return Integer.parseInt(value);
        } catch (Exception e) {
            log.warn("Failed to parse integer parameter for sequence generator. value={}, defaultValue={}", value, defaultValue);
            return defaultValue;
        }
    }
}
