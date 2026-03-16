package com.hxuanyu.frogmoker.controller;

import com.hxuanyu.frogmoker.common.Result;
import com.hxuanyu.frogmoker.dto.CreateServerInstanceRequest;
import com.hxuanyu.frogmoker.dto.UpdateServerInstanceRequest;
import com.hxuanyu.frogmoker.entity.ServerInstance;
import com.hxuanyu.frogmoker.service.ServerInstanceService;
import com.hxuanyu.frogmoker.service.server.ProtocolServerDescriptor;
import com.hxuanyu.frogmoker.service.server.ProtocolServerRegistry;
import com.hxuanyu.frogmoker.service.server.ServerStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 服务端实例管理 Controller
 */
@Slf4j
@Tag(name = "Server Instance", description = "服务端实例管理")
@RestController
@RequestMapping("/api/v1/server")
@RequiredArgsConstructor
public class ServerInstanceController {

    private final ServerInstanceService instanceService;
    private final ProtocolServerRegistry serverRegistry;

    @Operation(summary = "获取支持的协议列表")
    @GetMapping("/protocols")
    public Result<List<ProtocolServerDescriptor>> listProtocols() {
        log.debug("List protocols request received");
        List<ProtocolServerDescriptor> protocols = serverRegistry.listDescriptors();
        return Result.ok(protocols);
    }

    @Operation(summary = "获取服务端实例列表")
    @GetMapping("/instances")
    public Result<List<ServerInstance>> listInstances() {
        log.debug("List server instances request received");
        List<ServerInstance> instances = instanceService.listInstances();
        return Result.ok(instances);
    }

    @Operation(summary = "获取实例详情")
    @GetMapping("/instances/{id}")
    public Result<ServerInstance> getInstance(@PathVariable Long id) {
        log.debug("Get server instance request received. id={}", id);
        ServerInstance instance = instanceService.getInstance(id);
        return Result.ok(instance);
    }

    @Operation(summary = "创建服务端实例")
    @PostMapping("/instances")
    public Result<ServerInstance> createInstance(@Validated @RequestBody CreateServerInstanceRequest request) {
        log.info("Create server instance request received. name={}, protocol={}",
                request.getName(), request.getProtocol());
        ServerInstance instance = instanceService.createInstance(
                request.getName(),
                request.getDescription(),
                request.getProtocol(),
                request.getParams()
        );
        log.info("Create server instance request completed. id={}", instance.getId());
        return Result.ok(instance);
    }

    @Operation(summary = "更新实例配置")
    @PutMapping("/instances/{id}")
    public Result<ServerInstance> updateInstance(@PathVariable Long id,
                                                 @Validated @RequestBody UpdateServerInstanceRequest request) {
        log.info("Update server instance request received. id={}, name={}", id, request.getName());
        ServerInstance instance = instanceService.updateInstance(
                id,
                request.getName(),
                request.getDescription(),
                request.getParams()
        );
        log.info("Update server instance request completed. id={}", id);
        return Result.ok(instance);
    }

    @Operation(summary = "删除实例")
    @DeleteMapping("/instances/{id}")
    public Result<Void> deleteInstance(@PathVariable Long id) {
        log.info("Delete server instance request received. id={}", id);
        instanceService.deleteInstance(id);
        log.info("Delete server instance request completed. id={}", id);
        return Result.ok();
    }

    @Operation(summary = "启动实例")
    @PostMapping("/instances/{id}/start")
    public Result<Void> startInstance(@PathVariable Long id) {
        log.info("Start server instance request received. id={}", id);
        instanceService.startInstance(id);
        log.info("Start server instance request completed. id={}", id);
        return Result.ok();
    }

    @Operation(summary = "停止实例")
    @PostMapping("/instances/{id}/stop")
    public Result<Void> stopInstance(@PathVariable Long id) {
        log.info("Stop server instance request received. id={}", id);
        instanceService.stopInstance(id);
        log.info("Stop server instance request completed. id={}", id);
        return Result.ok();
    }

    @Operation(summary = "重启实例")
    @PostMapping("/instances/{id}/restart")
    public Result<Void> restartInstance(@PathVariable Long id) {
        log.info("Restart server instance request received. id={}", id);
        instanceService.restartInstance(id);
        log.info("Restart server instance request completed. id={}", id);
        return Result.ok();
    }

    @Operation(summary = "获取实例状态")
    @GetMapping("/instances/{id}/status")
    public Result<ServerStatus> getInstanceStatus(@PathVariable Long id) {
        log.debug("Get server instance status request received. id={}", id);
        ServerStatus status = instanceService.getInstanceStatus(id);
        return Result.ok(status);
    }
}
