// src/infra/study/SeedStudyData.ts
import { Concept } from '../../domain/models/Concept.ts'
import { Question } from '../../domain/models/Question.ts'
import type { ConceptChunk } from '../../domain/ports/VectorSearchPort.ts'
import { createDeterministicEmbedding } from './seed/SeedEmbedding.ts'
import { SEED_SOURCES } from './seed/SeedSources.ts'
import { SEED_CONCEPTS_PART1 } from './seed/SeedConceptsPart1.ts'
import { SEED_CONCEPTS_PART2 } from './seed/SeedConceptsPart2.ts'
import { SEED_QUESTIONS_PART1 } from './seed/SeedQuestionsPart1.ts'
import { SEED_QUESTIONS_PART2 } from './seed/SeedQuestionsPart2.ts'
import { SEED_QUESTIONS_PART3 } from './seed/SeedQuestionsPart3.ts'
import { buildConceptChunks } from './seed/SeedChunks.ts'

export { createDeterministicEmbedding, SEED_SOURCES }
export const SEED_CONCEPTS: Concept[] = [...SEED_CONCEPTS_PART1, ...SEED_CONCEPTS_PART2]
export const SEED_QUESTIONS: Question[] = [
  ...SEED_QUESTIONS_PART1,
  ...SEED_QUESTIONS_PART2,
  ...SEED_QUESTIONS_PART3,
]
export const SEED_CONCEPT_CHUNKS: ConceptChunk[] = buildConceptChunks(SEED_CONCEPTS)
