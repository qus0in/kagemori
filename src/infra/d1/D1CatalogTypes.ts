export interface D1DatabaseLike {
  prepare(query: string): {
    bind(...values: unknown[]): {
      first<T = Record<string, unknown>>(colName?: string): Promise<T | null>
      all<T = Record<string, unknown>>(): Promise<{ results: T[] }>
    }
    first<T = Record<string, unknown>>(colName?: string): Promise<T | null>
    all<T = Record<string, unknown>>(): Promise<{ results: T[] }>
  }
}

export interface DbBookRow {
  id: string
  edition_id: string
  volume_no: number
  title: string
  isbn13: string
}

export interface DbPartRow {
  id: string
  book_id: string
  ordinal: number
  title: string
}

export interface DbChapterRow {
  id: string
  part_id: string
  ordinal: number
  title: string
  section_range_hint: string | null
}

export interface DbSubjectRow {
  id: string
  blueprint_id: string
  ordinal: number
  title: string
  question_count: number
  minimum_correct: number
}

export interface DbTopicRow {
  id: string
  subject_id: string
  ordinal: number
  title: string
  question_count: number
}

export interface DbTopicChapterRow {
  topic_id: string
  chapter_id: string
}
