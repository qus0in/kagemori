// src/domain/models/PracticeSessionInit.ts
import type { Attempt } from './Attempt.ts'
import type { PracticeSessionProps } from './PracticeSessionTypes.ts'
import { validatePracticeSessionProps } from './PracticeSessionValidation.ts'

export interface SessionState {
  sessionId: string
  learnerId: string
  purpose: PracticeSessionProps['purpose']
  blueprintId: string
  currentIndex: number
  targetCount: number
  questionIds?: readonly string[]
  attempts: Attempt[]
  isCompleted: boolean
}

export function initSessionState(p: PracticeSessionProps): SessionState {
  validatePracticeSessionProps(p)
  const attempts = p.attempts ? [...p.attempts] : []
  return {
    sessionId: p.sessionId,
    learnerId: p.learnerId,
    purpose: p.purpose,
    blueprintId: p.blueprintId,
    currentIndex: p.currentQuestionIndex ?? 0,
    targetCount: p.targetQuestionCount,
    questionIds: p.questionIds ? [...p.questionIds] : undefined,
    attempts,
    isCompleted: p.isCompleted ?? (attempts.length >= p.targetQuestionCount),
  }
}
