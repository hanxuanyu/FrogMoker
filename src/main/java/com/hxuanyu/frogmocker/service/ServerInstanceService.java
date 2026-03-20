package com.hxuanyu.frogmocker.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hxuanyu.frogmocker.common.BusinessException;
import com.hxuanyu.frogmocker.entity.ServerInstance;
import com.hxuanyu.frogmocker.mapper.ServerInstanceMapper;
import com.hxuanyu.frogmocker.service.server.ProtocolServer;
import com.hxuanyu.frogmocker.service.server.ProtocolServerRegistry;
import com.hxuanyu.frogmocker.service.server.ServerStartException;
import com.hxuanyu.frogmocker.service.server.ServerStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 服务端实例服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ServerInstanceService {

    private final ServerInstanceMapper instanceMapper;
    private final ProtocolServerRegistry serverRegistry;
    private final ObjectMapper objectMapper;

    /**
     * 获取所有服务端实例
     */
    public List<ServerInstance> listInstances() {
        log.debug("Listing all server instances");
        return instanceMapper.selectList(null);
    }

    /**
     * 根据 ID 获取实例
     */
    public ServerInstance getInstance(Long id) {
        ServerInstance instance = instanceMapper.selectById(id);
        if (instance == null) {
            throw new BusinessException("服务端实例不存在: " + id);
        }
        return instance;
    }

    /**
     * 创建服务端实例
     */
    @Transactional
    public ServerInstance createInstance(String name, String description, String protocol, Map<String, String> params) {
        log.info("Creating server instance. name={}, protocol={}", name, protocol);

        // 验证协议是否支持
        if (!serverRegistry.exists(protocol)) {
            throw new BusinessException("不支持的协议类型: " + protocol);
        }

        try {
            ServerInstance instance = new ServerInstance();
            instance.setName(name);
            instance.setDescription(description);
            instance.setProtocol(protocol.toUpperCase());
            instance.setParams(objectMapper.writeValueAsString(params));
            instance.setStatus("STOPPED");

            instanceMapper.insert(instance);
            log.info("Server instance created. id={}, name={}", instance.getId(), name);
            return instance;
        } catch (Exception e) {
            log.error("Failed to create server instance. name={}", name, e);
            throw new BusinessException("创建服务端实例失败: " + e.getMessage());
        }
    }

    /**
     * 更新服务端实例
     */
    @Transactional
    public ServerInstance updateInstance(Long id, String name, String description, Map<String, String> params) {
        log.info("Updating server instance. id={}, name={}", id, name);

        ServerInstance instance = getInstance(id);

        // 如果实例正在运行，不允许修改
        if ("RUNNING".equals(instance.getStatus())) {
            throw new BusinessException("服务端实例正在运行，请先停止后再修改");
        }

        try {
            instance.setName(name);
            instance.setDescription(description);
            instance.setParams(objectMapper.writeValueAsString(params));

            instanceMapper.updateById(instance);
            log.info("Server instance updated. id={}", id);
            return instance;
        } catch (Exception e) {
            log.error("Failed to update server instance. id={}", id, e);
            throw new BusinessException("更新服务端实例失败: " + e.getMessage());
        }
    }

    /**
     * 删除服务端实例
     */
    @Transactional
    public void deleteInstance(Long id) {
        log.info("Deleting server instance. id={}", id);

        ServerInstance instance = getInstance(id);

        // 如果实例正在运行，先停止
        if ("RUNNING".equals(instance.getStatus())) {
            stopInstance(id);
        }

        instanceMapper.deleteById(id);
        log.info("Server instance deleted. id={}", id);
    }

    /**
     * 启动服务端实例
     */
    @Transactional
    public void startInstance(Long id) {
        log.info("Starting server instance. id={}", id);

        ServerInstance instance = getInstance(id);

        if ("RUNNING".equals(instance.getStatus())) {
            throw new BusinessException("服务端实例已在运行中");
        }

        try {
            // 解析参数
            Map<String, String> params = objectMapper.readValue(
                    instance.getParams(),
                    objectMapper.getTypeFactory().constructMapType(Map.class, String.class, String.class)
            );

            // 获取协议服务端并启动
            ProtocolServer server = serverRegistry.getServer(instance.getProtocol());
            server.start(id, params);

            // 更新数据库状态
            instance.setStatus("RUNNING");
            instance.setStartTime(LocalDateTime.now());
            instance.setStopTime(null);
            instance.setErrorMessage(null);
            instanceMapper.updateById(instance);

            log.info("Server instance started. id={}", id);

        } catch (ServerStartException e) {
            log.error("Failed to start server instance. id={}", id, e);

            // 更新失败状态
            instance.setStatus("FAILED");
            instance.setErrorMessage(e.getMessage());
            instanceMapper.updateById(instance);

            throw new BusinessException("启动服务端实例失败: " + e.getMessage());
        } catch (Exception e) {
            log.error("Failed to start server instance. id={}", id, e);
            throw new BusinessException("启动服务端实例失败: " + e.getMessage());
        }
    }

    /**
     * 停止服务端实例
     */
    @Transactional
    public void stopInstance(Long id) {
        log.info("Stopping server instance. id={}", id);

        ServerInstance instance = getInstance(id);

        if (!"RUNNING".equals(instance.getStatus())) {
            throw new BusinessException("服务端实例未在运行中");
        }

        try {
            // 获取协议服务端并停止
            ProtocolServer server = serverRegistry.getServer(instance.getProtocol());
            server.stop(id);

            // 更新数据库状态
            instance.setStatus("STOPPED");
            instance.setStopTime(LocalDateTime.now());
            instanceMapper.updateById(instance);

            log.info("Server instance stopped. id={}", id);

        } catch (Exception e) {
            log.error("Failed to stop server instance. id={}", id, e);
            throw new BusinessException("停止服务端实例失败: " + e.getMessage());
        }
    }

    /**
     * 重启服务端实例
     */
    @Transactional
    public void restartInstance(Long id) {
        log.info("Restarting server instance. id={}", id);
        stopInstance(id);
        startInstance(id);
    }

    /**
     * 获取服务端实例状态
     */
    public ServerStatus getInstanceStatus(Long id) {
        ServerInstance instance = getInstance(id);

        try {
            ProtocolServer server = serverRegistry.getServer(instance.getProtocol());
            return server.getStatus(id);
        } catch (Exception e) {
            log.error("Failed to get server instance status. id={}", id, e);
            ServerStatus status = new ServerStatus();
            status.setRunning(false);
            status.setErrorMessage(e.getMessage());
            return status;
        }
    }
}
