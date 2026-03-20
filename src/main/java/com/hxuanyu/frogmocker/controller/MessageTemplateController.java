package com.hxuanyu.frogmocker.controller;

import com.hxuanyu.frogmocker.common.Result;
import com.hxuanyu.frogmocker.dto.FormatMessageRequest;
import com.hxuanyu.frogmocker.dto.MessageTemplateDetailResponse;
import com.hxuanyu.frogmocker.dto.MessageTemplateSummaryResponse;
import com.hxuanyu.frogmocker.dto.ParseVariablesRequest;
import com.hxuanyu.frogmocker.dto.RenderTemplateRequest;
import com.hxuanyu.frogmocker.dto.SaveMessageTemplateRequest;
import com.hxuanyu.frogmocker.service.MessageTemplateService;
import com.hxuanyu.frogmocker.service.generator.VariableGeneratorDescriptor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@Tag(name = "Message Template", description = "CRUD and helper operations for templates")
@RestController
@RequestMapping("/api/v1/message-templates")
@RequiredArgsConstructor
public class MessageTemplateController {

    private final MessageTemplateService templateService;

    @Operation(summary = "Create template")
    @PostMapping
    public Result<Long> create(@Validated @RequestBody SaveMessageTemplateRequest request) {
        log.info("Create template request received. name={}, messageType={}, variableCount={}",
                request.getName(), request.getMessageType(), sizeOf(request.getVariables()));
        Long id = templateService.saveTemplate(request);
        log.info("Create template request completed. id={}, name={}", id, request.getName());
        return Result.ok(id);
    }

    @Operation(summary = "Update template")
    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id,
                               @Validated @RequestBody SaveMessageTemplateRequest request) {
        log.info("Update template request received. id={}, name={}, messageType={}, variableCount={}",
                id, request.getName(), request.getMessageType(), sizeOf(request.getVariables()));
        templateService.updateTemplate(id, request);
        log.info("Update template request completed. id={}", id);
        return Result.ok();
    }

    @Operation(summary = "Delete template")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        log.info("Delete template request received. id={}", id);
        templateService.deleteTemplate(id);
        log.info("Delete template request completed. id={}", id);
        return Result.ok();
    }

    @Operation(summary = "List templates")
    @GetMapping
    public Result<List<MessageTemplateSummaryResponse>> list() {
        log.debug("List templates request received.");
        List<MessageTemplateSummaryResponse> templates = templateService.listTemplates();
        log.debug("List templates request completed. count={}", templates.size());
        return Result.ok(templates);
    }

    @Operation(summary = "Get template detail")
    @GetMapping("/{id}")
    public Result<MessageTemplateDetailResponse> detail(@PathVariable Long id) {
        log.debug("Get template detail request received. id={}", id);
        MessageTemplateDetailResponse detail = templateService.getTemplateDetail(id);
        log.debug("Get template detail request completed. id={}, variableCount={}", id, sizeOf(detail.getVariables()));
        return Result.ok(detail);
    }

    @Operation(summary = "Format content")
    @PostMapping("/format")
    public Result<String> format(@Validated @RequestBody FormatMessageRequest request) {
        log.debug("Format content request received. messageType={}, contentLength={}",
                request.getMessageType(), safeLength(request.getContent()));
        String formatted = templateService.formatContent(request.getMessageType(), request.getContent());
        log.debug("Format content request completed. messageType={}, outputLength={}",
                request.getMessageType(), safeLength(formatted));
        return Result.ok(formatted);
    }

    @Operation(summary = "Parse template variables")
    @PostMapping("/parse-variables")
    public Result<List<String>> parseVariables(@Validated @RequestBody ParseVariablesRequest request) {
        log.debug("Parse variables request received. messageType={}, contentLength={}",
                request.getMessageType(), safeLength(request.getContent()));
        List<String> variables = templateService.parseVariables(request.getMessageType(), request.getContent());
        log.debug("Parse variables request completed. messageType={}, variableCount={}",
                request.getMessageType(), variables.size());
        return Result.ok(variables);
    }

    @Operation(summary = "Render template")
    @PostMapping("/render")
    public Result<String> render(@Validated @RequestBody RenderTemplateRequest request) {
        log.info("Render template request received. templateId={}", request.getTemplateId());
        String rendered = templateService.renderTemplate(request.getTemplateId());
        log.info("Render template request completed. templateId={}, outputLength={}",
                request.getTemplateId(), safeLength(rendered));
        return Result.ok(rendered);
    }

    @Operation(summary = "List variable generators")
    @GetMapping("/generators")
    public Result<List<VariableGeneratorDescriptor>> listGenerators() {
        log.debug("List generator descriptors request received.");
        List<VariableGeneratorDescriptor> descriptors = templateService.listGeneratorDescriptors();
        log.debug("List generator descriptors request completed. count={}", descriptors.size());
        return Result.ok(descriptors);
    }

    private int sizeOf(List<?> items) {
        return items == null ? 0 : items.size();
    }

    private int safeLength(String value) {
        return value == null ? 0 : value.length();
    }
}
