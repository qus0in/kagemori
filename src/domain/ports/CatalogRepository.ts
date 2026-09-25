// src/domain/ports/CatalogRepository.ts
import type { BookCatalog, ExamBlueprint } from '../models/Catalog.ts'

export interface CatalogOverview {
  readonly books: {
    readonly id: string
    readonly volumeNo: number
    readonly title: string
    readonly isbn13: string
    readonly partCount: number
    readonly chapterCount: number
  }[]
  readonly totalParts: number
  readonly totalChapters: number
  readonly blueprintSummary: {
    readonly examCode: string
    readonly totalQuestions: number
    readonly subjectsCount: number
    readonly topicsCount: number
  }
}

export interface CatalogRepository {
  getOverview(): Promise<CatalogOverview>
  getBooks(): Promise<BookCatalog[]>
  getBookById(id: string): Promise<BookCatalog | null>
  getExamBlueprint(): Promise<ExamBlueprint>
}
