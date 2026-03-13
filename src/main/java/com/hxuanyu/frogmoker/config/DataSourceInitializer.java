package com.hxuanyu.frogmoker.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.Statement;
import java.util.stream.Collectors;

@Slf4j
@Component
public class DataSourceInitializer implements ApplicationRunner {

    private final DataSource dataSource;

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    public DataSourceInitializer(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        // 确保数据库文件目录存在
        if (datasourceUrl.startsWith("jdbc:sqlite:")) {
            String dbPath = datasourceUrl.substring("jdbc:sqlite:".length());
            Path path = Paths.get(dbPath).getParent();
            if (path != null) {
                Files.createDirectories(path);
                log.info("数据库目录已就绪: {}", path.toAbsolutePath());
            }
        }

        // 执行 schema.sql 建表
        ClassPathResource resource = new ClassPathResource("schema.sql");
        String sql;
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
            sql = reader.lines().collect(Collectors.joining("\n"));
        }

        try (Connection conn = dataSource.getConnection(); Statement stmt = conn.createStatement()) {
            for (String statement : sql.split(";")) {
                String trimmed = statement.trim();
                if (!trimmed.isEmpty()) {
                    stmt.execute(trimmed);
                }
            }
            log.info("数据库表初始化完成");
        }
    }
}
