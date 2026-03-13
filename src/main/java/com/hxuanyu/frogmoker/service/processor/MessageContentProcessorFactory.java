package com.hxuanyu.frogmoker.service.processor;

import com.hxuanyu.frogmoker.common.BusinessException;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class MessageContentProcessorFactory {

    private final Map<String, MessageContentProcessor> processorMap;

    public MessageContentProcessorFactory(List<MessageContentProcessor> processors) {
        this.processorMap = processors.stream()
                .collect(Collectors.toMap(MessageContentProcessor::getMessageType, Function.identity()));
    }

    public MessageContentProcessor getProcessor(String messageType) {
        MessageContentProcessor processor = processorMap.get(messageType.toUpperCase());
        if (processor == null) {
            throw new BusinessException("不支持的报文类型: " + messageType);
        }
        return processor;
    }
}
