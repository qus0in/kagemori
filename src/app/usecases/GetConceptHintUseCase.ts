// src/app/usecases/GetConceptHintUseCase.ts
import type {
  QuestionRepository,
  ConceptRepository,
  AiExplanationPort,
  PracticeSessionRepository,
  SourceRepository,
} from '../../domain/ports/StudyPorts.ts'
import type { GetConceptHintRequestDto, ConceptHintResponseDto } from '../dto/StudyDto.ts'

export class GetConceptHintUseCase {
  private readonly qRepo: QuestionRepository
  private readonly cRepo: ConceptRepository
  private readonly ai: AiExplanationPort
  private readonly sRepo?: PracticeSessionRepository
  private readonly srcRepo?: SourceRepository

  constructor(
    qRepo: QuestionRepository,
    cRepo: ConceptRepository,
    ai: AiExplanationPort,
    sRepo?: PracticeSessionRepository,
    srcRepo?: SourceRepository,
  ) {
    this.qRepo = qRepo
    this.cRepo = cRepo
    this.ai = ai
    this.sRepo = sRepo
    this.srcRepo = srcRepo
  }

  public async execute(req: GetConceptHintRequestDto): Promise<ConceptHintResponseDto> {
    if (req.sessionId && this.sRepo) {
      const s = await this.sRepo.findById(req.sessionId)
      if (s && !s.allowsHint()) throw new Error(`Hints are not permitted for ${s.purpose} sessions.`)
    }

    const q = await this.qRepo.findById(req.questionId)
    if (!q) throw new Error(`Question not found: ${req.questionId}`)
    if (!q.conceptId) throw new Error(`Question has no concept: ${req.questionId}`)

    const c = await this.cRepo.findById(q.conceptId)
    if (!c) throw new Error(`Concept not found: ${q.conceptId}`)

    const hintText = await this.ai.generateHint(c.body, q.prompt)
    const srcId = c.sourceId || q.sourceId
    const src = this.srcRepo && srcId ? await this.srcRepo.findById(srcId) : null

    return {
      hintText,
      conceptTitle: c.title,
      sourceTitle: src?.title ?? '',
    }
  }
}
