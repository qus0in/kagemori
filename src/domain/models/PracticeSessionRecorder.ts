// src/domain/models/PracticeSessionRecorder.ts
import { Attempt } from './Attempt.ts'
import type { SessionState } from './PracticeSessionInit.ts'
import type { RecordAttemptInput } from './PracticeSessionTypes.ts'

export function executeRecordAttempt(
  state: SessionState,
  input: RecordAttemptInput,
  allowsHint: boolean,
): Attempt {
  if (state.isCompleted) {
    throw new Error(`Cannot record attempt. Session ${state.sessionId} is already completed.`)
  }
  if (input.hintUsed && !allowsHint) {
    throw new Error(`Hints are not allowed in ${state.purpose} session.`)
  }
  const first = input.firstAnswerOptionId ?? input.optionId
  const isFirstCorrect = input.isFirstCorrect ?? (input.hintUsed ? false : input.isCorrect)
  const attempt = new Attempt({
    attemptId: input.attemptId ?? `att-${state.sessionId}-${state.attempts.length + 1}`,
    sessionId: state.sessionId,
    questionId: input.questionId,
    topicId: input.topicId,
    questionVersion: input.questionVersion,
    firstAnswerOptionId: first,
    finalAnswerOptionId: input.optionId,
    isFirstCorrect,
    isFinalCorrect: input.isCorrect,
    hintUsed: input.hintUsed,
    durationMs: input.durationMs,
    answeredAt: input.answeredAt ?? new Date().toISOString(),
  })
  state.attempts.push(attempt)
  state.currentIndex += 1
  state.isCompleted = state.attempts.length >= state.targetCount
  return attempt
}
