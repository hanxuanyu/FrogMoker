package com.hxuanyu.frogmocker.service.server.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hxuanyu.frogmocker.entity.RequestLog;
import com.hxuanyu.frogmocker.mapper.MatchRuleMapper;
import com.hxuanyu.frogmocker.mapper.RequestLogMapper;
import com.hxuanyu.frogmocker.service.common.ParamDescriptor;
import com.hxuanyu.frogmocker.service.common.ParamDescriptorBuilder;
import com.hxuanyu.frogmocker.service.server.*;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.jetty.server.Request;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.handler.AbstractHandler;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * HTTP 模拟服务端
 */
@Slf4j
@Component
public class HttpMockServer implements ProtocolServer {

    private static final String PROTOCOL = "HTTP";

    private final Map<Long, Server> serverMap = new ConcurrentHashMap<>();
    private final Map<Long, ServerStatus> statusMap = new ConcurrentHashMap<>();
    private final Map<Long, Long> requestCountMap = new ConcurrentHashMap<>();

    private final RequestMatcher requestMatcher;
    private final MatchRuleMapper matchRuleMapper;
    private final RequestLogMapper requestLogMapper;
    private final ObjectMapper objectMapper;

    public HttpMockServer(RequestMatcher requestMatcher,
                         MatchRuleMapper matchRuleMapper,
                         RequestLogMapper requestLogMapper,
                         ObjectMapper objectMapper) {
        this.requestMatcher = requestMatcher;
        this.matchRuleMapper = matchRuleMapper;
        this.requestLogMapper = requestLogMapper;
        this.objectMapper = objectMapper;
    }

    @Override
    public String getProtocol() {
        return PROTOCOL;
    }

    @Override
    public ProtocolServerDescriptor getDescriptor() {
        List<ParamDescriptor> params = Arrays.asList(
                ParamDescriptorBuilder.number("port", "监听端口")
                        .description("HTTP 服务监听的端口号")
                        .required()
                        .placeholder("8081")
                        .build(),

                ParamDescriptorBuilder.text("host", "监听地址")
                        .description("HTTP 服务监听的地址")
                        .defaultValue("0.0.0.0")
                        .placeholder("0.0.0.0")
                        .build(),

                ParamDescriptorBuilder.text("basePath", "基础路径")
                        .description("所有请求的基础路径前缀（可选）")
                        .placeholder("/api")
                        .build(),

                ParamDescriptorBuilder.bool("enableCors", "启用 CORS")
                        .description("是否启用跨域资源共享")
                        .defaultValue("true")
                        .build(),

                ParamDescriptorBuilder.bool("logRequests", "记录请求日志")
                        .description("是否记录所有请求到数据库")
                        .defaultValue("true")
                        .build()
        );

        List<ParamDescriptor> responseParams = Arrays.asList(
                ParamDescriptorBuilder.number("statusCode", "HTTP 状态码")
                        .description("返回给客户端的 HTTP 状态码")
                        .required()
                        .defaultValue("200")
                        .placeholder("200")
                        .build(),

                ParamDescriptorBuilder.map("headers", "响应头")
                        .description("HTTP 响应头，键值对格式")
                        .mapLabels("响应头名称", "响应头值")
                        .build(),

                ParamDescriptorBuilder.textarea("body", "响应体")
                        .description("HTTP 响应内容")
                        .placeholder("{\"message\": \"OK\"}")
                        .build(),

                ParamDescriptorBuilder.number("delay", "延迟时间")
                        .description("模拟响应延迟，单位毫秒")
                        .placeholder("0")
                        .build()
        );

        ProtocolServerDescriptor descriptor = new ProtocolServerDescriptor(
                PROTOCOL,
                "HTTP 模拟服务端",
                "基于 Jetty 的轻量级 HTTP 模拟服务端，支持请求匹配和响应配置",
                params
        );
        descriptor.setSupportsMatcher(true);
        descriptor.setResponseParams(responseParams);
        return descriptor;
    }

    @Override
    public void start(Long instanceId, Map<String, String> params) throws ServerStartException {
        if (isRunning(instanceId)) {
            throw new ServerStartException("服务端实例已在运行中");
        }

        try {
            // 解析参数
            int port = Integer.parseInt(params.getOrDefault("port", "8081"));
            String host = params.getOrDefault("host", "0.0.0.0");
            String basePath = params.get("basePath");
            boolean enableCors = Boolean.parseBoolean(params.getOrDefault("enableCors", "true"));
            boolean logRequests = Boolean.parseBoolean(params.getOrDefault("logRequests", "true"));

            // 创建 Jetty Server
            Server server = new Server(port);
            server.setHandler(new HttpMockHandler(instanceId, basePath, enableCors, logRequests));

            // 启动服务器
            server.start();

            // 保存实例
            serverMap.put(instanceId, server);
            requestCountMap.put(instanceId, 0L);

            // 更新状态
            ServerStatus status = new ServerStatus();
            status.setRunning(true);
            status.setStartTime(System.currentTimeMillis());
            status.setListenAddress(String.format("http://%s:%d%s",
                    host, port, basePath != null ? basePath : ""));
            status.setTotalRequests(0);
            statusMap.put(instanceId, status);

            log.info("HTTP mock server started. instanceId={}, port={}", instanceId, port);

        } catch (Exception e) {
            log.error("Failed to start HTTP mock server. instanceId={}", instanceId, e);
            throw new ServerStartException("启动 HTTP 模拟服务端失败: " + e.getMessage(), e);
        }
    }

