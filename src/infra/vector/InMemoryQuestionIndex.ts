// src/infra/vector/InMemoryQuestionIndex.ts
import type { QuestionVector, QuestionVectorIndex, VectorMatch } from '../../domain/ports/SemanticPorts.ts'
import { cosineSimilarity } from '../../domain/models/VectorMath.ts'

/** Brute-force cosine index for local development and tests. */
export class InMemoryQuestionIndex implements QuestionVectorIndex {
  private readonly items = new Map<string, QuestionVector>()

  async missing(ids: readonly string[]): Promise<string[]> {
    return ids.filter((id) => !this.items.has(id))
  }

  async upsert(items: readonly QuestionVector[]): Promise<void> {
    for (const item of items) this.items.set(item.id, item)
  }

  async query(values: readonly number[], topK: number): Promise<VectorMatch[]> {
    return [...this.items.values()]
      .map((item) => ({ id: item.id, topicId: item.topicId, score: cosineSimilarity(values, item.values) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
  }

  async vectors(ids: readonly string[]): Promise<QuestionVector[]> {
    return ids.flatMap((id) => this.items.get(id) ?? [])
  }
}
