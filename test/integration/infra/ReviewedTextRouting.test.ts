import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { GeminiAiAdapter } from '../../../src/infra/ai/GeminiAiAdapter.ts'
import { GeminiStructuredDiagramAdapter } from '../../../src/infra/ai/TextDiagramModels.ts'
import { aiCacheKey } from '../../../src/infra/ai/KvAiResponseCache.ts'
import { buildExplanationPrompt } from '../../../src/infra/ai/GeminiPromptTemplates.ts'

const lite = 'gemini-3.5-flash-lite'
const gemma = 'gemma-4-26b-a4b-it'
const flash = 'gemini-3.8-flash'
const params = { conceptBody: '근거', questionPrompt: '질문', selectedOptionText: 'A', correctOptionText: 'A',
  isCorrect: true, questionExplanation: '저장된 해설' }
const approval = JSON.stringify({ reviews: [{ approved: true, issues: '' }] })
const rejection = JSON.stringify({ reviews: [{ approved: false, issues: '계산 오류' }] })

function setup(responses: (string | null | Error)[]) {
  const calls: { model: string; prompt: string; config: Record<string, unknown> }[] = []
  const store = new Map<string, string>()
  const cache = { get: async (key: string) => store.get(key) ?? null,
    put: async (key: string, value: string) => { store.set(key, value) } }
  const fetchFn: typeof fetch = async (url, init) => {
    const body = JSON.parse(String(init?.body))
    calls.push({ model: String(url).split('/models/')[1].split(':')[0],
      prompt: body.contents[0].parts[0].text, config: body.generationConfig })
    const text = responses.shift()
    if (text instanceof Error) throw text
    if (text == null) return new Response('', { status: 503 })
    return Response.json({ candidates: [{ content: { parts: [{ text }] } }] })
  }
  return { calls, store, cache, fetchFn, adapter: new GeminiAiAdapter({ apiKey: 'k', fetchFn, cache }) }
}

describe('[Integration / Infra] Feature: Lite-first serving with quality escalation', () => {
  it('Given an approved explanation, When repeated, Then serves Lite and caches only the reviewed result', async () => {
    const s = setup(['초안', approval])
    assert.equal(await s.adapter.generateExplanation(params), '초안')
    assert.equal(await s.adapter.generateExplanation(params), '초안')
    assert.deepEqual(s.calls.map((c) => c.model), [lite, gemma])
    assert.equal(s.calls[1].config.responseMimeType, undefined)
    assert.ok(s.calls[1].prompt.includes('저장된 해설'))
    assert.deepEqual([...s.store.values()], ['초안'])
  })

  for (const verdict of [rejection, 'not JSON', '{"reviews":[{"approved":"true","issues":""}]}',
    '{"reviews":[]}', null, new Error('timeout')]) {
    it(`Given review ${String(verdict)}, When explaining, Then routes to Flash and never caches the draft`, async () => {
      const s = setup(['잘못된 초안', verdict, '보정된 해설'])
      assert.equal(await s.adapter.generateExplanation(params), '보정된 해설')
      assert.equal(await s.adapter.generateExplanation(params), '보정된 해설')
      assert.deepEqual(s.calls.map((c) => c.model), [lite, gemma, flash])
      assert.ok(s.calls[2].prompt.includes('잘못된 초안'))
      if (verdict === rejection) assert.ok(s.calls[2].prompt.includes('계산 오류'))
      assert.deepEqual([...s.store.values()], ['보정된 해설'])
    })
  }

  it('Given Lite is unavailable, When requesting a hint, Then bypasses review and escalates once', async () => {
    const s = setup([null, '검토된 힌트'])
    assert.equal(await s.adapter.generateHint('개념', '질문'), '검토된 힌트')
    assert.deepEqual(s.calls.map((c) => c.model), [lite, flash])
    assert.ok(s.calls[1].prompt.includes('정답이 되는 용어·수치·선지 문장을 직접 쓰지 말고'))
  })

  it('Given rejected content and Flash failure, When explaining, Then returns the stored explanation without caching', async () => {
    const s = setup(['오류', rejection, null])
    assert.equal(await s.adapter.generateExplanation(params), '저장된 해설')
    assert.equal(s.store.size, 0)
  })

  it('Given a learner challenge without prior text, When requested, Then bypasses the normal cached answer', async () => {
    const s = setup(['초안', approval, '재검증 해설'])
    await s.adapter.generateExplanation(params)
    assert.equal(await s.adapter.generateExplanation({ ...params, reviewRequested: true }), '재검증 해설')
    assert.deepEqual(s.calls.map((c) => c.model), [lite, gemma, flash])
    assert.equal(s.store.size, 2)
  })

  it('Given a previous explanation, When regenerated, Then goes directly to Flash with revalidation instructions', async () => {
    const s = setup(['새 해설'])
    assert.equal(await s.adapter.generateExplanation({ ...params, previousExplanation: '이전 해설' }), '새 해설')
    assert.deepEqual(s.calls.map((c) => c.model), [flash])
    assert.ok(s.calls[0].prompt.includes('기존 해설을 사실로 전제하지 말고'))
  })

  it('Given a legacy unreviewed cache entry, When explaining, Then uses the new reviewed policy', async () => {
    const s = setup(['검토할 초안', approval])
    s.store.set(await aiCacheKey(lite, 2048, buildExplanationPrompt(params)), '미검토 결과')
    assert.equal(await s.adapter.generateExplanation(params), '검토할 초안')
    assert.deepEqual(s.calls.map((c) => c.model), [lite, gemma])
  })

  for (const badDraft of ['not JSON', '{"kind":"mermaid","code":"flowchart TD\nclick A evil"}'.replace('\n', '\\n')]) {
    it('Given an invalid diagram, When drawing, Then Flash repairs it before image fallback', async () => {
      const s = setup([badDraft, JSON.stringify({ kind: 'mermaid', code: 'flowchart TD\n A-->B' })])
      const diagram = new GeminiStructuredDiagramAdapter({ apiKey: 'k', fetchFn: s.fetchFn })
      assert.deepEqual(await diagram.draw({ ...params, topicTitle: '주제', explanation: '근거' }),
        { kind: 'mermaid', code: 'flowchart TD\n A-->B' })
      assert.deepEqual(s.calls.map((c) => c.model), [lite, flash])
      assert.equal(s.calls[1].config.responseMimeType, 'application/json')
    })
  }
})
