-- Contact messages. No IP address or user agent is stored.
CREATE TABLE contact_messages (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL,
    notified_at TEXT,
    notify_attempts INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX contact_messages_pending ON contact_messages (notified_at) WHERE notified_at IS NULL;
CREATE INDEX contact_messages_created_at ON contact_messages (created_at);
