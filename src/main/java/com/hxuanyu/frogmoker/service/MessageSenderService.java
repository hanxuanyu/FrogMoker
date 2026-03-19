package com.hxuanyu.frogmoker.service;

import com.hxuanyu.frogmoker.common.BusinessException;
import com.hxuanyu.frogmoker.dto.SendMessageRequest;
import com.hxuanyu.frogmoker.dto.SendMessageResponse;
import com.hxuanyu.frogmoker.service.client.ClientResponse;
import com.hxuanyu.frogmoker.service.client.ProtocolClient;
import com.hxuanyu.frogmoker.service.client.ProtocolClientDescriptor;
import com.hxuanyu.frogmoker.service.common.ParamDescriptor;
import com.hxuanyu.frogmoker.service.client.ProtocolClientRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
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
        Map<String, String> clientParams = request.getClientParams() == null
                ? new HashMap<String, String>()
                : new HashMap<String, String>(request.getClientParams());
        Map<String, Long> parameterTemplates = request.getParameterTemplates() == null
                ? new HashMap<String, Long>()
                : new HashMap<String, Long>(request.getParameterTemplates());

        log.info("Sending message. templateId={}, hasCustomContent={}, protocol={}, templateParamCount={}",
                templateId, customContent != null && !customContent.isEmpty(), protocol, parameterTemplates.size());

        if (protocol == null || protocol.isEmpty()) {
            throw new BusinessException("协议类型不能为空");
        }

        ProtocolClient client = clientRegistry.getClient(protocol);
        validateClientParams(client.getDescriptor(), clientParams, parameterTemplates);
        Map<String, String> resolvedClientParams = resolveClientParams(clientParams, parameterTemplates);
        String messageContent = resolveMessageContent(templateId, customContent, resolvedClientParams);
        ClientResponse clientResponse = client.send(messageContent, resolvedClientParams);

        SendMessageResponse response = new SendMessageResponse();
        response.setSuccess(clientResponse.isSuccess());
        response.setStatusCode(clientResponse.getStatusCode());
        response.setSentMessage(messageContent);
        response.setSentClientParams(resolvedClientParams);
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

    private void validateClientParams(ProtocolClientDescriptor descriptor,
                                      Map<String, String> params,
                                      Map<String, Long> parameterTemplates) {
        for (ParamDescriptor paramDesc : descriptor.getParams()) {
            if (!paramDesc.isRequired()) {
                continue;
            }
            if (parameterTemplates.containsKey(paramDesc.getName())) {
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

    private Map<String, String> resolveClientParams(Map<String, String> clientParams, Map<String, Long> parameterTemplates) {
        Map<String, String> resolved = new HashMap<String, String>(clientParams);
        for (Map.Entry<String, Long> entry : parameterTemplates.entrySet()) {
            Long templateId = entry.getValue();
            if (templateId == null) {
                continue;
            }
            String rendered = templateService.renderTemplate(templateId);
            resolved.put(entry.getKey(), rendered);
            log.debug("Resolved template parameter for sending. paramName={}, templateId={}, renderedLength={}",
                    entry.getKey(), templateId, rendered.length());
        }
        return resolved;
    }

    private String resolveMessageContent(Long templateId, String customContent, Map<String, String> resolvedClientParams) {
        if (templateId != null) {
            String rendered = templateService.renderTemplate(templateId);
            log.debug("Template rendered for sending. templateId={}, messageLength={}", templateId, rendered.length());
            return rendered;
        }

        if (customContent != null && !customContent.trim().isEmpty()) {
            String trimmed = customContent.trim();
            log.debug("Using custom content for sending. messageLength={}", trimmed.length());
            return trimmed;
        }

        String paramMessage = resolvedClientParams.get("message");
        if (paramMessage != null && !paramMessage.trim().isEmpty()) {
            return paramMessage;
        }

        String paramBody = resolvedClientParams.get("body");
        if (paramBody != null && !paramBody.trim().isEmpty()) {
            return paramBody;
        }

        log.debug("No standalone message content resolved, using empty string");
        return "";
    }

    private String normalizeProtocol(String protocol) {
        return protocol == null ? null : protocol.toUpperCase(Locale.ROOT);
    }
}
