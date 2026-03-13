package com.hxuanyu.frogmoker.service.client;

import com.hxuanyu.frogmoker.service.generator.ParamType;
import com.hxuanyu.frogmoker.service.generator.SelectOption;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * HTTP 协议客户端实现
 * 支持完整的 HTTP 请求配置，包括请求头、查询参数等
 */
@Slf4j
@Component
public class HttpProtocolClient implements ProtocolClient {

    private static final String PROTOCOL = "HTTP";

    private final RestTemplate restTemplate;

    public HttpProtocolClient() {
        this.restTemplate = new RestTemplate();
    }

    @Override
    public String getProtocol() {
        return PROTOCOL;
    }

    @Override
    public ProtocolClientDescriptor getDescriptor() {
        return new ProtocolClientDescriptor(
                PROTOCOL,
                "HTTP 客户端",
                "通过 HTTP/HTTPS 协议发送请求，支持完整的请求配置",
                Arrays.asList(
                        // 请求地址
                        createParam("url", "请求地址", "完整的 HTTP/HTTPS 地址",
                                ParamType.TEXT, true, "", null, null,
                                "http://localhost:8080/api/test"),

                        // 请求方法
                        createParam("method", "请求方法", "HTTP 请求方法",
                                ParamType.SELECT, true, "POST",
                                Arrays.asList(
                                        new SelectOption("GET", "GET"),
                                        new SelectOption("POST", "POST"),
                                        new SelectOption("PUT", "PUT"),
                                        new SelectOption("DELETE", "DELETE"),
                                        new SelectOption("PATCH", "PATCH"),
                                        new SelectOption("HEAD", "HEAD"),
                                        new SelectOption("OPTIONS", "OPTIONS")
                                ), null, null),

                        // 查询参数（MAP 类型）- 仅 GET/HEAD 请求显示
                        createMapParamWithDependency("queryParams", "查询参数",
                                "URL 查询参数，键值对格式",
                                false, "{}",
                                "参数名", "参数值",
                                createDependency("method", Arrays.asList("GET", "HEAD"),
                                        ParamDependency.DependencyCondition.EQUALS)),

                        // Content-Type - 仅非 GET/HEAD 请求显示
                        createParam("contentType", "Content-Type", "请求内容类型",
                                ParamType.SELECT, false, "application/json",
                                Arrays.asList(
                                        new SelectOption("application/json", "application/json"),
                                        new SelectOption("application/xml", "application/xml"),
                                        new SelectOption("text/plain", "text/plain"),
                                        new SelectOption("application/x-www-form-urlencoded", "application/x-www-form-urlencoded")
                                ),
                                createDependency("method", Arrays.asList("POST", "PUT", "PATCH", "DELETE"),
                                        ParamDependency.DependencyCondition.EQUALS),
                                null),

                        // 请求体（TEXTAREA 类型）- 仅非 GET/HEAD 且 Content-Type 不是 form-urlencoded 时显示
                        createParam("body", "请求体", "请求体内容，支持 JSON/XML/文本等格式",
                                ParamType.TEXTAREA, false, "", null,
                                createMultiDependency(ParamDependency.CombineLogic.AND, Arrays.asList(
                                        createDependency("method", Arrays.asList("POST", "PUT", "PATCH", "DELETE"),
                                                ParamDependency.DependencyCondition.EQUALS),
                                        createDependency("contentType", Arrays.asList("application/x-www-form-urlencoded"),
                                                ParamDependency.DependencyCondition.NOT_EQUALS)
                                )),
                                "输入请求体内容..."),

                        // 表单数据（MAP 类型）- 仅 POST/PUT/PATCH/DELETE 且 Content-Type 为 form-urlencoded 时显示
                        createMapParamWithDependency("formData", "表单数据",
                                "表单键值对数据，适用于 application/x-www-form-urlencoded",
                                false, "{}",
                                "字段名", "字段值",
                                createMultiDependency(ParamDependency.CombineLogic.AND, Arrays.asList(
                                        createDependency("method", Arrays.asList("POST", "PUT", "PATCH", "DELETE"),
                                                ParamDependency.DependencyCondition.EQUALS),
                                        createDependency("contentType", Arrays.asList("application/x-www-form-urlencoded"),
                                                ParamDependency.DependencyCondition.EQUALS)
                                ))),

                        // 自定义请求头（MAP 类型）
                        createMapParam("headers", "自定义请求头",
                                "额外的 HTTP 请求头，键值对格式",
                                false, "{}",
                                "请求头名称", "请求头值"),

                        // 超时时间
                        createParam("timeout", "超时时间", "请求超时时间（毫秒）",
                                ParamType.NUMBER, false, "30000", null, null,
                                "30000"),

                        // 是否跟随重定向
                        createParam("followRedirects", "跟随重定向", "是否自动跟随 HTTP 重定向",
                                ParamType.BOOLEAN, false, "true", null, null, null)
                )
        );
    }

