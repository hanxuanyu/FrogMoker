package com.hxuanyu.frogmoker;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;

import java.util.Arrays;

@Slf4j
@SpringBootApplication
public class FrogMokerApplication {

    private final Environment env;

    public FrogMokerApplication(Environment env) {
        this.env = env;
    }

    public static void main(String[] args) {
        SpringApplication.run(FrogMokerApplication.class, args);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onReady() {
        String port = env.getProperty("server.port", "8080");
        String contextPath = env.getProperty("server.servlet.context-path", "");
        String baseUrl = "http://localhost:" + port + contextPath;
        String[] activeProfiles = env.getActiveProfiles();
        String profileSummary = activeProfiles.length == 0 ? "[default]" : Arrays.toString(activeProfiles);

        log.info("Application started successfully. \nprofiles={}, \napiBase={}, \ndocsUrl={}, \nwebUrl={}",
                profileSummary,
                baseUrl + "/api/v1",
                baseUrl + "/doc.html",
                baseUrl + "/");
    }
}
