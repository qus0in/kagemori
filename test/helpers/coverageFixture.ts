import type { ExamBlueprint } from '../../src/domain/models/CatalogTypes.ts'

export const coverageBlueprint: ExamBlueprint = {
  id: 'bp', examCode: 'test', effectiveFrom: '2026', verificationStatus: 'PROVISIONAL',
  subjects: [{
    id: 's1', blueprintId: 'bp', title: '과목', ordinal: 1, questionCount: 20, minimumCorrect: 8,
    topics: ['세제', '금융상품', '부동산'].map((title, index) => ({
      id: `t${index}`, subjectId: 's1', title, ordinal: index + 1, questionCount: 1,
    })),
  }],
}
