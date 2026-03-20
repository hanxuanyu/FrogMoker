package com.hxuanyu.frogmocker.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hxuanyu.frogmocker.common.BusinessException;
import com.hxuanyu.frogmocker.entity.MatchRule;
import com.hxuanyu.frogmocker.mapper.MatchRuleMapper;
import com.hxuanyu.frogmocker.service.server.MatchCondition;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * 匹配规则服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MatchRuleService {

    private final MatchRuleMapper ruleMapper;
    private final ServerInstanceService instanceService;
    private final ObjectMapper objectMapper;

    /**
     * 获取实例的所有规则
     */
    public List<MatchRule> listRules(Long instanceId) {
        log.debug("Listing match rules. instanceId={}", instanceId);

        // 验证实例存在
        instanceService.getInstance(instanceId);

        return ruleMapper.selectList(
                new LambdaQueryWrapper<MatchRule>()
                        .eq(MatchRule::getInstanceId, instanceId)
                        .orderByDesc(MatchRule::getPriority)
        );
    }

    /**
     * 根据 ID 获取规则
     */
    public MatchRule getRule(Long id) {
        MatchRule rule = ruleMapper.selectById(id);
        if (rule == null) {
            throw new BusinessException("匹配规则不存在: " + id);
        }
        return rule;
    }

    /**
     * 创建匹配规则
     */
    @Transactional
    public MatchRule createRule(Long instanceId, String name, String description,
                                Integer priority, MatchCondition condition, Map<String, String> response) {
        log.info("Creating match rule. instanceId={}, name={}", instanceId, name);

        // 验证实例存在
        instanceService.getInstance(instanceId);

        try {
            MatchRule rule = new MatchRule();
            rule.setInstanceId(instanceId);
            rule.setName(name);
            rule.setDescription(description);
            rule.setPriority(priority != null ? priority : 0);
            rule.setCondition(objectMapper.writeValueAsString(condition));
            rule.setResponse(objectMapper.writeValueAsString(response));
            rule.setEnabled(true);

            ruleMapper.insert(rule);
            log.info("Match rule created. id={}, name={}", rule.getId(), name);
            return rule;
        } catch (Exception e) {
            log.error("Failed to create match rule. instanceId={}, name={}", instanceId, name, e);
            throw new BusinessException("创建匹配规则失败: " + e.getMessage());
        }
    }

    /**
     * 更新匹配规则
     */
    @Transactional
    public MatchRule updateRule(Long id, String name, String description,
                               Integer priority, MatchCondition condition, Map<String, String> response) {
        log.info("Updating match rule. id={}, name={}", id, name);

        MatchRule rule = getRule(id);

        try {
            rule.setName(name);
            rule.setDescription(description);
            if (priority != null) {
                rule.setPriority(priority);
            }
            rule.setCondition(objectMapper.writeValueAsString(condition));
            rule.setResponse(objectMapper.writeValueAsString(response));

            ruleMapper.updateById(rule);
            log.info("Match rule updated. id={}", id);
            return rule;
        } catch (Exception e) {
            log.error("Failed to update match rule. id={}", id, e);
            throw new BusinessException("更新匹配规则失败: " + e.getMessage());
        }
    }

    /**
     * 删除匹配规则
     */
    @Transactional
    public void deleteRule(Long id) {
        log.info("Deleting match rule. id={}", id);

        MatchRule rule = getRule(id);
        ruleMapper.deleteById(id);

        log.info("Match rule deleted. id={}", id);
    }

    /**
     * 启用/禁用规则
     */
    @Transactional
    public void toggleRule(Long id, boolean enabled) {
        log.info("Toggling match rule. id={}, enabled={}", id, enabled);

        MatchRule rule = getRule(id);
        rule.setEnabled(enabled);
        ruleMapper.updateById(rule);

        log.info("Match rule toggled. id={}, enabled={}", id, enabled);
    }

    /**
     * 调整规则优先级
     */
    @Transactional
    public void updatePriority(Long id, Integer priority) {
        log.info("Updating match rule priority. id={}, priority={}", id, priority);

        MatchRule rule = getRule(id);
        rule.setPriority(priority);
        ruleMapper.updateById(rule);

        log.info("Match rule priority updated. id={}, priority={}", id, priority);
    }
}
