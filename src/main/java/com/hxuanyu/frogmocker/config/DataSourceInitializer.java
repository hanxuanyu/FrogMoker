package com.hxuanyu.frogmocker.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;

@Slf4j
@Component
public class DataSourceInitializer implements ApplicationRunner {

    private final DataSource dataSource;
    private final ResourceLoader resourceLoader;

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    public DataSourceInitializer(DataSource dataSource, ResourceLoader resourceLoader) {
        this.dataSource = dataSource;
        this.resourceLoader = resourceLoader;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        log.info("Initializing datasource schema. datasourceUrl={}", datasourceUrl);
        ensureDatabaseDirectory();

        try (Connection conn = dataSource.getConnection()) {
            String databaseType = resolveDatabaseType(conn);
            Resource resource = resolveSchemaResource(databaseType);
            log.info("Executing schema initialization script. databaseType={}, resource={}", databaseType, resource.getFilename());
            ScriptUtils.executeSqlScript(conn, resource);
        }

        log.info("Datasource schema initialization completed.");
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

    private String resolveDatabaseType(Connection connection) throws Exception {
        String productName = connection.getMetaData().getDatabaseProductName();
        if (productName == null) {
            throw new IllegalStateException("Unable to detect database product name.");
        }

        String normalized = productName.trim().toLowerCase();
        if (normalized.contains("mysql")) {
            return "mysql";
        }
        if (normalized.contains("sqlite")) {
            return "sqlite";
        }

        throw new IllegalStateException("Unsupported database type: " + productName);
    }

    private Resource resolveSchemaResource(String databaseType) {
        String location = "classpath:schema-" + databaseType + ".sql";
        Resource resource = resourceLoader.getResource(location);
        if (!resource.exists()) {
            throw new IllegalStateException("Schema script not found for database type: " + databaseType);
        }
        return resource;
    }
}
