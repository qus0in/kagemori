import type { D1Database } from '@cloudflare/workers-types'
import type { PracticeSessionProps } from '../../domain/models/PracticeSessionTypes.ts'
import type { CoverageResult } from '../../domain/models/StudyCoverage.ts'
import type { QuestionHistoryEntry } from '../../domain/models/QuestionPlanning.ts'
import type { StudyHistoryPort } from '../../domain/ports/QuestionBankPorts.ts'
import { StorageUnavailableError } from '../../domain/models/StorageErrors.ts'
import { SEED_QUESTIONS } from '../study/SeedStudyData.ts'
import { withStorageDeadline } from '../storage/withStorageDeadline.ts'

export class D1StudyHistory implements StudyHistoryPort {
  private readonly db: D1Database
  constructor(db: D1Database) { this.db = db }

  async archive(session: PracticeSessionProps): Promise<void> {
    const statements = (session.attempts ?? []).map((attempt) => {
      const question = SEED_QUESTIONS.find((item) => item.id === attempt.questionId)
      const topicId = attempt.topicId ?? question?.topicId
      if (!topicId) throw new StorageUnavailableError('D1 history mapping')
      return this.db.prepare(`INSERT INTO study_attempts
        (session_id, question_id, attempt_id, topic_id, question_version, purpose,
         selected_option_id, is_correct, hint_used, duration_ms, answered_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(session_id, question_id) DO NOTHING`).bind(
        session.sessionId, attempt.questionId, attempt.attemptId, topicId,
        attempt.questionVersion ?? question?.version ?? 1, session.purpose,
        attempt.finalAnswerOptionId, Number(attempt.isFinalCorrect), Number(attempt.hintUsed),
        attempt.durationMs, attempt.answeredAt,
      )
    })
    try {
      // D1 batch is transactional; smaller batches stay below subrequest limits.
      for (let offset = 0; offset < statements.length; offset += 50) {
        const results = await withStorageDeadline(this.db.batch(statements.slice(offset, offset + 50)), 'D1')
        if (results.some((result) => !result.success)) throw new Error('Archive batch failed')
      }
    } catch (cause) { throw new StorageUnavailableError('D1', { cause }) }
  }

  private async latestRows() {
    try {
      const result = await withStorageDeadline(this.db.prepare(`SELECT question_id, topic_id, is_correct, hint_used, answered_at FROM (
        SELECT *, ROW_NUMBER() OVER (PARTITION BY question_id ORDER BY answered_at DESC, attempt_id DESC) AS position
        FROM study_attempts
      ) WHERE position = 1 ORDER BY question_id`).all<{
        question_id: string; topic_id: string; is_correct: number; hint_used: number; answered_at: string
      }>(), 'D1')
      if (!result.success) throw new Error('Latest results query failed')
      return result.results
    } catch (cause) { throw new StorageUnavailableError('D1', { cause }) }
  }

  async coverage(): Promise<CoverageResult[]> {
    return (await this.latestRows()).map((row) => ({
      questionId: row.question_id, topicId: row.topic_id,
      isCorrect: Boolean(row.is_correct), hintUsed: Boolean(row.hint_used),
    }))
  }

  async latestResults(): Promise<QuestionHistoryEntry[]> {
    return (await this.latestRows()).map((row) => ({
      questionId: row.question_id, topicId: row.topic_id, isCorrect: Boolean(row.is_correct),
      hintUsed: Boolean(row.hint_used), answeredAt: row.answered_at,
    }))
  }
}
