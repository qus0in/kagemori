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

  async chatHistory(): Promise<{ questionId: string; topicId: string; questionVersion: number; isCorrect: boolean; hintUsed: boolean; answeredAt: string; sessionId: string }[]> {
    try {
      const result = await withStorageDeadline(this.db.prepare(`SELECT session_id, question_id, topic_id, question_version, is_correct, hint_used, answered_at
        FROM study_attempts ORDER BY answered_at DESC`).all<{
        session_id: string; question_id: string; topic_id: string; question_version: number; is_correct: number; hint_used: number; answered_at: string
      }>(), 'D1')
      if (!result.success) throw new Error('Chat history query failed')
      return result.results.map((row) => ({ sessionId: row.session_id, questionId: row.question_id, topicId: row.topic_id,
        questionVersion: row.question_version, isCorrect: Boolean(row.is_correct), hintUsed: Boolean(row.hint_used), answeredAt: row.answered_at }))
    } catch (cause) { throw new StorageUnavailableError('D1', { cause }) }
  }

  async registerSession(sessionId: string, purpose: string, completed: boolean): Promise<void> {
    try {
      const result = await withStorageDeadline(this.db.prepare(`INSERT INTO study_session_status(session_id,purpose,is_completed,updated_at)
        VALUES(?,?,?,?) ON CONFLICT(session_id) DO UPDATE SET is_completed=excluded.is_completed,updated_at=excluded.updated_at`)
        .bind(sessionId, purpose, Number(completed), new Date().toISOString()).run(), 'D1')
      if (!result.success) throw new Error('Session status update failed')
    } catch (cause) { throw new StorageUnavailableError('D1', { cause }) }
  }

  async hasActiveSession(): Promise<boolean> {
    try {
      const result = await withStorageDeadline(this.db.prepare(`SELECT 1 AS active FROM study_session_status
        WHERE is_completed=0 AND updated_at >= datetime('now','-24 hours') LIMIT 1`)
        .first<{ active: number }>(), 'D1')
      return Boolean(result)
    } catch (cause) { throw new StorageUnavailableError('D1', { cause }) }
  }
}
