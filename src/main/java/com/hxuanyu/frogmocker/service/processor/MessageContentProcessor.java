package com.hxuanyu.frogmocker.service.processor;

import java.util.List;
import java.util.Map;

/**
 * 报文内容处理器接口，针对不同报文类型（XML/JSON）分别实现。
 */
public interface MessageContentProcessor {

    /**
     * 返回支持的报文类型，如 XML / JSON
     */
    String getMessageType();

    /**
     * 格式化报文内容
     */
    String format(String content);

    /**
     * 解析报文中的变量占位符，返回变量名列表
     */
    List<String> parseVariables(String content);

    /**
     * 将变量值填充到报文中，返回渲染后的报文
     *
     * @param content   含占位符的报文模板
     * @param variables 变量名 -> 变量值 的映射
     */
    String render(String content, Map<String, String> variables);
}
