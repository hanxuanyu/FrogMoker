package com.hxuanyu.frogmoker.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        log.info("Building OpenAPI metadata.");
        return new OpenAPI()
                .info(new Info()
                        .title("FrogMoker API")
                        .description("Mock testing tool API documentation")
                        .version("1.0.0"));
    }
}
