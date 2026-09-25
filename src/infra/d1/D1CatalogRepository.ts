// src/infra/d1/D1CatalogRepository.ts
import type { BookCatalog, ExamBlueprint, PartCatalog, ChapterCatalog } from '../../domain/models/Catalog.ts'
import type { CatalogOverview, CatalogRepository } from '../../domain/ports/CatalogRepository.ts'
import { STATIC_BOOKS_CATALOG, STATIC_EXAM_BLUEPRINT } from '../catalog/CatalogStaticData.ts'

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

interface DbBookRow {
  id: string
  edition_id: string
  volume_no: number
  title: string
  isbn13: string
}

interface DbPartRow {
  id: string
  book_id: string
  ordinal: number
  title: string
}

interface DbChapterRow {
  id: string
  part_id: string
  ordinal: number
  title: string
  section_range_hint: string | null
}

interface DbSubjectRow {
  id: string
  blueprint_id: string
  ordinal: number
  title: string
  question_count: number
  minimum_correct: number
}

interface DbTopicRow {
  id: string
  subject_id: string
  ordinal: number
  title: string
  question_count: number
}

interface DbTopicChapterRow {
  topic_id: string
  chapter_id: string
}

export class D1CatalogRepository implements CatalogRepository {
  private readonly db?: D1DatabaseLike

  constructor(db?: D1DatabaseLike) {
    this.db = db
  }

  public async getOverview(): Promise<CatalogOverview> {
    if (!this.db) {
      return this.getFallbackOverview()
    }

    try {
      const booksResult = await this.db.prepare(
        `SELECT b.id, b.volume_no, b.title, b.isbn13,
                COUNT(DISTINCT p.id) as partCount,
                COUNT(DISTINCT c.id) as chapterCount
         FROM books b
         LEFT JOIN parts p ON p.book_id = b.id
         LEFT JOIN chapters c ON c.part_id = p.id
         GROUP BY b.id, b.volume_no, b.title, b.isbn13
         ORDER BY b.volume_no ASC`
      ).all<{
        id: string
        volume_no: number
        title: string
        isbn13: string
        partCount: number
        chapterCount: number
      }>()

      if (!booksResult.results || booksResult.results.length === 0) {
        return this.getFallbackOverview()
      }

      const totalParts = booksResult.results.reduce((acc, b) => acc + Number(b.partCount), 0)
      const totalChapters = booksResult.results.reduce((acc, b) => acc + Number(b.chapterCount), 0)

      const bp = await this.getExamBlueprint()
      const totalQuestions = bp.subjects.reduce((sum, s) => sum + s.questionCount, 0)
      const topicsCount = bp.subjects.reduce((sum, s) => sum + s.topics.length, 0)

      return {
        books: booksResult.results.map((r) => ({
          id: r.id,
          volumeNo: r.volume_no,
          title: r.title,
          isbn13: r.isbn13,
          partCount: Number(r.partCount),
          chapterCount: Number(r.chapterCount),
        })),
        totalParts,
        totalChapters,
        blueprintSummary: {
          examCode: bp.examCode,
          totalQuestions,
          subjectsCount: bp.subjects.length,
          topicsCount,
        },
      }
    } catch (error) {
      console.warn('Failed to fetch catalog overview from D1, falling back to static:', error)
      return this.getFallbackOverview()
    }
  }

  public async getBooks(): Promise<BookCatalog[]> {
    if (!this.db) {
      return STATIC_BOOKS_CATALOG
    }

    try {
      const booksQuery = await this.db.prepare('SELECT * FROM books ORDER BY volume_no ASC').all<DbBookRow>()
      const partsQuery = await this.db.prepare('SELECT * FROM parts ORDER BY book_id, ordinal ASC').all<DbPartRow>()
      const chaptersQuery = await this.db.prepare('SELECT * FROM chapters ORDER BY part_id, ordinal ASC').all<DbChapterRow>()

      if (!booksQuery.results || booksQuery.results.length === 0) {
        return STATIC_BOOKS_CATALOG
      }

      const chaptersByPart = new Map<string, ChapterCatalog[]>()
      for (const ch of chaptersQuery.results) {
        const list = chaptersByPart.get(ch.part_id) ?? []
        list.push({
          id: ch.id,
          partId: ch.part_id,
          ordinal: ch.ordinal,
          title: ch.title,
          sectionRangeHint: ch.section_range_hint ?? undefined,
        })
        chaptersByPart.set(ch.part_id, list)
      }

      const partsByBook = new Map<string, PartCatalog[]>()
      for (const p of partsQuery.results) {
        const list = partsByBook.get(p.book_id) ?? []
        list.push({
          id: p.id,
          bookId: p.book_id,
          ordinal: p.ordinal,
          title: p.title,
          chapters: chaptersByPart.get(p.id) ?? [],
        })
        partsByBook.set(p.book_id, list)
      }

      return booksQuery.results.map((b) => ({
        id: b.id,
        editionId: b.edition_id,
        volumeNo: b.volume_no,
        title: b.title,
        isbn13: b.isbn13,
        parts: partsByBook.get(b.id) ?? [],
      }))
    } catch (error) {
      console.warn('Failed to fetch books from D1, falling back to static:', error)
      return STATIC_BOOKS_CATALOG
    }
  }

