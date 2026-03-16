package com.hxuanyu.frogmoker.service.server;

import java.util.Map;

/**
 * 协议服务端接口
 * 所有协议服务端实现都需要实现此接口
 */
public interface ProtocolServer {

    /**
     * 获取协议类型标识（如 HTTP、WebSocket）
     */
    String getProtocol();

    /**
     * 获取服务端描述信息（包含参数配置）
     */
    ProtocolServerDescriptor getDescriptor();

    /**
     * 启动服务端实例
     * @param instanceId 实例 ID
     * @param params 启动参数
     * @throws ServerStartException 启动失败时抛出
     */
    void start(Long instanceId, Map<String, String> params) throws ServerStartException;

    /**
     * 停止服务端实例
     * @param instanceId 实例 ID
     */
    void stop(Long instanceId);

    /**
     * 检查服务端实例是否正在运行
     * @param instanceId 实例 ID
     * @return 是否正在运行
     */
    boolean isRunning(Long instanceId);

    /**
     * 获取服务端实例状态
     * @param instanceId 实例 ID
     * @return 状态信息
     */
    ServerStatus getStatus(Long instanceId);

    /**
     * 销毁资源（应用关闭时调用）
     */
    default void destroy() {
        // 默认实现：无需清理
    }
}
