-- Shared study status is required to enforce mock-exam chat restrictions.
CREATE TABLE IF NOT EXISTS study_session_status (
  session_id TEXT PRIMARY KEY,
  purpose TEXT NOT NULL,
  is_completed INTEGER NOT NULL DEFAULT 0 CHECK (is_completed IN (0, 1)),
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS study_session_status_active ON study_session_status(is_completed, purpose);