  public async getBookById(id: string): Promise<BookCatalog | null> {
    const books = await this.getBooks()
    return books.find((b) => b.id === id) ?? null
  }

  public async getExamBlueprint(): Promise<ExamBlueprint> {
    if (!this.db) {
      return STATIC_EXAM_BLUEPRINT
    }

    try {
      const bpRow = await this.db.prepare('SELECT * FROM exam_blueprints LIMIT 1').first<{
        id: string
        exam_code: string
        effective_from: string
        verification_status: 'PROVISIONAL' | 'VERIFIED'
      }>()

      if (!bpRow) {
        return STATIC_EXAM_BLUEPRINT
      }

      const subjects = await this.db.prepare('SELECT * FROM exam_subjects WHERE blueprint_id = ? ORDER BY ordinal ASC')
        .bind(bpRow.id)
        .all<DbSubjectRow>()

      const topics = await this.db.prepare('SELECT * FROM exam_topics ORDER BY subject_id, ordinal ASC').all<DbTopicRow>()
      const mappings = await this.db.prepare('SELECT * FROM topic_chapters').all<DbTopicChapterRow>()

      const mappingsByTopic = new Map<string, string[]>()
      for (const m of mappings.results) {
        const list = mappingsByTopic.get(m.topic_id) ?? []
        list.push(m.chapter_id)
        mappingsByTopic.set(m.topic_id, list)
      }

      const topicsBySubject = new Map<string, DbTopicRow[]>()
      for (const t of topics.results) {
        const list = topicsBySubject.get(t.subject_id) ?? []
        list.push(t)
        topicsBySubject.set(t.subject_id, list)
      }

      return {
        id: bpRow.id,
        examCode: bpRow.exam_code,
        effectiveFrom: bpRow.effective_from,
        verificationStatus: bpRow.verification_status,
        subjects: subjects.results.map((s) => ({
          id: s.id,
          blueprintId: s.blueprint_id,
          ordinal: s.ordinal,
          title: s.title,
          questionCount: s.question_count,
          minimumCorrect: s.minimum_correct,
          topics: (topicsBySubject.get(s.id) ?? []).map((t) => ({
            id: t.id,
            subjectId: t.subject_id,
            ordinal: t.ordinal,
            title: t.title,
            questionCount: t.question_count,
            mappedChapterIds: mappingsByTopic.get(t.id) ?? [],
          })),
        })),
      }
    } catch (error) {
      console.warn('Failed to fetch exam blueprint from D1, falling back to static:', error)
      return STATIC_EXAM_BLUEPRINT
    }
  }

  private getFallbackOverview(): CatalogOverview {
    const totalParts = STATIC_BOOKS_CATALOG.reduce((acc, b) => acc + b.parts.length, 0)
    const totalChapters = STATIC_BOOKS_CATALOG.reduce(
      (acc, b) => acc + b.parts.reduce((pAcc, p) => pAcc + p.chapters.length, 0),
      0
    )
    const totalQuestions = STATIC_EXAM_BLUEPRINT.subjects.reduce((sum, s) => sum + s.questionCount, 0)
    const topicsCount = STATIC_EXAM_BLUEPRINT.subjects.reduce((sum, s) => sum + s.topics.length, 0)

    return {
      books: STATIC_BOOKS_CATALOG.map((b) => ({
        id: b.id,
        volumeNo: b.volumeNo,
        title: b.title,
        isbn13: b.isbn13,
        partCount: b.parts.length,
        chapterCount: b.parts.reduce((pAcc, p) => pAcc + p.chapters.length, 0),
      })),
      totalParts,
      totalChapters,
      blueprintSummary: {
        examCode: STATIC_EXAM_BLUEPRINT.examCode,
        totalQuestions,
        subjectsCount: STATIC_EXAM_BLUEPRINT.subjects.length,
        topicsCount,
      },
    }
  }
}
