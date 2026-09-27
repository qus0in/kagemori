// src/domain/ports/SemanticPorts.ts

export interface EmbeddingPort {
  readonly model: string
  /** Unit-length vectors, one per input text, in order. */
  embed(texts: readonly string[]): Promise<number[][]>
}

export interface QuestionVector {
  readonly id: string
  readonly topicId: string
  readonly values: readonly number[]
}

export interface VectorMatch {
  readonly id: string
  readonly topicId: string
  readonly score: number
}

export interface QuestionVectorIndex {
  /** Ids from the input that have not been indexed yet. */
  missing(ids: readonly string[]): Promise<string[]>
  upsert(items: readonly QuestionVector[]): Promise<void>
  query(values: readonly number[], topK: number): Promise<VectorMatch[]>
  vectors(ids: readonly string[]): Promise<QuestionVector[]>
}

export interface DiagramImage {
  readonly mimeType: string
  /** Base64 image bytes. */
  readonly data: string
}

export interface DiagramPort {
  readonly model: string
  generate(prompt: string): Promise<DiagramImage>
}

export interface DiagramCache {
  get(key: string): Promise<DiagramImage | null>
  put(key: string, image: DiagramImage): Promise<void>
}
