-- AI-drafted questions that passed an independent AI review (ADR 0003).
CREATE TABLE IF NOT EXISTS generated_questions (
  id TEXT PRIMARY KEY,
  topic_id TEXT NOT NULL,
  topic_title TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  type TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'REVIEWED',
  prompt TEXT NOT NULL,
  options_json TEXT NOT NULL,
  correct_option_id TEXT NOT NULL,
  explanation TEXT NOT NULL,
  basis TEXT NOT NULL,
  generator_model TEXT NOT NULL,
  reviewer_model TEXT NOT NULL,
  review_notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS generated_questions_topic ON generated_questions(topic_id);
