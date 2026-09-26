// test/unit/infra/InMemorySessionRepository.test.ts
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { InMemorySessionRepository } from '../../../src/infra/study/InMemorySessionRepository.ts'
import { PracticeSession } from '../../../src/domain/models/PracticeSession.ts'

describe('[Unit / Infra] Feature: InMemorySessionRepository Auto-Healing', () => {
  describe('Scenario: Session exists in local memory', () => {
    it('Given a saved session, When findById is called, Then returns the saved session', async () => {
      const repo = new InMemorySessionRepository()
      const session = new PracticeSession({
        sessionId: 'sess-1790418808436-test',
        learnerId: 'guest-learner',
        purpose: 'IMPROVEMENT',
        blueprintId: 'blueprint-round-47',
        targetQuestionCount: 5,
      })
      await repo.save(session)

      const found = await repo.findById('sess-1790418808436-test')
      assert.ok(found)
      assert.equal(found.sessionId, 'sess-1790418808436-test')
      assert.equal(found.targetQuestionCount, 5)
    })
  })

  describe('Scenario: Session missing in memory due to serverless isolate switch', () => {
    it('Given a valid timestamped session ID not in memory, When findById is called, Then auto-heals and recovers session', async () => {
      const repo = new InMemorySessionRepository()
      const userSessionId = 'sess-1790418808436-pqcgf'

      const recovered = await repo.findById(userSessionId)
      assert.ok(recovered)
      assert.equal(recovered.sessionId, userSessionId)
      assert.equal(recovered.purpose, 'IMPROVEMENT')
      assert.equal(recovered.targetQuestionCount, 6)
    })

    it('Given encoded purpose and count in session ID, When findById is called, Then recovers exact purpose and count', async () => {
      const repo = new InMemorySessionRepository()
      const diagnosticSessionId = 'sess-1790418808436-diagnostic-4-xyz12'

      const recovered = await repo.findById(diagnosticSessionId)
      assert.ok(recovered)
      assert.equal(recovered.sessionId, diagnosticSessionId)
      assert.equal(recovered.purpose, 'DIAGNOSTIC')
      assert.equal(recovered.targetQuestionCount, 4)
    })

    it('Given invalid session ID format, When findById is called, Then returns null (404)', async () => {
      const repo = new InMemorySessionRepository()
      const invalidId = 'sess-invalid-999'

      const notFound = await repo.findById(invalidId)
      assert.equal(notFound, null)
    })
  })
})
