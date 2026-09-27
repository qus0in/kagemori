import '../../helpers/registerTsx.ts'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ModelDiagramRouter, GeminiStructuredDiagramAdapter } from '../../../src/infra/ai/TextDiagramModels.ts'
import { R2DiagramImageStore, type R2BucketLike } from '../../../src/infra/storage/R2DiagramImageStore.ts'

const { QuestionPostAnswerTools } = await import('../../../src/ui/components/question/QuestionPostAnswerTools.tsx')
const input = { topicTitle: 'CAPM', conceptBody: '체계적 위험만 보상', questionPrompt: 'q', correctOptionText: 'β', explanation: 'e' }

function recorder(text: string) {
  const calls: { url: string; body: any }[] = []
  const fetchFn: typeof fetch = async (url, init) => {
    calls.push({ url: String(url), body: JSON.parse(String(init?.body)) })
    return Response.json({ candidates: [{ content: { parts: [{ text }] } }] })
  }
  return { fetchFn, calls }
}

describe('[Integration / Infra] Feature: Diagram routing, structured drawing and R2 storage', () => {
  it('Given Gemma and Flash-Lite routers, When deciding, Then only Flash-Lite uses JSON mode and both parse the verdict', async () => {
    const gemma = recorder('판정: {"mode":"image","reason":"음영 영역 필요"}')
    assert.deepEqual(await new ModelDiagramRouter({ apiKey: 'k', model: 'gemma-4-26b-a4b-it', fetchFn: gemma.fetchFn }, false).decide(input),
      { mode: 'image', reason: '음영 영역 필요' })
    assert.equal(gemma.calls[0].body.generationConfig.responseMimeType, undefined)
    const lite = recorder('{"mode":"structured","reason":"표"}')
    await new ModelDiagramRouter({ apiKey: 'k', model: 'gemini-3.5-flash-lite', fetchFn: lite.fetchFn }, true).decide(input)
    assert.ok(lite.calls[0].url.includes('models/gemini-3.5-flash-lite:generateContent'))
    assert.equal(lite.calls[0].body.generationConfig.responseMimeType, 'application/json')
    await assert.rejects(new ModelDiagramRouter({ apiKey: 'k', model: 'x', fetchFn: recorder('{"mode":"video"}').fetchFn }, true).decide(input))
  })

  it('Given 3.8 Flash output, When drawing structured diagrams, Then maps Mermaid and tables', async () => {
    const mermaid = recorder(JSON.stringify({ kind: 'mermaid', code: 'flowchart TD\n A-->B' }))
    assert.deepEqual(await new GeminiStructuredDiagramAdapter({ apiKey: 'k', fetchFn: mermaid.fetchFn }).draw(input), { kind: 'mermaid', code: 'flowchart TD\n A-->B' })
    assert.ok(mermaid.calls[0].url.includes('models/gemini-3.8-flash:generateContent'))
    assert.ok(mermaid.calls[0].body.contents[0].parts[0].text.includes('%%{init} 지시문'))
    const table = recorder(JSON.stringify({ kind: 'table', markdown: '| a |\n| --- |' }))
    assert.equal((await new GeminiStructuredDiagramAdapter({ apiKey: 'k', fetchFn: table.fetchFn }).draw(input)).kind, 'table')
  })

  it('Given an R2 bucket, When storing an image, Then writes decoded bytes with immutable caching and reads them back', async () => {
    const objects = new Map<string, { bytes: Uint8Array; contentType?: string; cacheControl?: string }>()
    const bucket: R2BucketLike = {
      head: async (key) => objects.get(key) ?? null,
      put: async (key, value, options) => { objects.set(key, { bytes: new Uint8Array(value as Uint8Array), ...options?.httpMetadata }) },
      get: async (key) => {
        const object = objects.get(key)
        return object ? { body: new Response(object.bytes).body!, httpMetadata: { contentType: object.contentType } } : null
      },
    }
    const store = new R2DiagramImageStore(bucket)
    assert.equal(await store.has('diagrams/m/q/v1'), false)
    await store.put('diagrams/m/q/v1', { mimeType: 'image/png', data: btoa('PNG') })
    assert.equal(await store.has('diagrams/m/q/v1'), true)
    assert.equal(objects.get('diagrams/m/q/v1')?.cacheControl, 'private, max-age=31536000, immutable')
    const image = await store.get('diagrams/m/q/v1')
    assert.equal(image?.mimeType, 'image/png')
    assert.equal(await new Response(image!.body).text(), 'PNG')
  })

  it('Given structured results, When rendered, Then shows a table or a Mermaid placeholder with an image option', () => {
    const render = (diagram: object) => renderToStaticMarkup(createElement(QuestionPostAnswerTools, { onRequestDiagram: () => {}, diagram }))
    const table = render({ kind: 'table', model: 'm', cached: false, markdown: '| a | b |\n| --- | --- |\n| 1 | 2 |' })
    assert.ok(table.includes('<table>') && table.includes('이미지로 보기') && table.includes('AI 작성 도식'))
    assert.ok(render({ kind: 'mermaid', model: 'm', cached: false, code: 'flowchart TD\n A-->B' }).includes('도식을 그리는 중'))
  })
})
