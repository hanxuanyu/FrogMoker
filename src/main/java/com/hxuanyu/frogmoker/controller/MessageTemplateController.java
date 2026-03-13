package com.hxuanyu.frogmoker.controller;

import com.hxuanyu.frogmoker.common.Result;
import com.hxuanyu.frogmoker.dto.*;
import com.hxuanyu.frogmoker.service.MessageTemplateService;
import com.hxuanyu.frogmoker.service.generator.VariableGeneratorDescriptor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "报文管理", description = "报文模板的增删改查及辅助功能")
@RestController
@RequestMapping("/api/v1/message-templates")
@RequiredArgsConstructor
public class MessageTemplateController {

    private final MessageTemplateService templateService;

    // ==================== 模板 CRUD ====================

    @Operation(summary = "创建报文模板")
    @PostMapping
    public Result<Long> create(@Validated @RequestBody SaveMessageTemplateRequest request) {
        Long id = templateService.saveTemplate(request);
        return Result.ok(id);
    }

    @Operation(summary = "更新报文模板")
    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id,
                               @Validated @RequestBody SaveMessageTemplateRequest request) {
        templateService.updateTemplate(id, request);
        return Result.ok();
    }

    @Operation(summary = "删除报文模板")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        templateService.deleteTemplate(id);
        return Result.ok();
    }

    @Operation(summary = "获取报文模板列表")
    @GetMapping
    public Result<List<MessageTemplateSummaryResponse>> list() {
        return Result.ok(templateService.listTemplates());
    }

    @Operation(summary = "获取报文模板详情")
    @GetMapping("/{id}")
    public Result<MessageTemplateDetailResponse> detail(@PathVariable Long id) {
        return Result.ok(templateService.getTemplateDetail(id));
    }

    // ==================== 辅助功能 ====================

    @Operation(summary = "格式化报文内容")
    @PostMapping("/format")
    public Result<String> format(@Validated @RequestBody FormatMessageRequest request) {
        String formatted = templateService.formatContent(request.getMessageType(), request.getContent());
        return Result.ok(formatted);
    }

    @Operation(summary = "解析报文中的变量占位符")
    @PostMapping("/parse-variables")
    public Result<List<String>> parseVariables(@Validated @RequestBody ParseVariablesRequest request) {
        List<String> variables = templateService.parseVariables(request.getMessageType(), request.getContent());
        return Result.ok(variables);
    }

    @Operation(summary = "渲染报文模板（使用生成器填充变量值）")
    @PostMapping("/render")
    public Result<String> render(@Validated @RequestBody RenderTemplateRequest request) {
        String rendered = templateService.renderTemplate(request.getTemplateId());
        return Result.ok(rendered);
    }

    @Operation(summary = "获取所有可用的变量生成器描述")
    @GetMapping("/generators")
    public Result<List<VariableGeneratorDescriptor>> listGenerators() {
        return Result.ok(templateService.listGeneratorDescriptors());
    }
}
