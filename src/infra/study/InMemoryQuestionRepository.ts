// src/infra/study/InMemoryQuestionRepository.ts
import type { Question } from '../../domain/models/Question.ts'
import type { PracticeSession } from '../../domain/models/PracticeSession.ts'
import type { QuestionRepository } from '../../domain/ports/QuestionRepository.ts'
import { SEED_QUESTIONS } from './SeedStudyData.ts'

function hashStringFnv1a(str: string): number {
  let hash = 2166136261
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function shuffleQuestionsWithSeed(questions: Question[], seed: string): Question[] {
  const shuffled = [...questions]
  let state = hashStringFnv1a(seed) || 1
  const rand = () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    const temp = shuffled[i]
    shuffled[i] = shuffled[j]
    shuffled[j] = temp
  }
  return shuffled
}

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
    if (session?.isCompleted) {
      return null
    }
    const answeredIds = new Set((session?.attempts ?? []).map((a) => a.questionId))
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
}
