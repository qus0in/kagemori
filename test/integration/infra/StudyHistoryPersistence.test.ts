import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { D1StudyHistory } from '../../../src/infra/d1/D1StudyHistory.ts'
import { D1CatalogRepository } from '../../../src/infra/d1/D1CatalogRepository.ts'
import { PracticeSession } from '../../../src/domain/models/PracticeSession.ts'
import { sessionSnapshot } from '../../../src/domain/models/SessionSnapshot.ts'
import { StudySessionDO } from '../../../worker/do/StudySessionDO.ts'
import { DurableObjectSessionRepository } from '../../../src/infra/study/DurableObjectSessionRepository.ts'
import { sqliteD1, memoryDOState } from '../../helpers/storageHarness.ts'
import app from '../../../worker/index.ts'
import { StorageUnavailableError } from '../../../src/domain/models/StorageErrors.ts'
import type { D1Database } from '@cloudflare/workers-types'

function session(id: string, correct: boolean, answeredAt: string) {
  const value = new PracticeSession({ sessionId: id, learnerId: 'owner', purpose: 'IMPROVEMENT', blueprintId: 'bp', targetQuestionCount: 6 })
  value.recordAttempt({ questionId: 'q-cma-001', topicId: 'topic-3-2', questionVersion: 1,
    optionId: 'opt-1-1', isCorrect: correct, hintUsed: false, durationMs: 100, answeredAt })
  return sessionSnapshot(value)
}

describe('[Integration / Infra] Feature: Global D1 study history', () => {
  it('Given replayed and out-of-order deliveries, When archived, Then deduplicates attempts and returns the newest result', async () => {
    const { db, sqlite } = sqliteD1()
    const history = new D1StudyHistory(db)
    const old = session('s-old', true, '2026-09-26T00:00:00Z')
    const recent = session('s-new', false, '2026-09-26T01:00:00Z')
    await history.archive(recent); await history.archive(old); await history.archive(recent)
    assert.equal(sqlite.prepare('SELECT count(*) AS count FROM study_attempts').get()?.count, 2)
    assert.deepEqual(await history.coverage(), [{ questionId: 'q-cma-001', topicId: 'topic-3-2', isCorrect: false, hintUsed: false }])
    const response = await app.request('/api/study/coverage', undefined, { DB: db })
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('cache-control'), 'no-store')
    assert.equal((await response.json() as { results: unknown[] }).results.length, 1)
    sqlite.close()
  })
  it('Given D1 failure then recovery, When the alarm is retried after object restart, Then archives every answer once', async () => {
    const { db, sqlite } = sqliteD1()
    const { state } = memoryDOState()
    const snapshot = session('legacy', true, '2026-09-26T00:00:00Z')
    await state.storage.put('session', snapshot)
    const failed = new StudySessionDO(state)
    await failed.fetch(new Request('https://do/session'))
    assert.ok(await state.storage.get('alarm'))
    await assert.rejects(failed.alarm())
    assert.equal(await state.storage.get('archivedRevision'), undefined)
    const restarted = new StudySessionDO(state, { DB: db })
    await restarted.alarm(); await restarted.alarm()
    assert.equal(await state.storage.get('archivedRevision'), 0)
    assert.equal(sqlite.prepare('SELECT count(*) AS count FROM study_attempts').get()?.count, 1)
    sqlite.close()
  })
  it('Given a committed answer, When alarm runs, Then new D1 connections observe the persisted result', async () => {
    const { db, sqlite } = sqliteD1()
    const { state } = memoryDOState()
    const object = new StudySessionDO(state, { DB: db })
    const repo = new DurableObjectSessionRepository({ idFromName: (id) => id, get: () => object })
    const value = new PracticeSession({ sessionId: 'new', learnerId: 'owner', purpose: 'DIAGNOSTIC', blueprintId: 'bp', targetQuestionCount: 6 })
    await repo.save(value)
    value.recordAttempt({ questionId: 'q-cma-001', topicId: 'topic-3-2', optionId: 'opt-1-1', isCorrect: true, hintUsed: false, durationMs: 1 })
    await repo.save(value)
    assert.ok(await state.storage.get('alarm'))
    await object.alarm()
    assert.equal((await new D1StudyHistory(db).coverage())[0].isCorrect, true)
    sqlite.close()
  })
  it('Given seeded D1, When catalog is read, Then batched queries preserve the real catalog', async () => {
    const { db, sqlite } = sqliteD1()
    const repo = new D1CatalogRepository(db)
    assert.equal((await repo.getBooks()).length, 5)
    assert.equal((await repo.getExamBlueprint()).subjects.length, 3)
    assert.equal((await repo.getOverview()).totalChapters, 125)
    sqlite.close()
  })
  it('Given D1 errors or missing bindings, When requested, Then returns 503 rather than empty progress or fabricated data', async () => {
    const db = { prepare: () => { throw new Error('D1 down') } } as unknown as D1Database
    await assert.rejects(new D1CatalogRepository(db).getBooks(), StorageUnavailableError)
    const response = await app.request('/api/study/coverage', undefined, { DB: db })
    assert.equal(response.status, 503)
    assert.equal((await response.json() as { code: string }).code, 'STORAGE_UNAVAILABLE')
    assert.equal((await app.request('/api/study/session/s/next', undefined, { STORAGE_MODE: 'persistent' })).status, 503)
    assert.equal((await app.request('/api/catalog/books', undefined, { STORAGE_MODE: 'persistent' })).status, 503)
  })
})