    @Override
    public void stop(Long instanceId) {
        Server server = serverMap.remove(instanceId);
        if (server != null) {
            try {
                server.stop();
                log.info("HTTP mock server stopped. instanceId={}", instanceId);
            } catch (Exception e) {
                log.error("Error stopping HTTP mock server. instanceId={}", instanceId, e);
            }
        }

        ServerStatus status = statusMap.get(instanceId);
        if (status != null) {
            status.setRunning(false);
        }
        requestCountMap.remove(instanceId);
    }

    @Override
    public boolean isRunning(Long instanceId) {
        Server server = serverMap.get(instanceId);
        return server != null && server.isRunning();
    }

    @Override
    public ServerStatus getStatus(Long instanceId) {
        return statusMap.getOrDefault(instanceId, new ServerStatus());
    }

    @Override
    public void destroy() {
        log.info("Destroying HTTP mock server. totalInstances={}", serverMap.size());
        new ArrayList<>(serverMap.keySet()).forEach(this::stop);
    }

    /**
     * HTTP 请求处理器
     */
    private class HttpMockHandler extends AbstractHandler {

        private final Long instanceId;
        private final String basePath;
        private final boolean enableCors;
        private final boolean logRequests;

        public HttpMockHandler(Long instanceId, String basePath, boolean enableCors, boolean logRequests) {
            this.instanceId = instanceId;
            this.basePath = basePath;
            this.enableCors = enableCors;
            this.logRequests = logRequests;
        }

        @Override
        public void handle(String target, Request baseRequest, HttpServletRequest request,
                          HttpServletResponse response) throws IOException {
            long startTime = System.currentTimeMillis();

            try {
                // 构建请求上下文
                ServerRequest serverRequest = buildServerRequest(request);

                // 查找匹配规则
                List<com.hxuanyu.frogmocker.service.server.MatchRule> rules = loadMatchRules(instanceId);
                com.hxuanyu.frogmocker.service.server.MatchRule matchedRule = requestMatcher.findMatchingRule(serverRequest, rules);

                // 构建响应
                ResponseConfig responseConfig;
                Long matchedRuleId = null;
                if (matchedRule != null) {
                    responseConfig = toResponseConfig(matchedRule.getResponse());
                    matchedRuleId = matchedRule.getId();
                } else {
                    // 默认响应
                    responseConfig = new ResponseConfig();
                    responseConfig.setStatusCode(404);
                    responseConfig.setBody("{\"error\": \"No matching rule found\"}");
                    responseConfig.setHeaders(Collections.singletonMap("Content-Type", "application/json"));
                }

                // 延迟（如果配置）
                if (responseConfig.getDelay() != null && responseConfig.getDelay() > 0) {
                    Thread.sleep(responseConfig.getDelay());
                }

                // 设置响应
                response.setStatus(responseConfig.getStatusCode());

                // 设置 CORS 头
                if (enableCors) {
                    response.setHeader("Access-Control-Allow-Origin", "*");
                    response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                    response.setHeader("Access-Control-Allow-Headers", "*");
                }

                // 设置自定义响应头
                if (responseConfig.getHeaders() != null) {
                    responseConfig.getHeaders().forEach(response::setHeader);
                }

                // 写入响应体
                if (responseConfig.getBody() != null) {
                    response.getWriter().write(responseConfig.getBody());
                }

                baseRequest.setHandled(true);

                // 记录日志
                if (logRequests) {
                    long duration = System.currentTimeMillis() - startTime;
                    saveRequestLog(serverRequest, responseConfig.getStatusCode(), duration, matchedRuleId);
                }

                // 更新统计
                updateStatistics(instanceId);

            } catch (Exception e) {
                log.error("Error handling request. instanceId={}", instanceId, e);
                response.setStatus(500);
                response.getWriter().write("{\"error\": \"Internal server error\"}");
                baseRequest.setHandled(true);
            }
        }

