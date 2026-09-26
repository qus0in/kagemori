import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { BrowserStudyCoverage, COVERAGE_STORAGE_KEY } from '../../../src/infra/cache/BrowserStudyCoverage.ts'
import { createStudyCoverageStore } from '../../../src/ui/store/useStudyCoverage.ts'

const result = { questionId: 'q1', topicId: 't1', isCorrect: true, hintUsed: false }
const memoryStorage = () => {
  const data = new Map<string, string>()
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value) },
    removeItem: (key: string) => { data.delete(key) },
  }
}

describe('[Slice / UI] Feature: Persistent study coverage', () => {
  it('Given a successful answer, When the store is recreated, Then restores the latest result', () => {
    const storage = new BrowserStudyCoverage(() => memory)
    const memory = memoryStorage()
    const store = createStudyCoverageStore(storage)
    store.getState().record(result)
    store.getState().record({ ...result, isCorrect: false })
    const restored = createStudyCoverageStore(storage)
    assert.deepEqual(restored.getState().results, [{ ...result, isCorrect: false }])
    restored.getState().clear()
    assert.deepEqual(createStudyCoverageStore(storage).getState().results, [])
  })
  it('Given corrupt or invalid saved data, When loaded, Then safely reports unavailable history', () => {
    const memory = memoryStorage()
    for (const value of ['{bad', '{}', '[{"questionId":"x"}]', '[null]']) {
      memory.setItem(COVERAGE_STORAGE_KEY, value)
      const store = createStudyCoverageStore(new BrowserStudyCoverage(() => memory))
      assert.deepEqual(store.getState().results, [])
      assert.equal(store.getState().storageAvailable, false)
    }
  })
  it('Given denied browser storage, When recording and clearing, Then keeps the app usable', () => {
    const store = createStudyCoverageStore(new BrowserStudyCoverage(() => { throw new Error('Denied') }))
    store.getState().record(result)
    assert.deepEqual(store.getState().results, [result])
    assert.equal(store.getState().storageAvailable, false)
    store.getState().clear()
    assert.deepEqual(store.getState().results, [])
  })
  it('Given quota exceeded on write, When recording, Then retains results in memory', () => {
    const memory = memoryStorage()
    const store = createStudyCoverageStore(new BrowserStudyCoverage(() => ({
      ...memory, setItem: () => { throw new Error('Quota exceeded') },
    })))
    store.getState().record(result)
    assert.equal(store.getState().results.length, 1)
    assert.equal(store.getState().storageAvailable, false)
  })
})
