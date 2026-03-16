package com.hxuanyu.frogmoker.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hxuanyu.frogmoker.common.Result;
import com.hxuanyu.frogmoker.entity.RequestLog;
import com.hxuanyu.frogmoker.service.RequestLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

/**
 * 请求日志管理 Controller
 */
@Slf4j
@Tag(name = "Request Log", description = "请求日志管理")
@RestController
@RequestMapping("/api/v1/server")
@RequiredArgsConstructor
public class RequestLogController {

    private final RequestLogService logService;

    @Operation(summary = "获取请求日志（分页）")
    @GetMapping("/instances/{instanceId}/logs")
    public Result<Page<RequestLog>> listLogs(@PathVariable Long instanceId,
                                             @RequestParam(defaultValue = "1") int page,
                                             @RequestParam(defaultValue = "20") int size) {
        log.debug("List request logs request received. instanceId={}, page={}, size={}",
                instanceId, page, size);
        Page<RequestLog> logs = logService.listLogs(instanceId, page, size);
        return Result.ok(logs);
    }

    @Operation(summary = "清空日志")
    @DeleteMapping("/instances/{instanceId}/logs")
    public Result<Void> clearLogs(@PathVariable Long instanceId) {
        log.info("Clear request logs request received. instanceId={}", instanceId);
        logService.clearLogs(instanceId);
        log.info("Clear request logs request completed. instanceId={}", instanceId);
        return Result.ok();
    }

    @Operation(summary = "获取日志详情")
    @GetMapping("/logs/{logId}")
    public Result<RequestLog> getLog(@PathVariable Long logId) {
        log.debug("Get request log request received. logId={}", logId);
        RequestLog requestLog = logService.getLog(logId);
        return Result.ok(requestLog);
    }
}
