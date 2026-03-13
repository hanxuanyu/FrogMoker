CREATE TABLE IF NOT EXISTS message_template
(
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         VARCHAR(128)  NOT NULL,
    description  VARCHAR(512),
    message_type VARCHAR(16)   NOT NULL,
    content      TEXT          NOT NULL,
    created_at   DATETIME      NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at   DATETIME      NOT NULL DEFAULT (datetime('now', 'localtime'))
);

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
