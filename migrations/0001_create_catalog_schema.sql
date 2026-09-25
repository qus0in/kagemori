-- 0001_create_catalog_schema.sql
-- 2026 투자자산운용사 교재 카탈로그 및 출제기준 스키마

CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  publisher TEXT NOT NULL,
  source_type TEXT NOT NULL,
  checked_at TEXT NOT NULL,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS editions (
  id TEXT PRIMARY KEY,
  exam_code TEXT NOT NULL,
  year INTEGER NOT NULL,
  publisher TEXT NOT NULL,
  verified_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  edition_id TEXT NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
  volume_no INTEGER NOT NULL,
  title TEXT NOT NULL,
  isbn13 TEXT UNIQUE NOT NULL,
  source_id TEXT REFERENCES sources(id),
  UNIQUE(edition_id, volume_no)
);

CREATE TABLE IF NOT EXISTS parts (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  ordinal INTEGER NOT NULL,
  title TEXT NOT NULL,
  start_page INTEGER,
  UNIQUE(book_id, ordinal)
);

CREATE TABLE IF NOT EXISTS chapters (
  id TEXT PRIMARY KEY,
  part_id TEXT NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  ordinal INTEGER NOT NULL,
  title TEXT NOT NULL,
  start_page INTEGER,
  section_range_hint TEXT,
  UNIQUE(part_id, ordinal)
);

CREATE TABLE IF NOT EXISTS sections (
  id TEXT PRIMARY KEY,
  chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  ordinal INTEGER NOT NULL,
  title TEXT NOT NULL,
  start_page INTEGER,
  UNIQUE(chapter_id, ordinal)
);

CREATE TABLE IF NOT EXISTS exam_blueprints (
  id TEXT PRIMARY KEY,
  exam_code TEXT NOT NULL,
  effective_from TEXT NOT NULL,
  source_id TEXT REFERENCES sources(id),
  verification_status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS exam_subjects (
  id TEXT PRIMARY KEY,
  blueprint_id TEXT NOT NULL REFERENCES exam_blueprints(id) ON DELETE CASCADE,
  ordinal INTEGER NOT NULL,
  title TEXT NOT NULL,
  question_count INTEGER NOT NULL,
  minimum_correct INTEGER NOT NULL,
  UNIQUE(blueprint_id, ordinal)
);

CREATE TABLE IF NOT EXISTS exam_topics (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL REFERENCES exam_subjects(id) ON DELETE CASCADE,
  ordinal INTEGER NOT NULL,
  title TEXT NOT NULL,
  question_count INTEGER NOT NULL,
  UNIQUE(subject_id, ordinal)
);

CREATE TABLE IF NOT EXISTS topic_chapters (
  topic_id TEXT NOT NULL REFERENCES exam_topics(id) ON DELETE CASCADE,
  chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  source_id TEXT REFERENCES sources(id),
  mapping_status TEXT NOT NULL,
  PRIMARY KEY (topic_id, chapter_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_books_edition ON books(edition_id);
CREATE INDEX IF NOT EXISTS idx_parts_book ON parts(book_id);
CREATE INDEX IF NOT EXISTS idx_chapters_part ON chapters(part_id);
CREATE INDEX IF NOT EXISTS idx_sections_chapter ON sections(chapter_id);
CREATE INDEX IF NOT EXISTS idx_subjects_blueprint ON exam_subjects(blueprint_id);
CREATE INDEX IF NOT EXISTS idx_topics_subject ON exam_topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_topic_chapters_topic ON topic_chapters(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_chapters_chapter ON topic_chapters(chapter_id);
