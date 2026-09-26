// src/domain/models/PracticeSessionMetrics.ts
import type { Attempt } from './Attempt.ts'
import type { SessionPurpose, SessionSummary } from './PracticeSessionTypes.ts'

export function countCorrect(attempts: readonly Attempt[]): number {
  return attempts.filter((a) => a.isFinalCorrect).length
}

export function countFirstTry(attempts: readonly Attempt[]): number {
  return attempts.filter((a) => a.isFirstCorrect && !a.hintUsed).length
}

export function calculateAccuracy(correct: number, total: number): number {
  return total === 0 ? 0 : Math.round((correct / total) * 100)
}

export function computeAccuracy(attempts: readonly Attempt[]): number {
  return calculateAccuracy(countCorrect(attempts), attempts.length)
}

export function buildSessionSummary(p: {
  sessionId: string
  learnerId: string
  purpose: SessionPurpose
  targetQuestionCount: number
  attempts: readonly Attempt[]
  isCompleted: boolean
}): SessionSummary {
  const c = countCorrect(p.attempts)
  return {
    sessionId: p.sessionId,
    learnerId: p.learnerId,
    purpose: p.purpose,
    totalAttempts: p.attempts.length,
    targetQuestionCount: p.targetQuestionCount,
    correctCount: c,
    firstTryCorrectCount: countFirstTry(p.attempts),
    accuracyPercentage: calculateAccuracy(c, p.attempts.length),
    isCompleted: p.isCompleted,
  }
}
