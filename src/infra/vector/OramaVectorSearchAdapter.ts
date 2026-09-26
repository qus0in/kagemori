// src/infra/vector/OramaVectorSearchAdapter.ts
import { insert, search, count, type AnyOrama } from '@orama/orama'
import type {
  ConceptChunk,
  VectorSearchFilter,
  VectorSearchPort,
  VectorSearchResult,
} from '../../domain/ports/VectorSearchPort.ts'
import {
  createOramaDb,
  buildOramaSearchOptions,
  mapOramaHit,
} from './OramaSearchQueryBuilder.ts'

export class OramaVectorSearchAdapter implements VectorSearchPort {
  private dbPromise: Promise<AnyOrama> | null = null
  private chunksMap: Map<string, ConceptChunk> = new Map()
  private dimension: number

  constructor(initialChunks: ConceptChunk[] = [], dimension: number = 768) {
    this.dimension = dimension
    for (const chunk of initialChunks) {
      this.chunksMap.set(chunk.id, chunk)
    }
  }

  private async getDb(): Promise<AnyOrama> {
    if (!this.dbPromise) {
      this.dbPromise = createOramaDb(this.dimension, this.chunksMap.values())
    }
    return this.dbPromise
  }

  async insertChunk(chunk: ConceptChunk): Promise<void> {
    this.chunksMap.set(chunk.id, chunk)
    const db = await this.getDb()
    try {
      await insert(db, {
        id: chunk.id,
        conceptId: chunk.conceptId,
        topicId: chunk.topicId || '',
        text: chunk.text || '',
        embedding: chunk.embedding,
      })
    } catch {
      // document already exists in DB
    }
  }

  async searchSimilar(
    embedding: number[],
    topK: number = 5,
    filter?: VectorSearchFilter
  ): Promise<VectorSearchResult[]> {
    const db = await this.getDb()
    const options = buildOramaSearchOptions(embedding, topK, filter)
    const result = await search(db, options)
    return result.hits.map((hit) => mapOramaHit(hit, this.chunksMap, embedding))
  }

  async count(): Promise<number> {
    const db = await this.getDb()
    return count(db)
  }
}
