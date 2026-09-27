import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { resolveNextSlot, replaceableSlots, type GenerationPlan } from '../../../src/domain/models/SessionGeneration.ts'
import { PracticeSession } from '../../../src/domain/models/PracticeSession.ts'

const ids = ['a', 'b', 'c', 'd']
const plan = (overrides: Partial<GenerationPlan> = {}): GenerationPlan =>
  ({ status: 'running', from: 2, until: 4, deadline: '2026-09-27T00:01:00Z', lockedIndex: -1, ...overrides })
const before = Date.parse('2026-09-27T00:00:30Z')
const after = Date.parse('2026-09-27T00:02:00Z')

describe('[Unit / Domain] Feature: Background generation slots', () => {
  it('Given slots before the generation range, When resolving, Then serves the planned question', () => {
    assert.deepEqual(resolveNextSlot(ids, 1, plan(), before, false), { kind: 'question', questionId: 'b' })
    assert.deepEqual(resolveNextSlot(ids, 4, plan(), before, false), { kind: 'completed' })
  })

  it('Given an unfinished generation slot, When resolving, Then waits until the deadline or the learner opts out', () => {
    assert.deepEqual(resolveNextSlot(ids, 2, plan(), before, false), { kind: 'preparing', remainingMs: 30_000 })
    assert.deepEqual(resolveNextSlot(ids, 2, plan(), before, true), { kind: 'fallback', questionId: 'c', index: 2 })
    assert.deepEqual(resolveNextSlot(ids, 2, plan(), after, false), { kind: 'fallback', questionId: 'c', index: 2 })
  })

  it('Given a finished or locked slot, When resolving, Then serves it directly', () => {
    assert.deepEqual(resolveNextSlot(ids, 2, plan({ status: 'done' }), before, false), { kind: 'question', questionId: 'c' })
    assert.deepEqual(resolveNextSlot(ids, 2, plan({ lockedIndex: 2 }), before, false), { kind: 'question', questionId: 'c' })
  })

  it('Given answers and locks, When computing replaceable slots, Then skips served and locked ones', () => {
    assert.deepEqual(replaceableSlots(plan(), 0), [2, 3])
    assert.deepEqual(replaceableSlots(plan(), 3), [3])
    assert.deepEqual(replaceableSlots(plan({ lockedIndex: 2 }), 2), [3])
  })

  it('Given generated ids, When applied to a session, Then fills free slots, ignores duplicates and marks the outcome', () => {
    const session = new PracticeSession({ sessionId: 's', learnerId: 'l', purpose: 'DIAGNOSTIC', blueprintId: 'b',
      targetQuestionCount: 4, questionIds: ids, generation: plan({ lockedIndex: 2 }) })
    assert.equal(session.applyGeneratedQuestions(['a', 'gq-1', 'gq-2']), 1)
    assert.deepEqual(session.questionIds, ['a', 'b', 'c', 'gq-1'])
    assert.equal(session.generation?.status, 'done')
    const none = new PracticeSession({ sessionId: 's', learnerId: 'l', purpose: 'DIAGNOSTIC', blueprintId: 'b',
      targetQuestionCount: 4, questionIds: ids, generation: plan() })
    assert.equal(none.applyGeneratedQuestions([]), 0)
    assert.equal(none.generation?.status, 'failed')
  })

  it('Given a plan outside the question list, When constructing, Then rejects it', () => {
    assert.throws(() => new PracticeSession({ sessionId: 's', learnerId: 'l', purpose: 'DIAGNOSTIC', blueprintId: 'b',
      targetQuestionCount: 4, questionIds: ids, generation: plan({ from: 1 }) }))
  })
})
