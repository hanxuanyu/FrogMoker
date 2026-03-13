package com.hxuanyu.frogmoker.service.processor;

import com.hxuanyu.frogmoker.common.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeSet;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Component
public class MessageContentProcessorFactory {

    private final Map<String, MessageContentProcessor> processorMap;

    public MessageContentProcessorFactory(List<MessageContentProcessor> processors) {
        this.processorMap = processors.stream()
                .collect(Collectors.toMap(
                        processor -> processor.getMessageType().toUpperCase(Locale.ROOT),
                        Function.identity()));
        log.info("Registered message content processors. types={}", new TreeSet<String>(processorMap.keySet()));
    }

    public MessageContentProcessor getProcessor(String messageType) {
        String normalizedType = messageType == null ? "" : messageType.toUpperCase(Locale.ROOT);
        MessageContentProcessor processor = processorMap.get(normalizedType);
        if (processor == null) {
            log.warn("Unsupported message content processor requested. messageType={}", messageType);
            throw new BusinessException("不支持的报文类型: " + messageType);
        }
        log.debug("Resolved message content processor. messageType={}, processor={}",
                normalizedType, processor.getClass().getSimpleName());
        return processor;
    }
}
