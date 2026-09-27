// src/infra/ai/GeminiQuestionAuthor.ts
import type { QuestionDraft } from '../../domain/models/GeneratedQuestion.ts'
import type {
  AuthoringRequest, BlindReviewPort, QuestionAuthoringPort, QuestionReview,
} from '../../domain/ports/QuestionBankPorts.ts'
import { callGemini } from './GeminiApiClient.ts'
import { buildDraftPrompt, buildReviewPrompt } from './GeminiQuestionPrompts.ts'
import { asText, geminiUrl, parseModelJsonList } from './ModelJson.ts'

const DEF_AUTHOR_MODEL = 'gemini-3.8-flash'

export interface GeminiModelOptions {
  apiKey: string
  model?: string
  fetchFn?: typeof fetch
}

export function toReviews(items: Record<string, unknown>[]): QuestionReview[] {
  return items.map((raw) => ({
    index: Number(raw.index), solvedIndex: Number(raw.solvedIndex),
    approved: raw.approved === true, issues: asText(raw.issues),
  }))
}

/** Drafts with gemini-3.8-flash and acts as the primary blind reviewer in a separate call. */
export class GeminiQuestionAuthor implements QuestionAuthoringPort, BlindReviewPort {
  readonly generatorModel: string
  readonly model: string
  private readonly apiKey: string
  private readonly fetch: typeof fetch

  constructor(options: GeminiModelOptions) {
    this.apiKey = options.apiKey
    this.generatorModel = options.model ?? DEF_AUTHOR_MODEL
    this.model = options.model ?? DEF_AUTHOR_MODEL
    this.fetch = options.fetchFn ?? globalThis.fetch
  }

  private call(model: string, prompt: string, temperature: number, maxTokens: number, timeoutMs: number): Promise<string | null> {
    return callGemini(this.fetch, geminiUrl(model, this.apiKey), prompt, maxTokens, { json: true, temperature, timeoutMs })
  }

  async draft(request: AuthoringRequest): Promise<QuestionDraft[]> {
    const text = await this.call(this.generatorModel, buildDraftPrompt(request), 0.7, 8192, 75_000)
    return parseModelJsonList(text, 'questions').map((raw) => ({
      topicId: asText(raw.topicId), chapterId: asText(raw.chapterId),
      type: asText(raw.type) as QuestionDraft['type'], difficulty: asText(raw.difficulty) as QuestionDraft['difficulty'],
      prompt: asText(raw.prompt), options: Array.isArray(raw.options) ? raw.options.map(asText) : [],
      correctIndex: Number(raw.correctIndex), explanation: asText(raw.explanation), basis: asText(raw.basis),
    }))
  }

  async review(drafts: readonly QuestionDraft[], request: AuthoringRequest): Promise<QuestionReview[]> {
    const text = await this.call(this.model, buildReviewPrompt(drafts, request), 0, 4096, 60_000)
    return toReviews(parseModelJsonList(text, 'reviews'))
  }
}
