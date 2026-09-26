// src/infra/study/InMemorySourceRepository.ts
import type { SourceRepository, SourceDocument } from '../../domain/ports/SourceRepository.ts'
import { SEED_SOURCES } from './SeedStudyData.ts'

export class InMemorySourceRepository implements SourceRepository {
  private sources: Map<string, SourceDocument> = new Map()

  constructor(initialSources: SourceDocument[] = SEED_SOURCES) {
    for (const s of initialSources) {
      this.sources.set(s.id, s)
    }
  }

  async findById(id: string): Promise<SourceDocument | null> {
    return this.sources.get(id) || null
  }
}
