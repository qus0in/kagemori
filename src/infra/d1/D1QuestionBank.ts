// src/infra/d1/D1QuestionBank.ts
import type { D1Database } from '@cloudflare/workers-types'
import { Question } from '../../domain/models/Question.ts'
import type { Difficulty, QuestionOption, QuestionType } from '../../domain/models/QuestionTypes.ts'
import { conceptIdOfQuestion, type GeneratedQuestionRecord } from '../../domain/models/GeneratedQuestion.ts'
import type { GeneratedQuestionStore } from '../../domain/ports/QuestionBankPorts.ts'
import { StorageUnavailableError } from '../../domain/models/StorageErrors.ts'
import { withStorageDeadline } from '../storage/withStorageDeadline.ts'

interface Row {
  id: string; topic_id: string; topic_title: string; chapter_id: string; type: string; difficulty: string
  prompt: string; options_json: string; correct_option_id: string; explanation: string; basis: string
  generator_model: string; reviewer_model: string; review_notes: string; created_at: string; issue: string; tier: string
}

function toRecord(row: Row): GeneratedQuestionRecord {
  return {
    question: new Question({
      id: row.id, version: 1, topicId: row.topic_id, chapterId: row.chapter_id,
      type: row.type as QuestionType, difficulty: row.difficulty as Difficulty, status: 'REVIEWED',
      prompt: row.prompt, options: JSON.parse(row.options_json) as QuestionOption[],
      correctOptionId: row.correct_option_id, explanation: row.explanation,
      conceptId: conceptIdOfQuestion(row.id), sourceId: '',
    }),
    topicTitle: row.topic_title, basis: row.basis, issue: row.issue ?? '', generatorModel: row.generator_model,
    reviewerModel: row.reviewer_model, reviewNotes: row.review_notes, createdAt: row.created_at,
    tier: row.tier === 'VERIFIED' ? 'VERIFIED' : 'REVIEWED',
  }
}

export class D1QuestionBank implements GeneratedQuestionStore {
  private readonly db: D1Database
  constructor(db: D1Database) { this.db = db }

  private async run<T>(operation: Promise<T>): Promise<T> {
    try { return await withStorageDeadline(operation, 'D1') }
    catch (cause) { throw new StorageUnavailableError('D1', { cause }) }
  }

  async list(): Promise<GeneratedQuestionRecord[]> {
    const result = await this.run(this.db.prepare(
      "SELECT * FROM generated_questions WHERE status = 'REVIEWED' ORDER BY created_at, id").all<Row>())
    if (!result.success) throw new StorageUnavailableError('D1')
    return result.results.map(toRecord)
  }

  async findById(questionId: string): Promise<GeneratedQuestionRecord | null> {
    const row = await this.run(this.db.prepare(
      "SELECT * FROM generated_questions WHERE id = ? AND status = 'REVIEWED'").bind(questionId).first<Row>())
    return row ? toRecord(row) : null
  }

  async save(records: readonly GeneratedQuestionRecord[]): Promise<void> {
    const statements = records.map(({ question: q, ...meta }) => this.db.prepare(`INSERT INTO generated_questions
      (id, topic_id, topic_title, chapter_id, type, difficulty, prompt, options_json, correct_option_id,
       explanation, basis, generator_model, reviewer_model, review_notes, created_at, issue, tier)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING`).bind(
      q.id, q.topicId, meta.topicTitle, q.chapterId, q.type, q.difficulty, q.prompt, JSON.stringify(q.options),
      q.correctOptionId, q.explanation, meta.basis, meta.generatorModel, meta.reviewerModel, meta.reviewNotes, meta.createdAt, meta.issue, meta.tier,
    ))
    if (!statements.length) return
    const results = await this.run(this.db.batch(statements))
    if (results.some((result) => !result.success)) throw new StorageUnavailableError('D1')
  }
}
