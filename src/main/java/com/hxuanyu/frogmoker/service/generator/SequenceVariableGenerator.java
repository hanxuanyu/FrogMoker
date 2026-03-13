package com.hxuanyu.frogmoker.service.generator;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.hxuanyu.frogmoker.entity.GeneratorSequenceState;
import com.hxuanyu.frogmoker.mapper.GeneratorSequenceStateMapper;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Map;

@Component
public class SequenceVariableGenerator implements VariableValueGenerator {

    public static final String TYPE = "SEQUENCE";

    private final GeneratorSequenceStateMapper sequenceStateMapper;

    public SequenceVariableGenerator(GeneratorSequenceStateMapper sequenceStateMapper) {
        this.sequenceStateMapper = sequenceStateMapper;
    }

    @Override
    public String getType() {
        return TYPE;
    }

    @Override
    public VariableGeneratorDescriptor getDescriptor() {
        return new VariableGeneratorDescriptor(
                TYPE,
                "序列号",
                "每次调用自增，支持日期时间前缀模板",
                Arrays.asList(
                        new VariableGeneratorParamDescriptor("prefix", "前缀模板，支持日期格式如 yyyyMMdd", false, ""),
                        new VariableGeneratorParamDescriptor("padding", "序号补零位数", false, "6"),
                        new VariableGeneratorParamDescriptor("step", "每次递增步长", false, "1")
                )
        );
    }

    @Override
    public synchronized String generate(Long variableId, Map<String, String> params) {
        // 查询或初始化状态
        GeneratorSequenceState state = sequenceStateMapper.selectOne(
                new LambdaQueryWrapper<GeneratorSequenceState>()
                        .eq(GeneratorSequenceState::getVariableId, variableId)
        );

        long step = parseLong(params.getOrDefault("step", "1"), 1L);

        if (state == null) {
            state = new GeneratorSequenceState();
            state.setVariableId(variableId);
            state.setCurrentValue(step);
            state.setUpdatedAt(LocalDateTime.now());
            sequenceStateMapper.insert(state);
        } else {
            long next = state.getCurrentValue() + step;
            state.setCurrentValue(next);
            state.setUpdatedAt(LocalDateTime.now());
            sequenceStateMapper.update(state,
                    new LambdaUpdateWrapper<GeneratorSequenceState>()
                            .eq(GeneratorSequenceState::getVariableId, variableId));
        }

        long seq = state.getCurrentValue();
        int padding = (int) parseLong(params.getOrDefault("padding", "6"), 6L);
        String seqStr = String.format("%0" + padding + "d", seq);

        String prefixTemplate = params.getOrDefault("prefix", "");
        String prefix = "";
        if (prefixTemplate != null && !prefixTemplate.isEmpty()) {
            try {
                prefix = LocalDateTime.now().format(DateTimeFormatter.ofPattern(prefixTemplate));
            } catch (Exception e) {
                prefix = prefixTemplate;
            }
        }

        return prefix + seqStr;
    }

    private long parseLong(String value, long defaultValue) {
        try {
            return Long.parseLong(value);
        } catch (Exception e) {
            return defaultValue;
        }
    }
}
