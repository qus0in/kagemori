// src/infra/study/InMemoryQuestionRepository.ts
import type { Question } from '../../domain/models/Question.ts'
import type { PracticeSession } from '../../domain/models/PracticeSession.ts'
import type { QuestionRepository } from '../../domain/ports/QuestionRepository.ts'
import type { GeneratedQuestionStore, QuestionBankPort } from '../../domain/ports/QuestionBankPorts.ts'
import { isGeneratedQuestionId, type GeneratedQuestionRecord } from '../../domain/models/GeneratedQuestion.ts'
import { seededShuffle } from '../../domain/models/QuestionPlanning.ts'
import { SEED_QUESTIONS } from './SeedStudyData.ts'
import { InMemoryGeneratedQuestionStore } from './InMemoryGeneratedQuestionStore.ts'

export function shuffleQuestionsWithSeed(questions: Question[], seed: string): Question[] {
  return seededShuffle(questions, seed)
}

/** Fixed seed questions plus reviewed AI questions from the generated store. */
export class InMemoryQuestionRepository implements QuestionRepository, QuestionBankPort {
  private questions: Map<string, Question> = new Map()
  private readonly generated: GeneratedQuestionStore

  constructor(initialQuestions: Question[] = SEED_QUESTIONS, generated: GeneratedQuestionStore = new InMemoryGeneratedQuestionStore()) {
    for (const q of initialQuestions) {
      this.questions.set(q.id, q)
    }
    this.generated = generated
  }

  async findById(id: string): Promise<Question | null> {
    const seeded = this.questions.get(id)
    if (seeded || !isGeneratedQuestionId(id)) return seeded ?? null
    return (await this.generated.findById(id))?.question ?? null
  }

  async findNextForSession(session: PracticeSession): Promise<Question | null> {
    if (session?.isCompleted) {
      return null
    }
    const answeredIds = new Set((session?.attempts ?? []).map((a) => a.questionId))
    if (session?.questionIds) {
      const nextId = session.questionIds.find((id) => !answeredIds.has(id))
      return nextId ? this.findById(nextId) : null
    }
    // Legacy sessions created before planned question lists.
    const all = Array.from(this.questions.values())
    const ordered = session?.sessionId ? shuffleQuestionsWithSeed(all, session.sessionId) : all

    for (const q of ordered) {
      if (!answeredIds.has(q.id)) {
        return q
      }
    }
    return null
  }

  async getAll(): Promise<Question[]> {
    return Array.from(this.questions.values())
  }

  async listQuestions(): Promise<Question[]> {
    const generated = await this.generated.list()
    return [...this.questions.values(), ...generated.map((record) => record.question)]
  }

  async saveGenerated(records: readonly GeneratedQuestionRecord[]): Promise<void> {
    await this.generated.save(records)
  }
}
