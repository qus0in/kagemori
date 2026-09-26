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
    const { session, question } = await validateAndLoadQuestion(
      this.sRepo,
      this.qRepo,
      req.sessionId,
      req.questionId,
      req.optionId,
    )

    const isCorrect = question.evaluateAnswer(req.optionId)
    session.recordAttempt({
      questionId: question.id,
      optionId: req.optionId,
      isCorrect,
      hintUsed: req.hintUsed,
      durationMs: req.durationMs,
    })
    await this.sRepo.save(session)

    const c = question.conceptId ? await this.cRepo.findById(question.conceptId) : null
    const src = await resolveSourceInfo(this.src, c?.sourceId || question.sourceId)
    const exp = await resolveAnswerExplanation(this.ai, c, question, req.optionId, isCorrect)

    return formatSubmitResult(isCorrect, question, exp, c, src, session.isCompleted)
  }
}
