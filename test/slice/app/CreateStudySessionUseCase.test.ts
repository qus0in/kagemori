import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { CreateStudySessionUseCase } from '../../../src/app/usecases/CreateStudySessionUseCase.ts'
import { ReplenishQuestionBankUseCase } from '../../../src/app/usecases/ReplenishQuestionBankUseCase.ts'
import { PrepareSessionQuestionsUseCase } from '../../../src/app/usecases/PrepareSessionQuestionsUseCase.ts'
import { InMemoryStudyRepository } from '../../../src/infra/study/InMemoryStudyRepository.ts'
import { buildGeneratedQuestion, type GeneratedQuestionRecord, type GeneratedQuestionTier, type QuestionDraft } from '../../../src/domain/models/GeneratedQuestion.ts'
import type { BlindReviewPort, QuestionAuthoringPort, QuestionBankPort, QuestionReview, TopicContext } from '../../../src/domain/ports/QuestionBankPorts.ts'
import type { QuestionHistoryEntry } from '../../../src/domain/models/QuestionPlanning.ts'
import { SEED_QUESTIONS } from '../../../src/infra/study/SeedStudyData.ts'

const topic: TopicContext = { id: 'topic-2-3', title: '투자분석기법', subjectTitle: '제2과목', weight: 12, chapters: [{ id: 'c5-01-01', title: '기본적 분석' }], conceptNotes: [] }
const draft = (n: number, overrides: Partial<QuestionDraft> = {}): QuestionDraft => ({ topicId: 'topic-2-3', chapterId: 'c5-01-01', type: 'CONCEPT', difficulty: 'MEDIUM', prompt: `PER 해석 문항 ${n}`, options: [`정답 ${n}`, `오답A ${n}`, `오답B ${n}`, `오답C ${n}`], correctIndex: 0, explanation: 'PER은 주가를 주당순이익으로 나눈 값이다.', basis: 'PER = 주가 / EPS', ...overrides })
function author(drafts: QuestionDraft[], reviews?: (drafts: readonly QuestionDraft[]) => QuestionReview[]) {
  const calls = { draft: 0, review: 0, reviewed: [] as (readonly QuestionDraft[])[] }
  const port: QuestionAuthoringPort & BlindReviewPort = { generatorModel: 'gen', model: 'rev', draft: async () => { calls.draft++; return drafts }, review: async (items) => { calls.review++; calls.reviewed.push(items); return reviews?.(items) ?? items.map((d, index) => ({ index, solvedIndex: d.correctIndex, approved: true, issues: '' })) } }
  return { port, calls }
}

const allAnswered: QuestionHistoryEntry[] = SEED_QUESTIONS.map((q) => ({ questionId: q.id, topicId: q.topicId, isCorrect: true, hintUsed: false, answeredAt: '2026-09-01T00:00:00Z' }))
function setup(port: QuestionAuthoringPort & BlindReviewPort, history: QuestionHistoryEntry[] | Error = allAnswered) {
  const repo = new InMemoryStudyRepository()
  const warnings: string[] = []
  const warn = (message: string) => { warnings.push(message) }
  let n = 0
  const replenish = new ReplenishQuestionBankUseCase({ bank: repo.questions, topics: { listTopics: async () => [topic] }, author: port, reviewers: [port], newId: () => `id${++n}` })
  const latestResults = async () => { if (history instanceof Error) throw history; return history }
  const useCase = new CreateStudySessionUseCase({ repo, bank: repo.questions, canGenerate: true, shuffleSeed: () => 'seed', warn, history: { latestResults } })
  const prepare = new PrepareSessionQuestionsUseCase({ sessions: repo.sessions, bank: repo.questions, replenish, warn, history: { latestResults } })
  return { repo, useCase, prepare, reload: async (id: string) => (await repo.sessions.findById(id))!, warnings }
}

