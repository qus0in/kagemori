// src/app/usecases/GetNextQuestionUseCase.ts

import type { PracticeSessionRepository } from '../../domain/ports/PracticeSessionRepository.ts'
import type { QuestionRepository } from '../../domain/ports/QuestionRepository.ts'
import type { PublicQuestionDto } from '../dto/StudyDto.ts'
import type { PracticeSession } from '../../domain/models/PracticeSession.ts'
import type { Question } from '../../domain/models/Question.ts'
import { isGeneratedQuestionId } from '../../domain/models/GeneratedQuestion.ts'
import { resolveNextSlot } from '../../domain/models/SessionGeneration.ts'
import { updateSessionWithRetry } from './SessionPlanUpdates.ts'

export type NextQuestionResult =
  | { readonly kind: 'question'; readonly question: PublicQuestionDto; readonly session: PracticeSession }
  | { readonly kind: 'preparing'; readonly remainingMs: number }
  | { readonly kind: 'completed' }

export const PREPARING_RETRY_MS = 2000

// Never expose correctOptionId or internal explanations before submission
function toPublic(question: Question): PublicQuestionDto {
  return {
    id: question.id,
    topicId: question.topicId,
    type: question.type,
    difficulty: question.difficulty,
    prompt: question.prompt,
    options: question.options.map((opt) => ({ id: opt.id, text: opt.text })),
    ...(isGeneratedQuestionId(question.id) ? { isAiGenerated: true } : {}),
  }
}

export class GetNextQuestionUseCase {
  private readonly sessionRepository: PracticeSessionRepository
  private readonly questionRepository: QuestionRepository
  private readonly now: () => number

  constructor(sessionRepository: PracticeSessionRepository, questionRepository: QuestionRepository, now: () => number = Date.now) {
    this.sessionRepository = sessionRepository
    this.questionRepository = questionRepository
    this.now = now
  }

  public async execute(sessionId: string): Promise<PublicQuestionDto | null> {
    const session = await this.sessionRepository.findById(sessionId)
    if (!session) {
      throw new Error(`Practice session not found: ${sessionId}`)
    }
    const result = await this.executeForSession(session)
    return result.kind === 'question' ? result.question : null
  }

  /** Waits for background generation until its deadline unless the learner asks for an existing question. */
  public async executeForSession(session: PracticeSession, useExisting = false): Promise<NextQuestionResult> {
    if (session.isCompleted) return { kind: 'completed' }
    if (!session.questionIds) {
      const legacy = await this.questionRepository.findNextForSession(session)
      return legacy ? { kind: 'question', question: toPublic(legacy), session } : { kind: 'completed' }
    }
    const slot = resolveNextSlot(session.questionIds, session.attempts.length, session.generation, this.now(), useExisting)
    if (slot.kind === 'completed') return slot
    if (slot.kind === 'preparing') return slot
    let current = session
    if (slot.kind === 'fallback') {
      const locked = await updateSessionWithRetry(this.sessionRepository, session.sessionId, (latest) => {
        latest.lockGenerationSlot(slot.index)
        return true
      })
      if (!locked) return { kind: 'completed' }
      current = locked
    }
    const nextId = current.questionIds?.[current.attempts.length]
    const question = nextId ? await this.questionRepository.findById(nextId) : null
    return question ? { kind: 'question', question: toPublic(question), session: current } : { kind: 'completed' }
  }
}
