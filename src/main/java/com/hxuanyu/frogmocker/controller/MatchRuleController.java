package com.hxuanyu.frogmocker.controller;

import com.hxuanyu.frogmocker.common.Result;
import com.hxuanyu.frogmocker.dto.CreateMatchRuleRequest;
import com.hxuanyu.frogmocker.dto.UpdateMatchRuleRequest;
import com.hxuanyu.frogmocker.dto.UpdateRulePriorityRequest;
import com.hxuanyu.frogmocker.entity.MatchRule;
import com.hxuanyu.frogmocker.service.MatchRuleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 匹配规则管理 Controller
 */
@Slf4j
@Tag(name = "Match Rule", description = "匹配规则管理")
@RestController
@RequestMapping("/api/v1/server")
@RequiredArgsConstructor
public class MatchRuleController {

    private final MatchRuleService ruleService;

    @Operation(summary = "获取实例的规则列表")
    @GetMapping("/instances/{instanceId}/rules")
    public Result<List<MatchRule>> listRules(@PathVariable Long instanceId) {
        log.debug("List match rules request received. instanceId={}", instanceId);
        List<MatchRule> rules = ruleService.listRules(instanceId);
        return Result.ok(rules);
    }

    @Operation(summary = "获取规则详情")
    @GetMapping("/rules/{ruleId}")
    public Result<MatchRule> getRule(@PathVariable Long ruleId) {
        log.debug("Get match rule request received. ruleId={}", ruleId);
        MatchRule rule = ruleService.getRule(ruleId);
        return Result.ok(rule);
    }

    @Operation(summary = "创建匹配规则")
    @PostMapping("/instances/{instanceId}/rules")
    public Result<MatchRule> createRule(@PathVariable Long instanceId,
                                       @Validated @RequestBody CreateMatchRuleRequest request) {
        log.info("Create match rule request received. instanceId={}, name={}",
                instanceId, request.getName());
        MatchRule rule = ruleService.createRule(
                instanceId,
                request.getName(),
                request.getDescription(),
                request.getPriority(),
                request.getCondition(),
                request.getResponse()
        );
        log.info("Create match rule request completed. ruleId={}", rule.getId());
        return Result.ok(rule);
    }

    @Operation(summary = "更新匹配规则")
    @PutMapping("/rules/{ruleId}")
    public Result<MatchRule> updateRule(@PathVariable Long ruleId,
                                       @Validated @RequestBody UpdateMatchRuleRequest request) {
        log.info("Update match rule request received. ruleId={}, name={}", ruleId, request.getName());
        MatchRule rule = ruleService.updateRule(
                ruleId,
                request.getName(),
                request.getDescription(),
                request.getPriority(),
                request.getCondition(),
                request.getResponse()
        );
        log.info("Update match rule request completed. ruleId={}", ruleId);
        return Result.ok(rule);
    }

    @Operation(summary = "删除匹配规则")
    @DeleteMapping("/rules/{ruleId}")
    public Result<Void> deleteRule(@PathVariable Long ruleId) {
        log.info("Delete match rule request received. ruleId={}", ruleId);
        ruleService.deleteRule(ruleId);
        log.info("Delete match rule request completed. ruleId={}", ruleId);
        return Result.ok();
    }

    @Operation(summary = "启用/禁用规则")
    @PutMapping("/rules/{ruleId}/toggle")
    public Result<Void> toggleRule(@PathVariable Long ruleId, @RequestParam boolean enabled) {
        log.info("Toggle match rule request received. ruleId={}, enabled={}", ruleId, enabled);
        ruleService.toggleRule(ruleId, enabled);
        log.info("Toggle match rule request completed. ruleId={}", ruleId);
        return Result.ok();
    }

    @Operation(summary = "调整规则优先级")
    @PutMapping("/rules/{ruleId}/priority")
    public Result<Void> updatePriority(@PathVariable Long ruleId,
                                       @Validated @RequestBody UpdateRulePriorityRequest request) {
        log.info("Update rule priority request received. ruleId={}, priority={}",
                ruleId, request.getPriority());
        ruleService.updatePriority(ruleId, request.getPriority());
        log.info("Update rule priority request completed. ruleId={}", ruleId);
        return Result.ok();
    }
}
