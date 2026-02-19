-- Schema and seed data for sample `Items` feature (001-modernize-api)

CREATE TABLE IF NOT EXISTS items (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Sample data
INSERT INTO items (id, name, description, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Sample Item A', 'Seed item for local testing', NOW()),
('22222222-2222-2222-2222-222222222222', 'Sample Item B', 'Another seed item', NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
