// src/infra/study/seed/SeedChunks.ts
import type { Concept } from '../../../domain/models/Concept.ts'
import type { ConceptChunk } from '../../../domain/ports/VectorSearchPort.ts'
import { createDeterministicEmbedding } from './SeedEmbedding.ts'

export function buildConceptChunks(concepts: readonly Concept[]): ConceptChunk[] {
  return concepts.map((concept, idx) => ({
    id: `chunk-${concept.conceptId}`,
    conceptId: concept.conceptId,
    topicId: concept.topicId,
    text: `${concept.title}\n${concept.body}`,
    embedding: createDeterministicEmbedding(idx + 1),
  }))
}
