// src/domain/ports/SourceRepository.ts

export interface SourceDocument {
  readonly id: string
  readonly title: string
  readonly url: string
  readonly publisher?: string
}

export interface SourceRepository {
  findById(sourceId: string): Promise<SourceDocument | null>
}
