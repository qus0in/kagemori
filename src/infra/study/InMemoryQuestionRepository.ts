// src/infra/study/InMemoryQuestionRepository.ts
import type { Question } from '../../domain/models/Question.ts'
import type { PracticeSession } from '../../domain/models/PracticeSession.ts'
import type { QuestionRepository } from '../../domain/ports/QuestionRepository.ts'
import { SEED_QUESTIONS } from './SeedStudyData.ts'

export class InMemoryQuestionRepository implements QuestionRepository {
  private questions: Map<string, Question> = new Map()

  constructor(initialQuestions: Question[] = SEED_QUESTIONS) {
    for (const q of initialQuestions) {
      this.questions.set(q.id, q)
    }
  }

  async findById(id: string): Promise<Question | null> {
    return this.questions.get(id) || null
  }

  async findNextForSession(session: PracticeSession): Promise<Question | null> {
    const answeredIds = new Set(session.attempts.map((a) => a.questionId))
    for (const q of this.questions.values()) {
      if (!answeredIds.has(q.id)) {
        return q
      }
    }
    return null
  }

  async getAll(): Promise<Question[]> {
    return Array.from(this.questions.values())
  }
}
