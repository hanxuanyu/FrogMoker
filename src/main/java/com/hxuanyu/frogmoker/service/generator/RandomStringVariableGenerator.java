package com.hxuanyu.frogmoker.service.generator;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Component
public class RandomStringVariableGenerator implements VariableValueGenerator {

    public static final String TYPE = "RANDOM_STRING";

    private static final String CHARS_LOWER = "abcdefghijklmnopqrstuvwxyz";
    private static final String CHARS_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String CHARS_DIGIT = "0123456789";

    @Override
    public String getType() {
        return TYPE;
    }

    @Override
    public VariableGeneratorDescriptor getDescriptor() {
        return new VariableGeneratorDescriptor(
                TYPE,
                "随机字符串",
                "生成指定长度的随机字符串",
                Arrays.asList(
                        VariableGeneratorParamDescriptor.text("length", "长度", "生成字符串的长度，默认为 8", false, "8"),
                        VariableGeneratorParamDescriptor.select("charset", "字符集", "选择生成字符串所使用的字符集", false, "alphanumeric",
                                new com.hxuanyu.frogmoker.service.common.SelectOption("alpha", "纯字母"),
                                new com.hxuanyu.frogmoker.service.common.SelectOption("numeric", "纯数字"),
                                new com.hxuanyu.frogmoker.service.common.SelectOption("alphanumeric", "字母+数字")
                        ),
                        VariableGeneratorParamDescriptor.bool("uppercase", "全部大写", "是否将生成的字符串全部转换为大写", false)
                )
        );
    }

    @Override
    public String generate(Long variableId, Map<String, String> params) {
        int length = parseInt(params.getOrDefault("length", "8"), 8);
        if (length <= 0) {
            log.debug("Random string generator received non-positive length, fallback to default. variableId={}, length={}", variableId, length);
            length = 8;
        }

        String charset = params.getOrDefault("charset", "alphanumeric");
        String pool;
        switch (charset.toLowerCase()) {
            case "alpha":
                pool = CHARS_LOWER + CHARS_UPPER;
                break;
            case "numeric":
                pool = CHARS_DIGIT;
                break;
            default:
                pool = CHARS_LOWER + CHARS_UPPER + CHARS_DIGIT;
                break;
        }

        StringBuilder builder = new StringBuilder(length);
        ThreadLocalRandom random = ThreadLocalRandom.current();
        for (int i = 0; i < length; i++) {
            builder.append(pool.charAt(random.nextInt(pool.length())));
        }

        String result = builder.toString();
        boolean uppercase = "true".equalsIgnoreCase(params.getOrDefault("uppercase", "false"));
        if (uppercase) {
            result = result.toUpperCase();
        }

        log.debug("Generated random string. variableId={}, length={}, charset={}, uppercase={}, preview={}",
                variableId, length, charset, uppercase, summarize(result));
        return result;
    }

    private int parseInt(String value, int defaultValue) {
        try {
            return Integer.parseInt(value);
        } catch (Exception e) {
            log.warn("Failed to parse integer parameter for random string generator. value={}, defaultValue={}", value, defaultValue);
            return defaultValue;
        }
    }

    private String summarize(String value) {
        if (value == null || value.length() <= 48) {
            return value;
        }
        return value.substring(0, 45) + "...";
    }
}
