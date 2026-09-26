// src/infra/study/InMemoryConceptRepository.ts
import type { Concept } from '../../domain/models/Concept.ts'
import type { ConceptRepository } from '../../domain/ports/ConceptRepository.ts'
import { SEED_CONCEPTS } from './SeedStudyData.ts'

export class InMemoryConceptRepository implements ConceptRepository {
  private concepts: Map<string, Concept> = new Map()

  constructor(initialConcepts: Concept[] = SEED_CONCEPTS) {
    for (const c of initialConcepts) {
      this.concepts.set(c.conceptId, c)
    }
  }

  async findById(id: string): Promise<Concept | null> {
    return this.concepts.get(id) || null
  }

  async findByTopicId(topicId: string): Promise<Concept[]> {
    return Array.from(this.concepts.values()).filter((c) => c.topicId === topicId)
  }

  async getAll(): Promise<Concept[]> {
    return Array.from(this.concepts.values())
  }
}
