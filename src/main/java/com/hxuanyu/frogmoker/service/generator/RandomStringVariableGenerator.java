package com.hxuanyu.frogmoker.service.generator;

import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

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
                                new SelectOption("alpha", "纯字母"),
                                new SelectOption("numeric", "纯数字"),
                                new SelectOption("alphanumeric", "字母+数字")
                        ),
                        VariableGeneratorParamDescriptor.bool("uppercase", "全部大写", "是否将生成的字符串全部转为大写", false)
                )
        );
    }

    @Override
    public String generate(Long variableId, Map<String, String> params) {
        int length = parseInt(params.getOrDefault("length", "8"), 8);
        if (length <= 0) length = 8;

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

        StringBuilder sb = new StringBuilder(length);
        ThreadLocalRandom rnd = ThreadLocalRandom.current();
        for (int i = 0; i < length; i++) {
            sb.append(pool.charAt(rnd.nextInt(pool.length())));
        }

        String result = sb.toString();
        if ("true".equalsIgnoreCase(params.getOrDefault("uppercase", "false"))) {
            result = result.toUpperCase();
        }
        return result;
    }

    private int parseInt(String value, int defaultValue) {
        try {
            return Integer.parseInt(value);
        } catch (Exception e) {
            return defaultValue;
        }
    }
}
