package com.hxuanyu.frogmoker.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hxuanyu.frogmoker.common.BusinessException;
import com.hxuanyu.frogmoker.dto.MessageTemplateDetailResponse;
import com.hxuanyu.frogmoker.dto.MessageTemplateSummaryResponse;
import com.hxuanyu.frogmoker.dto.SaveMessageTemplateRequest;
import com.hxuanyu.frogmoker.dto.TemplateVariableRequest;
import com.hxuanyu.frogmoker.dto.TemplateVariableResponse;
import com.hxuanyu.frogmoker.entity.MessageTemplate;
import com.hxuanyu.frogmoker.entity.TemplateVariable;
import com.hxuanyu.frogmoker.mapper.MessageTemplateMapper;
import com.hxuanyu.frogmoker.mapper.TemplateVariableMapper;
import com.hxuanyu.frogmoker.service.generator.VariableGeneratorDescriptor;
import com.hxuanyu.frogmoker.service.common.ParamDescriptor;
import com.hxuanyu.frogmoker.service.generator.VariableGeneratorRegistry;
import com.hxuanyu.frogmoker.service.generator.VariableValueGenerator;
import com.hxuanyu.frogmoker.service.processor.MessageContentProcessor;
import com.hxuanyu.frogmoker.service.processor.MessageContentProcessorFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
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

    @Transactional
    public Long saveTemplate(SaveMessageTemplateRequest request) {
        String messageType = normalizeMessageType(request.getMessageType());
        log.info("Saving template. name={}, messageType={}, variableCount={}",
                request.getName(), messageType, sizeOf(request.getVariables()));

        processorFactory.getProcessor(messageType);

        MessageTemplate template = new MessageTemplate();
        template.setName(request.getName());
        template.setDescription(request.getDescription());
        template.setGroupName(normalizeGroupName(request.getGroupName()));
        template.setMessageType(messageType);
        template.setContent(request.getContent());
        template.setTagsJson(toJsonArray(normalizeTags(request.getTags())));
        templateMapper.insert(template);
        log.debug("Template entity persisted. id={}, name={}", template.getId(), template.getName());

        saveVariables(template.getId(), request.getVariables());
        log.info("Template saved successfully. id={}, name={}", template.getId(), template.getName());
        return template.getId();
    }

    @Transactional
    public void updateTemplate(Long id, SaveMessageTemplateRequest request) {
        String messageType = normalizeMessageType(request.getMessageType());
        log.info("Updating template. id={}, name={}, messageType={}, variableCount={}",
                id, request.getName(), messageType, sizeOf(request.getVariables()));

        MessageTemplate template = getTemplateOrThrow(id);
        processorFactory.getProcessor(messageType);

        template.setName(request.getName());
        template.setDescription(request.getDescription());
        template.setGroupName(normalizeGroupName(request.getGroupName()));
        template.setMessageType(messageType);
        template.setContent(request.getContent());
        template.setTagsJson(toJsonArray(normalizeTags(request.getTags())));
        templateMapper.updateById(template);
        log.debug("Template entity updated. id={}", id);

        int deletedVariables = variableMapper.delete(new LambdaQueryWrapper<TemplateVariable>()
                .eq(TemplateVariable::getTemplateId, id));
        log.debug("Existing template variables removed before refresh. templateId={}, deletedCount={}", id, deletedVariables);

        saveVariables(id, request.getVariables());
        log.info("Template updated successfully. id={}", id);
    }

    @Transactional
    public void deleteTemplate(Long id) {
        log.info("Deleting template. id={}", id);
        getTemplateOrThrow(id);

        int deletedTemplates = templateMapper.deleteById(id);
        int deletedVariables = variableMapper.delete(new LambdaQueryWrapper<TemplateVariable>()
                .eq(TemplateVariable::getTemplateId, id));

        log.info("Template deleted successfully. id={}, deletedTemplateCount={}, deletedVariableCount={}",
                id, deletedTemplates, deletedVariables);
    }

    public List<MessageTemplateSummaryResponse> listTemplates() {
        List<MessageTemplate> templates = templateMapper.selectList(null);
        Map<Long, Integer> variableCountMap = variableMapper.selectList(null).stream()
                .collect(Collectors.groupingBy(TemplateVariable::getTemplateId, Collectors.collectingAndThen(Collectors.counting(), Long::intValue)));
        log.debug("Loaded template list. count={}", templates.size());
        return templates.stream()
                .map(template -> toSummary(template, variableCountMap.getOrDefault(template.getId(), 0)))
                .collect(Collectors.toList());
    }

    public MessageTemplateDetailResponse getTemplateDetail(Long id) {
        log.debug("Loading template detail. id={}", id);
        MessageTemplate template = getTemplateOrThrow(id);
        List<TemplateVariable> variables = variableMapper.selectList(
                new LambdaQueryWrapper<TemplateVariable>()
                        .eq(TemplateVariable::getTemplateId, id));
        log.debug("Loaded template detail. id={}, variableCount={}", id, variables.size());
        return toDetail(template, variables);
    }

    public String formatContent(String messageType, String content) {
        String normalizedType = normalizeMessageType(messageType);
        log.debug("Formatting template content. messageType={}, contentLength={}", normalizedType, safeLength(content));
        MessageContentProcessor processor = processorFactory.getProcessor(normalizedType);
        String formatted = processor.format(content);
        log.debug("Template content formatted. messageType={}, outputLength={}", normalizedType, safeLength(formatted));
        return formatted;
    }

    public List<String> parseVariables(String messageType, String content) {
        String normalizedType = normalizeMessageType(messageType);
        log.debug("Parsing template variables. messageType={}, contentLength={}", normalizedType, safeLength(content));
        MessageContentProcessor processor = processorFactory.getProcessor(normalizedType);
        List<String> variables = processor.parseVariables(content);
        log.debug("Template variables parsed. messageType={}, variableCount={}, variables={}",
                normalizedType, variables.size(), variables);
        return variables;
    }

    public String renderTemplate(Long templateId) {
        log.info("Rendering template. templateId={}", templateId);
        MessageTemplate template = getTemplateOrThrow(templateId);
        List<TemplateVariable> variables = variableMapper.selectList(
                new LambdaQueryWrapper<TemplateVariable>()
                        .eq(TemplateVariable::getTemplateId, templateId));
        log.debug("Template variables loaded for rendering. templateId={}, variableCount={}", templateId, variables.size());

        Map<String, String> valueMap = new HashMap<String, String>();
        for (TemplateVariable variable : variables) {
            Map<String, String> params = parseParams(variable.getGeneratorParams());
            VariableValueGenerator generator = generatorRegistry.getGenerator(variable.getGeneratorType());
            String value = generator.generate(variable.getId(), params);
            valueMap.put(variable.getVariableName(), value);
            log.debug("Variable generated for template rendering. templateId={}, variableId={}, variableName={}, generatorType={}, valuePreview={}",
                    templateId,
                    variable.getId(),
                    variable.getVariableName(),
                    variable.getGeneratorType(),
                    summarize(value));
        }

        MessageContentProcessor processor = processorFactory.getProcessor(template.getMessageType());
        String rendered = processor.render(template.getContent(), valueMap);
        log.info("Template rendered successfully. templateId={}, variableCount={}, outputLength={}",
                templateId, valueMap.size(), safeLength(rendered));
        return rendered;
    }

    public List<VariableGeneratorDescriptor> listGeneratorDescriptors() {
        log.debug("Listing variable generator descriptors.");
        return generatorRegistry.listDescriptors();
    }

    private void saveVariables(Long templateId, List<TemplateVariableRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            log.debug("No template variables to persist. templateId={}", templateId);
            return;
        }

        log.debug("Persisting template variables. templateId={}, count={}", templateId, requests.size());
        for (TemplateVariableRequest request : requests) {
            String generatorType = normalizeGeneratorType(request.getGeneratorType());
            log.debug("Validating template variable. templateId={}, variableName={}, generatorType={}",
                    templateId, request.getVariableName(), generatorType);

            if (!generatorRegistry.exists(generatorType)) {
                log.warn("Unsupported generator type detected while saving template. templateId={}, variableName={}, generatorType={}",
                        templateId, request.getVariableName(), generatorType);
                throw new BusinessException("不支持的生成器类型: " + request.getGeneratorType());
            }

            VariableValueGenerator generator = generatorRegistry.getGenerator(generatorType);
            Map<String, String> params = request.getGeneratorParams() == null
                    ? new HashMap<String, String>()
                    : new HashMap<String, String>(request.getGeneratorParams());

            for (ParamDescriptor paramDescriptor : generator.getDescriptor().getParams()) {
                if (!paramDescriptor.isRequired()) {
                    continue;
                }
                String value = params.get(paramDescriptor.getName());
                if (value == null || value.trim().isEmpty()) {
                    log.warn("Required generator parameter missing. templateId={}, variableName={}, generatorType={}, paramName={}",
                            templateId, request.getVariableName(), generatorType, paramDescriptor.getName());
                    throw new BusinessException(400,
                            "变量 [" + request.getVariableName() + "] 的参数 [" + paramDescriptor.getName() + "] 为必填项");
                }
            }

            TemplateVariable variable = new TemplateVariable();
            variable.setTemplateId(templateId);
            variable.setVariableName(request.getVariableName());
            variable.setGeneratorType(generatorType);
            variable.setGeneratorParams(toJson(params));
            variableMapper.insert(variable);

            log.debug("Template variable persisted. templateId={}, variableId={}, variableName={}, generatorType={}",
                    templateId, variable.getId(), variable.getVariableName(), variable.getGeneratorType());
        }
    }

    private MessageTemplate getTemplateOrThrow(Long id) {
        MessageTemplate template = templateMapper.selectById(id);
        if (template == null) {
            log.warn("Template not found. id={}", id);
            throw new BusinessException(404, "报文模板不存在，id=" + id);
        }
        return template;
    }

    private MessageTemplateSummaryResponse toSummary(MessageTemplate template, int variableCount) {
        MessageTemplateSummaryResponse response = new MessageTemplateSummaryResponse();
        response.setId(template.getId());
        response.setName(template.getName());
        response.setDescription(template.getDescription());
        response.setGroupName(normalizeGroupName(template.getGroupName()));
        response.setMessageType(template.getMessageType());
        String content = template.getContent();
        response.setContentPreview(content != null && content.length() > 200
                ? content.substring(0, 200) + "..."
                : content);
        response.setTags(parseTags(template.getTagsJson()));
        response.setVariableCount(variableCount);
        response.setCreatedAt(template.getCreatedAt());
        response.setUpdatedAt(template.getUpdatedAt());
        return response;
    }

    private MessageTemplateDetailResponse toDetail(MessageTemplate template, List<TemplateVariable> variables) {
        MessageTemplateDetailResponse response = new MessageTemplateDetailResponse();
        response.setId(template.getId());
        response.setName(template.getName());
        response.setDescription(template.getDescription());
        response.setGroupName(normalizeGroupName(template.getGroupName()));
        response.setMessageType(template.getMessageType());
        response.setContent(template.getContent());
        response.setTags(parseTags(template.getTagsJson()));
        response.setCreatedAt(template.getCreatedAt());
        response.setUpdatedAt(template.getUpdatedAt());
        response.setVariables(variables.stream().map(this::toVariableResponse).collect(Collectors.toList()));
        return response;
    }

    private TemplateVariableResponse toVariableResponse(TemplateVariable variable) {
        TemplateVariableResponse response = new TemplateVariableResponse();
        response.setId(variable.getId());
        response.setVariableName(variable.getVariableName());
        response.setGeneratorType(variable.getGeneratorType());
        response.setGeneratorParams(parseParams(variable.getGeneratorParams()));
        return response;
    }

    private Map<String, String> parseParams(String json) {
        if (json == null || json.isEmpty()) {
            return new HashMap<String, String>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, String>>() {
            });
        } catch (Exception e) {
            log.warn("Failed to parse generator params JSON. payloadPreview={}", summarize(json), e);
            return new HashMap<String, String>();
        }
    }

    private String toJson(Map<String, String> params) {
        if (params == null || params.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(params);
        } catch (Exception e) {
            log.warn("Failed to serialize generator params. params={}", params, e);
            return null;
        }
    }

    private String toJsonArray(List<String> values) {
        if (values == null || values.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(values);
        } catch (Exception e) {
            log.warn("Failed to serialize template tags. values={}", values, e);
            return null;
        }
    }

    private List<String> parseTags(String json) {
        if (json == null || json.isEmpty()) {
            return new ArrayList<String>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {
            });
        } catch (Exception e) {
            log.warn("Failed to parse template tags JSON. payloadPreview={}", summarize(json), e);
            return new ArrayList<String>();
        }
    }

    private String normalizeMessageType(String messageType) {
        return messageType == null ? null : messageType.toUpperCase(Locale.ROOT);
    }

    private String normalizeGroupName(String groupName) {
        if (groupName == null || groupName.trim().isEmpty()) {
            return "未分组";
        }
        return groupName.trim();
    }

    private List<String> normalizeTags(List<String> tags) {
        if (tags == null || tags.isEmpty()) {
            return new ArrayList<String>();
        }
        Set<String> normalized = new LinkedHashSet<String>();
        for (String tag : tags) {
            if (tag == null) {
                continue;
            }
            String trimmed = tag.trim();
            if (!trimmed.isEmpty()) {
                normalized.add(trimmed);
            }
        }
        return new ArrayList<String>(normalized);
    }

    private String normalizeGeneratorType(String generatorType) {
        return generatorType == null ? null : generatorType.toUpperCase(Locale.ROOT);
    }

    private int sizeOf(List<?> items) {
        return items == null ? 0 : items.size();
    }

    private int safeLength(String value) {
        return value == null ? 0 : value.length();
    }

    private String summarize(String value) {
        if (value == null) {
            return "null";
        }
        String normalized = value.replaceAll("\\s+", " ").trim();
        if (normalized.length() <= 64) {
            return normalized;
        }
        return normalized.substring(0, 61) + "...";
    }
}