describe('[Slice / App] Feature: Session planning with background AI generation', () => {
  describe('Scenario: The bank has no unanswered questions', () => {
    it('Given every seed answered, When a diagnostic starts, Then serves existing questions first and swaps later slots after preparing', async () => {
      const { port, calls } = author([draft(1), draft(2)])
      const { repo, useCase, prepare, reload } = setup(port)
      const session = await useCase.execute('DIAGNOSTIC', 4)
      assert.equal(calls.draft, 0)
      assert.deepEqual(session.generation && [session.generation.status, session.generation.from, session.generation.until], ['pending', 2, 4])
      assert.ok(session.questionIds?.every((id) => id.startsWith('q-')))
      assert.deepEqual(await prepare.execute(session.sessionId), { status: 'done', added: 2 })
      const after = await reload(session.sessionId)
      assert.deepEqual(after.questionIds?.slice(0, 2), session.questionIds?.slice(0, 2))
      assert.deepEqual(after.questionIds?.slice(2), ['gq-topic-2-3-id1', 'gq-topic-2-3-id2'])
      const saved = await repo.questions.findById('gq-topic-2-3-id1')
      assert.equal(saved?.options.find((o) => o.id === saved.correctOptionId)?.text, '정답 1')
      assert.equal((await repo.concepts.findById(saved!.conceptId))?.body, 'PER = 주가 / EPS')
      assert.deepEqual(await prepare.execute(session.sessionId), { status: 'done', added: 0 })
      assert.equal(calls.draft, 1)
    })
    it('Given the reviewer solves differently or rejects, When preparing, Then only matching approvals replace fallbacks', async () => {
      const { port } = author([draft(1), draft(2), draft(3)], (items) => [
        { index: 0, solvedIndex: 1, approved: true, issues: '' },
        { index: 1, solvedIndex: 0, approved: false, issues: '복수 정답' },
        { index: 2, solvedIndex: items[2].correctIndex, approved: true, issues: '' },
      ])
      const { repo, useCase, prepare, reload } = setup(port)
      const session = await useCase.execute('IMPROVEMENT', 5)
      await prepare.execute(session.sessionId)
      const generated = (await repo.questions.listQuestions()).filter((q) => q.id.startsWith('gq-'))
      assert.deepEqual(generated.map((q) => q.prompt), ['PER 해석 문항 3'])
      const after = await reload(session.sessionId)
      assert.equal(after.questionIds?.[2], generated[0].id)
      assert.deepEqual(after.questionIds?.slice(3), session.questionIds?.slice(3))
    })
    it('Given invalid or duplicate drafts, When preparing, Then they never reach the reviewer', async () => {
      const seedPrompt = SEED_QUESTIONS[0].prompt
      const { port, calls } = author([draft(1, { options: ['a', 'a', 'b', 'c'] }), draft(2, { prompt: seedPrompt }), draft(3, { correctIndex: 4 }), draft(4)])
      const { useCase, prepare } = setup(port)
      await prepare.execute((await useCase.execute('DIAGNOSTIC', 6)).sessionId)
      assert.deepEqual(calls.reviewed[0].map((d) => d.prompt), ['PER 해석 문항 4'])
    })
    it('Given the author fails, When preparing, Then marks generation failed and keeps the fallbacks', async () => {
      const port: QuestionAuthoringPort & BlindReviewPort = { ...author([]).port, draft: async () => { throw new Error('429 quota') } }
      const { useCase, prepare, reload, warnings } = setup(port)
      const session = await useCase.execute('DIAGNOSTIC', 6)
      assert.deepEqual(await prepare.execute(session.sessionId), { status: 'failed', added: 0 })
      assert.deepEqual((await reload(session.sessionId)).questionIds, session.questionIds)
      assert.ok(warnings.includes('Background question generation failed'))
    })
  })
  describe('Scenario: Purposes and failures that skip generation', () => {
    it('Given a mock exam, When the bank is short, Then plans seed questions without a generation plan', async () => {
      const session = await setup(author([draft(1)]).port).useCase.execute('MOCK_EXAM')
      assert.equal(session.generation, undefined)
      assert.equal(session.questionIds?.length, 10)
      assert.ok(session.questionIds?.every((id) => id.startsWith('q-')))
    })
    it('Given enough fresh questions, When a session starts, Then needs no generation', async () => {
      const session = await setup(author([draft(1)]).port, []).useCase.execute('DIAGNOSTIC', 6)
      assert.equal(session.generation, undefined)
      assert.equal(new Set(session.questionIds).size, 6)
    })
    it('Given D1 history is unavailable, When a session starts, Then logs and plans without history', async () => {
      const { useCase, warnings } = setup(author([]).port, new Error('D1 down'))
      assert.equal((await useCase.execute('DIAGNOSTIC', 6)).questionIds?.length, 6)
      assert.equal(warnings[0], 'Study history unavailable for planning')
    })
  })
  describe('Scenario: Mock exam mixes only verified AI questions', () => {
    const aiRecord = (id: string, tier: GeneratedQuestionTier): GeneratedQuestionRecord => ({ question: buildGeneratedQuestion(draft(1), id), topicTitle: topic.title, basis: 'PER = 주가 / EPS', issue: '', generatorModel: 'gen', reviewerModel: 'r1, r2', reviewNotes: '', createdAt: '2026-09-01T00:00:00Z', tier })
    const aiIds = (session: { questionIds?: readonly string[] }) => (session.questionIds ?? []).filter((id) => id.startsWith('gq-')).sort()
    it('Given verified and reviewed AI questions, When a mock exam is created, Then only verified ones fill it', async () => {
      const { repo, useCase } = setup(author([]).port)
      await repo.questions.saveGenerated([aiRecord('gq-topic-2-3-v1', 'VERIFIED'), aiRecord('gq-topic-2-3-v2', 'VERIFIED'), aiRecord('gq-topic-2-3-r1', 'REVIEWED'), aiRecord('gq-topic-2-3-r2', 'REVIEWED')])
      const session = await useCase.execute('MOCK_EXAM', 5)
      assert.equal(session.questionIds?.length, 5)
      assert.deepEqual(aiIds(session), ['gq-topic-2-3-v1', 'gq-topic-2-3-v2'])
      assert.equal(session.generation, undefined)
    })
    it('Given more verified AI questions than the cap, When a mock exam is created, Then the cap limits them', async () => {
      const { repo, useCase } = setup(author([]).port)
      await repo.questions.saveGenerated(['v1', 'v2', 'v3'].map((n) => aiRecord(`gq-topic-2-3-${n}`, 'VERIFIED')))
      assert.equal(aiIds(await useCase.execute('MOCK_EXAM', 5)).length, 2)
    })
    it('Given generated tiers cannot be read, When a mock exam is created, Then it falls back to seeds and warns', async () => {
      const { repo } = setup(author([]).port)
      const warnings: string[] = []
      const bank: QuestionBankPort = { listQuestions: () => repo.questions.listQuestions(), saveGenerated: (r) => repo.questions.saveGenerated(r), listGenerated: async () => { throw new Error('D1 down') } }
      const useCase = new CreateStudySessionUseCase({ repo, bank, shuffleSeed: () => 'seed', warn: (m) => { warnings.push(m) }, history: { latestResults: async () => allAnswered } })
      const session = await useCase.execute('MOCK_EXAM', 5)
      assert.equal(session.questionIds?.length, 5)
      assert.ok(session.questionIds?.every((id) => id.startsWith('q-')))
      assert.ok(warnings.includes('Generated question tiers unavailable'))
    })
  })
})
