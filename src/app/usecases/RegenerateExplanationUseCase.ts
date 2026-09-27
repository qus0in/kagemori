// src/app/usecases/RegenerateExplanationUseCase.ts
import type {
  AiExplanationPort, ConceptRepository, PracticeSessionRepository, QuestionRepository,
} from '../../domain/ports/StudyPorts.ts'
import { loadAnsweredQuestion } from './AnsweredQuestionLoader.ts'

export interface RegenerateExplanationRequest {
  readonly sessionId: string
  readonly questionId: string
  readonly previousExplanation?: string
}

/** Rewrites the explanation from a different angle; grading and progress stay untouched. */
export class RegenerateExplanationUseCase {
  private readonly sessions: PracticeSessionRepository
  private readonly questions: QuestionRepository
  private readonly concepts: ConceptRepository
  private readonly ai: AiExplanationPort

  constructor(sessions: PracticeSessionRepository, questions: QuestionRepository, concepts: ConceptRepository, ai: AiExplanationPort) {
    this.sessions = sessions
    this.questions = questions
    this.concepts = concepts
    this.ai = ai
  }

  async execute(req: RegenerateExplanationRequest): Promise<{ explanation: string }> {
    const { attempt, question, concept } = await loadAnsweredQuestion(this.sessions, this.questions, this.concepts, req.sessionId, req.questionId)
    const text = (id: string) => question.options.find((o) => o.id === id)?.text ?? ''
    const explanation = await this.ai.generateExplanation({
      conceptBody: concept?.body ?? question.explanation,
      questionPrompt: question.prompt,
      selectedOptionText: text(attempt.finalAnswerOptionId),
      correctOptionText: text(question.correctOptionId),
      isCorrect: attempt.isFinalCorrect,
      allOptions: question.options.map((o) => ({ id: o.id, text: o.text })),
      questionExplanation: question.explanation,
      reviewRequested: true,
      previousExplanation: req.previousExplanation?.trim() || question.explanation,
    })
    return { explanation }
  }
}
