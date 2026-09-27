import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import app from '../../../worker/index.ts'
import { StudySessionDO } from '../../../worker/do/StudySessionDO.ts'
import { D1QuestionBank } from '../../../src/infra/d1/D1QuestionBank.ts'
import { D1StudyHistory } from '../../../src/infra/d1/D1StudyHistory.ts'
import { buildGeneratedQuestion } from '../../../src/domain/models/GeneratedQuestion.ts'
import { SEED_QUESTIONS } from '../../../src/infra/study/SeedStudyData.ts'
import type { BlindReviewPort, QuestionAuthoringPort } from '../../../src/domain/ports/QuestionBankPorts.ts'
import type { PublicQuestionDto, SubmitAnswerResponseDto, ConceptHintResponseDto } from '../../../src/app/dto/StudyDto.ts'
import { sqliteD1, memoryDOState } from '../../helpers/storageHarness.ts'

const draft = {
  topicId: 'topic-2-3', chapterId: 'c5-01-01', type: 'CALCULATION' as const, difficulty: 'MEDIUM' as const,
  prompt: '주가 20,000원, EPS 2,000원일 때 PER은?', options: ['10배', '0.1배', '20배', '5배'], correctIndex: 0,
  explanation: 'PER = 주가 / EPS = 10배', basis: 'PER은 주가를 주당순이익(EPS)으로 나눈 배수이다.',
}

const meta = { topicTitle: '투자분석기법', basis: draft.basis, issue: 'PER 계산', generatorModel: 'gemini-3.8-flash',
  reviewerModel: 'gemini-3.8-flash', reviewNotes: '', createdAt: '2026-09-27T00:00:00Z' }
const recordOf = (id: string, tier: 'REVIEWED' | 'VERIFIED') => ({ ...meta, question: buildGeneratedQuestion(draft, id), tier })
const authorOf = (generatorModel = 'gemini-3.8-flash', model = generatorModel): QuestionAuthoringPort & BlindReviewPort => ({
  generatorModel, model, draft: async () => [draft],
  review: async (items) => items.map((_, index) => ({ index, solvedIndex: 0, approved: true, issues: '' })),
})

function answerAllSeeds(sqlite: ReturnType<typeof sqliteD1>['sqlite']) {
  const insert = sqlite.prepare(`INSERT INTO study_attempts VALUES (?, ?, ?, ?, 1, 'DIAGNOSTIC', 'x', ?, 0, 1, ?)`)
  SEED_QUESTIONS.forEach((q, i) => insert.run('old', q.id, `a${i}`, q.topicId, i % 2, `2026-09-0${1 + (i % 9)}T00:00:00Z`))
}

