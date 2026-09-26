// src/domain/models/Catalog.ts
import type {
  ChapterCatalog,
  PartCatalog,
  BookCatalog,
  ExamTopic,
  ExamSubject,
  ExamBlueprint,
} from './CatalogTypes.ts'

export type {
  ChapterCatalog,
  PartCatalog,
  BookCatalog,
  ExamTopic,
  ExamSubject,
  ExamBlueprint,
}

export type BookPart = PartCatalog
export type BookChapter = ChapterCatalog

export class CatalogRules {
  public static calculateTotalQuestions(subjects: readonly ExamSubject[]): number {
    return subjects.reduce((sum, s) => sum + s.questionCount, 0)
  }

  public static isSubjectPassed(subject: ExamSubject, correctCount: number): boolean {
    return correctCount >= subject.minimumCorrect
  }

  public static isExamPassed(
    subjectScores: { subjectId: string; correctCount: number }[],
    subjects: readonly ExamSubject[]
  ): boolean {
    let totalCorrect = 0
    for (const sub of subjects) {
      const score = subjectScores.find((s) => s.subjectId === sub.id)?.correctCount ?? 0
      if (!this.isSubjectPassed(sub, score)) {
        return false
      }
      totalCorrect += score
    }
    return totalCorrect >= 70
  }
}
