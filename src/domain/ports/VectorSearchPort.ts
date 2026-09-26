// src/domain/ports/VectorSearchPort.ts

export interface ConceptChunkItem {
  id: string
  conceptId: string
  topicId?: string
  text?: string
  embedding: number[]
}

export type ConceptChunk = ConceptChunkItem

export interface VectorSearchResult {
  readonly chunkId: string
  readonly conceptId: string
  readonly score: number
  readonly chunk?: ConceptChunkItem
}

export interface VectorSearchFilter {
  readonly topicId?: string
}

export interface VectorSearchPort {
  searchSimilar(
    embedding: number[],
    topK?: number,
    filter?: VectorSearchFilter
  ): Promise<VectorSearchResult[]>
  insertChunk(chunk: ConceptChunk): Promise<void>
  count?(): Promise<number>
}
