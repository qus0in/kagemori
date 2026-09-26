import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { planSessionQuestions, type QuestionHistoryEntry } from '../../../src/domain/models/QuestionPlanning.ts'
import { allocateTopics } from '../../../src/domain/models/TopicAllocation.ts'

const q = (id: string, topicId = 't1') => ({ id, topicId })
const h = (questionId: string, isCorrect: boolean, answeredAt: string, hintUsed = false, topicId = 't1'): QuestionHistoryEntry =>
  ({ questionId, topicId, isCorrect, hintUsed, answeredAt })

describe('[Unit / Domain] Feature: History-based session planning', () => {
  describe('Scenario: Prioritising questions across sessions', () => {
    it('Given fresh, reviewed and mastered questions, When planned, Then orders fresh → review (oldest first) → mastered', () => {
      const pool = [q('mastered'), q('wrong-new'), q('fresh-a'), q('hinted-old'), q('fresh-b')]
      const history = [
        h('mastered', true, '2026-09-01T00:00:00Z'),
        h('wrong-new', false, '2026-09-20T00:00:00Z'),
        h('hinted-old', true, '2026-09-10T00:00:00Z', true),
      ]
      const plan = planSessionQuestions(pool, history, 5, 'seed')
      assert.deepEqual(new Set(plan.questionIds.slice(0, 2)), new Set(['fresh-a', 'fresh-b']))
      assert.deepEqual(plan.questionIds.slice(2), ['hinted-old', 'wrong-new', 'mastered'])
      assert.equal(plan.freshCount, 2)
    })

    it('Given repeated answers, When planned, Then only the latest result decides the category', () => {
      const history = [h('a', false, '2026-09-01T00:00:00Z'), h('a', true, '2026-09-02T00:00:00Z'), h('b', false, '2026-09-03T00:00:00Z')]
      assert.deepEqual(planSessionQuestions([q('a'), q('b')], history, 2, 's').questionIds, ['b', 'a'])
    })

    it('Given more questions than needed, When planned, Then returns the target count deterministically per seed', () => {
      const pool = Array.from({ length: 10 }, (_, i) => q(`q${i}`))
      const first = planSessionQuestions(pool, [], 4, 'same')
      assert.equal(first.questionIds.length, 4)
      assert.equal(first.freshCount, 4)
      assert.deepEqual(planSessionQuestions(pool, [], 4, 'same').questionIds, first.questionIds)
    })
  })
})

describe('[Unit / Domain] Feature: Topic allocation for new questions', () => {
  it('Given blueprint weights and available questions, When allocating, Then favours heavy topics with few fresh questions', () => {
    const topics = [{ id: 'heavy', weight: 12 }, { id: 'light', weight: 3 }, { id: 'covered', weight: 12 }]
    const pool = [q('c1', 'covered'), q('c2', 'covered'), q('c3', 'covered')]
    const result = allocateTopics(topics, pool, [], 4)
    assert.equal(result.reduce((sum, a) => sum + a.count, 0), 4)
    assert.ok((result.find((a) => a.topicId === 'heavy')?.count ?? 0) >= 2)
    assert.ok(!result.some((a) => a.topicId === 'light' && a.count > (result.find((b) => b.topicId === 'heavy')?.count ?? 0)))
  })

  it('Given equal weights, When one topic has a high review rate, Then it receives the first allocation', () => {
    const topics = [{ id: 'a', weight: 5 }, { id: 'b', weight: 5 }]
    const history = [h('x', false, '2026-09-01T00:00:00Z', false, 'b')]
    assert.deepEqual(allocateTopics(topics, [q('x', 'b')], history, 1), [{ topicId: 'b', count: 1 }])
  })
})
