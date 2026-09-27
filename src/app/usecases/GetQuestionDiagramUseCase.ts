// src/app/usecases/GetQuestionDiagramUseCase.ts
import type { Question } from '../../domain/models/Question.ts'
import type { Concept } from '../../domain/models/Concept.ts'
import type { ConceptRepository, PracticeSessionRepository, QuestionRepository } from '../../domain/ports/StudyPorts.ts'
import type { DiagramCache, DiagramImage, DiagramPort } from '../../domain/ports/SemanticPorts.ts'
import { loadAnsweredQuestion } from './AnsweredQuestionLoader.ts'

export interface DiagramResult extends DiagramImage {
  readonly model: string
  readonly cached: boolean
}

export function buildDiagramPrompt(question: Question, concept: Concept | null): string {
  const correct = question.options.find((o) => o.id === question.correctOptionId)?.text ?? ''
  return `투자자산운용사 수험생이 한눈에 복습할 개념 도식 한 장을 그려 주세요.
주제: ${concept?.title ?? question.topicId}
핵심 근거: ${(concept?.body ?? question.explanation).slice(0, 1200)}
정답 포인트: ${correct}

[형식]
- 흰 배경의 간결한 플랫 인포그래픽. 그래프·비교표·흐름도 중 개념에 가장 알맞은 한 가지만 사용.
- 한국어 레이블은 짧게(10자 이내), 수식·기호·축 이름은 정확하게, 불필요한 문장·장식·인물·로고 금지.
- 문제 원문이나 선지 번호를 그대로 옮기지 않기.`
}

/** Post-answer concept diagram, cached per question version so each image is generated once. */
export class GetQuestionDiagramUseCase {
  private readonly sessions: PracticeSessionRepository
  private readonly questions: QuestionRepository
  private readonly concepts: ConceptRepository
  private readonly diagram: DiagramPort
  private readonly cache?: DiagramCache

  constructor(
    sessions: PracticeSessionRepository, questions: QuestionRepository, concepts: ConceptRepository,
    diagram: DiagramPort, cache?: DiagramCache,
  ) {
    this.sessions = sessions
    this.questions = questions
    this.concepts = concepts
    this.diagram = diagram
    this.cache = cache
  }

  async execute(sessionId: string, questionId: string): Promise<DiagramResult> {
    const { question, concept } = await loadAnsweredQuestion(this.sessions, this.questions, this.concepts, sessionId, questionId)
    const key = `diagram:${question.id}:v${question.version}`
    const cached = await this.cache?.get(key)
    if (cached) return { ...cached, model: this.diagram.model, cached: true }
    const image = await this.diagram.generate(buildDiagramPrompt(question, concept))
    await this.cache?.put(key, image)
    return { ...image, model: this.diagram.model, cached: false }
  }
}
