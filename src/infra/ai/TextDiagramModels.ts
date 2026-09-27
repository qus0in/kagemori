// src/infra/ai/TextDiagramModels.ts
import type { StructuredDiagram } from '../../domain/models/DiagramContent.ts'
import type { DiagramDecision, DiagramInput, DiagramRouterPort, StructuredDiagramPort } from '../../domain/ports/SemanticPorts.ts'
import { callGemini } from './GeminiApiClient.ts'
import { buildRouterPrompt, buildStructuredPrompt } from './DiagramPrompts.ts'
import type { GeminiModelOptions } from './GeminiQuestionAuthor.ts'
import { asText, geminiUrl } from './ModelJson.ts'

function parseObject(text: string | null): Record<string, unknown> {
  if (!text) throw new Error('Model returned no content')
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start < 0 || end <= start) throw new Error('Model response is not JSON')
  return JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>
}

/** Representation judge; Gemma has no JSON mode, so `json` is false for it. */
export class ModelDiagramRouter implements DiagramRouterPort {
  readonly model: string
  private readonly options: GeminiModelOptions
  private readonly json: boolean

  constructor(options: GeminiModelOptions & { model: string }, json: boolean) {
    this.options = options
    this.model = options.model
    this.json = json
  }

  async decide(input: DiagramInput): Promise<DiagramDecision> {
    const text = await callGemini(this.options.fetchFn ?? globalThis.fetch, geminiUrl(this.model, this.options.apiKey),
      buildRouterPrompt(input), 512, { json: this.json, temperature: 0, timeoutMs: 15_000 })
    const raw = parseObject(text)
    if (raw.mode !== 'structured' && raw.mode !== 'image') throw new Error(`Unknown diagram mode: ${String(raw.mode)}`)
    return { mode: raw.mode, reason: asText(raw.reason).slice(0, 200) }
  }
}

/** gemini-3.8-flash writes Mermaid or a GFM table; the browser renders it exactly. */
export class GeminiStructuredDiagramAdapter implements StructuredDiagramPort {
  readonly model: string
  private readonly options: GeminiModelOptions

  constructor(options: GeminiModelOptions) {
    this.options = options
    this.model = options.model ?? 'gemini-3.8-flash'
  }

  async draw(input: DiagramInput): Promise<StructuredDiagram> {
    const text = await callGemini(this.options.fetchFn ?? globalThis.fetch, geminiUrl(this.model, this.options.apiKey),
      buildStructuredPrompt(input), 2048, { json: true, temperature: 0.2, timeoutMs: 45_000 })
    const raw = parseObject(text)
    return raw.kind === 'table' ? { kind: 'table', markdown: asText(raw.markdown) } : { kind: 'mermaid', code: asText(raw.code) }
  }
}
