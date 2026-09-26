// src/infra/study/InMemoryGeneratedQuestionStore.ts
import type { GeneratedQuestionRecord } from '../../domain/models/GeneratedQuestion.ts'
import type { GeneratedQuestionStore } from '../../domain/ports/QuestionBankPorts.ts'

/** Local/test store; production uses D1QuestionBank. */
export class InMemoryGeneratedQuestionStore implements GeneratedQuestionStore {
  private readonly records = new Map<string, GeneratedQuestionRecord>()

  async list(): Promise<GeneratedQuestionRecord[]> {
    return [...this.records.values()]
  }

  async findById(questionId: string): Promise<GeneratedQuestionRecord | null> {
    return this.records.get(questionId) ?? null
  }

  async save(records: readonly GeneratedQuestionRecord[]): Promise<void> {
    for (const record of records) {
      if (!this.records.has(record.question.id)) this.records.set(record.question.id, record)
    }
  }
}
