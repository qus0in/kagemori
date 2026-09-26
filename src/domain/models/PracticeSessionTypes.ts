// src/domain/models/PracticeSessionTypes.ts
import type { Attempt } from './Attempt.ts'

export type SessionPurpose = 'DIAGNOSTIC' | 'IMPROVEMENT' | 'MOCK_EXAM'

export const DEFAULT_SESSION_QUESTION_COUNTS: Readonly<Record<SessionPurpose, number>> = {
  DIAGNOSTIC: 6,
  IMPROVEMENT: 6,
  MOCK_EXAM: 10,
}

export interface PracticeSessionProps {
  readonly sessionId: string
  readonly learnerId: string
  readonly purpose: SessionPurpose
  readonly blueprintId: string
  readonly currentQuestionIndex?: number
  readonly targetQuestionCount: number
  /** Question order fixed at creation; absent for legacy sessions. */
  readonly questionIds?: readonly string[]
  readonly attempts?: readonly Attempt[]
  readonly isCompleted?: boolean
}

export interface RecordAttemptInput {
  readonly topicId?: string
  readonly questionVersion?: number
  readonly attemptId?: string
  readonly questionId: string
  readonly optionId: string
  readonly isCorrect: boolean
  readonly hintUsed: boolean
  readonly durationMs: number
  readonly firstAnswerOptionId?: string
  readonly isFirstCorrect?: boolean
  readonly answeredAt?: string
}

export interface SessionSummary {
  readonly sessionId: string
  readonly learnerId: string
  readonly purpose: SessionPurpose
  readonly totalAttempts: number
  readonly targetQuestionCount: number
  readonly correctCount: number
  readonly firstTryCorrectCount: number
  readonly accuracyPercentage: number
  readonly isCompleted: boolean
}
