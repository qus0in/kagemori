// src/infra/ai/TextDiagramModels.ts
import { validateStructuredDiagram, type StructuredDiagram } from '../../domain/models/DiagramContent.ts'
import type { DiagramDecision, DiagramInput, DiagramRouterPort, StructuredDiagramPort } from '../../domain/ports/SemanticPorts.ts'
import { callGemini } from './GeminiApiClient.ts'
import { buildRouterPrompt, buildStructuredPrompt } from './DiagramPrompts.ts'
import type { GeminiModelOptions } from './GeminiQuestionAuthor.ts'
import { asText, geminiUrl } from './ModelJson.ts'
import { PRIMARY_TEXT_MODEL, ReviewedTextClient, reviewedTextIdentity } from './ReviewedTextClient.ts'

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

/** Lite writes diagrams; Gemma reviews, and Flash repairs rejected or invalid drafts. */
export class GeminiStructuredDiagramAdapter implements StructuredDiagramPort {
  readonly model: string
  private readonly options: GeminiModelOptions

  constructor(options: GeminiModelOptions) {
    this.options = options
    this.model = reviewedTextIdentity(options.model ?? PRIMARY_TEXT_MODEL)
  }

  async draw(input: DiagramInput): Promise<StructuredDiagram> {
    const parse = (text: string): StructuredDiagram => {
      const raw = parseObject(text)
      if (raw.kind !== 'table' && raw.kind !== 'mermaid') throw new Error('Unknown diagram kind')
      const diagram: StructuredDiagram = raw.kind === 'table'
        ? { kind: 'table', markdown: asText(raw.markdown) } : { kind: 'mermaid', code: asText(raw.code) }
      const valid = validateStructuredDiagram(diagram)
      if (!valid) throw new Error('Invalid structured diagram')
      return valid
    }
    const text = await new ReviewedTextClient(this.options).execute({
      model: this.options.model ?? PRIMARY_TEXT_MODEL, prompt: buildStructuredPrompt(input), tokens: 2048,
      json: true, validate: (text) => !!parse(text),
    })
    if (!text) throw new Error('No reviewed structured diagram')
    return parse(text)
  }
}
