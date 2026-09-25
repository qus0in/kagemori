import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import ky from 'ky'
import { HttpCatalogRepository } from '../../../src/infra/api/HttpCatalogRepository.ts'
import { STATIC_BOOKS_CATALOG, STATIC_EXAM_BLUEPRINT } from '../../../src/infra/catalog/CatalogStaticData.ts'

describe('[Integration / Infra] Feature: HttpCatalogRepository using ky', () => {
  describe('Scenario: Fetching catalog data via ky and caching', () => {
    it('Given mocked ky responses, When getOverview and getBooks are called, Then returns and caches data', async () => {
      let networkFetchCount = 0

      const dummyOverview = {
        books: [],
        totalParts: 28,
        totalChapters: 125,
        blueprintSummary: {
          examCode: 'INVESTMENT_MANAGER',
          totalQuestions: 100,
          subjectsCount: 3,
          topicsCount: 17,
        },
      }

      const mockKy = {
        get: (_url: string) => {
          networkFetchCount++
          return {
            json: async () => dummyOverview,
          }
        },
      } as unknown as typeof ky

      const repo = new HttpCatalogRepository('/api/catalog', mockKy)

      // First call -> fetches from network
      const overview1 = await repo.getOverview()
      assert.equal(overview1.totalChapters, 125)
      assert.equal(networkFetchCount, 1)

      // Second call -> returns from LRU cache
      const overview2 = await repo.getOverview()
      assert.equal(overview2.totalChapters, 125)
      assert.equal(networkFetchCount, 1, 'Network call should not occur due to cache')
    })

    it('Given mocked ky for blueprint, When getExamBlueprint is called, Then parses correctly', async () => {
      const mockKy = {
        get: (_url: string) => ({
          json: async () => STATIC_EXAM_BLUEPRINT,
        }),
      } as unknown as typeof ky

      const repo = new HttpCatalogRepository('/api/catalog', mockKy)
      const bp = await repo.getExamBlueprint()
      assert.equal(bp.subjects.length, 3)
      assert.equal(bp.subjects[0].minimumCorrect, 8)
    })
  })
})
