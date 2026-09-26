import type { CatalogOverview } from '../../domain/ports/CatalogRepository.ts'
import { STATIC_BOOKS_CATALOG, STATIC_EXAM_BLUEPRINT } from '../catalog/CatalogStaticData.ts'

export function getFallbackOverview(): CatalogOverview {
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
