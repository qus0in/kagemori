// src/infra/study/InMemoryConceptRepository.ts
import type { Concept } from '../../domain/models/Concept.ts'
import type { ConceptRepository } from '../../domain/ports/ConceptRepository.ts'
import type { GeneratedQuestionStore } from '../../domain/ports/QuestionBankPorts.ts'
import { generatedConcept, isGeneratedConceptId, questionIdOfConcept } from '../../domain/models/GeneratedQuestion.ts'
import { SEED_CONCEPTS } from './SeedStudyData.ts'

export class InMemoryConceptRepository implements ConceptRepository {
  private concepts: Map<string, Concept> = new Map()
  private readonly generated?: GeneratedQuestionStore

  constructor(initialConcepts: Concept[] = SEED_CONCEPTS, generated?: GeneratedQuestionStore) {
    for (const c of initialConcepts) {
      this.concepts.set(c.conceptId, c)
    }
    this.generated = generated
  }

  async findById(id: string): Promise<Concept | null> {
    const seeded = this.concepts.get(id)
    if (seeded || !this.generated || !isGeneratedConceptId(id)) return seeded ?? null
    const record = await this.generated.findById(questionIdOfConcept(id))
    return record ? generatedConcept(record) : null
  }

  async findByTopicId(topicId: string): Promise<Concept[]> {
    return Array.from(this.concepts.values()).filter((c) => c.topicId === topicId)
  }

  async getAll(): Promise<Concept[]> {
    return Array.from(this.concepts.values())
  }
}
