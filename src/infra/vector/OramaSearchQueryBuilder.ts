// src/infra/vector/OramaSearchQueryBuilder.ts
import { create, insert, search, type AnyOrama } from '@orama/orama'
import type {
  ConceptChunk,
  VectorSearchFilter,
  VectorSearchResult,
} from '../../domain/ports/VectorSearchPort.ts'

export async function createOramaDb(
  dimension: number,
  chunks: Iterable<ConceptChunk>
): Promise<AnyOrama> {
  const db = await create({
    schema: {
      id: 'string',
      conceptId: 'string',
      topicId: 'string',
      text: 'string',
      embedding: `vector[${dimension}]`,
    },
  })
  for (const chunk of chunks) {
    await insert(db, {
      id: chunk.id,
      conceptId: chunk.conceptId,
      topicId: chunk.topicId || '',
      text: chunk.text || '',
      embedding: chunk.embedding,
    })
  }
  return db
}

export function buildOramaSearchOptions(
  embedding: number[],
  topK: number,
  filter?: VectorSearchFilter
): Parameters<typeof search>[1] {
  const options: Parameters<typeof search>[1] = {
    mode: 'vector',
    vector: { value: embedding, property: 'embedding' },
    similarity: 0,
    limit: topK,
  }
  if (filter?.topicId) {
    options.where = { topicId: filter.topicId }
  }
  return options
}

export function mapOramaHit(
  hit: { id: string; score: number; document?: unknown },
  chunksMap: Map<string, ConceptChunk>,
  fallbackEmbedding: number[]
): VectorSearchResult {
  const doc = hit.document as Record<string, unknown> | undefined
  const docId = (doc?.id as string) || hit.id
  const stored = chunksMap.get(docId)
  const conceptId = stored?.conceptId || (doc?.conceptId as string) || ''

  return {
    chunkId: docId,
    conceptId,
    score: hit.score,
    chunk: stored || {
      id: docId,
      conceptId,
      topicId: (doc?.topicId as string) || undefined,
      text: (doc?.text as string) || undefined,
      embedding: fallbackEmbedding,
    },
  }
}
