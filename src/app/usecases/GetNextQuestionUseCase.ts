// src/app/usecases/GetNextQuestionUseCase.ts

import type { PracticeSessionRepository } from '../../domain/ports/PracticeSessionRepository.ts'
import type { QuestionRepository } from '../../domain/ports/QuestionRepository.ts'
import type { PublicQuestionDto } from '../dto/StudyDto.ts'
import type { PracticeSession } from '../../domain/models/PracticeSession.ts'

export class GetNextQuestionUseCase {
  private readonly sessionRepository: PracticeSessionRepository
  private readonly questionRepository: QuestionRepository

  constructor(
    sessionRepository: PracticeSessionRepository,
    questionRepository: QuestionRepository
  ) {
    this.sessionRepository = sessionRepository
    this.questionRepository = questionRepository
  }

  public async execute(sessionId: string): Promise<PublicQuestionDto | null> {
    const session = await this.sessionRepository.findById(sessionId)
    if (!session) {
      throw new Error(`Practice session not found: ${sessionId}`)
    }

    return this.executeForSession(session)
  }

  public async executeForSession(session: PracticeSession): Promise<PublicQuestionDto | null> {
    if (session.isCompleted) {
      return null
    }

    const question = await this.questionRepository.findNextForSession(session)
    if (!question) {
      return null
    }

    // Never expose correctOptionId or internal explanations before submission
    return {
      id: question.id,
      topicId: question.topicId,
      type: question.type,
      difficulty: question.difficulty,
      prompt: question.prompt,
      options: question.options.map((opt) => ({
        id: opt.id,
        text: opt.text,
      })),
    }
  }
}
