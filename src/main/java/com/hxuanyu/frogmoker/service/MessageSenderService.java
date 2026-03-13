package com.hxuanyu.frogmoker.service;

import com.hxuanyu.frogmoker.common.BusinessException;
import com.hxuanyu.frogmoker.dto.SendMessageRequest;
import com.hxuanyu.frogmoker.dto.SendMessageResponse;
import com.hxuanyu.frogmoker.service.client.ClientResponse;
import com.hxuanyu.frogmoker.service.client.ProtocolClient;
import com.hxuanyu.frogmoker.service.client.ProtocolClientDescriptor;
import com.hxuanyu.frogmoker.service.client.ProtocolClientParamDescriptor;
import com.hxuanyu.frogmoker.service.client.ProtocolClientRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * 报文发送服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MessageSenderService {

    private final MessageTemplateService templateService;
    private final ProtocolClientRegistry clientRegistry;

    public SendMessageResponse sendMessage(SendMessageRequest request) {
        Long templateId = request.getTemplateId();
        String customContent = request.getCustomContent();
        String protocol = normalizeProtocol(request.getProtocol());
        Map<String, String> clientParams = request.getClientParams();

        log.info("Sending message. templateId={}, hasCustomContent={}, protocol={}",
                templateId, customContent != null && !customContent.isEmpty(), protocol);

        // 验证协议类型
        if (protocol == null || protocol.isEmpty()) {
            throw new BusinessException("协议类型不能为空");
        }

        // 获取客户端
        ProtocolClient client = clientRegistry.getClient(protocol);

        // 验证必填参数
        validateClientParams(client.getDescriptor(), clientParams);

        // 获取报文内容：优先使用模板，否则使用自定义内容，如果都没有则使用空字符串
        String messageContent = "";
        if (templateId != null) {
            messageContent = templateService.renderTemplate(templateId);
            log.debug("Template rendered for sending. templateId={}, messageLength={}", templateId, messageContent.length());
        } else if (customContent != null && !customContent.trim().isEmpty()) {
            messageContent = customContent.trim();
            log.debug("Using custom content for sending. messageLength={}", messageContent.length());
        } else {
            log.debug("No message content provided, using empty string");
        }

        // 发送报文
        ClientResponse clientResponse = client.send(messageContent, clientParams);

        // 构造响应
        SendMessageResponse response = new SendMessageResponse();
        response.setSuccess(clientResponse.isSuccess());
        response.setStatusCode(clientResponse.getStatusCode());
        response.setSentMessage(messageContent);
        response.setResponseContent(clientResponse.getContent());
        response.setErrorMessage(clientResponse.getErrorMessage());
        response.setDuration(clientResponse.getDuration());

        log.info("Message sent. templateId={}, protocol={}, success={}, duration={}ms",
                templateId, protocol, clientResponse.isSuccess(), clientResponse.getDuration());

        return response;
    }

    public List<ProtocolClientDescriptor> listProtocolClients() {
        log.debug("Listing protocol client descriptors.");
        return clientRegistry.listDescriptors();
    }

    private void validateClientParams(ProtocolClientDescriptor descriptor, Map<String, String> params) {
        for (ProtocolClientParamDescriptor paramDesc : descriptor.getParams()) {
            if (!paramDesc.isRequired()) {
                continue;
            }
            String value = params.get(paramDesc.getName());
            if (value == null || value.trim().isEmpty()) {
                log.warn("Required client parameter missing. protocol={}, paramName={}",
                        descriptor.getProtocol(), paramDesc.getName());
                throw new BusinessException("参数 [" + paramDesc.getLabel() + "] 为必填项");
            }
        }
    }

    private String normalizeProtocol(String protocol) {
        return protocol == null ? null : protocol.toUpperCase(Locale.ROOT);
    }
}
