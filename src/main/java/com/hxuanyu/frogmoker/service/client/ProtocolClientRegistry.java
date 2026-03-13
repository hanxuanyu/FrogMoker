package com.hxuanyu.frogmoker.service.client;

import com.hxuanyu.frogmoker.common.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * 协议客户端注册中心
 */
@Slf4j
@Component
public class ProtocolClientRegistry {

    private final Map<String, ProtocolClient> clientMap = new ConcurrentHashMap<>();

    public ProtocolClientRegistry(List<ProtocolClient> clients) {
        for (ProtocolClient client : clients) {
            String protocol = normalizeProtocol(client.getProtocol());
            clientMap.put(protocol, client);
            log.info("Protocol client registered. protocol={}, name={}",
                    protocol, client.getDescriptor().getName());
        }
        log.info("Protocol client registry initialized. totalClients={}", clientMap.size());
    }

    public ProtocolClient getClient(String protocol) {
        String normalized = normalizeProtocol(protocol);
        ProtocolClient client = clientMap.get(normalized);
        if (client == null) {
            log.warn("Protocol client not found. protocol={}", protocol);
            throw new BusinessException("不支持的协议类型: " + protocol);
        }
        return client;
    }

    public boolean exists(String protocol) {
        return clientMap.containsKey(normalizeProtocol(protocol));
    }

    public List<ProtocolClientDescriptor> listDescriptors() {
        return clientMap.values().stream()
                .map(ProtocolClient::getDescriptor)
                .collect(Collectors.toList());
    }

    private String normalizeProtocol(String protocol) {
        return protocol == null ? null : protocol.toUpperCase(Locale.ROOT);
    }
}
