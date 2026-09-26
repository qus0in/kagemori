import { PracticeSession } from './PracticeSession.ts'
import type { PracticeSessionProps } from './PracticeSessionTypes.ts'

export function sessionSnapshot(session: PracticeSession): PracticeSessionProps {
  return {
    sessionId: session.sessionId, learnerId: session.learnerId, purpose: session.purpose,
    blueprintId: session.blueprintId, targetQuestionCount: session.targetQuestionCount,
    currentQuestionIndex: session.currentQuestionIndex, isCompleted: session.isCompleted,
    attempts: [...session.attempts],
    ...(session.questionIds ? { questionIds: [...session.questionIds] } : {}),
  }
}
export function cloneSession(session: PracticeSession): PracticeSession {
  return new PracticeSession(structuredClone(sessionSnapshot(session)))
}
