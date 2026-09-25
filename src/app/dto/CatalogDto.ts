// src/app/dto/CatalogDto.ts

export interface ChapterDto {
  id: string
  ordinal: number
  title: string
  sectionRangeHint?: string
}

export interface PartDto {
  id: string
  ordinal: number
  title: string
  chapters: ChapterDto[]
}

export interface BookSummaryDto {
  id: string
  volumeNo: number
  title: string
  isbn13: string
  partCount: number
  chapterCount: number
}

export interface BookDetailDto {
  id: string
  volumeNo: number
  title: string
  isbn13: string
  parts: PartDto[]
}

export interface ExamTopicDto {
  id: string
  ordinal: number
  title: string
  questionCount: number
  mappedChapterIds?: string[]
}

export interface ExamSubjectDto {
  id: string
  ordinal: number
  title: string
  questionCount: number
  minimumCorrect: number
  topics: ExamTopicDto[]
}

export interface ExamBlueprintDto {
  id: string
  examCode: string
  effectiveFrom: string
  verificationStatus: string
  totalQuestions: number
  subjects: ExamSubjectDto[]
}

export interface CatalogOverviewDto {
  books: BookSummaryDto[]
  totalBooks: number
  totalParts: number
  totalChapters: number
  blueprint: {
    examCode: string
    totalQuestions: number
    subjectsCount: number
    topicsCount: number
  }
}