        private ServerRequest buildServerRequest(HttpServletRequest request) throws IOException {
            ServerRequest serverRequest = new ServerRequest();
            serverRequest.setMethod(request.getMethod());
            serverRequest.setPath(request.getRequestURI());
            serverRequest.setClientIp(request.getRemoteAddr());

            // 提取请求头
            Map<String, String> headers = new HashMap<>();
            Enumeration<String> headerNames = request.getHeaderNames();
            while (headerNames.hasMoreElements()) {
                String headerName = headerNames.nextElement();
                headers.put(headerName, request.getHeader(headerName));
            }
            serverRequest.setHeaders(headers);

            // 提取查询参数
            Map<String, String> queryParams = new HashMap<>();
            Enumeration<String> paramNames = request.getParameterNames();
            while (paramNames.hasMoreElements()) {
                String paramName = paramNames.nextElement();
                queryParams.put(paramName, request.getParameter(paramName));
            }
            serverRequest.setQueryParams(queryParams);

            // 读取请求体
            StringBuilder body = new StringBuilder();
            try (BufferedReader reader = request.getReader()) {
                String line;
                while ((line = reader.readLine()) != null) {
                    body.append(line);
                }
            }
            serverRequest.setBody(body.toString());

            return serverRequest;
        }

        private List<com.hxuanyu.frogmocker.service.server.MatchRule> loadMatchRules(Long instanceId) {
            try {
                List<com.hxuanyu.frogmocker.entity.MatchRule> entities = matchRuleMapper.selectList(
                        new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<com.hxuanyu.frogmocker.entity.MatchRule>()
                                .eq(com.hxuanyu.frogmocker.entity.MatchRule::getInstanceId, instanceId)
                                .eq(com.hxuanyu.frogmocker.entity.MatchRule::getEnabled, true)
                                .orderByDesc(com.hxuanyu.frogmocker.entity.MatchRule::getPriority)
                );

                return entities.stream().map(entity -> {
                    com.hxuanyu.frogmocker.service.server.MatchRule rule = new com.hxuanyu.frogmocker.service.server.MatchRule();
                        rule.setId(entity.getId());
                        rule.setInstanceId(entity.getInstanceId());
                        rule.setName(entity.getName());
                    rule.setDescription(entity.getDescription());
                    rule.setPriority(entity.getPriority());
                    rule.setEnabled(entity.getEnabled());

                        try {
                            rule.setCondition(objectMapper.readValue(entity.getCondition(), MatchCondition.class));
                            rule.setResponse(objectMapper.readValue(entity.getResponse(),
                                    new com.fasterxml.jackson.core.type.TypeReference<Map<String, String>>() {}));
                        } catch (Exception e) {
                            log.error("Error parsing rule. ruleId={}", entity.getId(), e);
                        }

                    return rule;
                }).collect(Collectors.toList());

            } catch (Exception e) {
                log.error("Error loading match rules. instanceId={}", instanceId, e);
                return Collections.emptyList();
            }
        }

        private void saveRequestLog(ServerRequest serverRequest, int statusCode, long duration, Long matchedRuleId) {
            try {
                RequestLog log = new RequestLog();
                log.setInstanceId(instanceId);
                log.setMethod(serverRequest.getMethod());
                log.setPath(serverRequest.getPath());
                log.setHeaders(objectMapper.writeValueAsString(serverRequest.getHeaders()));
                log.setQueryParams(objectMapper.writeValueAsString(serverRequest.getQueryParams()));
                log.setBody(serverRequest.getBody());
                log.setStatusCode(statusCode);
                log.setDuration((int) duration);
                log.setMatchedRuleId(matchedRuleId);

                requestLogMapper.insert(log);
            } catch (Exception e) {
                HttpMockServer.log.error("Error saving request log. instanceId={}", instanceId, e);
            }
        }

        private void updateStatistics(Long instanceId) {
            requestCountMap.compute(instanceId, (k, v) -> v == null ? 1L : v + 1);
            ServerStatus status = statusMap.get(instanceId);
            if (status != null) {
                status.setTotalRequests(requestCountMap.get(instanceId));
                status.setLastRequestTime(System.currentTimeMillis());
            }
        }

        private ResponseConfig toResponseConfig(Map<String, String> response) {
            ResponseConfig config = new ResponseConfig();
            if (response == null) {
                return config;
            }

            String statusCode = response.get("statusCode");
            if (statusCode != null && !statusCode.trim().isEmpty()) {
                config.setStatusCode(Integer.parseInt(statusCode.trim()));
            }

            String body = response.get("body");
            config.setBody(body);

            String delay = response.get("delay");
            if (delay != null && !delay.trim().isEmpty()) {
                config.setDelay(Integer.parseInt(delay.trim()));
            }

            String headers = response.get("headers");
            if (headers != null && !headers.trim().isEmpty()) {
                config.setHeaders(com.hxuanyu.frogmocker.service.client.ParamParser.parseMap(headers));
            }

            return config;
        }
    }
}
