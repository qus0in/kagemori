// test/unit/infra/DurableObjectSessionRepository.test.ts
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  DurableObjectSessionRepository,
  type DurableObjectNamespaceLike,
  type DurableObjectStubLike,
} from '../../../src/infra/study/DurableObjectSessionRepository.ts'
import { PracticeSession } from '../../../src/domain/models/PracticeSession.ts'
import type { PracticeSessionProps } from '../../../src/domain/models/PracticeSessionTypes.ts'
import type { CloudflareKvBinding } from '../../../src/infra/study/KvSessionCache.ts'

describe('[Unit / Infra] Feature: DurableObjectSessionRepository with DO & KV', () => {
  function createMockKv(): { kv: CloudflareKvBinding; store: Map<string, string> } {
    const store = new Map<string, string>()
    const kv: CloudflareKvBinding = {
      async get(key: string, type?: 'text' | 'json') {
        const val = store.get(key)
        if (!val) return null
        return type === 'json' ? JSON.parse(val) : val
      },
      async put(key: string, value: string) {
        store.set(key, value)
      },
      async delete(key: string) {
        store.delete(key)
      },
    }
    return { kv, store }
  }

  function createMockDoNamespace(): {
    ns: DurableObjectNamespaceLike
    doStore: Map<string, PracticeSessionProps>
  } {
    const doStore = new Map<string, PracticeSessionProps>()
    const ns: DurableObjectNamespaceLike = {
      idFromName(name: string) {
        return name
      },
      get(id: unknown): DurableObjectStubLike {
        const name = String(id)
        return {
          async getSession() {
            return doStore.get(name) ?? null
          },
          async saveSession(props: PracticeSessionProps) {
            doStore.set(name, props)
          },
          async fetch() {
            return new Response('ok')
          },
        }
      },
    }
    return { ns, doStore }
  }

  describe('Scenario: Saving and loading session with Durable Object & KV', () => {
    it('Given mock DO and KV, When session is saved and queried, Then persists to both and retrieves successfully', async () => {
      const { ns, doStore } = createMockDoNamespace()
      const { kv, store: kvStore } = createMockKv()

      const repo = new DurableObjectSessionRepository(ns, kv)
      const session = new PracticeSession({
        sessionId: 'sess-1790418808436-improvement-5-abcde',
        learnerId: 'guest-learner',
        purpose: 'IMPROVEMENT',
        blueprintId: 'blueprint-round-47',
        targetQuestionCount: 5,
      })

      // When
      await repo.save(session)

      // Then: DO contains session props
      assert.ok(doStore.has('sess-1790418808436-improvement-5-abcde'))
      assert.equal(doStore.get('sess-1790418808436-improvement-5-abcde')?.targetQuestionCount, 5)

      // Then: KV contains session metadata and state
      assert.ok(kvStore.has('session:sess-1790418808436-improvement-5-abcde'))
      assert.ok(kvStore.has('session_state:sess-1790418808436-improvement-5-abcde'))

      // When queried
      const loaded = await repo.findById('sess-1790418808436-improvement-5-abcde')
      assert.ok(loaded)
      assert.equal(loaded.sessionId, 'sess-1790418808436-improvement-5-abcde')
      assert.equal(loaded.purpose, 'IMPROVEMENT')
    })

    it('Given DO unavailable but KV populated, When findById is called, Then recovers session from KV', async () => {
      const { kv, store: kvStore } = createMockKv()
      const repo = new DurableObjectSessionRepository(undefined, kv)
      kvStore.set('session_state:sess-from-kv', JSON.stringify({
        sessionId: 'sess-from-kv', learnerId: 'guest', purpose: 'DIAGNOSTIC', blueprintId: 'bp',
        targetQuestionCount: 6, currentQuestionIndex: 2, isCompleted: false,
        attempts: [{ questionId: 'q1', optionId: 'o1', isCorrect: true, hintUsed: false, durationMs: 1000 }],
      }))
      const recovered = await repo.findById('sess-from-kv')
      assert.ok(recovered)
      assert.equal(recovered.attempts.length, 1)
      assert.equal(recovered.currentQuestionIndex, 2)
    })
  })

  describe('Scenario: Fallback when bindings are absent', () => {
    it('Given no DO or KV bindings, When session is saved, Then uses in-memory fallback smoothly', async () => {
      const repo = new DurableObjectSessionRepository(undefined, undefined)
      const session = new PracticeSession({
        sessionId: 'sess-1790418808436-diagnostic-6-local',
        learnerId: 'guest-learner',
        purpose: 'DIAGNOSTIC',
        blueprintId: 'blueprint-round-47',
        targetQuestionCount: 6,
      })

      await repo.save(session)
      const loaded = await repo.findById('sess-1790418808436-diagnostic-6-local')
      assert.ok(loaded)
      assert.equal(loaded.sessionId, 'sess-1790418808436-diagnostic-6-local')
      assert.equal(loaded.purpose, 'DIAGNOSTIC')
    })
  })
})
