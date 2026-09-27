// src/app/usecases/GetQuestionDiagramUseCase.ts
import type { Question } from '../../domain/models/Question.ts'
import type { Concept } from '../../domain/models/Concept.ts'
import { diagramImageKey, validateStructuredDiagram, type DiagramContent } from '../../domain/models/DiagramContent.ts'
import type { ConceptRepository, PracticeSessionRepository, QuestionRepository } from '../../domain/ports/StudyPorts.ts'
import type {
  DiagramCache, DiagramDecision, DiagramImageStore, DiagramInput, DiagramRouterPort, ImageDiagramPort, StoredImage, StructuredDiagramPort,
} from '../../domain/ports/SemanticPorts.ts'
import { loadAnsweredQuestion } from './AnsweredQuestionLoader.ts'

export type DiagramMode = 'auto' | 'image'
export class DiagramUnavailableError extends Error {}

export interface DiagramDeps {
  readonly sessions: PracticeSessionRepository
  readonly questions: QuestionRepository
  readonly concepts: ConceptRepository
  /** Tried in order (gemini-3.5-flash-lite, then gemma-4-26b-a4b-it). */
  readonly routers: readonly DiagramRouterPort[]
  readonly structured?: StructuredDiagramPort
  readonly image?: ImageDiagramPort
  readonly imageStore?: DiagramImageStore
  readonly cache?: DiagramCache
  readonly warn?: (message: string, detail: Record<string, unknown>) => void
}

export interface DiagramOutcome {
  readonly content: DiagramContent
  readonly cached: boolean
  readonly reason?: string
}

function toInput(question: Question, concept: Concept | null): DiagramInput {
  return {
    topicTitle: concept?.title ?? question.topicId,
    conceptBody: (concept?.body ?? question.explanation).slice(0, 1500),
    questionPrompt: question.prompt,
    correctOptionText: question.options.find((o) => o.id === question.correctOptionId)?.text ?? '',
    explanation: question.explanation.slice(0, 1500),
  }
}

/** Post-answer diagram: structured (Mermaid/table) first, image only when judged better or requested. */
export class GetQuestionDiagramUseCase {
  private readonly deps: DiagramDeps
  constructor(deps: DiagramDeps) { this.deps = deps }

  private warn(message: string, error: unknown): void {
    (this.deps.warn ?? ((m, d) => console.warn(m, d)))(message, { error: String(error) })
  }

  private load(sessionId: string, questionId: string) {
    return loadAnsweredQuestion(this.deps.sessions, this.deps.questions, this.deps.concepts, sessionId, questionId)
  }

  private get canDrawImage(): boolean { return !!this.deps.image && !!this.deps.imageStore }

  private async decide(input: DiagramInput): Promise<DiagramDecision> {
    for (const router of this.deps.routers) {
      try { return await router.decide(input) } catch (error) { this.warn(`Diagram router ${router.model} failed`, error) }
    }
    return { mode: 'structured', reason: '판정 모델 응답이 없어 구조 도식을 사용' }
  }

  private async drawStructured(input: DiagramInput): Promise<DiagramContent | null> {
    if (!this.deps.structured) return null
    try {
      const valid = validateStructuredDiagram(await this.deps.structured.draw(input))
      if (!valid) this.warn('Structured diagram rejected by validation', this.deps.structured.model)
      return valid && { ...valid, model: this.deps.structured.model }
    } catch (error) {
      this.warn('Structured diagram failed', error)
      return null
    }
  }

  private async drawImage(question: Question, input: DiagramInput): Promise<DiagramOutcome> {
    const { image, imageStore } = this.deps
    if (!image || !imageStore) throw new DiagramUnavailableError('Image diagrams are not configured')
    const imageKey = diagramImageKey(image.model, question.id, question.version)
    const content: DiagramContent = { kind: 'image', model: image.model, imageKey }
    if (await imageStore.has(imageKey)) return { content, cached: true }
    await imageStore.put(imageKey, await image.generate(input))
    return { content, cached: false }
  }

  async execute(sessionId: string, questionId: string, mode: DiagramMode = 'auto'): Promise<DiagramOutcome> {
    const { question, concept } = await this.load(sessionId, questionId)
    const input = toInput(question, concept)
    if (mode === 'image') return this.drawImage(question, input)
    const autoKey = `diagram:auto:${this.deps.structured?.model ?? "none"}:${this.deps.image?.model ?? "none"}:${question.id}:v${question.version}`
    const cached = await this.deps.cache?.get(autoKey)
    if (cached) return { content: cached, cached: true }
    const decision = await this.decide(input)
    let outcome: DiagramOutcome | null = null
    if (decision.mode === 'image' && this.canDrawImage) outcome = await this.drawImage(question, input)
    const structured = outcome ? null : await this.drawStructured(input)
    if (structured) outcome = { content: structured, cached: false }
    if (!outcome && this.canDrawImage) outcome = await this.drawImage(question, input)
    if (!outcome) throw new DiagramUnavailableError('No diagram model produced a result')
    await this.deps.cache?.put(autoKey, outcome.content)
    return { ...outcome, reason: decision.reason }
  }

  /** Streams a stored image only after the learner has answered the question. */
  async openImage(sessionId: string, questionId: string): Promise<StoredImage | null> {
    const { question } = await this.load(sessionId, questionId)
    if (!this.deps.image || !this.deps.imageStore) return null
    return this.deps.imageStore.get(diagramImageKey(this.deps.image.model, question.id, question.version))
  }
}
