-- Single-owner history: one immutable answer per session/question.
CREATE TABLE IF NOT EXISTS study_attempts (
  session_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  attempt_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  question_version INTEGER NOT NULL,
  purpose TEXT NOT NULL,
  selected_option_id TEXT NOT NULL,
  is_correct INTEGER NOT NULL CHECK (is_correct IN (0, 1)),
  hint_used INTEGER NOT NULL CHECK (hint_used IN (0, 1)),
  duration_ms INTEGER NOT NULL,
  answered_at TEXT NOT NULL,
  PRIMARY KEY (session_id, question_id)
);
CREATE INDEX IF NOT EXISTS study_attempts_latest ON study_attempts(question_id, answered_at DESC, attempt_id DESC);
CREATE INDEX IF NOT EXISTS study_attempts_topic ON study_attempts(topic_id);
