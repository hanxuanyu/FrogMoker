package com.hxuanyu.frogmoker.service.client;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;

import java.util.*;

/**
 * 参数解析工具类
 * 用于解析 MAP 和 ARRAY 类型的参数
 */
@Slf4j
public class ParamParser {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 解析 MAP 类型参数
     * 支持 JSON 格式：{"key1":"value1","key2":"value2"}
     *
     * @param value 参数值
     * @return 解析后的 Map
     */
    public static Map<String, String> parseMap(String value) {
        if (value == null || value.trim().isEmpty()) {
            return new HashMap<>();
        }

        try {
            // 尝试解析 JSON 格式
            return objectMapper.readValue(value, new TypeReference<Map<String, String>>() {});
        } catch (Exception e) {
            log.warn("Failed to parse map parameter as JSON: {}", value, e);
            return new HashMap<>();
        }
    }

    /**
     * 解析 ARRAY 类型参数
     * 支持 JSON 格式：["item1","item2","item3"]
     *
     * @param value 参数值
     * @return 解析后的 List
     */
    public static List<String> parseArray(String value) {
        if (value == null || value.trim().isEmpty()) {
            return new ArrayList<>();
        }

        try {
            // 尝试解析 JSON 格式
            return objectMapper.readValue(value, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            log.warn("Failed to parse array parameter as JSON: {}", value, e);
            return new ArrayList<>();
        }
    }

    /**
     * 将 Map 转换为 JSON 字符串
     */
    public static String mapToJson(Map<String, String> map) {
        try {
            return objectMapper.writeValueAsString(map);
        } catch (Exception e) {
            log.error("Failed to convert map to JSON", e);
            return "{}";
        }
    }

    /**
     * 将 List 转换为 JSON 字符串
     */
    public static String arrayToJson(List<String> list) {
        try {
            return objectMapper.writeValueAsString(list);
        } catch (Exception e) {
            log.error("Failed to convert array to JSON", e);
            return "[]";
        }
    }
}
