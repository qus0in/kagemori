// src/domain/ports/QuestionBankPorts.ts
import type { Question } from '../models/Question.ts'
import type { QuestionHistoryEntry } from '../models/QuestionPlanning.ts'
import type { TopicAllocation } from '../models/TopicAllocation.ts'
import type { GeneratedQuestionRecord, QuestionDraft } from '../models/GeneratedQuestion.ts'

export interface StudyHistoryPort {
  /** Latest result for each answered question across all sessions. */
  latestResults(): Promise<QuestionHistoryEntry[]>
}

export interface GeneratedQuestionStore {
  list(): Promise<GeneratedQuestionRecord[]>
  findById(questionId: string): Promise<GeneratedQuestionRecord | null>
  save(records: readonly GeneratedQuestionRecord[]): Promise<void>
}

export interface QuestionBankPort {
  /** Every question that may be planned: fixed seed plus reviewed AI questions. */
  listQuestions(): Promise<Question[]>
  /** Reviewed AI questions with their verification tier. */
  listGenerated(): Promise<GeneratedQuestionRecord[]>
  saveGenerated(records: readonly GeneratedQuestionRecord[]): Promise<void>
}

export interface TopicContext {
  readonly id: string
  readonly title: string
  readonly subjectTitle: string
  readonly weight: number
  readonly chapters: readonly { readonly id: string; readonly title: string }[]
  /** Verified concept bodies for grounding. */
  readonly conceptNotes: readonly string[]
}

export interface TopicContextPort {
  listTopics(): Promise<TopicContext[]>
}

export interface AuthoringRequest {
  readonly allocations: readonly TopicAllocation[]
  readonly topics: readonly TopicContext[]
  /** Existing prompts per topic to avoid duplicates. */
  readonly existingPrompts: Readonly<Record<string, readonly string[]>>
}

export interface QuestionReview {
  readonly index: number
  readonly solvedIndex: number
  readonly approved: boolean
  readonly issues: string
}

export interface QuestionAuthoringPort {
  readonly generatorModel: string
  draft(request: AuthoringRequest): Promise<QuestionDraft[]>
}

export interface BlindReviewPort {
  readonly model: string
  /** Solves without the answer key, then judges validity. */
  review(drafts: readonly QuestionDraft[], request: AuthoringRequest): Promise<QuestionReview[]>
}

export interface DraftScreening {
  readonly index: number
  readonly keep: boolean
  /** One-line core issue the question tests. */
  readonly issue: string
}

export interface DraftScreenPort {
  readonly model: string
  screen(drafts: readonly QuestionDraft[], request: AuthoringRequest): Promise<DraftScreening[]>
}
