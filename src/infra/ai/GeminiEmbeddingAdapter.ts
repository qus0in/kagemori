// src/infra/ai/GeminiEmbeddingAdapter.ts
import type { EmbeddingPort } from '../../domain/ports/SemanticPorts.ts'
import type { GeminiModelOptions } from './GeminiQuestionAuthor.ts'
import { geminiUrl } from './ModelJson.ts'

export const EMBEDDING_DIMENSIONS = 768

/** gemini-embedding-2 at 768 dims (auto-normalised); symmetric task prefix for similarity. */
export class GeminiEmbeddingAdapter implements EmbeddingPort {
  readonly model: string
  private readonly apiKey: string
  private readonly fetch: typeof fetch

  constructor(options: GeminiModelOptions) {
    this.apiKey = options.apiKey
    this.model = options.model ?? 'gemini-embedding-2'
    this.fetch = options.fetchFn ?? globalThis.fetch
  }

  async embed(texts: readonly string[]): Promise<number[][]> {
    if (!texts.length) return []
    const response = await this.fetch(geminiUrl(this.model, this.apiKey, 'batchEmbedContents'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: texts.map((text) => ({
          model: `models/${this.model}`,
          content: { parts: [{ text: `task: sentence similarity | query: ${text}` }] },
          output_dimensionality: EMBEDDING_DIMENSIONS,
        })),
      }),
      signal: AbortSignal.timeout(20_000),
    })
    if (!response.ok) throw new Error(`Embedding request failed: ${response.status}`)
    const data = await response.json() as { embeddings?: { values?: number[] }[] }
    const vectors = (data.embeddings ?? []).map((item) => item.values ?? [])
    if (vectors.length !== texts.length || vectors.some((v) => v.length !== EMBEDDING_DIMENSIONS)) {
      throw new Error('Embedding response shape mismatch')
    }
    return vectors
  }
}
