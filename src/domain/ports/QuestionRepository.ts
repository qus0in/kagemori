// src/domain/ports/QuestionRepository.ts

import type { Question } from '../models/Question.ts'
import type { PracticeSession } from '../models/PracticeSession.ts'

export interface QuestionRepository {
  findById(id: string): Promise<Question | null>
  findNextForSession(session: PracticeSession): Promise<Question | null>
}
