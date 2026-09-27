// src/app/usecases/SubmitAnswerUseCase.ts
import type {
  PracticeSessionRepository,
  QuestionRepository,
  ConceptRepository,
  AiExplanationPort,
  SourceRepository,
} from '../../domain/ports/StudyPorts.ts'
import type { SubmitAnswerRequestDto, SubmitAnswerResponseDto } from '../dto/StudyDto.ts'
import { validateAndLoadQuestion } from './SubmitAnswerValidation.ts'
import { SessionConflictError } from '../../domain/models/StorageErrors.ts'
import {
  resolveAnswerExplanation,
  resolveSourceInfo,
  formatSubmitResult,
} from './SubmitAnswerExplanationHelper.ts'

export class SubmitAnswerUseCase {
  private readonly sRepo: PracticeSessionRepository
  private readonly qRepo: QuestionRepository
  private readonly cRepo: ConceptRepository
  private readonly ai?: AiExplanationPort
  private readonly src?: SourceRepository

  constructor(
    sRepo: PracticeSessionRepository,
    qRepo: QuestionRepository,
    cRepo: ConceptRepository,
    ai?: AiExplanationPort,
    src?: SourceRepository,
  ) {
    this.sRepo = sRepo
    this.qRepo = qRepo
    this.cRepo = cRepo
    this.ai = ai
    this.src = src
  }

  public async execute(req: SubmitAnswerRequestDto): Promise<SubmitAnswerResponseDto> {
    let { session, question } = await validateAndLoadQuestion(
      this.sRepo,
      this.qRepo,
      req.sessionId,
      req.questionId,
      req.optionId,
    )

    const previous = session.attempts.find((attempt) => attempt.questionId === question.id)
    let isCorrect = previous?.isFinalCorrect ?? question.evaluateAnswer(req.optionId)
    if (previous && (previous.finalAnswerOptionId !== req.optionId || previous.hintUsed !== req.hintUsed)) {
      throw new SessionConflictError()
    }
    // Background plan updates (slot locks, AI question swaps) can race a submission; retry on top of them.
    for (let tries = 0; !previous; tries++) {
      const next = await this.qRepo.findNextForSession(session)
      if (next?.id !== question.id) throw new SessionConflictError()
      session.recordAttempt({
        questionId: question.id,
        topicId: question.topicId,
        questionVersion: question.version,
        optionId: req.optionId,
        isCorrect,
        hintUsed: req.hintUsed,
        durationMs: req.durationMs,
      })
      try { await this.sRepo.save(session); break } catch (error) {
        if (!(error instanceof SessionConflictError)) throw error
        const latest = await this.sRepo.findById(session.sessionId)
        const recorded = latest?.attempts.find((attempt) => attempt.questionId === question.id)
        if (!latest || (!recorded && tries >= 2)) throw error
        session = latest
        if (!recorded) continue
        if (recorded.finalAnswerOptionId !== req.optionId || recorded.hintUsed !== req.hintUsed) throw error
        isCorrect = recorded.isFinalCorrect
        break
      }
    }

    const c = question.conceptId ? await this.cRepo.findById(question.conceptId) : null
    const src = await resolveSourceInfo(this.src, c?.sourceId || question.sourceId)
    const exp = previous ? question.explanation : await resolveAnswerExplanation(this.ai, c, question, req.optionId, isCorrect)

    return {
      ...formatSubmitResult(isCorrect, question, exp, c, src, session.isCompleted),
      conceptId: question.conceptId,
      sessionProgress: {
        currentQuestionIndex: session.currentQuestionIndex, totalQuestions: session.targetQuestionCount,
        isCompleted: session.isCompleted, correctCount: session.correctCount,
      },
    }
  }
}
