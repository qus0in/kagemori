import { PracticeSession } from '../../src/domain/models/PracticeSession.ts'
import type { PracticeSessionProps } from '../../src/domain/models/PracticeSessionTypes.ts'

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null)

function validAttempts(next: PracticeSessionProps): boolean {
  const attempts = next.attempts ?? []
  if (!Array.isArray(attempts) || next.currentQuestionIndex !== attempts.length ||
    attempts.length > next.targetQuestionCount || next.isCompleted !== (attempts.length === next.targetQuestionCount)) return false
  if (new Set(attempts.map((a) => a.questionId)).size !== attempts.length) return false
  if (next.questionIds && attempts.some((a, index) => a.questionId !== next.questionIds?.[index])) return false
  return !attempts.some((a) => !a.questionId || !a.attemptId || a.sessionId !== next.sessionId ||
    !a.finalAnswerOptionId || typeof a.isFinalCorrect !== 'boolean' || typeof a.hintUsed !== 'boolean' ||
    !Number.isFinite(a.durationMs) || !Number.isFinite(Date.parse(a.answeredAt)))
}

/** Plan-only updates may lock slots, change status, or swap unserved and unlocked generation slots. */
function validPlanChange(next: PracticeSessionProps, previous: PracticeSessionProps): boolean {
  const before = previous.generation
  const after = next.generation
  if (!before || !after) return same(before, after) && same(next.questionIds, previous.questionIds)
  if (after.from !== before.from || after.until !== before.until || after.deadline !== before.deadline ||
    after.lockedIndex < before.lockedIndex) return false
  const answered = next.attempts?.length ?? 0
  const oldIds = previous.questionIds ?? []
  const newIds = next.questionIds ?? []
  if (newIds.length !== oldIds.length) return false
  return newIds.every((id, i) => id === oldIds[i] ||
    (i >= after.from && i < after.until && i >= answered && i > after.lockedIndex))
}

export function validateSessionUpdate(next: PracticeSessionProps, previous?: PracticeSessionProps): boolean {
  try {
    new PracticeSession(next)
    if (!Number.isInteger(next.targetQuestionCount) || next.targetQuestionCount < 1 || next.targetQuestionCount > 100 ||
      !['DIAGNOSTIC', 'IMPROVEMENT', 'MOCK_EXAM'].includes(next.purpose)) return false
    if (!validAttempts(next)) return false
    const attempts = next.attempts ?? []
    if (!previous) return attempts.length === 0
    if (previous.isCompleted) return false
    for (const key of ['sessionId', 'learnerId', 'purpose', 'blueprintId', 'targetQuestionCount'] as const) {
      if (next[key] !== previous[key]) return false
    }
    const previousAttempts = previous.attempts ?? []
    if (!previousAttempts.every((attempt, index) => same(attempt, attempts[index]))) return false
    if (attempts.length === previousAttempts.length) return validPlanChange(next, previous)
    // Answer submissions never change the plan.
    return attempts.length === previousAttempts.length + 1 &&
      same(next.questionIds, previous.questionIds) && same(next.generation, previous.generation)
  } catch { return false }
}
