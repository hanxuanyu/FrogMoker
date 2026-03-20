package com.hxuanyu.frogmocker.service.client;

import com.hxuanyu.frogmocker.service.common.SelectOption;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.client.LaxRedirectStrategy;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.Map;

import static com.hxuanyu.frogmocker.service.client.ProtocolClientParamBuilder.*;

/**
 * HTTP 协议客户端实现
 * 支持完整的 HTTP 请求配置，包括请求头、查询参数等
 */
@Slf4j
@Component
public class HttpProtocolClient implements ProtocolClient {

    private static final String PROTOCOL = "HTTP";

    private final PoolingHttpClientConnectionManager connectionManager;
    private final CloseableHttpClient httpClient;
    private final CloseableHttpClient httpClientNoRedirect;
    private final RestTemplate restTemplate;
    private final RestTemplate restTemplateNoRedirect;

    public HttpProtocolClient() {
        this.connectionManager = new PoolingHttpClientConnectionManager();
        this.connectionManager.setMaxTotal(200);
        this.connectionManager.setDefaultMaxPerRoute(50);

        this.httpClient = HttpClients.custom()
                .setConnectionManager(connectionManager)
                .setConnectionManagerShared(true)
                .setRedirectStrategy(new LaxRedirectStrategy())
                .build();

        this.httpClientNoRedirect = HttpClients.custom()
                .setConnectionManager(connectionManager)
                .setConnectionManagerShared(true)
                .disableRedirectHandling()
                .build();

        this.restTemplate = new RestTemplate(new HttpComponentsClientHttpRequestFactory(httpClient));
        this.restTemplateNoRedirect = new RestTemplate(new HttpComponentsClientHttpRequestFactory(httpClientNoRedirect));
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
                        text("url", "请求地址")
                                .description("完整的 HTTP/HTTPS 地址")
                                .required()
                                .placeholder("http://localhost:8080/api/test")
                                .build(),

                        // 请求方法
                        select("method", "请求方法")
                                .description("HTTP 请求方法")
                                .required()
                                .defaultValue("POST")
                                .options(
                                        new SelectOption("GET", "GET"),
                                        new SelectOption("POST", "POST"),
                                        new SelectOption("PUT", "PUT"),
                                        new SelectOption("DELETE", "DELETE"),
                                        new SelectOption("PATCH", "PATCH"),
                                        new SelectOption("HEAD", "HEAD"),
                                        new SelectOption("OPTIONS", "OPTIONS")
                                )
                                .build(),

                        // 查询参数（MAP 类型）- 仅 GET/HEAD 请求显示
                        map("queryParams", "查询参数")
                                .description("URL 查询参数，键值对格式")
                                .mapLabels("参数名", "参数值")
                                .dependsOn("method", "GET", "HEAD")
                                .build(),

                        // Content-Type - 仅非 GET/HEAD 请求显示
                        select("contentType", "Content-Type")
                                .description("请求内容类型")
                                .defaultValue("application/json")
                                .options(
                                        new SelectOption("application/json", "application/json"),
                                        new SelectOption("application/xml", "application/xml"),
                                        new SelectOption("text/plain", "text/plain"),
                                        new SelectOption("application/x-www-form-urlencoded", "application/x-www-form-urlencoded")
                                )
                                .dependsOn("method", "POST", "PUT", "PATCH", "DELETE")
                                .build(),

                        // 请求体（TEXTAREA 类型）- 仅非 GET/HEAD 且 Content-Type 不是 form-urlencoded 时显示
                        textarea("body", "请求体")
                                .description("请求体内容，支持 JSON/XML/文本等格式")
                                .placeholder("输入请求体内容...")
                                .dependsOnAll(
                                        DependencyBuilder.equals("method", "POST", "PUT", "PATCH", "DELETE"),
                                        DependencyBuilder.notEquals("contentType", "application/x-www-form-urlencoded")
                                )
                                .build(),

                        // 表单数据（MAP 类型）- 仅 POST/PUT/PATCH/DELETE 且 Content-Type 为 form-urlencoded 时显示
                        map("formData", "表单数据")
                                .description("表单键值对数据，适用于 application/x-www-form-urlencoded")
                                .mapLabels("字段名", "字段值")
                                .dependsOnAll(
                                        DependencyBuilder.equals("method", "POST", "PUT", "PATCH", "DELETE"),
                                        DependencyBuilder.equals("contentType", "application/x-www-form-urlencoded")
                                )
                                .build(),

                        // 自定义请求头（MAP 类型）
                        map("headers", "自定义请求头")
                                .description("额外的 HTTP 请求头，键值对格式")
                                .mapLabels("请求头名称", "请求头值")
                                .build(),

                        // 是否跟随重定向
                        bool("followRedirects", "跟随重定向")
                                .description("是否自动跟随 HTTP 重定向")
                                .defaultValue("true")
                                .build()
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
        boolean followRedirects = Boolean.parseBoolean(params.getOrDefault("followRedirects", "true"));

        log.info("Sending HTTP request. url={}, method={}, contentType={}, bodyLength={}, followRedirects={}",
                url, method, contentType, body.length(), followRedirects);

        RestTemplate template = followRedirects ? restTemplate : restTemplateNoRedirect;

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
            ResponseEntity<String> response = template.exchange(
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

    @Override
    public void destroy() {
        try {
            httpClient.close();
            httpClientNoRedirect.close();
            log.info("HTTP clients closed");
        } catch (Exception e) {
            log.warn("Error closing HTTP clients", e);
        }
        try {
            connectionManager.close();
            log.info("HTTP connection manager closed");
        } catch (Exception e) {
            log.warn("Error closing HTTP connection manager", e);
        }
    }
}
