package com.hxuanyu.frogmoker.service.client;

import java.util.Map;

/**
 * 协议客户端接口，所有协议客户端均需实现此接口。
 * 新增客户端只需实现本接口并注册为Spring Bean即可自动被发现。
 */
public interface ProtocolClient {

    /**
     * 返回协议类型标识（唯一，大写下划线风格，如 HTTP / TCP / WEBSOCKET）
     */
    String getProtocol();

    /**
     * 返回客户端的描述信息（名称、说明、支持的参数）
     */
    ProtocolClientDescriptor getDescriptor();

    /**
     * 发送报文并返回响应
     *
     * @param message 要发送的报文内容
     * @param params  客户端参数（如URL、超时时间等）
     * @return 响应结果
     */
    ClientResponse send(String message, Map<String, String> params);
}
