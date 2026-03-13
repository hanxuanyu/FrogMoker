package com.hxuanyu.frogmoker.service.generator;

/**
 * 参数类型枚举
 */
public enum ParamType {
    /** 普通文本输入（单行） */
    TEXT,

    /** 多行文本输入 */
    TEXTAREA,

    /** 布尔开关（true/false） */
    BOOLEAN,

    /** 下拉选择 */
    SELECT,

    /** 键值对映射（如 HTTP Headers） */
    MAP,

    /** 数组列表 */
    ARRAY,

    /** 数字输入 */
    NUMBER
}
