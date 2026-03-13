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
        log.info("Initializing datasource schema. datasourceUrl={}", datasourceUrl);
        ensureDatabaseDirectory();

        ClassPathResource resource = new ClassPathResource("schema.sql");
        String sql;
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
            sql = reader.lines().collect(Collectors.joining("\n"));
        }

        int executedStatements = 0;
        try (Connection conn = dataSource.getConnection(); Statement stmt = conn.createStatement()) {
            for (String statement : sql.split(";")) {
                String trimmed = statement.trim();
                if (!trimmed.isEmpty()) {
                    stmt.execute(trimmed);
                    executedStatements++;
                    log.debug("Executed schema statement {}: {}", executedStatements, abbreviate(trimmed));
                }
            }
        }

        log.info("Datasource schema initialization completed. statementCount={}", executedStatements);
    }

    private void ensureDatabaseDirectory() throws Exception {
        if (!datasourceUrl.startsWith("jdbc:sqlite:")) {
            return;
        }

        String dbPath = datasourceUrl.substring("jdbc:sqlite:".length());
        Path parent = Paths.get(dbPath).getParent();
        if (parent == null) {
            return;
        }

        Files.createDirectories(parent);
        log.info("Ensured SQLite database directory exists. path={}", parent.toAbsolutePath());
    }

    private String abbreviate(String value) {
        if (value == null) {
            return "";
        }
        String normalized = value.replaceAll("\\s+", " ").trim();
        if (normalized.length() <= 160) {
            return normalized;
        }
        return normalized.substring(0, 157) + "...";
    }
}
