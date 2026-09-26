// src/app/usecases/SubmitAnswerValidation.ts
import type { PracticeSession } from '../../domain/models/PracticeSession.ts'
import type { Question } from '../../domain/models/Question.ts'
import type { PracticeSessionRepository } from '../../domain/ports/PracticeSessionRepository.ts'
import type { QuestionRepository } from '../../domain/ports/QuestionRepository.ts'

export async function validateAndLoadQuestion(
  sessionRepo: PracticeSessionRepository,
  questionRepo: QuestionRepository,
  sessionId: string | undefined,
  questionId: string,
  optionId: string
): Promise<{ session: PracticeSession; question: Question }> {
  if (!sessionId) throw new Error('sessionId is required to submit an answer.')
  const session = await sessionRepo.findById(sessionId)
  if (!session) throw new Error(`Practice session not found: ${sessionId}`)

  const question = await questionRepo.findById(questionId)
  if (!question) throw new Error(`Question not found: ${questionId}`)

  if (!question.options.some((opt) => opt.id === optionId)) {
    throw new Error(`Invalid optionId "${optionId}" for question ${questionId}.`)
  }
  return { session, question }
}
