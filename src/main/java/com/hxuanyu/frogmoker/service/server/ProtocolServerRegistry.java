package com.hxuanyu.frogmoker.service.server;

import com.hxuanyu.frogmoker.common.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.annotation.PreDestroy;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * 协议服务端注册中心
 */
@Slf4j
@Component
public class ProtocolServerRegistry {

    private final Map<String, ProtocolServer> serverMap = new ConcurrentHashMap<>();

    public ProtocolServerRegistry(List<ProtocolServer> servers) {
        for (ProtocolServer server : servers) {
            String protocol = normalizeProtocol(server.getProtocol());
            serverMap.put(protocol, server);
            log.info("Protocol server registered. protocol={}, name={}",
                    protocol, server.getDescriptor().getName());
        }
        log.info("Protocol server registry initialized. totalServers={}", serverMap.size());
    }

    public ProtocolServer getServer(String protocol) {
        String normalized = normalizeProtocol(protocol);
        ProtocolServer server = serverMap.get(normalized);
        if (server == null) {
            log.warn("Protocol server not found. protocol={}", protocol);
            throw new BusinessException("不支持的协议类型: " + protocol);
        }
        return server;
    }

    public boolean exists(String protocol) {
        return serverMap.containsKey(normalizeProtocol(protocol));
    }

    public List<ProtocolServerDescriptor> listDescriptors() {
        return serverMap.values().stream()
                .map(ProtocolServer::getDescriptor)
                .collect(Collectors.toList());
    }

    private String normalizeProtocol(String protocol) {
        return protocol == null ? null : protocol.toUpperCase(Locale.ROOT);
    }

    @PreDestroy
    public void destroy() {
        log.info("Destroying protocol server registry. totalServers={}", serverMap.size());
        serverMap.values().forEach(server -> {
            try {
                server.destroy();
            } catch (Exception e) {
                log.warn("Error destroying server. protocol={}", server.getProtocol(), e);
            }
        });
    }
}
