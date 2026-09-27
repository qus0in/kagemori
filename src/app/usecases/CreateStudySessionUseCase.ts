// src/app/usecases/CreateStudySessionUseCase.ts
import type { PracticeSession, SessionPurpose } from '../../domain/models/PracticeSession.ts'
import { DEFAULT_SESSION_QUESTION_COUNTS } from '../../domain/models/PracticeSessionTypes.ts'
import { needsReview, planSessionQuestions, type QuestionHistoryEntry } from '../../domain/models/QuestionPlanning.ts'
import type { Question } from '../../domain/models/Question.ts'
import { selectMockExamPool } from '../../domain/models/MockExamPool.ts'
import type { StudyRepository } from '../../domain/ports/StudyRepository.ts'
import type { QuestionBankPort, StudyHistoryPort } from '../../domain/ports/QuestionBankPorts.ts'
import { FIRST_GENERATED_SLOT, GENERATION_WAIT_MS, type GenerationPlan } from '../../domain/models/SessionGeneration.ts'
import type { SemanticQuestionService } from './SemanticQuestionService.ts'

export interface CreateStudySessionDeps {
  readonly repo: StudyRepository
  readonly bank: QuestionBankPort
  readonly history?: StudyHistoryPort
  /** True when AI drafting is configured; later slots are then generated in the background. */
  readonly canGenerate?: boolean
  readonly now?: () => number
  readonly semantic?: SemanticQuestionService
  readonly shuffleSeed?: () => string
  readonly warn?: (message: string, detail: Record<string, unknown>) => void
}

/**
 * Fixes the question order at creation without waiting for AI: slots 1–2 are always existing
 * questions; short banks mark later slots for background generation with fallbacks in place.
 */
export class CreateStudySessionUseCase {
  private readonly deps: CreateStudySessionDeps
  constructor(deps: CreateStudySessionDeps) { this.deps = deps }

  private warn(message: string, error: unknown): void {
    const warn = this.deps.warn ?? ((text, detail) => console.warn(text, detail))
    warn(message, { error: String(error) })
  }

  private async loadHistory(): Promise<QuestionHistoryEntry[]> {
    if (!this.deps.history) return []
    try {
      return await this.deps.history.latestResults()
    } catch (error) {
      // Ordering is an optimisation; grading and progress still require D1 elsewhere.
      this.warn('Study history unavailable for planning', error)
      return []
    }
  }

  /** IMPROVEMENT only: fresh questions similar to the three latest review questions come first. */
  private async weakSpotBoost(purpose: SessionPurpose, pool: readonly Question[], history: readonly QuestionHistoryEntry[]) {
    if (purpose !== 'IMPROVEMENT' || !this.deps.semantic) return undefined
    const recentReview = history.filter(needsReview).sort((a, b) => b.answeredAt.localeCompare(a.answeredAt)).slice(0, 3)
    if (!recentReview.length) return undefined
    const answered = new Set(history.map((entry) => entry.questionId))
    await this.deps.semantic.ensureIndexed(pool)
    return this.deps.semantic.relatedTo(recentReview.map((e) => e.questionId), new Set(pool.filter((q) => !answered.has(q.id)).map((q) => q.id)))
  }

  /** IDs of fully verified AI questions; a failed lookup must never break exam creation. */
  private async verifiedIds(): Promise<ReadonlySet<string>> {
    try {
      const records = await this.deps.bank.listGenerated()
      return new Set(records.filter((record) => record.tier === 'VERIFIED').map((record) => record.question.id))
    } catch (error) {
      this.warn('Generated question tiers unavailable', error)
      return new Set()
    }
  }

  async execute(purpose: SessionPurpose, targetCount?: number): Promise<PracticeSession> {
    const count = targetCount && targetCount > 0 ? Math.min(Math.floor(targetCount), 100) : DEFAULT_SESSION_QUESTION_COUNTS[purpose]
    const seed = this.deps.shuffleSeed?.() ?? crypto.randomUUID()
    const mockExam = purpose === 'MOCK_EXAM'
    const all = await this.deps.bank.listQuestions()
    const pool = mockExam ? selectMockExamPool(all, await this.verifiedIds(), count, seed) : all
    const history = await this.loadHistory()
    const boost = await this.weakSpotBoost(purpose, pool, history)
    const plan = planSessionQuestions(pool, history, count, seed, boost)
    const from = Math.max(FIRST_GENERATED_SLOT, plan.freshCount)
    const generation: GenerationPlan | undefined = !mockExam && this.deps.canGenerate && from < plan.questionIds.length
      ? { status: 'pending', from, until: plan.questionIds.length, deadline: new Date((this.deps.now?.() ?? Date.now()) + GENERATION_WAIT_MS).toISOString(), lockedIndex: -1 }
      : undefined
    return this.deps.repo.createSession(purpose, count, plan.questionIds.length ? plan.questionIds : undefined, generation)
  }
}
