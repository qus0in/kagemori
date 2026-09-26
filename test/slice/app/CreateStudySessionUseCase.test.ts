import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { CreateStudySessionUseCase } from '../../../src/app/usecases/CreateStudySessionUseCase.ts'
import { ReplenishQuestionBankUseCase } from '../../../src/app/usecases/ReplenishQuestionBankUseCase.ts'
import { InMemoryStudyRepository } from '../../../src/infra/study/InMemoryStudyRepository.ts'
import type { QuestionDraft } from '../../../src/domain/models/GeneratedQuestion.ts'
import type { QuestionAuthoringPort, QuestionReview, TopicContext } from '../../../src/domain/ports/QuestionBankPorts.ts'
import type { QuestionHistoryEntry } from '../../../src/domain/models/QuestionPlanning.ts'
import { SEED_QUESTIONS } from '../../../src/infra/study/SeedStudyData.ts'

const topic: TopicContext = { id: 'topic-2-3', title: '투자분석기법', subjectTitle: '제2과목', weight: 12, chapters: [{ id: 'c5-01-01', title: '기본적 분석' }], conceptNotes: [] }

function draft(n: number, overrides: Partial<QuestionDraft> = {}): QuestionDraft {
  return {
    topicId: 'topic-2-3', chapterId: 'c5-01-01', type: 'CONCEPT', difficulty: 'MEDIUM',
    prompt: `PER 해석 문항 ${n}`, options: [`정답 ${n}`, `오답A ${n}`, `오답B ${n}`, `오답C ${n}`],
    correctIndex: 0, explanation: 'PER은 주가를 주당순이익으로 나눈 값이다.', basis: 'PER = 주가 / EPS', ...overrides,
  }
}

function author(drafts: QuestionDraft[], reviews?: (drafts: readonly QuestionDraft[]) => QuestionReview[]) {
  const calls = { draft: 0, review: 0, reviewed: [] as (readonly QuestionDraft[])[] }
  const port: QuestionAuthoringPort = {
    generatorModel: 'gen', reviewerModel: 'rev',
    draft: async () => { calls.draft++; return drafts },
    review: async (items) => {
      calls.review++; calls.reviewed.push(items)
      return reviews?.(items) ?? items.map((d, index) => ({ index, solvedIndex: d.correctIndex, approved: true, issues: '' }))
    },
  }
  return { port, calls }
}

const allAnswered: QuestionHistoryEntry[] = SEED_QUESTIONS.map((q) => ({ questionId: q.id, topicId: q.topicId, isCorrect: true, hintUsed: false, answeredAt: '2026-09-01T00:00:00Z' }))

function setup(port: QuestionAuthoringPort, history: QuestionHistoryEntry[] | Error = allAnswered) {
  const repo = new InMemoryStudyRepository()
  let n = 0
  const replenish = new ReplenishQuestionBankUseCase({ bank: repo.questions, topics: { listTopics: async () => [topic] }, author: port, newId: () => `id${++n}` })
  const warnings: string[] = []
  const useCase = new CreateStudySessionUseCase({
    repo, bank: repo.questions, replenish, shuffleSeed: () => 'seed', warn: (message) => warnings.push(message),
    history: { latestResults: async () => { if (history instanceof Error) throw history; return history } },
  })
  return { repo, useCase, warnings }
}

describe('[Slice / App] Feature: Session planning with AI replenishment', () => {
  describe('Scenario: The bank has no unanswered questions', () => {
    it('Given every seed answered, When a diagnostic starts, Then drafts the shortfall, keeps reviewed questions and plans them first', async () => {
      const { port, calls } = author([draft(1), draft(2)])
      const { repo, useCase } = setup(port)
      const session = await useCase.execute('DIAGNOSTIC', 2)
      assert.equal(calls.draft, 1)
      assert.deepEqual(session.questionIds, ['gq-topic-2-3-id1', 'gq-topic-2-3-id2'])
      const saved = await repo.questions.findById('gq-topic-2-3-id1')
      assert.equal(saved?.status, 'REVIEWED')
      assert.equal(saved?.options.find((o) => o.id === saved.correctOptionId)?.text, '정답 1')
      assert.equal((await repo.concepts.findById(saved!.conceptId))?.body, 'PER = 주가 / EPS')
    })

    it('Given the reviewer solves differently or rejects, When replenishing, Then only matching approvals are stored', async () => {
      const { port } = author([draft(1), draft(2), draft(3)], (items) => [
        { index: 0, solvedIndex: 1, approved: true, issues: '' },
        { index: 1, solvedIndex: 0, approved: false, issues: '복수 정답' },
        { index: 2, solvedIndex: items[2].correctIndex, approved: true, issues: '' },
      ])
      const { repo, useCase } = setup(port)
      const session = await useCase.execute('IMPROVEMENT', 3)
      const generated = (await repo.questions.listQuestions()).filter((q) => q.id.startsWith('gq-'))
      assert.deepEqual(generated.map((q) => q.prompt), ['PER 해석 문항 3'])
      assert.equal(session.questionIds?.[0], generated[0].id)
      assert.equal(session.questionIds?.length, 3)
    })

    it('Given invalid or duplicate drafts, When replenishing, Then they never reach the reviewer', async () => {
      const seedPrompt = SEED_QUESTIONS[0].prompt
      const { port, calls } = author([draft(1, { options: ['a', 'a', 'b', 'c'] }), draft(2, { prompt: seedPrompt }), draft(3, { correctIndex: 4 }), draft(4)])
      await setup(port).useCase.execute('DIAGNOSTIC', 4)
      assert.deepEqual(calls.reviewed[0].map((d) => d.prompt), ['PER 해석 문항 4'])
    })

    it('Given the author fails, When a session starts, Then falls back to repeating existing questions', async () => {
      const port: QuestionAuthoringPort = { ...author([]).port, draft: async () => { throw new Error('429 quota') } }
      const { useCase, warnings } = setup(port)
      const session = await useCase.execute('DIAGNOSTIC', 6)
      assert.equal(session.questionIds?.length, 6)
      assert.deepEqual(warnings, ['Question generation failed; repeating existing questions'])
    })
  })

  describe('Scenario: Purposes and failures that skip generation', () => {
    it('Given a mock exam, When the bank is short, Then never drafts AI questions', async () => {
      const { port, calls } = author([draft(1)])
      const session = await setup(port).useCase.execute('MOCK_EXAM')
      assert.equal(calls.draft, 0)
      assert.equal(session.questionIds?.length, 10)
      assert.ok(session.questionIds?.every((id) => id.startsWith('q-')))
    })

    it('Given enough fresh questions, When a session starts, Then plans without calling the author', async () => {
      const { port, calls } = author([draft(1)])
      const session = await setup(port, []).useCase.execute('DIAGNOSTIC', 6)
      assert.equal(calls.draft, 0)
      assert.equal(new Set(session.questionIds).size, 6)
    })

    it('Given D1 history is unavailable, When a session starts, Then logs and plans without history', async () => {
      const { port } = author([])
      const { useCase, warnings } = setup(port, new Error('D1 down'))
      assert.equal((await useCase.execute('DIAGNOSTIC', 6)).questionIds?.length, 6)
      assert.equal(warnings[0], 'Study history unavailable for planning')
    })
  })
})
