// src/domain/models/CatalogTypes.ts

export interface ChapterCatalog {
  readonly id: string
  readonly partId: string
  readonly ordinal: number
  readonly title: string
  readonly sectionRangeHint?: string
}

export interface PartCatalog {
  readonly id: string
  readonly bookId: string
  readonly ordinal: number
  readonly title: string
  readonly chapters: ChapterCatalog[]
}

export interface BookCatalog {
  readonly id: string
  readonly editionId: string
  readonly volumeNo: number
  readonly title: string
  readonly isbn13: string
  readonly parts: PartCatalog[]
}

export interface ExamTopic {
  readonly id: string
  readonly subjectId: string
  readonly ordinal: number
  readonly title: string
  readonly questionCount: number
  readonly mappedChapterIds?: string[]
}

export interface ExamSubject {
  readonly id: string
  readonly blueprintId: string
  readonly ordinal: number
  readonly title: string
  readonly questionCount: number
  readonly minimumCorrect: number
  readonly topics: ExamTopic[]
}

export interface ExamBlueprint {
  readonly id: string
  readonly examCode: string
  readonly effectiveFrom: string
  readonly verificationStatus: 'PROVISIONAL' | 'VERIFIED'
  readonly subjects: ExamSubject[]
}
