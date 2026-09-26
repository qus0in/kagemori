import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { GeminiQuestionAuthor } from '../../../src/infra/ai/GeminiQuestionAuthor.ts'
import type { AuthoringRequest } from '../../../src/domain/ports/QuestionBankPorts.ts'

const request: AuthoringRequest = {
  allocations: [{ topicId: 'topic-2-3', count: 1 }],
  topics: [{ id: 'topic-2-3', title: '투자분석기법', subjectTitle: '제2과목', weight: 12,
    chapters: [{ id: 'c5-01-01', title: '기본적 분석' }], conceptNotes: ['PER: 주가/EPS'] }],
  existingPrompts: { 'topic-2-3': ['기존 PER 문항?'] },
}
const draft = { topicId: 'topic-2-3', chapterId: 'c5-01-01', type: 'CALCULATION' as const, difficulty: 'EASY' as const,
  prompt: 'PER은?', options: ['10배', '5배', '2배', '1배'], correctIndex: 0, explanation: '비밀해설', basis: '비밀근거' }

function mockFetch(text: string, status = 200) {
  const calls: { url: string; body: any }[] = []
  const fetchFn: typeof fetch = async (input, init) => {
    calls.push({ url: input.toString(), body: JSON.parse(String(init?.body)) })
    return status === 200
      ? Response.json({ candidates: [{ content: { parts: [{ text }] } }] })
      : new Response('quota', { status })
  }
  return { fetchFn, calls }
}

describe('[Integration / Infra] Feature: GeminiQuestionAuthor', () => {
  it('Given a JSON draft response, When drafting, Then calls gemini-3.8-flash in JSON mode with topic grounding', async () => {
    const api = mockFetch('```json\n' + JSON.stringify({ questions: [draft] }) + '\n```')
    const drafts = await new GeminiQuestionAuthor({ apiKey: 'k', fetchFn: api.fetchFn }).draft(request)
    assert.deepEqual(drafts, [draft])
    assert.ok(api.calls[0].url.includes('models/gemini-3.8-flash:generateContent'))
    assert.equal(api.calls[0].body.generationConfig.responseMimeType, 'application/json')
    const prompt: string = api.calls[0].body.contents[0].parts[0].text
    for (const text of ['topic-2-3', 'c5-01-01: 기본적 분석', 'PER: 주가/EPS', '기존 PER 문항?']) assert.ok(prompt.includes(text), text)
  })

  it('Given drafts to review, When reviewing, Then hides the answer key and parses verdicts', async () => {
    const api = mockFetch(JSON.stringify({ reviews: [{ index: 0, solvedIndex: 0, approved: true, issues: '' }] }))
    const reviews = await new GeminiQuestionAuthor({ apiKey: 'k', fetchFn: api.fetchFn }).review([draft], request)
    assert.deepEqual(reviews, [{ index: 0, solvedIndex: 0, approved: true, issues: '' }])
    const prompt: string = api.calls[0].body.contents[0].parts[0].text
    assert.equal(api.calls[0].body.generationConfig.temperature, 0)
    assert.ok(prompt.includes('0. 10배') && prompt.includes('3. 1배'))
    for (const hidden of ['비밀해설', '비밀근거', 'correctIndex']) assert.ok(!prompt.includes(hidden), hidden)
  })

  it('Given quota errors or malformed JSON, When drafting, Then throws so the caller can fall back', async () => {
    await assert.rejects(new GeminiQuestionAuthor({ apiKey: 'k', fetchFn: mockFetch('', 429).fetchFn }).draft(request))
    await assert.rejects(new GeminiQuestionAuthor({ apiKey: 'k', fetchFn: mockFetch('{"items":[]}').fetchFn }).draft(request))
  })
})
