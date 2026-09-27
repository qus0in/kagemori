// src/domain/ports/SemanticPorts.ts
import type { DiagramContent, StructuredDiagram } from '../models/DiagramContent.ts'

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

export interface DiagramInput {
  readonly topicTitle: string
  readonly conceptBody: string
  readonly questionPrompt: string
  readonly correctOptionText: string
  readonly explanation: string
}

export interface DiagramImage {
  readonly mimeType: string
  /** Base64 image bytes as returned by the model. */
  readonly data: string
}

export interface DiagramDecision {
  readonly mode: 'structured' | 'image'
  readonly reason: string
}

/** Cheap model deciding whether Mermaid/table or an image explains the concept better. */
export interface DiagramRouterPort {
  readonly model: string
  decide(input: DiagramInput): Promise<DiagramDecision>
}

export interface StructuredDiagramPort {
  readonly model: string
  draw(input: DiagramInput): Promise<StructuredDiagram>
}

export interface ImageDiagramPort {
  readonly model: string
  generate(input: DiagramInput): Promise<DiagramImage>
}

export interface DiagramCache {
  get(key: string): Promise<DiagramContent | null>
  put(key: string, content: DiagramContent): Promise<void>
}

export interface StoredImage {
  readonly mimeType: string
  readonly body: ReadableStream | ArrayBuffer
}

/** Object storage for generated images (R2 in production). */
export interface DiagramImageStore {
  has(key: string): Promise<boolean>
  put(key: string, image: DiagramImage): Promise<void>
  get(key: string): Promise<StoredImage | null>
}
