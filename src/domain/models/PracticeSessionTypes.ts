// src/domain/models/PracticeSessionTypes.ts
import type { Attempt } from './Attempt.ts'

export type SessionPurpose = 'DIAGNOSTIC' | 'IMPROVEMENT' | 'MOCK_EXAM'

export interface PracticeSessionProps {
  readonly sessionId: string
  readonly learnerId: string
  readonly purpose: SessionPurpose
  readonly blueprintId: string
  readonly currentQuestionIndex?: number
  readonly targetQuestionCount: number
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
