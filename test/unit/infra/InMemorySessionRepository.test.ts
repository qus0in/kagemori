import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { InMemorySessionRepository } from '../../../src/infra/study/InMemorySessionRepository.ts'
import { PracticeSession } from '../../../src/domain/models/PracticeSession.ts'

describe('[Unit / Infra] Feature: Isolated local session snapshots', () => {
  it('Given a plausible session ID, When absent, Then never fabricates progress', async () => {
    assert.equal(await new InMemorySessionRepository().findById('sess-1790418808436-diagnostic-4-xyz12'), null)
  })
  it('Given a loaded snapshot, When mutated without saving, Then stored progress is unchanged', async () => {
    const repo = new InMemorySessionRepository()
    await repo.save(new PracticeSession({ sessionId: 's', learnerId: 'owner', purpose: 'DIAGNOSTIC', blueprintId: 'bp', targetQuestionCount: 6 }))
    const loaded = (await repo.findById('s'))!
    loaded.recordAttempt({ questionId: 'q', optionId: 'a', isCorrect: true, hintUsed: false, durationMs: 1 })
    assert.equal((await repo.findById('s'))?.attempts.length, 0)
    await repo.save(loaded)
    assert.equal((await repo.findById('s'))?.attempts.length, 1)
  })
})
