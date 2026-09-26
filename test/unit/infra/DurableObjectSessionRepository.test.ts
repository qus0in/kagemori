import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { DurableObjectSessionRepository } from '../../../src/infra/study/DurableObjectSessionRepository.ts'
import { PracticeSession } from '../../../src/domain/models/PracticeSession.ts'
import { SessionConflictError, StorageUnavailableError } from '../../../src/domain/models/StorageErrors.ts'
import { StudySessionDO } from '../../../worker/do/StudySessionDO.ts'
import { memoryDOState } from '../../helpers/storageHarness.ts'

const session = () => new PracticeSession({ sessionId: 's', learnerId: 'owner', purpose: 'DIAGNOSTIC', blueprintId: 'bp', targetQuestionCount: 6 })
const answer = { questionId: 'q', optionId: 'a', isCorrect: true, hintUsed: false, durationMs: 100 }
function harness() {
  const storage = memoryDOState()
  const object = new StudySessionDO(storage.state)
  const namespace = { idFromName: (id: string) => id, get: () => object }
  return { ...storage, object, namespace, repo: new DurableObjectSessionRepository(namespace) }
}

describe('[Integration / Infra] Feature: Authoritative DO sessions', () => {
  it('Given two snapshots, When both submit, Then exactly one commits without lost updates', async () => {
    const { repo } = harness()
    await repo.save(session())
    const left = (await repo.findById('s'))!
    const right = (await repo.findById('s'))!
    left.recordAttempt(answer); right.recordAttempt({ ...answer, optionId: 'b' })
    const results = await Promise.allSettled([repo.save(left), repo.save(right)])
    assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1)
    assert.equal((results.find((result) => result.status === 'rejected') as PromiseRejectedResult).reason instanceof SessionConflictError, true)
    assert.equal((await repo.findById('s'))?.attempts.length, 1)
  })
  it('Given failed disk write, When saved, Then never exposes uncommitted state', async () => {
    const { repo, fail } = harness()
    await repo.save(session())
    const loaded = (await repo.findById('s'))!
    loaded.recordAttempt(answer)
    fail(true)
    await assert.rejects(repo.save(loaded), StorageUnavailableError)
    fail(false)
    assert.equal((await repo.findById('s'))?.attempts.length, 0)
  })
  it('Given a hung DO, When read deadline expires, Then does not consult stale KV', async () => {
    let kvReads = 0
    const repo = new DurableObjectSessionRepository({ idFromName: (id) => id, get: () => ({ fetch: () => new Promise(() => {}) }) }, {
      get: async () => { kvReads++; return {} }, put: async () => {}, delete: async () => {},
    }, undefined, 5)
    await assert.rejects(repo.findById('s'), StorageUnavailableError)
    assert.equal(kvReads, 0)
  })
  it('Given missing or failed DO, When queried, Then distinguishes 404 from storage failure', async () => {
    const { repo } = harness()
    assert.equal(await repo.findById('s'), null)
    const broken = new DurableObjectSessionRepository({ idFromName: (id) => id, get: () => ({ fetch: async () => new Response('', { status: 503 }) }) })
    await assert.rejects(broken.findById('s'), StorageUnavailableError)
  })
  it('Given KV failure, When DO creation succeeds, Then background cache cannot undo the commit', async () => {
    const { namespace } = harness()
    const pending: Promise<unknown>[] = []
    const repo = new DurableObjectSessionRepository(namespace, {
      get: async () => null, delete: async () => {}, put: async () => { throw new Error('KV unavailable') },
    }, (task) => pending.push(task))
    await repo.save(session())
    await Promise.all(pending)
    assert.ok(await repo.findById('s'))
    assert.equal(pending.length, 1)
  })
  it('Given legacy stored session without revision, When loaded and updated, Then preserves history', async () => {
    const { repo, state } = harness()
    const { sessionSnapshot } = await import('../../../src/domain/models/SessionSnapshot.ts')
    await state.storage.put('session', sessionSnapshot(session()))
    const loaded = (await repo.findById('s'))!
    loaded.recordAttempt(answer)
    await repo.save(loaded)
    assert.equal((await repo.findById('s'))?.currentQuestionIndex, 1)
  })
})
