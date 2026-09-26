// src/app/usecases/ReplenishQuestionBankUseCase.ts
import type { Question } from '../../domain/models/Question.ts'
import type { QuestionHistoryEntry } from '../../domain/models/QuestionPlanning.ts'
import { allocateTopics } from '../../domain/models/TopicAllocation.ts'
import {
  buildGeneratedQuestion, normalizePrompt, GENERATED_QUESTION_PREFIX,
  type GeneratedQuestionRecord, type QuestionDraft,
} from '../../domain/models/GeneratedQuestion.ts'
import type {
  AuthoringRequest, QuestionAuthoringPort, QuestionBankPort, QuestionReview, TopicContext, TopicContextPort,
} from '../../domain/ports/QuestionBankPorts.ts'

const TYPES = ['CONCEPT', 'APPLICATION', 'CALCULATION', 'REGULATION']
const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD']

export interface ReplenishDeps {
  readonly bank: QuestionBankPort
  readonly topics: TopicContextPort
  readonly author: QuestionAuthoringPort
  readonly newId?: () => string
  readonly now?: () => Date
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

function passedReview(draft: QuestionDraft, review?: QuestionReview): review is QuestionReview {
  return !!review && review.approved && review.solvedIndex === draft.correctIndex
}

/** Drafts the shortfall with AI, keeps only questions an independent review solves identically. */
export class ReplenishQuestionBankUseCase {
  private readonly deps: ReplenishDeps
  constructor(deps: ReplenishDeps) { this.deps = deps }

  async execute(shortfall: number, pool: readonly Question[], history: readonly QuestionHistoryEntry[]): Promise<Question[]> {
    const { bank, author } = this.deps
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
    const drafts = (await author.draft(request))
      .map((draft) => acceptDraft(draft, topicMap, seen))
      .filter((draft): draft is QuestionDraft => draft !== null)
      .slice(0, shortfall)
    if (!drafts.length) return []
    const reviews = await author.review(drafts, request)
    const createdAt = (this.deps.now?.() ?? new Date()).toISOString()
    const newId = this.deps.newId ?? (() => crypto.randomUUID().slice(0, 12))
    const records: GeneratedQuestionRecord[] = []
    drafts.forEach((draft, index) => {
      const review = reviews.find((r) => r.index === index)
      if (!passedReview(draft, review)) return
      records.push({
        question: buildGeneratedQuestion(draft, `${GENERATED_QUESTION_PREFIX}${draft.topicId}-${newId()}`),
        topicTitle: topicMap.get(draft.topicId)!.title, basis: draft.basis.trim(),
        generatorModel: author.generatorModel, reviewerModel: author.reviewerModel,
        reviewNotes: review.issues, createdAt,
      })
    })
    if (records.length) await bank.saveGenerated(records)
    return records.map((record) => record.question)
  }
}
