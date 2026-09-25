// src/domain/models/Catalog.ts

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

export class CatalogRules {
  public static calculateTotalQuestions(subjects: readonly ExamSubject[]): number {
    return subjects.reduce((sum, s) => sum + s.questionCount, 0)
  }

  public static isSubjectPassed(subject: ExamSubject, correctCount: number): boolean {
    return correctCount >= subject.minimumCorrect
  }

  public static isExamPassed(subjectScores: { subjectId: string; correctCount: number }[], subjects: readonly ExamSubject[]): boolean {
    let totalCorrect = 0
    for (const sub of subjects) {
      const score = subjectScores.find((s) => s.subjectId === sub.id)?.correctCount ?? 0
      if (!this.isSubjectPassed(sub, score)) {
        return false // 과락
      }
      totalCorrect += score
    }
    // 총 70문항(70점) 이상
    return totalCorrect >= 70
  }
}
