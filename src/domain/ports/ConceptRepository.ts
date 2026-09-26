// src/domain/ports/ConceptRepository.ts

import type { Concept } from '../models/Concept.ts'

export interface ConceptRepository {
  findById(id: string): Promise<Concept | null>
  findByTopicId(topicId: string): Promise<Concept[]>
}
