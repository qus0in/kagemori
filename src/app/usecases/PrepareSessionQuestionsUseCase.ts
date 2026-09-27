// src/app/usecases/PrepareSessionQuestionsUseCase.ts
import type { GenerationStatus } from '../../domain/models/SessionGeneration.ts'
import type { PracticeSessionRepository } from '../../domain/ports/PracticeSessionRepository.ts'
import type { QuestionBankPort, StudyHistoryPort } from '../../domain/ports/QuestionBankPorts.ts'
import type { ReplenishQuestionBankUseCase } from './ReplenishQuestionBankUseCase.ts'
import { SessionNotFoundError } from './AnsweredQuestionLoader.ts'
import { updateSessionWithRetry } from './SessionPlanUpdates.ts'

export interface PrepareDeps {
  readonly sessions: PracticeSessionRepository
  readonly bank: QuestionBankPort
  readonly history?: StudyHistoryPort
  readonly replenish?: ReplenishQuestionBankUseCase
  readonly warn?: (message: string, detail: Record<string, unknown>) => void
}

export interface PrepareResult {
  readonly status: GenerationStatus | 'none'
  readonly added: number
}

/** Runs AI generation for a session's later slots while the learner answers the first questions. */
export class PrepareSessionQuestionsUseCase {
  private readonly deps: PrepareDeps
  constructor(deps: PrepareDeps) { this.deps = deps }

  private warn(message: string, error: unknown): void {
    (this.deps.warn ?? ((m, d) => console.warn(m, d)))(message, { error: String(error) })
  }

  async execute(sessionId: string): Promise<PrepareResult> {
    const { sessions, bank, history, replenish } = this.deps
    let claimed = false
    const session = await updateSessionWithRetry(sessions, sessionId, (current) => {
      claimed = current.generation?.status === 'pending'
      if (claimed) current.setGenerationStatus(replenish ? 'running' : 'failed')
      return claimed
    })
    if (!session) throw new SessionNotFoundError(`Practice session not found: ${sessionId}`)
    const plan = session.generation
    if (!claimed || !plan || !replenish) return { status: plan?.status ?? 'none', added: 0 }

    let ids: string[] = []
    try {
      const pool = await bank.listQuestions()
      const latest = history ? await history.latestResults().catch((error) => { this.warn('History unavailable for generation', error); return [] }) : []
      ids = (await replenish.execute(plan.until - plan.from, pool, latest)).map((q) => q.id)
    } catch (error) {
      this.warn('Background question generation failed', error)
    }
    let added = 0
    const updated = await updateSessionWithRetry(sessions, sessionId, (current) => {
      added = current.applyGeneratedQuestions(ids)
      return true
    })
    return { status: updated?.generation?.status ?? 'failed', added }
  }
}
