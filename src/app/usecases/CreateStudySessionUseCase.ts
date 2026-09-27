// src/app/usecases/CreateStudySessionUseCase.ts
import type { PracticeSession, SessionPurpose } from '../../domain/models/PracticeSession.ts'
import { DEFAULT_SESSION_QUESTION_COUNTS } from '../../domain/models/PracticeSessionTypes.ts'
import { needsReview, planSessionQuestions, type QuestionHistoryEntry } from '../../domain/models/QuestionPlanning.ts'
import type { Question } from '../../domain/models/Question.ts'
import { isGeneratedQuestionId } from '../../domain/models/GeneratedQuestion.ts'
import type { StudyRepository } from '../../domain/ports/StudyRepository.ts'
import type { QuestionBankPort, StudyHistoryPort } from '../../domain/ports/QuestionBankPorts.ts'
import type { ReplenishQuestionBankUseCase } from './ReplenishQuestionBankUseCase.ts'
import type { SemanticQuestionService } from './SemanticQuestionService.ts'

export interface CreateStudySessionDeps {
  readonly repo: StudyRepository
  readonly bank: QuestionBankPort
  readonly history?: StudyHistoryPort
  readonly replenish?: ReplenishQuestionBankUseCase
  readonly semantic?: SemanticQuestionService
  readonly shuffleSeed?: () => string
  readonly warn?: (message: string, detail: Record<string, unknown>) => void
}

/** Fixes the session's question order at creation so /next and submit agree on it. */
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

  async execute(purpose: SessionPurpose, targetCount?: number): Promise<PracticeSession> {
    const count = targetCount && targetCount > 0 ? Math.min(Math.floor(targetCount), 100) : DEFAULT_SESSION_QUESTION_COUNTS[purpose]
    const seed = this.deps.shuffleSeed?.() ?? crypto.randomUUID()
    const mockExam = purpose === 'MOCK_EXAM'
    let pool = (await this.deps.bank.listQuestions()).filter((q) => !mockExam || !isGeneratedQuestionId(q.id))
    const history = await this.loadHistory()
    let boost = await this.weakSpotBoost(purpose, pool, history)
    let plan = planSessionQuestions(pool, history, count, seed, boost)

    if (!mockExam && this.deps.replenish && plan.freshCount < count) {
      try {
        const added = await this.deps.replenish.execute(count - plan.freshCount, pool, history)
        if (added.length) {
          pool = [...pool, ...added]
          boost = await this.weakSpotBoost(purpose, pool, history)
          plan = planSessionQuestions(pool, history, count, seed, boost)
        }
      } catch (error) {
        this.warn('Question generation failed; repeating existing questions', error)
      }
    }
    return this.deps.repo.createSession(purpose, count, plan.questionIds.length ? plan.questionIds : undefined)
  }
}
