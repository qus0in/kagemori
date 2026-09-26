// worker/routes/studySubmitFormatter.ts
import type { SubmitAnswerResponseDto } from '../../src/app/dto/StudyDto.ts'
import type { PracticeSession } from '../../src/domain/models/PracticeSession.ts'

export function buildSubmitPayload(
  sub: SubmitAnswerResponseDto,
  session: PracticeSession,
  conceptId?: string,
): SubmitAnswerResponseDto {
  const correctCount = session.attempts.filter((a) => a.isFinalCorrect).length
  return {
    ...sub,
    aiExplanation: sub.explanation,
    conceptId,
    sessionProgress: {
      currentQuestionIndex: session.currentQuestionIndex,
      totalQuestions: session.targetQuestionCount,
      isCompleted: session.isCompleted,
      correctCount,
    },
  }
}
