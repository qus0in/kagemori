import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { GetQuestionDiagramUseCase, DiagramUnavailableError } from '../../../src/app/usecases/GetQuestionDiagramUseCase.ts'
import { InMemoryStudyRepository } from '../../../src/infra/study/InMemoryStudyRepository.ts'
import { InMemoryDiagramImageStore } from '../../../src/infra/storage/InMemoryDiagramImageStore.ts'
import type { StructuredDiagram, DiagramContent } from '../../../src/domain/models/DiagramContent.ts'
import type { DiagramRouterPort, ImageDiagramPort, StructuredDiagramPort } from '../../../src/domain/ports/SemanticPorts.ts'

async function answeredSession() {
  const repo = new InMemoryStudyRepository()
  const session = await repo.createSession('DIAGNOSTIC', 1)
  const question = (await repo.questions.findNextForSession(session))!
  session.recordAttempt({ questionId: question.id, optionId: question.correctOptionId, isCorrect: true, hintUsed: false, durationMs: 1 })
  await repo.sessions.save(session)
  return { repo, sessionId: session.sessionId, questionId: question.id }
}

const router = (mode: 'structured' | 'image' | Error, model = 'gemma-4-26b-a4b-it'): DiagramRouterPort => ({
  model, decide: async () => { if (mode instanceof Error) throw mode; return { mode, reason: `${model} 판정` } },
})
const drawer = (result: StructuredDiagram | Error) => {
  const port: StructuredDiagramPort & { calls: number } = { model: 'gemini-3.8-flash', calls: 0, draw: async () => { port.calls++; if (result instanceof Error) throw result; return result } }
  return port
}
const painter = () => {
  const port: ImageDiagramPort & { calls: number } = { model: 'gemini-3.1-flash-image', calls: 0, generate: async () => { port.calls++; return { mimeType: 'image/png', data: btoa('img') } } }
  return port
}
function memoryCache() {
  const map = new Map<string, DiagramContent>()
  return { map, get: async (k: string) => map.get(k) ?? null, put: async (k: string, v: DiagramContent) => { map.set(k, v) } }
}

async function setup(opts: { routers: DiagramRouterPort[]; structured?: StructuredDiagramPort; image?: ImageDiagramPort; withStore?: boolean }) {
  const { repo, sessionId, questionId } = await answeredSession()
  const imageStore = opts.withStore === false ? undefined : new InMemoryDiagramImageStore()
  const cache = memoryCache()
  const warnings: string[] = []
  const useCase = new GetQuestionDiagramUseCase({ sessions: repo.sessions, questions: repo.questions, concepts: repo.concepts,
    routers: opts.routers, structured: opts.structured, image: opts.image, imageStore, cache, warn: (m) => { warnings.push(m) } })
  return { useCase, sessionId, questionId, imageStore, cache, warnings }
}

const mermaid: StructuredDiagram = { kind: 'mermaid', code: 'flowchart TD\n  A --> B' }

describe('[Slice / App] Feature: Diagram representation routing', () => {
  it('Given Gemma judges structured, When drawing, Then returns validated Mermaid and caches it without images', async () => {
    const structured = drawer(mermaid)
    const image = painter()
    const { useCase, sessionId, questionId } = await setup({ routers: [router('structured')], structured, image })
    const first = await useCase.execute(sessionId, questionId)
    assert.deepEqual([first.content.kind, first.cached, first.reason], ['mermaid', false, 'gemma-4-26b-a4b-it 판정'])
    assert.equal((await useCase.execute(sessionId, questionId)).cached, true)
    assert.deepEqual([structured.calls, image.calls], [1, 0])
  })

  it('Given Gemma fails, When Flash-Lite answers image, Then stores the image in object storage', async () => {
    const image = painter()
    const { useCase, sessionId, questionId, imageStore, warnings } = await setup({
      routers: [router(new Error('down')), router('image', 'gemini-3.5-flash-lite')], structured: drawer(mermaid), image,
    })
    const result = await useCase.execute(sessionId, questionId)
    assert.equal(result.content.kind, 'image')
    assert.ok(result.content.kind === 'image' && await imageStore!.has(result.content.imageKey))
    assert.ok(warnings[0].includes('gemma-4-26b-a4b-it'))
    assert.ok(await useCase.openImage(sessionId, questionId))
  })

  it('Given every router fails and Mermaid is invalid, When drawing, Then defaults to structured and falls back to an image', async () => {
    const image = painter()
    const { useCase, sessionId, questionId } = await setup({ routers: [router(new Error('a')), router(new Error('b'))],
      structured: drawer({ kind: 'mermaid', code: 'sequenceDiagram\n A->>B: x' }), image })
    assert.equal((await useCase.execute(sessionId, questionId)).content.kind, 'image')
    assert.equal(image.calls, 1)
  })

  it('Given a forced image request, When repeated, Then generates once; without storage it is unavailable', async () => {
    const image = painter()
    const { useCase, sessionId, questionId } = await setup({ routers: [], structured: drawer(mermaid), image })
    assert.equal((await useCase.execute(sessionId, questionId, 'image')).cached, false)
    assert.equal((await useCase.execute(sessionId, questionId, 'image')).cached, true)
    assert.equal(image.calls, 1)
    const bare = await setup({ routers: [], structured: drawer(new Error('x')), image: painter(), withStore: false })
    await assert.rejects(bare.useCase.execute(bare.sessionId, bare.questionId, 'image'), DiagramUnavailableError)
    await assert.rejects(bare.useCase.execute(bare.sessionId, bare.questionId), DiagramUnavailableError)
  })
})