describe('[Integration / Infra] Feature: D1 question bank and planned sessions', () => {
  it('Given reviewed records, When saved twice and reloaded, Then round-trips the question once', async () => {
    const { db, sqlite } = sqliteD1(); const bank = new D1QuestionBank(db)
    const record = recordOf('gq-topic-2-3-abc', 'REVIEWED')
    await bank.save([record]); await bank.save([record])
    assert.deepEqual(await bank.list(), [record])
    assert.deepEqual(await bank.findById('gq-topic-2-3-abc'), record)
    assert.equal(await bank.findById('gq-missing'), null)
    sqlite.close()
  })

  it('Given saved tiers, When reloaded, Then persists VERIFIED and defaults raw inserts to REVIEWED', async () => {
    const { db, sqlite } = sqliteD1(); const bank = new D1QuestionBank(db)
    await bank.save([recordOf('gq-topic-2-3-rev', 'REVIEWED'), recordOf('gq-topic-2-3-ver', 'VERIFIED')])
    assert.equal((await bank.findById('gq-topic-2-3-rev'))?.tier, 'REVIEWED')
    assert.equal((await bank.findById('gq-topic-2-3-ver'))?.tier, 'VERIFIED')
    const raw = buildGeneratedQuestion(draft, 'gq-topic-2-3-def')
    sqlite.prepare(`INSERT INTO generated_questions (id, topic_id, topic_title, chapter_id, type, difficulty, prompt, options_json, correct_option_id, explanation, basis, generator_model, reviewer_model, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(raw.id, raw.topicId, meta.topicTitle, raw.chapterId, raw.type, raw.difficulty, raw.prompt, JSON.stringify(raw.options), raw.correctOptionId, raw.explanation, meta.basis, meta.generatorModel, meta.reviewerModel, meta.createdAt)
    assert.equal((await bank.findById('gq-topic-2-3-def'))?.tier, 'REVIEWED')
    sqlite.close()
  })

  it('Given answered history, When latest results are read, Then include the answer time for ordering', async () => {
    const { db, sqlite } = sqliteD1(); answerAllSeeds(sqlite)
    const latest = await new D1StudyHistory(db).latestResults()
    assert.equal(latest.length, SEED_QUESTIONS.length)
    assert.ok(latest.every((entry) => entry.answeredAt.startsWith('2026-09-0')))
    sqlite.close()
  })

  it('Given every seed answered, When a session starts over HTTP, Then serves, hints and grades the reviewed AI question', async () => {
    const { db, sqlite } = sqliteD1(); answerAllSeeds(sqlite)
    const object = new StudySessionDO(memoryDOState().state, { DB: db })
    const env = { STORAGE_MODE: 'persistent' as const, DB: db, STUDY_SESSION_DO: { idFromName: (id: string) => id, get: () => object }, QUESTION_AUTHOR: authorOf() }
    const post = (path: string, body: unknown) => app.request(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, env)
    const get = (path: string) => app.request(path, undefined, env)
    const created = await post('/api/study/session', { purpose: 'IMPROVEMENT', targetCount: 3 })
    assert.equal(created.status, 201)
    const { sessionId, preparingQuestions } = await created.json() as { sessionId: string; preparingQuestions?: number }; assert.equal(preparingQuestions, 1)
    for (let i = 0; i < 2; i++) {
      const existing = await (await get(`/api/study/session/${sessionId}/next`)).json() as PublicQuestionDto
      assert.ok(existing.id.startsWith('q-cma-'))
      await post(`/api/study/session/${sessionId}/submit`, { questionId: existing.id, optionId: existing.options[0].id, hintUsed: false })
    }
    const waiting = await get(`/api/study/session/${sessionId}/next`); assert.equal(waiting.status, 202)
    assert.equal((await waiting.json() as { preparing: boolean }).preparing, true)
    assert.deepEqual(await (await post(`/api/study/session/${sessionId}/prepare`, {})).json(), { status: 'done', added: 1 })
    const next = await (await get(`/api/study/session/${sessionId}/next`)).json() as PublicQuestionDto
    assert.ok(next.id.startsWith('gq-topic-2-3-')); assert.equal(next.isAiGenerated, true)
    assert.equal(sqlite.prepare('SELECT count(*) AS n FROM generated_questions').get()?.n, 1)
    const hint = await (await post(`/api/study/session/${sessionId}/hint`, { questionId: next.id })).json() as ConceptHintResponseDto
    assert.equal(hint.conceptTitle, '투자분석기법 핵심 근거')
    const correct = next.options.find((option) => option.text === '10배')!
    const result = await (await post(`/api/study/session/${sessionId}/submit`, { questionId: next.id, optionId: correct.id, hintUsed: true })).json() as SubmitAnswerResponseDto
    assert.equal(result.isCorrect, true); assert.equal(result.sessionProgress?.isCompleted, true)
    sqlite.close()
  })

  it('Given the learner chooses an existing question while generating, When generation finishes, Then the served slot is never replaced', async () => {
    const { db, sqlite } = sqliteD1(); answerAllSeeds(sqlite)
    const object = new StudySessionDO(memoryDOState().state, { DB: db })
    const env = { STORAGE_MODE: 'persistent' as const, DB: db, STUDY_SESSION_DO: { idFromName: (id: string) => id, get: () => object }, QUESTION_AUTHOR: authorOf('g', 'r') }
    const post = (path: string, body: unknown) => app.request(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, env)
    const { sessionId } = await (await post('/api/study/session', { purpose: 'DIAGNOSTIC', targetCount: 3 })).json() as { sessionId: string }
    for (let i = 0; i < 2; i++) {
      const q = await (await app.request(`/api/study/session/${sessionId}/next`, undefined, env)).json() as PublicQuestionDto
      await post(`/api/study/session/${sessionId}/submit`, { questionId: q.id, optionId: q.options[0].id, hintUsed: false })
    }
    const fallback = await (await app.request(`/api/study/session/${sessionId}/next?existing=1`, undefined, env)).json() as PublicQuestionDto
    assert.ok(fallback.id.startsWith('q-cma-'))
    assert.deepEqual(await (await post(`/api/study/session/${sessionId}/prepare`, {})).json(), { status: 'failed', added: 0 })
    const again = await (await app.request(`/api/study/session/${sessionId}/next`, undefined, env)).json() as PublicQuestionDto; assert.equal(again.id, fallback.id)
    const result = await (await post(`/api/study/session/${sessionId}/submit`, { questionId: fallback.id, optionId: fallback.options[0].id, hintUsed: false })).json() as SubmitAnswerResponseDto
    assert.equal(result.sessionProgress?.isCompleted, true)
    sqlite.close()
  })

  it('Given a stored plan, When an update changes or skips planned questions, Then the durable object rejects it', async () => {
    const object = new StudySessionDO(memoryDOState().state)
    const base = { sessionId: 's', learnerId: 'l', purpose: 'DIAGNOSTIC', blueprintId: 'b', targetQuestionCount: 2,
      currentQuestionIndex: 0, isCompleted: false, attempts: [], questionIds: ['q-cma-001', 'q-cma-002'] }
    const save = (session: unknown, expectedRevision: number | null) => object.fetch(new Request('https://session.internal/session',
      { method: 'POST', body: JSON.stringify({ session, expectedRevision }) }))
    assert.equal((await save(base, null)).status, 200)
    assert.equal((await save({ ...base, questionIds: ['q-cma-002', 'q-cma-001'] }, 1)).status, 400)
    const attempt = { attemptId: 'a1', sessionId: 's', questionId: 'q-cma-002', firstAnswerOptionId: 'o', finalAnswerOptionId: 'o',
      isFirstCorrect: true, isFinalCorrect: true, hintUsed: false, durationMs: 1, answeredAt: '2026-09-27T00:00:00Z' }
    assert.equal((await save({ ...base, currentQuestionIndex: 1, attempts: [attempt] }, 1)).status, 400)
    assert.equal((await save({ ...base, currentQuestionIndex: 1, attempts: [{ ...attempt, questionId: 'q-cma-001' }] }, 1)).status, 200)
  })
})
