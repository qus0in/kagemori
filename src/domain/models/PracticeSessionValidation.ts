// src/domain/models/PracticeSessionValidation.ts
import type { PracticeSessionProps } from './PracticeSessionTypes.ts'

export function validatePracticeSessionProps(p: PracticeSessionProps): void {
  if (!p.sessionId?.trim()) throw new Error('Session id cannot be empty.')
  if (!p.learnerId?.trim()) throw new Error('Learner id cannot be empty.')
  if (p.targetQuestionCount <= 0) {
    throw new Error('targetQuestionCount must be greater than zero.')
  }
}
