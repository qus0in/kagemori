-- Verification tier for AI-drafted questions (ADR 0003): REVIEWED (study) or VERIFIED (mock exam).
ALTER TABLE generated_questions ADD COLUMN tier TEXT NOT NULL DEFAULT 'REVIEWED';
CREATE INDEX IF NOT EXISTS generated_questions_tier ON generated_questions(tier);
