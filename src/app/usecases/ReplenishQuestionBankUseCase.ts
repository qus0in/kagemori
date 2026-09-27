// src/app/usecases/ReplenishQuestionBankUseCase.ts
import type { Question } from '../../domain/models/Question.ts'
import type { QuestionHistoryEntry } from '../../domain/models/QuestionPlanning.ts'
import { allocateTopics } from '../../domain/models/TopicAllocation.ts'
import { questionEmbeddingText } from '../../domain/models/VectorMath.ts'
import {
  buildGeneratedQuestion, normalizePrompt, GENERATED_QUESTION_PREFIX,
  type GeneratedQuestionRecord, type QuestionDraft,
} from '../../domain/models/GeneratedQuestion.ts'
import type {
  AuthoringRequest, BlindReviewPort, DraftScreenPort, QuestionAuthoringPort, QuestionBankPort, TopicContext, TopicContextPort,
} from '../../domain/ports/QuestionBankPorts.ts'
import type { SemanticQuestionService } from './SemanticQuestionService.ts'
import { runBlindReviews } from './BlindReviewPanel.ts'

const TYPES = ['CONCEPT', 'APPLICATION', 'CALCULATION', 'REGULATION']
const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD']
type Warn = (message: string, detail: Record<string, unknown>) => void

export interface ReplenishDeps {
  readonly bank: QuestionBankPort
  readonly topics: TopicContextPort
  readonly author: QuestionAuthoringPort
  /** First reviewer is required (gemini-3.8-flash); later ones cross-check (Gemma). */
  readonly reviewers: readonly BlindReviewPort[]
  readonly screener?: DraftScreenPort
  readonly semantic?: SemanticQuestionService
  readonly newId?: () => string
  readonly now?: () => Date
  readonly warn?: Warn
}

function acceptDraft(draft: QuestionDraft, topics: Map<string, TopicContext>, seen: Set<string>): QuestionDraft | null {
  const topic = topics.get(draft.topicId)
  const options = draft.options.map((text) => text?.trim())
  if (!topic || !draft.prompt?.trim() || !draft.explanation?.trim() || !draft.basis?.trim() ||
    options.length !== 4 || options.some((text) => !text) || new Set(options).size !== 4 ||
    !Number.isInteger(draft.correctIndex) || draft.correctIndex < 0 || draft.correctIndex > 3 ||
    !TYPES.includes(draft.type) || !DIFFICULTIES.includes(draft.difficulty)) return null
  const key = normalizePrompt(draft.prompt)
  if (seen.has(key)) return null
  seen.add(key)
  const chapterId = topic.chapters.some((c) => c.id === draft.chapterId) ? draft.chapterId : topic.chapters[0]?.id ?? ''
  return { ...draft, chapterId, options }
}

/** Draft → screen → semantic dedupe → parallel blind reviews → store survivors. */
export class ReplenishQuestionBankUseCase {
  private readonly deps: ReplenishDeps
  constructor(deps: ReplenishDeps) { this.deps = deps }
  private get warn(): Warn { return this.deps.warn ?? ((m, d) => console.warn(m, d)) }

  private async screen(drafts: QuestionDraft[], request: AuthoringRequest): Promise<QuestionDraft[]> {
    if (!this.deps.screener || !drafts.length) return drafts
    try {
      const verdicts = await this.deps.screener.screen(drafts, request)
      return drafts.flatMap((draft, index) => {
        const verdict = verdicts.find((v) => v.index === index)
        return verdict?.keep === false ? [] : [{ ...draft, issue: verdict?.issue.trim() ?? '' }]
      })
    } catch (error) {
      this.warn('Draft screening skipped', { error: String(error) })
      return drafts
    }
  }

  private async dedupe(drafts: QuestionDraft[], pool: readonly Question[]) {
    if (!this.deps.semantic || !drafts.length) return { drafts, vectors: null as number[][] | null }
    await this.deps.semantic.ensureIndexed(pool)
    const { duplicate, vectors } = await this.deps.semantic.findDuplicates(drafts.map((d) => ({
      topicId: d.topicId, text: questionEmbeddingText(d.prompt, d.options[d.correctIndex]),
    })))
    return { drafts: drafts.filter((_, i) => !duplicate[i]), vectors: vectors?.filter((_, i) => !duplicate[i]) ?? null }
  }

  async execute(shortfall: number, pool: readonly Question[], history: readonly QuestionHistoryEntry[]): Promise<Question[]> {
    const topics = await this.deps.topics.listTopics()
    const allocations = allocateTopics(topics, pool, history, shortfall)
    if (!allocations.length) return []
    const wanted = new Set(allocations.map((a) => a.topicId))
    const request: AuthoringRequest = {
      allocations,
      topics: topics.filter((topic) => wanted.has(topic.id)),
      existingPrompts: Object.fromEntries([...wanted].map((id) => [id, pool.filter((q) => q.topicId === id).map((q) => q.prompt)])),
    }
    const topicMap = new Map(request.topics.map((topic) => [topic.id, topic]))
    const seen = new Set(pool.map((q) => normalizePrompt(q.prompt)))
    const accepted = (await this.deps.author.draft(request))
      .map((draft) => acceptDraft(draft, topicMap, seen))
      .filter((draft): draft is QuestionDraft => draft !== null)
      .slice(0, shortfall)
    const { drafts, vectors } = await this.dedupe(await this.screen(accepted, request), pool)
    if (!drafts.length) return []
    const verdict = await runBlindReviews(this.deps.reviewers, drafts, request, this.warn)
    const createdAt = (this.deps.now?.() ?? new Date()).toISOString()
    const newId = this.deps.newId ?? (() => crypto.randomUUID().slice(0, 12))
    const kept = drafts.flatMap((draft, index) => verdict.passed(index, draft) ? [{ draft, index }] : [])
    const records: GeneratedQuestionRecord[] = kept.map(({ draft, index }) => ({
      question: buildGeneratedQuestion(draft, `${GENERATED_QUESTION_PREFIX}${draft.topicId}-${newId()}`),
      topicTitle: topicMap.get(draft.topicId)!.title, basis: draft.basis.trim(), issue: draft.issue ?? '',
      generatorModel: this.deps.author.generatorModel, reviewerModel: verdict.models.join(', '),
      reviewNotes: verdict.notes(index), createdAt,
    }))
    if (!records.length) return []
    await this.deps.bank.saveGenerated(records)
    if (vectors) {
      await this.deps.semantic?.add(records.map((r, i) => ({ id: r.question.id, topicId: r.question.topicId, values: vectors[kept[i].index] })))
    }
    return records.map((record) => record.question)
  }
}
