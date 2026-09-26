import { PracticeSession } from '../../src/domain/models/PracticeSession.ts'
import type { PracticeSessionProps } from '../../src/domain/models/PracticeSessionTypes.ts'

export function validateSessionUpdate(next: PracticeSessionProps, previous?: PracticeSessionProps): boolean {
  try {
    new PracticeSession(next)
    if (!Number.isInteger(next.targetQuestionCount) || next.targetQuestionCount < 1 || next.targetQuestionCount > 100 ||
      !['DIAGNOSTIC', 'IMPROVEMENT', 'MOCK_EXAM'].includes(next.purpose)) return false
    const attempts = next.attempts ?? []
    if (!Array.isArray(attempts) || next.currentQuestionIndex !== attempts.length ||
      attempts.length > next.targetQuestionCount || next.isCompleted !== (attempts.length === next.targetQuestionCount)) return false
    if (new Set(attempts.map((a) => a.questionId)).size !== attempts.length) return false
    if (attempts.some((a) => !a.questionId || !a.attemptId || a.sessionId !== next.sessionId ||
      !a.finalAnswerOptionId || typeof a.isFinalCorrect !== 'boolean' || typeof a.hintUsed !== 'boolean' ||
      !Number.isFinite(a.durationMs) || !Number.isFinite(Date.parse(a.answeredAt)))) return false
    if (!previous) return attempts.length === 0
    if (previous.isCompleted || attempts.length !== (previous.attempts?.length ?? 0) + 1) return false
    for (const key of ['sessionId', 'learnerId', 'purpose', 'blueprintId', 'targetQuestionCount'] as const) {
      if (next[key] !== previous[key]) return false
    }
    if (JSON.stringify(next.questionIds ?? null) !== JSON.stringify(previous.questionIds ?? null)) return false
    if (next.questionIds && attempts.some((a, index) => a.questionId !== next.questionIds?.[index])) return false
    return (previous.attempts ?? []).every((attempt, index) => JSON.stringify(attempt) === JSON.stringify(attempts[index]))
  } catch { return false }
}
