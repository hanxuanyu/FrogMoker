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

        // 验证参数
        if (templateId == null && (customContent == null || customContent.trim().isEmpty())) {
            throw new BusinessException("必须提供模板ID或自定义报文内容");
        }
        if (protocol == null || protocol.isEmpty()) {
            throw new BusinessException("协议类型不能为空");
        }

        // 获取客户端
        ProtocolClient client = clientRegistry.getClient(protocol);

        // 验证必填参数
        validateClientParams(client.getDescriptor(), clientParams);

        // 获取报文内容：优先使用模板，否则使用自定义内容
        String messageContent;
        if (templateId != null) {
            messageContent = templateService.renderTemplate(templateId);
            log.debug("Template rendered for sending. templateId={}, messageLength={}", templateId, messageContent.length());
        } else {
            messageContent = customContent.trim();
            log.debug("Using custom content for sending. messageLength={}", messageContent.length());
        }

        // 发送报文
        ClientResponse clientResponse = client.send(messageContent, clientParams);

        // 格式化响应内容
        String formattedResponse = formatResponseContent(clientResponse.getContent());

        // 构造响应
        SendMessageResponse response = new SendMessageResponse();
        response.setSuccess(clientResponse.isSuccess());
        response.setStatusCode(clientResponse.getStatusCode());
        response.setSentMessage(messageContent);
        response.setResponseContent(formattedResponse);
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

    private String formatResponseContent(String content) {
        if (content == null || content.trim().isEmpty()) {
            return content;
        }

        String trimmed = content.trim();

        // 尝试检测并格式化 JSON
        if (isJson(trimmed)) {
            try {
                String formatted = templateService.formatContent("JSON", trimmed);
                log.debug("Response formatted as JSON. originalLength={}, formattedLength={}",
                        trimmed.length(), formatted.length());
                return formatted;
            } catch (Exception e) {
                log.debug("Failed to format response as JSON, returning original. error={}", e.getMessage());
            }
        }

        // 尝试检测并格式化 XML
        if (isXml(trimmed)) {
            try {
                String formatted = templateService.formatContent("XML", trimmed);
                log.debug("Response formatted as XML. originalLength={}, formattedLength={}",
                        trimmed.length(), formatted.length());
                return formatted;
            } catch (Exception e) {
                log.debug("Failed to format response as XML, returning original. error={}", e.getMessage());
            }
        }

        // 无法识别格式，返回原内容
        log.debug("Response format not recognized, returning original. contentLength={}", trimmed.length());
        return content;
    }

    private boolean isJson(String content) {
        if (content == null || content.isEmpty()) {
            return false;
        }
        char first = content.charAt(0);
        return first == '{' || first == '[';
    }

    private boolean isXml(String content) {
        if (content == null || content.isEmpty()) {
            return false;
        }
        return content.charAt(0) == '<';
    }

    private String normalizeProtocol(String protocol) {
        return protocol == null ? null : protocol.toUpperCase(Locale.ROOT);
    }
}
