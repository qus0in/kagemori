import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import app, { resetDefaultStudyRepo } from '../../../worker/index.ts'
import type { GenerateExplanationParams, AiExplanationPort } from '../../../src/domain/ports/AiExplanationPort.ts'
import type { ImageDiagramPort } from '../../../src/domain/ports/SemanticPorts.ts'
import type { PublicQuestionDto, DiagramResponseDto } from '../../../src/app/dto/StudyDto.ts'

function memoryKv() {
  const store = new Map<string, string>()
  return {
    store,
    get: async (key: string, type?: 'text' | 'json') => { const v = store.get(key); return v && type === 'json' ? JSON.parse(v) : v ?? null },
    put: async (key: string, value: string) => { store.set(key, value) },
    delete: async (key: string) => { store.delete(key) },
  }
}

function fixtures() {
  const explanations: GenerateExplanationParams[] = []
  const ai = {
    generateHint: async () => 'hint',
    generateExplanation: async (params: GenerateExplanationParams) => { explanations.push(params); return `새 해설 ${explanations.length}` },
  } as unknown as AiExplanationPort
  let diagramCalls = 0
  const diagram: ImageDiagramPort = { model: 'gemini-3.1-flash-image', generate: async (input) => {
    diagramCalls++
    assert.ok(input.correctOptionText)
    return { mimeType: 'image/png', data: btoa('PNGDATA') }
  } }
  const router: DiagramRouterPort = { model: 'gemma-4-26b-a4b-it', decide: async () => ({ mode: 'structured', reason: '흐름도로 충분' }) }
  const structured: StructuredDiagramPort = { model: 'gemini-3.8-flash', draw: async () => ({ kind: 'mermaid', code: 'flowchart TD\n  A[위험] --> B[베타]' }) }
  const kv = memoryKv()
  const env = { STORAGE_MODE: 'local' as const, AI_ADAPTER: ai, DIAGRAM_PORT: diagram, DIAGRAM_ROUTERS: [router], STRUCTURED_DIAGRAM: structured, KAGEMORI_KV: kv }
  const post = (path: string, body: unknown, e: object = env) =>
    app.request(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, e)
  return { env, post, explanations, kv, diagramCalls: () => diagramCalls }
}

describe('[Integration / Infra] Feature: Post-answer explanation retry and concept diagram', () => {
  beforeEach(() => resetDefaultStudyRepo())

  it('Given an answered question, When the learner retries the explanation and asks for a diagram, Then both follow the stored answer', async () => {
    const { env, post, explanations, kv, diagramCalls } = fixtures()
    const { sessionId } = await (await post('/api/study/session', { purpose: 'DIAGNOSTIC', targetCount: 1 })).json() as { sessionId: string }
    const question = await (await app.request(`/api/study/session/${sessionId}/next`, undefined, env)).json() as PublicQuestionDto

    assert.equal((await post(`/api/study/session/${sessionId}/explanation`, { questionId: question.id })).status, 409)
    assert.equal((await post(`/api/study/session/${sessionId}/diagram`, { questionId: question.id })).status, 409)

    const chosen = question.options[1]
    await post(`/api/study/session/${sessionId}/submit`, { questionId: question.id, optionId: chosen.id, hintUsed: false, durationMs: 10 })
    const retry = await post(`/api/study/session/${sessionId}/explanation`, { questionId: question.id, previousExplanation: '이전 해설' })
    assert.equal(retry.status, 200)
    assert.equal((await retry.json() as { explanation: string }).explanation, `새 해설 ${explanations.length}`)
    const last = explanations.at(-1)!
    assert.equal(last.previousExplanation, '이전 해설')
    assert.equal(last.reviewRequested, true)
    assert.equal(last.selectedOptionText, chosen.text)

    const auto = await (await post(`/api/study/session/${sessionId}/diagram`, { questionId: question.id })).json() as DiagramResponseDto
    assert.deepEqual([auto.kind, auto.cached, auto.reason], ['mermaid', false, '흐름도로 충분'])
    assert.ok(auto.code?.startsWith('flowchart TD'))
    const again = await (await post(`/api/study/session/${sessionId}/diagram`, { questionId: question.id })).json() as DiagramResponseDto
    assert.equal(again.cached, true)

    const image = await (await post(`/api/study/session/${sessionId}/diagram`, { questionId: question.id, mode: 'image' })).json() as DiagramResponseDto & { imageKey?: string }
    const imageAgain = await (await post(`/api/study/session/${sessionId}/diagram`, { questionId: question.id, mode: 'image' })).json() as DiagramResponseDto
    assert.deepEqual([image.kind, image.cached, imageAgain.cached, diagramCalls()], ['image', false, true, 1])
    assert.equal(image.imageKey, undefined)
    const bytes = await app.request(image.imageUrl!, undefined, env)
    assert.equal(bytes.status, 200)
    assert.equal(bytes.headers.get('content-type'), 'image/png')
    assert.equal(await bytes.text(), 'PNGDATA')
    assert.ok([...kv.store.keys()].some((key) => key.startsWith('diagram:auto:') && key.includes(`:${question.id}:v`)))
  })

  it('Given a missing session or no diagram model, When requesting, Then returns 404 and 503', async () => {
    const { post, env } = fixtures()
    assert.equal((await post('/api/study/session/nope/explanation', { questionId: 'q-cma-001' })).status, 404)
    assert.equal((await post('/api/study/session/nope/diagram', { questionId: 'q-cma-001' }, { ...env, DIAGRAM_PORT: undefined, STRUCTURED_DIAGRAM: undefined, DIAGRAM_ROUTERS: undefined })).status, 503)
  })
})