    @Override
    public ClientResponse send(String message, Map<String, String> params) {
        long startTime = System.currentTimeMillis();
        String url = params.get("url");
        String method = params.getOrDefault("method", "POST");
        String contentType = params.get("contentType");
        String body = params.getOrDefault("body", "");

        log.info("Sending HTTP request. url={}, method={}, contentType={}, bodyLength={}",
                url, method, contentType, body.length());

        try {
            // 构建请求头
            HttpHeaders headers = new HttpHeaders();

            // 设置 Content-Type（仅对有 body 的请求）
            if (contentType != null && !contentType.isEmpty() &&
                    !method.equalsIgnoreCase("GET") && !method.equalsIgnoreCase("HEAD")) {
                headers.set("Content-Type", contentType);
            }

            // 添加自定义请求头
            String headersJson = params.get("headers");
            if (headersJson != null && !headersJson.trim().isEmpty()) {
                Map<String, String> customHeaders = ParamParser.parseMap(headersJson);
                customHeaders.forEach(headers::set);
            }

            // 处理查询参数
            String queryParamsJson = params.get("queryParams");
            if (queryParamsJson != null && !queryParamsJson.trim().isEmpty()) {
                Map<String, String> queryParams = ParamParser.parseMap(queryParamsJson);
                url = appendQueryParams(url, queryParams);
            }

            // 构建请求实体
            HttpEntity<String> requestEntity;
            if (method.equalsIgnoreCase("GET") || method.equalsIgnoreCase("HEAD")) {
                // GET 和 HEAD 请求不应该有 body
                requestEntity = new HttpEntity<>(headers);
            } else {
                // 处理表单数据
                String requestBody = body;
                if ("application/x-www-form-urlencoded".equals(contentType)) {
                    String formDataJson = params.get("formData");
                    if (formDataJson != null && !formDataJson.trim().isEmpty()) {
                        Map<String, String> formData = ParamParser.parseMap(formDataJson);
                        requestBody = buildFormUrlEncoded(formData);
                    }
                }
                requestEntity = new HttpEntity<>(requestBody, headers);
            }

            HttpMethod httpMethod = HttpMethod.resolve(method.toUpperCase());
            if (httpMethod == null) {
                throw new IllegalArgumentException("不支持的 HTTP 方法: " + method);
            }

            // 发送请求
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    httpMethod,
                    requestEntity,
                    String.class
            );

            long duration = System.currentTimeMillis() - startTime;
            int statusCode = response.getStatusCodeValue();
            String responseBody = response.getBody();

            log.info("HTTP request completed. url={}, statusCode={}, duration={}ms, responseLength={}",
                    url, statusCode, duration, responseBody != null ? responseBody.length() : 0);

            return ClientResponse.success(statusCode, responseBody, duration);

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("HTTP request failed. url={}, duration={}ms", url, duration, e);
            return ClientResponse.failure("请求失败: " + e.getMessage(), duration);
        }
    }

    /**
     * 创建普通参数描述
     */
    private ProtocolClientParamDescriptor createParam(String name, String label, String description,
                                                       ParamType paramType, boolean required,
                                                       String defaultValue, List<SelectOption> options,
                                                       ParamDependency dependency, String placeholder) {
        ProtocolClientParamDescriptor param = new ProtocolClientParamDescriptor();
        param.setName(name);
        param.setLabel(label);
        param.setDescription(description);
        param.setParamType(paramType);
        param.setRequired(required);
        param.setDefaultValue(defaultValue);
        param.setOptions(options);
        param.setDependency(dependency);
        param.setPlaceholder(placeholder);
        return param;
    }

    /**
     * 创建 MAP 类型参数描述
     */
    private ProtocolClientParamDescriptor createMapParam(String name, String label, String description,
                                                          boolean required, String defaultValue,
                                                          String keyLabel, String valueLabel) {
        ProtocolClientParamDescriptor param = new ProtocolClientParamDescriptor();
        param.setName(name);
        param.setLabel(label);
        param.setDescription(description);
        param.setParamType(ParamType.MAP);
        param.setRequired(required);
        param.setDefaultValue(defaultValue);
        param.setKeyLabel(keyLabel);
        param.setValueLabel(valueLabel);
        param.setPlaceholder("{\"key\":\"value\"}");
        return param;
    }

    /**
     * 创建带依赖的 MAP 类型参数描述
     */
    private ProtocolClientParamDescriptor createMapParamWithDependency(String name, String label, String description,
                                                                        boolean required, String defaultValue,
                                                                        String keyLabel, String valueLabel,
                                                                        ParamDependency dependency) {
        ProtocolClientParamDescriptor param = createMapParam(name, label, description, required, defaultValue, keyLabel, valueLabel);
        param.setDependency(dependency);
        return param;
    }

    /**
     * 创建参数依赖配置
     */
    private ParamDependency createDependency(String dependsOn, List<String> expectedValues,
                                              ParamDependency.DependencyCondition condition) {
        ParamDependency dependency = new ParamDependency();
        dependency.setDependsOn(dependsOn);
        dependency.setExpectedValues(expectedValues);
        dependency.setCondition(condition);
        return dependency;
    }

    /**
     * 创建多依赖配置（支持 AND/OR 逻辑）
     */
    private ParamDependency createMultiDependency(ParamDependency.CombineLogic combineLogic,
                                                   List<ParamDependency> dependencies) {
        ParamDependency multiDependency = new ParamDependency();
        multiDependency.setDependencies(dependencies);
        multiDependency.setCombineLogic(combineLogic);
        return multiDependency;
    }

    /**
     * 将查询参数追加到 URL
     */
    private String appendQueryParams(String url, Map<String, String> queryParams) {
        if (queryParams == null || queryParams.isEmpty()) {
            return url;
        }

        StringBuilder sb = new StringBuilder(url);
        boolean hasQuery = url.contains("?");

        for (Map.Entry<String, String> entry : queryParams.entrySet()) {
            if (hasQuery) {
                sb.append("&");
            } else {
                sb.append("?");
                hasQuery = true;
            }
            sb.append(entry.getKey()).append("=").append(entry.getValue());
        }

        return sb.toString();
    }

    /**
     * 构建 application/x-www-form-urlencoded 格式的请求体
     */
    private String buildFormUrlEncoded(Map<String, String> formData) {
        if (formData == null || formData.isEmpty()) {
            return "";
        }

        StringBuilder sb = new StringBuilder();
        boolean first = true;

        for (Map.Entry<String, String> entry : formData.entrySet()) {
            if (!first) {
                sb.append("&");
            }
            sb.append(entry.getKey()).append("=").append(entry.getValue());
            first = false;
        }

        return sb.toString();
    }
}
