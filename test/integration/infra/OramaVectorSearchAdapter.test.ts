// test/integration/infra/OramaVectorSearchAdapter.test.ts
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { OramaVectorSearchAdapter } from '../../../src/infra/vector/OramaVectorSearchAdapter.ts'
import {
  SEED_CONCEPT_CHUNKS,
  createDeterministicEmbedding,
} from '../../../src/infra/study/SeedStudyData.ts'
import type { ConceptChunk } from '../../../src/domain/ports/VectorSearchPort.ts'

describe('[Integration / Infra] Feature: OramaVectorSearchAdapter', () => {
  describe('Scenario: Pre-populating with initial concept chunks', () => {
    it('Given SEED_CONCEPT_CHUNKS, When instantiated, Then loads chunks and reports accurate count', async () => {
      // Given
      const adapter = new OramaVectorSearchAdapter(SEED_CONCEPT_CHUNKS)

      // When
      const total = await adapter.count()

      // Then
      assert.equal(total, SEED_CONCEPT_CHUNKS.length)
      assert.ok(total >= 6)
    })
  })

  describe('Scenario: Inserting chunks and querying by cosine similarity', () => {
    it('Given new concept chunks, When inserted and queried, Then returns nearest vector with highest score', async () => {
      // Given
      const adapter = new OramaVectorSearchAdapter()
      const vec1 = createDeterministicEmbedding(10)
      const vec2 = createDeterministicEmbedding(20)

      const chunk1: ConceptChunk = {
        id: 'chunk-cma-10',
        conceptId: 'concept-10',
        topicId: 'topic-3-2',
        text: '자본시장법 제3조 금융투자상품 및 원본손실위험 정의',
        embedding: vec1,
      }
      const chunk2: ConceptChunk = {
        id: 'chunk-cma-20',
        conceptId: 'concept-20',
        topicId: 'topic-3-5',
        text: '주식 포트폴리오 베타 및 벤치마크 분석',
        embedding: vec2,
      }

      await adapter.insertChunk(chunk1)
      await adapter.insertChunk(chunk2)

      // When: search with query equal to vec1
      const results = await adapter.searchSimilar(vec1, 2)

      // Then
      assert.equal(results.length, 2)
      assert.equal(results[0].chunkId, 'chunk-cma-10')
      assert.equal(results[0].chunk?.id, 'chunk-cma-10')
      // Exact match cosine similarity is ~1.0
      assert.ok(results[0].score >= 0.99)
      assert.ok(results[0].score > results[1].score)
    })
  })

  describe('Scenario: Topic filtering in vector search', () => {
    it('Given chunks from multiple topics, When filter topicId is applied, Then restricts search results to that topic', async () => {
      // Given
      const adapter = new OramaVectorSearchAdapter()
      const vecBase = createDeterministicEmbedding(100)

      await adapter.insertChunk({
        id: 'chunk-t1',
        conceptId: 'c-1',
        topicId: 'topic-3-2',
        text: '자본시장법 집합투자재산 운용제한 10% 룰',
        embedding: vecBase,
      })
      await adapter.insertChunk({
        id: 'chunk-t2',
        conceptId: 'c-2',
        topicId: 'topic-3-6',
        text: '채권 듀레이션 및 볼록성 계산',
        embedding: vecBase,
      })

      // When: search with topicId filter 'topic-3-2'
      const results = await adapter.searchSimilar(vecBase, 5, { topicId: 'topic-3-2' })

      // Then
      assert.equal(results.length, 1)
      assert.equal(results[0].chunkId, 'chunk-t1')
      assert.equal(results[0].chunk?.id, 'chunk-t1')
      assert.equal(results[0].chunk?.topicId, 'topic-3-2')
    })
  })

  describe('Scenario: Edge cases in vector search', () => {
    it('Given empty adapter, When queried, Then returns empty array gracefully', async () => {
      // Given
      const adapter = new OramaVectorSearchAdapter()
      const queryVec = createDeterministicEmbedding(999)

      // When
      const results = await adapter.searchSimilar(queryVec, 5)

      // Then
      assert.deepEqual(results, [])
    })

    it('Given non-matching topicId filter, When queried, Then returns empty array', async () => {
      // Given
      const adapter = new OramaVectorSearchAdapter(SEED_CONCEPT_CHUNKS)
      const queryVec = createDeterministicEmbedding(1)

      // When
      const results = await adapter.searchSimilar(queryVec, 5, { topicId: 'non-existent-topic' })

      // Then
      assert.deepEqual(results, [])
    })

    it('Given topK <= 0, When queried, Then returns empty array', async () => {
      // Given
      const adapter = new OramaVectorSearchAdapter(SEED_CONCEPT_CHUNKS)
      const queryVec = createDeterministicEmbedding(1)

      // When
      const results = await adapter.searchSimilar(queryVec, 0)

      // Then
      assert.deepEqual(results, [])
    })
  })
})
