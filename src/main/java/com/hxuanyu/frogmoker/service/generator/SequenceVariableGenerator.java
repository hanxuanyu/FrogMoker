package com.hxuanyu.frogmoker.service.generator;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.hxuanyu.frogmoker.entity.GeneratorSequenceState;
import com.hxuanyu.frogmoker.mapper.GeneratorSequenceStateMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Map;

@Component
public class SequenceVariableGenerator implements VariableValueGenerator {

    public static final String TYPE = "SEQUENCE";

    @Autowired
    private GeneratorSequenceStateMapper sequenceStateMapper;

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
                        VariableGeneratorParamDescriptor.text("padding", "补零位数", "序列号数字部分的最小位数，不足时左补零，例如填 4 则输出 0001", false, "4"),
                        VariableGeneratorParamDescriptor.text("step", "步长", "每次递增的步长，默认为 1", false, "1")
                )
        );
    }

    @Override
    public String generate(Long variableId, Map<String, String> params) {
        String prefix = params.getOrDefault("prefix", "");
        String datePattern = params.getOrDefault("datePattern", "");
        int padding = parseInt(params.getOrDefault("padding", "4"), 4);
        int step = parseInt(params.getOrDefault("step", "1"), 1);
        if (step <= 0) step = 1;

        // 获取或初始化序列状态
        GeneratorSequenceState state = sequenceStateMapper.selectOne(
                new LambdaQueryWrapper<GeneratorSequenceState>().eq(GeneratorSequenceState::getVariableId, variableId));
        long nextVal;
        if (state == null) {
            state = new GeneratorSequenceState();
            state.setVariableId(variableId);
            state.setCurrentValue((long) step);
            sequenceStateMapper.insert(state);
            nextVal = step;
        } else {
            nextVal = state.getCurrentValue() + step;
            state.setCurrentValue(nextVal);
            sequenceStateMapper.updateById(state);
        }

        // 构建前缀部分
        StringBuilder sb = new StringBuilder();
        sb.append(prefix);
        if (datePattern != null && !datePattern.isEmpty()) {
            try {
                sb.append(LocalDateTime.now().format(DateTimeFormatter.ofPattern(datePattern)));
            } catch (Exception ignored) {
            }
        }

        // 数字部分补零
        String numStr = String.valueOf(nextVal);
        if (padding > numStr.length()) {
            for (int i = 0; i < padding - numStr.length(); i++) sb.append('0');
        }
        sb.append(numStr);
        return sb.toString();
    }

    private int parseInt(String value, int defaultValue) {
        try {
            return Integer.parseInt(value);
        } catch (Exception e) {
            return defaultValue;
        }
    }
}
