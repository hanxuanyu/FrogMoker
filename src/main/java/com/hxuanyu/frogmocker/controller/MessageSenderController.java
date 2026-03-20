package com.hxuanyu.frogmocker.controller;

import com.hxuanyu.frogmocker.common.Result;
import com.hxuanyu.frogmocker.dto.SendMessageRequest;
import com.hxuanyu.frogmocker.dto.SendMessageResponse;
import com.hxuanyu.frogmocker.service.MessageSenderService;
import com.hxuanyu.frogmocker.service.client.ProtocolClientDescriptor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 报文发送控制器
 */
@Tag(name = "报文发送", description = "报文发送相关接口")
@RestController
@RequestMapping("/api/v1/sender")
@RequiredArgsConstructor
public class MessageSenderController {

    private final MessageSenderService senderService;

    @Operation(summary = "获取支持的协议客户端列表")
    @GetMapping("/protocols")
    public Result<List<ProtocolClientDescriptor>> listProtocols() {
        return Result.ok(senderService.listProtocolClients());
    }

    @Operation(summary = "发送报文")
    @PostMapping("/send")
    public Result<SendMessageResponse> sendMessage(@RequestBody SendMessageRequest request) {
        return Result.ok(senderService.sendMessage(request));
    }
}
