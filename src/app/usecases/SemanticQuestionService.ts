// src/app/usecases/SemanticQuestionService.ts
import type { Question } from '../../domain/models/Question.ts'
import { cosineSimilarity, questionEmbeddingText } from '../../domain/models/VectorMath.ts'
import type { EmbeddingPort, QuestionVector, QuestionVectorIndex } from '../../domain/ports/SemanticPorts.ts'

export const DUPLICATE_THRESHOLD = 0.9
// gemini-embedding-2 scores unrelated finance sentences around 0.75 and paraphrases above 0.9.
export const RELATED_THRESHOLD = 0.82
const BATCH = 50

export interface EmbeddableText {
  readonly topicId: string
  readonly text: string
}

type Warn = (message: string, detail: Record<string, unknown>) => void

export const correctText = (q: Question) =>
  questionEmbeddingText(q.prompt, q.options.find((o) => o.id === q.correctOptionId)?.text ?? '')

/** gemini-embedding-2 + vector index. Every method degrades to a neutral result on failure. */
export class SemanticQuestionService {
  private readonly embedder: EmbeddingPort
  private readonly index: QuestionVectorIndex
  private readonly warn: Warn

  constructor(embedder: EmbeddingPort, index: QuestionVectorIndex, warn: Warn = (m, d) => console.warn(m, d)) {
    this.embedder = embedder
    this.index = index
    this.warn = warn
  }

  private async embedAll(texts: readonly string[]): Promise<number[][]> {
    const vectors: number[][] = []
    for (let offset = 0; offset < texts.length; offset += BATCH) {
      vectors.push(...await this.embedder.embed(texts.slice(offset, offset + BATCH)))
    }
    return vectors
  }

  /** Embeds only questions the index has not seen (seed questions on first use). */
  async ensureIndexed(pool: readonly Question[]): Promise<void> {
    try {
      const missing = new Set(await this.index.missing(pool.map((q) => q.id)))
      const todo = pool.filter((q) => missing.has(q.id))
      if (!todo.length) return
      const vectors = await this.embedAll(todo.map(correctText))
      await this.index.upsert(todo.map((q, i) => ({ id: q.id, topicId: q.topicId, values: vectors[i] })))
    } catch (error) { this.warn('Question vector backfill skipped', { error: String(error) }) }
  }

  /** Flags items similar to an indexed question or to an earlier item in the same batch. */
  async findDuplicates(items: readonly EmbeddableText[]): Promise<{ duplicate: boolean[]; vectors: number[][] | null }> {
    try {
      const vectors = await this.embedAll(items.map((item) => item.text))
      const duplicate = await Promise.all(vectors.map(async (values, i) => {
        const earlier = vectors.slice(0, i).some((other) => cosineSimilarity(values, other) >= DUPLICATE_THRESHOLD)
        return earlier || (await this.index.query(values, 3)).some((match) => match.score >= DUPLICATE_THRESHOLD)
      }))
      return { duplicate, vectors }
    } catch (error) {
      this.warn('Semantic duplicate check skipped', { error: String(error) })
      return { duplicate: items.map(() => false), vectors: null }
    }
  }

  async add(items: readonly QuestionVector[]): Promise<void> {
    try { if (items.length) await this.index.upsert(items) }
    catch (error) { this.warn('Question vector upsert skipped', { error: String(error) }) }
  }

  /** Best similarity of each candidate to any review question, above RELATED_THRESHOLD. */
  async relatedTo(reviewIds: readonly string[], candidateIds: ReadonlySet<string>): Promise<Map<string, number>> {
    const boost = new Map<string, number>()
    try {
      for (const source of await this.index.vectors(reviewIds)) {
        for (const match of await this.index.query(source.values, 20)) {
          if (!candidateIds.has(match.id) || match.score < RELATED_THRESHOLD) continue
          boost.set(match.id, Math.max(boost.get(match.id) ?? 0, match.score))
        }
      }
    } catch (error) { this.warn('Related question ranking skipped', { error: String(error) }) }
    return boost
  }
}
