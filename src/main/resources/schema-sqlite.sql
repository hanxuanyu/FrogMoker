CREATE TABLE IF NOT EXISTS message_template
(
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         VARCHAR(128)  NOT NULL,
    description  VARCHAR(512),
    group_name   VARCHAR(128)  NOT NULL,
    message_type VARCHAR(16)   NOT NULL,
    content      TEXT          NOT NULL,
    tags         TEXT,
    created_at   DATETIME      NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at   DATETIME      NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_message_template_group_name ON message_template(group_name);

CREATE TABLE IF NOT EXISTS template_variable
(
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    template_id         INTEGER      NOT NULL,
    variable_name       VARCHAR(128) NOT NULL,
    generator_type      VARCHAR(64)  NOT NULL,
    generator_params    TEXT,
    created_at          DATETIME     NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at          DATETIME     NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS generator_sequence_state
(
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    variable_id   INTEGER NOT NULL UNIQUE,
    current_value INTEGER NOT NULL DEFAULT 0,
    updated_at    DATETIME NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS server_instance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(128) NOT NULL,
    description VARCHAR(512),
    protocol VARCHAR(32) NOT NULL,
    params TEXT NOT NULL,
    status VARCHAR(16) NOT NULL,
    start_time DATETIME,
    stop_time DATETIME,
    error_message TEXT,
    created_at DATETIME NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at DATETIME NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS match_rule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    instance_id INTEGER NOT NULL,
    name VARCHAR(128) NOT NULL,
    description VARCHAR(512),
    priority INTEGER NOT NULL DEFAULT 0,
    `condition` TEXT NOT NULL,
    response TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at DATETIME NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (instance_id) REFERENCES server_instance(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_match_rule_instance ON match_rule(instance_id, priority DESC);

CREATE TABLE IF NOT EXISTS request_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    instance_id INTEGER NOT NULL,
    method VARCHAR(16),
    path VARCHAR(512),
    headers TEXT,
    query_params TEXT,
    body TEXT,
    status_code INTEGER,
    duration INTEGER,
    matched_rule_id INTEGER,
    created_at DATETIME NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (instance_id) REFERENCES server_instance(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_request_log_instance ON request_log(instance_id, created_at DESC);
