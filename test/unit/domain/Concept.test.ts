// test/unit/domain/Concept.test.ts
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Concept, ConceptChunk } from '../../../src/domain/models/Concept.ts'

describe('[Unit / Domain] Feature: Concept Entity and Validation', () => {
  describe('Scenario: Valid Concept instantiation', () => {
    it('Given valid concept properties, When Concept is instantiated, Then properties are set correctly', () => {
      // Given & When
      const concept = new Concept({
        conceptId: 'concept-cm-1',
        topicId: 'topic-cm-act',
        chapterId: 'chap-general-provisions',
        title: '금융투자상품의 개념 및 분류',
        body: '자본시장법 제3조에 따른 금융투자상품이란 이익을 얻거나 손실을 회피할 목적으로 취득하는 권리이다.',
        status: 'PUBLISHED',
        version: 1,
        sourceId: 'src-cma-law',
        locator: '자본시장법 제3조',
      })

      // Then
      assert.equal(concept.conceptId, 'concept-cm-1')
      assert.equal(concept.topicId, 'topic-cm-act')
      assert.equal(concept.chapterId, 'chap-general-provisions')
      assert.equal(concept.title, '금융투자상품의 개념 및 분류')
      assert.equal(concept.status, 'PUBLISHED')
      assert.equal(concept.version, 1)
      assert.equal(concept.sourceId, 'src-cma-law')
      assert.equal(concept.locator, '자본시장법 제3조')
    })
  })

  describe('Scenario: Concept validation errors', () => {
    it('Given empty conceptId, When instantiated, Then throws error', () => {
      assert.throws(
        () =>
          new Concept({
            conceptId: '  ',
            topicId: 't-1',
            chapterId: 'c-1',
            title: 'Title',
            body: 'Body',
            status: 'DRAFT',
            version: 1,
            sourceId: 'src-1',
            locator: 'p.1',
          }),
        /Concept id cannot be empty/
      )
    })

    it('Given empty title, When instantiated, Then throws error', () => {
      assert.throws(
        () =>
          new Concept({
            conceptId: 'c-1',
            topicId: 't-1',
            chapterId: 'c-1',
            title: '',
            body: 'Body',
            status: 'DRAFT',
            version: 1,
            sourceId: 'src-1',
            locator: 'p.1',
          }),
        /Concept title cannot be empty/
      )
    })

    it('Given empty body, When instantiated, Then throws error', () => {
      assert.throws(
        () =>
          new Concept({
            conceptId: 'c-1',
            topicId: 't-1',
            chapterId: 'c-1',
            title: 'Title',
            body: '   ',
            status: 'DRAFT',
            version: 1,
            sourceId: 'src-1',
            locator: 'p.1',
          }),
        /Concept body cannot be empty/
      )
    })
  })

  describe('Scenario: ConceptChunk validation and immutability', () => {
    it('Given valid chunk properties, When ConceptChunk is created, Then properties match and embedding is frozen', () => {
      // Given
      const rawEmbedding = [0.1, 0.2, 0.3]
      const chunk = new ConceptChunk({
        chunkId: 'chunk-1',
        conceptId: 'concept-cm-1',
        body: '청크 본문',
        embedding: rawEmbedding,
        hash: 'hash-abc-123',
      })

      // Then
      assert.equal(chunk.chunkId, 'chunk-1')
      assert.equal(chunk.conceptId, 'concept-cm-1')
      assert.equal(chunk.body, '청크 본문')
      assert.deepEqual(chunk.embedding, [0.1, 0.2, 0.3])
      assert.equal(chunk.hash, 'hash-abc-123')
      assert.ok(Object.isFrozen(chunk.embedding))
    })

    it('Given empty chunkId, When ConceptChunk is instantiated, Then throws error', () => {
      assert.throws(
        () =>
          new ConceptChunk({
            chunkId: '',
            conceptId: 'c-1',
            body: 'body',
            embedding: [0.1],
            hash: 'h-1',
          }),
        /Chunk id cannot be empty/
      )
    })

    it('Given empty conceptId, When ConceptChunk is instantiated, Then throws error', () => {
      assert.throws(
        () =>
          new ConceptChunk({
            chunkId: 'chk-1',
            conceptId: '',
            body: 'body',
            embedding: [0.1],
            hash: 'h-1',
          }),
        /Concept id cannot be empty for chunk/
      )
    })

    it('Given empty embedding array, When ConceptChunk is instantiated, Then throws error', () => {
      assert.throws(
        () =>
          new ConceptChunk({
            chunkId: 'chk-1',
            conceptId: 'c-1',
            body: 'body',
            embedding: [],
            hash: 'h-1',
          }),
        /Embedding array cannot be empty/
      )
    })
  })
})
