package com.hxuanyu.frogmoker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;

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
        String ctx  = env.getProperty("server.servlet.context-path", "");
        String base = "http://localhost:" + port + ctx;
        System.out.println("\n==================================================");
        System.out.println("  FrogMoker 启动成功！");
        System.out.println("  API  基础地址：" + base + "/api/v1");
        System.out.println("  接口文档地址：" + base + "/doc.html");
        System.out.println("  前端地址：" + base + "/");
        System.out.println("==================================================\n");
    }

}
