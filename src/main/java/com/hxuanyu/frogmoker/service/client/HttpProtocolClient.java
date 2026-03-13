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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * HTTP 协议客户端实现
 */
@Slf4j
@Component
public class HttpProtocolClient implements ProtocolClient {

    private static final String PROTOCOL = "HTTP";
    private static final int DEFAULT_TIMEOUT = 30;

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
                "通过 HTTP/HTTPS 协议发送请求",
                Arrays.asList(
                        new ProtocolClientParamDescriptor(
                                "url",
                                "请求地址",
                                "完整的 HTTP/HTTPS 地址，如 http://localhost:8080/api/test",
                                ParamType.TEXT,
                                true,
                                "",
                                null
                        ),
                        new ProtocolClientParamDescriptor(
                                "method",
                                "请求方法",
                                "HTTP 请求方法",
                                ParamType.SELECT,
                                true,
                                "POST",
                                Arrays.asList(
                                        new SelectOption("GET", "GET"),
                                        new SelectOption("POST", "POST"),
                                        new SelectOption("PUT", "PUT"),
                                        new SelectOption("DELETE", "DELETE"),
                                        new SelectOption("PATCH", "PATCH")
                                )
                        ),
                        new ProtocolClientParamDescriptor(
                                "contentType",
                                "Content-Type",
                                "请求内容类型",
                                ParamType.SELECT,
                                false,
                                "application/json",
                                Arrays.asList(
                                        new SelectOption("application/json", "application/json"),
                                        new SelectOption("application/xml", "application/xml"),
                                        new SelectOption("text/plain", "text/plain"),
                                        new SelectOption("application/x-www-form-urlencoded", "application/x-www-form-urlencoded")
                                )
                        ),
                        new ProtocolClientParamDescriptor(
                                "headers",
                                "自定义请求头",
                                "额外的请求头，格式：Key1:Value1,Key2:Value2",
                                ParamType.TEXT,
                                false,
                                "",
                                null
                        )
                )
        );
    }

    @Override
    public ClientResponse send(String message, Map<String, String> params) {
        long startTime = System.currentTimeMillis();
        String url = params.get("url");
        String method = params.getOrDefault("method", "POST");
        String contentType = params.getOrDefault("contentType", "application/json");

        log.info("Sending HTTP request. url={}, method={}, contentType={}",
                url, method, contentType);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", contentType);

            // 添加自定义请求头
            String customHeaders = params.get("headers");
            if (customHeaders != null && !customHeaders.trim().isEmpty()) {
                parseHeaders(customHeaders).forEach(headers::set);
            }

            HttpEntity<String> requestEntity = new HttpEntity<>(message, headers);
            HttpMethod httpMethod = HttpMethod.resolve(method.toUpperCase());

            if (httpMethod == null) {
                throw new IllegalArgumentException("不支持的 HTTP 方法: " + method);
            }

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

    private Map<String, String> parseHeaders(String headersStr) {
        Map<String, String> headers = new HashMap<String, String>();
        if (headersStr == null || headersStr.trim().isEmpty()) {
            return headers;
        }

        String[] pairs = headersStr.split(",");
        for (String pair : pairs) {
            String[] kv = pair.split(":", 2);
            if (kv.length == 2) {
                headers.put(kv[0].trim(), kv[1].trim());
            }
        }
        return headers;
    }
}
