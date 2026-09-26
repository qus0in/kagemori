// test/unit/infra/InMemoryQuestionRepository.test.ts
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { InMemoryQuestionRepository } from '../../../src/infra/study/InMemoryQuestionRepository.ts'
import { PracticeSession } from '../../../src/domain/models/PracticeSession.ts'

describe('[Unit / Infra] Feature: InMemoryQuestionRepository Session-Seeded Shuffle', () => {
  const createSession = (sessionId: string, targetCount = 6) =>
    new PracticeSession({
      sessionId,
      learnerId: 'guest-learner',
      purpose: 'DIAGNOSTIC',
      blueprintId: 'bp-test',
      targetQuestionCount: targetCount,
    })

  describe('Scenario: Consistency within the same session', () => {
    it('Given same session ID, When iterating through questions, Then returns identical order', async () => {
      const repo = new InMemoryQuestionRepository()
      const session1 = createSession('sess-100-alpha')
      const session2 = createSession('sess-100-alpha')

      const q1 = await repo.findNextForSession(session1)
      const q2 = await repo.findNextForSession(session2)

      assert.ok(q1)
      assert.ok(q2)
      assert.equal(q1.id, q2.id)
    })

    it('Given progressive answers in a session, When findNextForSession is called, Then yields next unattempted question in seed order', async () => {
      const repo = new InMemoryQuestionRepository()
      const session = createSession('sess-consistent-order')
      const sequence: string[] = []

      for (let i = 0; i < 6; i++) {
        const nextQ = await repo.findNextForSession(session)
        if (!nextQ) break
        sequence.push(nextQ.id)
        session.recordAttempt({
          questionId: nextQ.id,
          optionId: nextQ.options[0].id,
          isCorrect: true,
          hintUsed: false,
          durationMs: 1000,
        })
      }

      assert.equal(sequence.length, 6)
      assert.equal(new Set(sequence).size, 6)

      const completedNext = await repo.findNextForSession(session)
      assert.equal(completedNext, null)
    })
  })

  describe('Scenario: Distinct order across different sessions', () => {
    it('Given two different session IDs, When collecting full question order, Then orderings differ', async () => {
      const repo = new InMemoryQuestionRepository()

      const getOrderForSession = async (sessionId: string): Promise<string[]> => {
        const session = createSession(sessionId)
        const order: string[] = []
        for (let i = 0; i < 6; i++) {
          const nextQ = await repo.findNextForSession(session)
          if (!nextQ) break
          order.push(nextQ.id)
          session.recordAttempt({
            questionId: nextQ.id,
            optionId: nextQ.options[0].id,
            isCorrect: true,
            hintUsed: false,
            durationMs: 1000,
          })
        }
        return order
      }

      const orderA = await getOrderForSession('sess-1790418808436-user-1')
      const orderB = await getOrderForSession('sess-1790418808437-user-2')

      assert.equal(orderA.length, 6)
      assert.equal(orderB.length, 6)
      assert.notDeepEqual(orderA, orderB)
    })
  })

  describe('Scenario: Basic retrieval methods', () => {
    it('Given question ID, When findById is called, Then returns correct question or null', async () => {
      const repo = new InMemoryQuestionRepository()
      const all = await repo.getAll()
      assert.ok(all.length >= 6)

      const found = await repo.findById(all[0].id)
      assert.ok(found)
      assert.equal(found.id, all[0].id)

      const notFound = await repo.findById('non-existent-id')
      assert.equal(notFound, null)
    })
  })
})
