-- Core issue tagged by gemma-4-26b-a4b-it during screening (ADR 0003).
ALTER TABLE generated_questions ADD COLUMN issue TEXT NOT NULL DEFAULT '';

-- Which questions have a gemini-embedding-2 vector in Vectorize `kagemori-questions`.
CREATE TABLE IF NOT EXISTS question_vectors (
  question_id TEXT PRIMARY KEY,
  topic_id TEXT NOT NULL,
  model TEXT NOT NULL,
  indexed_at TEXT NOT NULL
);
