import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { GetCatalogOverviewUseCase } from '../../../src/app/usecases/GetCatalogOverviewUseCase.ts'
import type { CatalogRepository, CatalogOverview } from '../../../src/domain/ports/CatalogRepository.ts'
import type { BookCatalog, ExamBlueprint } from '../../../src/domain/models/Catalog.ts'

describe('[Slice / App] Feature: GetCatalogOverviewUseCase', () => {
  describe('Scenario: Orchestrating catalog overview retrieval', () => {
    it('Given a mock catalog repository, When use case executes, Then returns formatted DTO', async () => {
      // Given
      const mockOverview: CatalogOverview = {
        books: [
          {
            id: 'book-1',
            volumeNo: 1,
            title: '제1권 금융상품 및 세제',
            isbn13: '9788960507845',
            partCount: 12,
            chapterCount: 33,
          },
          {
            id: 'book-2',
            volumeNo: 2,
            title: '제2권 투자운용 및 전략 Ⅱ 및 투자분석기법',
            isbn13: '9788960507852',
            partCount: 6,
            chapterCount: 29,
          },
        ],
        totalParts: 18,
        totalChapters: 62,
        blueprintSummary: {
          examCode: 'INVESTMENT_MANAGER',
          totalQuestions: 100,
          subjectsCount: 3,
          topicsCount: 17,
        },
      }

      const mockRepo: CatalogRepository = {
        getOverview: async () => mockOverview,
        getBooks: async (): Promise<BookCatalog[]> => [],
        getBookById: async (): Promise<BookCatalog | null> => null,
        getExamBlueprint: async (): Promise<ExamBlueprint> => ({} as ExamBlueprint),
      }

      const useCase = new GetCatalogOverviewUseCase(mockRepo)

      // When
      const result = await useCase.execute()

      // Then
      assert.equal(result.totalBooks, 2)
      assert.equal(result.totalParts, 18)
      assert.equal(result.totalChapters, 62)
      assert.equal(result.blueprint.totalQuestions, 100)
      assert.equal(result.books[0].title, '제1권 금융상품 및 세제')
      assert.equal(result.books[1].chapterCount, 29)
    })
  })
})
