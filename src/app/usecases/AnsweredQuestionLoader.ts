// src/app/usecases/AnsweredQuestionLoader.ts
import type { Attempt } from '../../domain/models/Attempt.ts'
import type { Concept } from '../../domain/models/Concept.ts'
import type { Question } from '../../domain/models/Question.ts'
import type { ConceptRepository, PracticeSessionRepository, QuestionRepository } from '../../domain/ports/StudyPorts.ts'

export class SessionNotFoundError extends Error {}
export class QuestionNotAnsweredError extends Error {}

export interface AnsweredQuestion {
  readonly attempt: Attempt
  readonly question: Question
  readonly concept: Concept | null
}

/** Post-answer features must never reveal answers before the learner has submitted. */
export async function loadAnsweredQuestion(
  sessions: PracticeSessionRepository,
  questions: QuestionRepository,
  concepts: ConceptRepository,
  sessionId: string,
  questionId: string,
): Promise<AnsweredQuestion> {
  const session = await sessions.findById(sessionId)
  if (!session) throw new SessionNotFoundError(`Practice session not found: ${sessionId}`)
  const attempt = session.attempts.find((item) => item.questionId === questionId)
  if (!attempt) throw new QuestionNotAnsweredError('Submit an answer before requesting this.')
  const question = await questions.findById(questionId)
  if (!question) throw new QuestionNotAnsweredError(`Question not found: ${questionId}`)
  const concept = question.conceptId ? await concepts.findById(question.conceptId) : null
  return { attempt, question, concept }
}
