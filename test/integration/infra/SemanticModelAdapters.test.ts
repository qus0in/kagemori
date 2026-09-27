import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { GeminiEmbeddingAdapter } from '../../../src/infra/ai/GeminiEmbeddingAdapter.ts'
import { GeminiDiagramAdapter } from '../../../src/infra/ai/GeminiDiagramAdapter.ts'
import { GemmaBlindReviewer, GemmaDraftScreener } from '../../../src/infra/ai/GemmaQuestionModels.ts'
import { VectorizeQuestionIndex, type VectorizeLike } from '../../../src/infra/vector/VectorizeQuestionIndex.ts'
import { buildExplanationPrompt } from '../../../src/infra/ai/GeminiPromptTemplates.ts'
import { callGemini } from '../../../src/infra/ai/GeminiApiClient.ts'
import type { AuthoringRequest } from '../../../src/domain/ports/QuestionBankPorts.ts'
import { sqliteD1 } from '../../helpers/storageHarness.ts'

function recorder(respond: (body: any) => unknown, status = 200) {
  const calls: { url: string; body: any }[] = []
  const fetchFn: typeof fetch = async (input, init) => {
    const body = JSON.parse(String(init?.body))
    calls.push({ url: input.toString(), body })
    return status === 200 ? Response.json(respond(body)) : new Response('err', { status })
  }
  return { fetchFn, calls }
}
const textReply = (text: string) => () => ({ candidates: [{ content: { parts: [{ text }] } }] })
const request: AuthoringRequest = { allocations: [{ topicId: 't', count: 1 }], topics: [{ id: 't', title: '채권', subjectTitle: 's', weight: 6, chapters: [], conceptNotes: [] }], existingPrompts: {} }
const draft = { topicId: 't', chapterId: 'c', type: 'CONCEPT' as const, difficulty: 'EASY' as const, prompt: '듀레이션은?', options: ['a', 'b', 'c', 'd'], correctIndex: 1, explanation: 'x', basis: 'y' }

describe('[Integration / Infra] Feature: Embedding, Gemma and image model adapters', () => {
  it('Given texts, When embedding, Then batches gemini-embedding-2 at 768 dims and rejects wrong shapes', async () => {
    const api = recorder((body) => ({ embeddings: body.requests.map(() => ({ values: new Array(768).fill(0.1) })) }))
    const vectors = await new GeminiEmbeddingAdapter({ apiKey: 'k', fetchFn: api.fetchFn }).embed(['가', '나'])
    assert.equal(vectors.length, 2)
    assert.ok(api.calls[0].url.includes('models/gemini-embedding-2:batchEmbedContents'))
    assert.equal(api.calls[0].body.requests[0].output_dimensionality, 768)
    assert.equal(api.calls[0].body.requests[0].content.parts[0].text, 'task: sentence similarity | query: 가')
    const short = recorder(() => ({ embeddings: [{ values: [1, 2] }] }))
    await assert.rejects(new GeminiEmbeddingAdapter({ apiKey: 'k', fetchFn: short.fetchFn }).embed(['가']))
  })

  it('Given Gemma prose-wrapped JSON, When reviewing and screening, Then parses without JSON mode', async () => {
    const review = recorder(textReply('검토 결과입니다.\n{"reviews":[{"index":0,"solvedIndex":1,"approved":true,"issues":""}]}\n끝'))
    assert.deepEqual(await new GemmaBlindReviewer({ apiKey: 'k', fetchFn: review.fetchFn }).review([draft], request),
      [{ index: 0, solvedIndex: 1, approved: true, issues: '' }])
    assert.ok(review.calls[0].url.includes('models/gemma-4-31b-it:generateContent'))
    assert.equal(review.calls[0].body.generationConfig.responseMimeType, undefined)
    assert.ok(!JSON.stringify(review.calls[0].body).includes('"correctIndex"'))

    const screen = recorder(textReply('```json\n{"screens":[{"index":0,"keep":false,"issue":"듀레이션 정의"}]}\n```'))
    assert.deepEqual(await new GemmaDraftScreener({ apiKey: 'k', fetchFn: screen.fetchFn }).screen([draft], request),
      [{ index: 0, keep: false, issue: '듀레이션 정의' }])
    assert.ok(screen.calls[0].url.includes('models/gemma-4-26b-a4b-it:generateContent'))
  })

  it('Given an image response, When drawing a diagram, Then requests IMAGE modality and returns inline data', async () => {
    const api = recorder(() => ({ candidates: [{ content: { parts: [{ inlineData: { mimeType: 'image/png', data: 'AAA' } }] } }] }))
    const input = { topicTitle: '듀레이션', conceptBody: '듀레이션 정의', questionPrompt: '듀레이션은?', correctOptionText: 'b', explanation: 'x' }
    const image = await new GeminiDiagramAdapter({ apiKey: 'k', fetchFn: api.fetchFn }).generate(input)
    assert.deepEqual(image, { mimeType: 'image/png', data: 'AAA' })
    assert.ok(api.calls[0].url.includes('models/gemini-3.1-flash-image:generateContent'))
    assert.deepEqual(api.calls[0].body.generationConfig.responseModalities, ['IMAGE'])
    const empty = recorder(textReply('no image'))
    await assert.rejects(new GeminiDiagramAdapter({ apiKey: 'k', fetchFn: empty.fetchFn }).generate(input))
  })

  it('Given thought parts or a retry request, When prompting text models, Then drops thoughts and asks for a new angle', async () => {
    const api = recorder(() => ({ candidates: [{ content: { parts: [{ text: '생각', thought: true }, { text: '답' }] } }] }))
    assert.equal(await callGemini(api.fetchFn, 'https://x', 'p', 10), '답')
    const prompt = buildExplanationPrompt({ conceptBody: 'c', questionPrompt: 'q', selectedOptionText: 's', correctOptionText: 's', isCorrect: true, previousExplanation: '예전 해설' })
    assert.ok(prompt.includes('[재요청]') && prompt.includes('예전 해설'))
  })

  it('Given a Vectorize binding, When indexing, Then records the ledger in D1 and maps query metadata', async () => {
    const { db, sqlite } = sqliteD1()
    const stored = new Map<string, { id: string; values: number[]; metadata?: Record<string, string> }>()
    const binding: VectorizeLike = {
      upsert: async (vectors) => { vectors.forEach((v) => stored.set(v.id, v)) },
      query: async () => ({ matches: [...stored.values()].map((v) => ({ id: v.id, score: 0.93, metadata: v.metadata })) }),
      getByIds: async (ids) => ids.flatMap((id) => stored.get(id) ?? []),
    }
    const index = new VectorizeQuestionIndex(binding, db, 'gemini-embedding-2')
    await index.upsert([{ id: 'q1', topicId: 'topic-3-6', values: [1, 0] }])
    assert.deepEqual(await index.missing(['q1', 'q2']), ['q2'])
    assert.deepEqual(await index.query([1, 0], 3), [{ id: 'q1', topicId: 'topic-3-6', score: 0.93 }])
    assert.deepEqual(await index.vectors(['q1']), [{ id: 'q1', topicId: 'topic-3-6', values: [1, 0] }])
    assert.deepEqual(await new VectorizeQuestionIndex(binding, db, 'other-model').missing(['q1']), ['q1'])
    sqlite.close()
  })
})
