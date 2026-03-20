package com.hxuanyu.frogmocker.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hxuanyu.frogmocker.entity.RequestLog;
import com.hxuanyu.frogmocker.mapper.RequestLogMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 请求日志服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RequestLogService {

    private final RequestLogMapper logMapper;
    private final ServerInstanceService instanceService;

    /**
     * 分页查询请求日志
     */
    public Page<RequestLog> listLogs(Long instanceId, int page, int size) {
        log.debug("Listing request logs. instanceId={}, page={}, size={}", instanceId, page, size);

        // 验证实例存在
        instanceService.getInstance(instanceId);

        Page<RequestLog> pageRequest = new Page<>(page, size);
        return logMapper.selectPage(
                pageRequest,
                new LambdaQueryWrapper<RequestLog>()
                        .eq(RequestLog::getInstanceId, instanceId)
                        .orderByDesc(RequestLog::getCreatedAt)
        );
    }

    /**
     * 清空实例的所有日志
     */
    @Transactional
    public void clearLogs(Long instanceId) {
        log.info("Clearing request logs. instanceId={}", instanceId);

        // 验证实例存在
        instanceService.getInstance(instanceId);

        logMapper.delete(
                new LambdaQueryWrapper<RequestLog>()
                        .eq(RequestLog::getInstanceId, instanceId)
        );

        log.info("Request logs cleared. instanceId={}", instanceId);
    }

    /**
     * 根据 ID 获取日志详情
     */
    public RequestLog getLog(Long id) {
        RequestLog log = logMapper.selectById(id);
        if (log == null) {
            throw new com.hxuanyu.frogmocker.common.BusinessException("请求日志不存在: " + id);
        }
        return log;
    }
}
