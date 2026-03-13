package com.hxuanyu.frogmoker.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hxuanyu.frogmoker.common.BusinessException;
import com.hxuanyu.frogmoker.dto.*;
import com.hxuanyu.frogmoker.entity.MessageTemplate;
import com.hxuanyu.frogmoker.entity.TemplateVariable;
import com.hxuanyu.frogmoker.mapper.MessageTemplateMapper;
import com.hxuanyu.frogmoker.mapper.TemplateVariableMapper;
import com.hxuanyu.frogmoker.service.generator.VariableGeneratorDescriptor;
import com.hxuanyu.frogmoker.service.generator.VariableGeneratorRegistry;
import com.hxuanyu.frogmoker.service.generator.VariableValueGenerator;
import com.hxuanyu.frogmoker.service.processor.MessageContentProcessor;
import com.hxuanyu.frogmoker.service.processor.MessageContentProcessorFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessageTemplateService {

    private final MessageTemplateMapper templateMapper;
    private final TemplateVariableMapper variableMapper;
    private final MessageContentProcessorFactory processorFactory;
    private final VariableGeneratorRegistry generatorRegistry;
    private final ObjectMapper objectMapper;

    // ==================== 模板 CRUD ====================

    @Transactional
    public Long saveTemplate(SaveMessageTemplateRequest request) {
        // 校验报文类型
        processorFactory.getProcessor(request.getMessageType());

        MessageTemplate template = new MessageTemplate();
        template.setName(request.getName());
        template.setDescription(request.getDescription());
        template.setMessageType(request.getMessageType().toUpperCase());
        template.setContent(request.getContent());
        templateMapper.insert(template);

        // 保存变量
        saveVariables(template.getId(), request.getVariables());

        return template.getId();
    }

    @Transactional
    public void updateTemplate(Long id, SaveMessageTemplateRequest request) {
        MessageTemplate template = getTemplateOrThrow(id);
        processorFactory.getProcessor(request.getMessageType());

        template.setName(request.getName());
        template.setDescription(request.getDescription());
        template.setMessageType(request.getMessageType().toUpperCase());
        template.setContent(request.getContent());
        templateMapper.updateById(template);

        // 删除旧变量，重新保存
        variableMapper.delete(new LambdaQueryWrapper<TemplateVariable>()
                .eq(TemplateVariable::getTemplateId, id));
        saveVariables(id, request.getVariables());
    }

    @Transactional
    public void deleteTemplate(Long id) {
        getTemplateOrThrow(id);
        templateMapper.deleteById(id);
        variableMapper.delete(new LambdaQueryWrapper<TemplateVariable>()
                .eq(TemplateVariable::getTemplateId, id));
    }

    public List<MessageTemplateSummaryResponse> listTemplates() {
        return templateMapper.selectList(null).stream()
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    public MessageTemplateDetailResponse getTemplateDetail(Long id) {
        MessageTemplate template = getTemplateOrThrow(id);
        List<TemplateVariable> variables = variableMapper.selectList(
                new LambdaQueryWrapper<TemplateVariable>()
                        .eq(TemplateVariable::getTemplateId, id));
        return toDetail(template, variables);
    }

    // ==================== 辅助功能 ====================

    public String formatContent(String messageType, String content) {
        return processorFactory.getProcessor(messageType).format(content);
    }

    public List<String> parseVariables(String messageType, String content) {
        return processorFactory.getProcessor(messageType).parseVariables(content);
    }

    public String renderTemplate(Long templateId) {
        MessageTemplate template = getTemplateOrThrow(templateId);
        List<TemplateVariable> variables = variableMapper.selectList(
                new LambdaQueryWrapper<TemplateVariable>()
                        .eq(TemplateVariable::getTemplateId, templateId));

        Map<String, String> valueMap = new HashMap<>();
        for (TemplateVariable variable : variables) {
            Map<String, String> params = parseParams(variable.getGeneratorParams());
            VariableValueGenerator generator = generatorRegistry.getGenerator(variable.getGeneratorType());
            String value = generator.generate(variable.getId(), params);
            valueMap.put(variable.getVariableName(), value);
        }

        MessageContentProcessor processor = processorFactory.getProcessor(template.getMessageType());
        return processor.render(template.getContent(), valueMap);
    }

    public List<VariableGeneratorDescriptor> listGeneratorDescriptors() {
        return generatorRegistry.listDescriptors();
    }

    // ==================== 私有方法 ====================

    private void saveVariables(Long templateId, List<TemplateVariableRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            return;
        }
        for (TemplateVariableRequest req : requests) {
            if (!generatorRegistry.exists(req.getGeneratorType())) {
                throw new BusinessException("不支持的生成器类型: " + req.getGeneratorType());
            }
            TemplateVariable variable = new TemplateVariable();
            variable.setTemplateId(templateId);
            variable.setVariableName(req.getVariableName());
            variable.setGeneratorType(req.getGeneratorType());
            variable.setGeneratorParams(toJson(req.getGeneratorParams()));
            variableMapper.insert(variable);
        }
    }

    private MessageTemplate getTemplateOrThrow(Long id) {
        MessageTemplate template = templateMapper.selectById(id);
        if (template == null) {
            throw new BusinessException(404, "报文模板不存在，id=" + id);
        }
        return template;
    }

    private MessageTemplateSummaryResponse toSummary(MessageTemplate template) {
        MessageTemplateSummaryResponse resp = new MessageTemplateSummaryResponse();
        resp.setId(template.getId());
        resp.setName(template.getName());
        resp.setDescription(template.getDescription());
        resp.setMessageType(template.getMessageType());
        String content = template.getContent();
        resp.setContentPreview(content != null && content.length() > 200
                ? content.substring(0, 200) + "..." : content);
        resp.setCreatedAt(template.getCreatedAt());
        resp.setUpdatedAt(template.getUpdatedAt());
        return resp;
    }

    private MessageTemplateDetailResponse toDetail(MessageTemplate template, List<TemplateVariable> variables) {
        MessageTemplateDetailResponse resp = new MessageTemplateDetailResponse();
        resp.setId(template.getId());
        resp.setName(template.getName());
        resp.setDescription(template.getDescription());
        resp.setMessageType(template.getMessageType());
        resp.setContent(template.getContent());
        resp.setCreatedAt(template.getCreatedAt());
        resp.setUpdatedAt(template.getUpdatedAt());
        resp.setVariables(variables.stream().map(this::toVariableResponse).collect(Collectors.toList()));
        return resp;
    }

    private TemplateVariableResponse toVariableResponse(TemplateVariable variable) {
        TemplateVariableResponse resp = new TemplateVariableResponse();
        resp.setId(variable.getId());
        resp.setVariableName(variable.getVariableName());
        resp.setGeneratorType(variable.getGeneratorType());
        resp.setGeneratorParams(parseParams(variable.getGeneratorParams()));
        return resp;
    }

    private Map<String, String> parseParams(String json) {
        if (json == null || json.isEmpty()) {
            return new HashMap<>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, String>>() {});
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    private String toJson(Map<String, String> params) {
        if (params == null || params.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(params);
        } catch (Exception e) {
            return null;
        }
    }
}
