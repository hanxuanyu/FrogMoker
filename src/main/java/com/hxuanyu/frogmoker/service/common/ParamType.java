package com.hxuanyu.frogmoker.service.common;

/**
 * 参数类型枚举（通用）
 * 用于客户端、服务端、生成器的参数描述
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
