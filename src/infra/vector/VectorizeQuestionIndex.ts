// src/infra/vector/VectorizeQuestionIndex.ts
import type { D1Database } from '@cloudflare/workers-types'
import type { QuestionVector, QuestionVectorIndex, VectorMatch } from '../../domain/ports/SemanticPorts.ts'
import { withStorageDeadline } from '../storage/withStorageDeadline.ts'

/** Minimal slice of the Cloudflare Vectorize binding. */
export interface VectorizeLike {
  upsert(vectors: { id: string; values: number[]; metadata?: Record<string, string> }[]): Promise<unknown>
  query(vector: number[], options: { topK: number; returnMetadata?: 'all' | 'indexed' | 'none' }): Promise<{
    matches: { id: string; score: number; metadata?: Record<string, unknown> }[]
  }>
  getByIds(ids: string[]): Promise<{ id: string; values: ArrayLike<number>; metadata?: Record<string, unknown> }[]>
}

const CHUNK = 90

/** Vectors live in Vectorize; D1 `question_vectors` records which questions are indexed. */
export class VectorizeQuestionIndex implements QuestionVectorIndex {
  private readonly index: VectorizeLike
  private readonly db: D1Database
  private readonly model: string

  constructor(index: VectorizeLike, db: D1Database, model: string) {
    this.index = index
    this.db = db
    this.model = model
  }

  async missing(ids: readonly string[]): Promise<string[]> {
    const known = new Set<string>()
    for (let offset = 0; offset < ids.length; offset += CHUNK) {
      const chunk = ids.slice(offset, offset + CHUNK)
      const result = await withStorageDeadline(this.db.prepare(
        `SELECT question_id FROM question_vectors WHERE model = ? AND question_id IN (${chunk.map(() => '?').join(', ')})`,
      ).bind(this.model, ...chunk).all<{ question_id: string }>(), 'D1')
      for (const row of result.results) known.add(row.question_id)
    }
    return ids.filter((id) => !known.has(id))
  }

  async upsert(items: readonly QuestionVector[]): Promise<void> {
    if (!items.length) return
    await withStorageDeadline(this.index.upsert(items.map((item) => ({
      id: item.id, values: [...item.values], metadata: { topicId: item.topicId },
    }))), 'Vectorize')
    const indexedAt = new Date().toISOString()
    await withStorageDeadline(this.db.batch(items.map((item) => this.db.prepare(`INSERT INTO question_vectors
      (question_id, topic_id, model, indexed_at) VALUES (?, ?, ?, ?)
      ON CONFLICT(question_id) DO UPDATE SET model = excluded.model, indexed_at = excluded.indexed_at`)
      .bind(item.id, item.topicId, this.model, indexedAt))), 'D1')
  }

  async query(values: readonly number[], topK: number): Promise<VectorMatch[]> {
    const result = await withStorageDeadline(this.index.query([...values], { topK, returnMetadata: 'all' }), 'Vectorize')
    return result.matches.map((match) => ({ id: match.id, score: match.score, topicId: String(match.metadata?.topicId ?? '') }))
  }

  async vectors(ids: readonly string[]): Promise<QuestionVector[]> {
    if (!ids.length) return []
    const found = await withStorageDeadline(this.index.getByIds([...ids]), 'Vectorize')
    return found.map((item) => ({ id: item.id, topicId: String(item.metadata?.topicId ?? ''), values: Array.from(item.values) }))
  }
}
