// test/integration/infra/KvAiResponseCache.test.ts
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { GeminiAiAdapter } from '../../../src/infra/ai/GeminiAiAdapter.ts'
import { KvAiResponseCache } from '../../../src/infra/ai/KvAiResponseCache.ts'
import type { CloudflareKvBinding } from '../../../src/infra/study/KvSessionCache.ts'

function memoryKv(failing = false): CloudflareKvBinding & { store: Map<string, string> } {
  const store = new Map<string, string>()
  return {
    store,
    async get(key) { if (failing) throw new Error('kv down'); return store.get(key) ?? null },
    async put(key, value) { if (failing) throw new Error('kv down'); store.set(key, value) },
    async delete(key) { store.delete(key) },
  }
}

const approved = JSON.stringify({ reviews: [{ approved: true, issues: '' }] })

function countingFetch(responses: Array<string | null>) {
  let calls = 0
  const fetchFn: typeof fetch = async () => {
    const text = responses[Math.min(calls++, responses.length - 1)]
    if (text === null) return new Response('quota exceeded', { status: 429 })
    return Response.json({ candidates: [{ content: { parts: [{ text }] } }] })
  }
  return { fetchFn, calls: () => calls }
}

describe('[Integration / Infra] Feature: KvAiResponseCache', () => {
  describe('Scenario: Reusing Gemini responses for identical prompts', () => {
    it('Given a cached hint, When the same hint is requested again, Then the generation and review run only once', async () => {
      // Given
      const kv = memoryKv()
      const api = countingFetch(['AI 힌트', approved])
      const adapter = new GeminiAiAdapter({ apiKey: 'k', fetchFn: api.fetchFn, cache: new KvAiResponseCache(kv) })

      // When
      const first = await adapter.generateHint('개념', '질문')
      const second = await adapter.generateHint('개념', '질문')

      // Then
      assert.equal(first, 'AI 힌트')
      assert.equal(second, 'AI 힌트')
      assert.equal(api.calls(), 2)
      assert.equal(kv.store.size, 1)
      assert.ok([...kv.store.keys()][0].startsWith('ai:'))
    })

    it('Given a different prompt, When a hint is requested, Then a new cache key calls Gemini again', async () => {
      const api = countingFetch(['A', approved, 'B', approved])
      const adapter = new GeminiAiAdapter({ apiKey: 'k', fetchFn: api.fetchFn, cache: new KvAiResponseCache(memoryKv()) })

      assert.equal(await adapter.generateHint('개념', '질문 1'), 'A')
      assert.equal(await adapter.generateHint('개념', '질문 2'), 'B')
      assert.equal(api.calls(), 4)
    })
  })

  describe('Scenario: Failures never poison or block the cache', () => {
    it('Given Gemini fails, When a hint is requested, Then the fallback is returned and not cached', async () => {
      const kv = memoryKv()
      const api = countingFetch([null, null, 'AI 힌트', approved])
      const adapter = new GeminiAiAdapter({ apiKey: 'k', fetchFn: api.fetchFn, cache: new KvAiResponseCache(kv) })

      const fallback = await adapter.generateHint('개념 본문', '질문')
      assert.equal(kv.store.size, 0)
      const retried = await adapter.generateHint('개념 본문', '질문')

      assert.ok(fallback.includes('[학습 힌트]'))
      assert.equal(retried, 'AI 힌트')
      assert.equal(api.calls(), 4)
    })

    it('Given KV is unavailable, When an explanation is requested, Then Gemini output is still returned', async () => {
      const api = countingFetch(['AI 해설', approved])
      const adapter = new GeminiAiAdapter({ apiKey: 'k', fetchFn: api.fetchFn, cache: new KvAiResponseCache(memoryKv(true)) })

      const explanation = await adapter.generateExplanation({
        conceptBody: '개념', questionPrompt: '질문', selectedOptionText: 'A', correctOptionText: 'A', isCorrect: true,
      })

      assert.equal(explanation, 'AI 해설')
      assert.equal(api.calls(), 2)
    })
  })
})
