// src/infra/ai/GemmaQuestionModels.ts
import type { QuestionDraft } from '../../domain/models/GeneratedQuestion.ts'
import type {
  AuthoringRequest, BlindReviewPort, DraftScreenPort, DraftScreening, QuestionReview,
} from '../../domain/ports/QuestionBankPorts.ts'
import { callGemini } from './GeminiApiClient.ts'
import { buildReviewPrompt, buildScreenPrompt } from './GeminiQuestionPrompts.ts'
import { asText, geminiUrl, parseModelJsonList } from './ModelJson.ts'
import { toReviews, type GeminiModelOptions } from './GeminiQuestionAuthor.ts'

const JSON_ONLY = '\n\n반드시 JSON 객체 하나만 출력하세요.'

abstract class GemmaModel {
  readonly model: string
  private readonly apiKey: string
  private readonly fetch: typeof fetch

  constructor(options: GeminiModelOptions, defaultModel: string) {
    this.apiKey = options.apiKey
    this.model = options.model ?? defaultModel
    this.fetch = options.fetchFn ?? globalThis.fetch
  }

  // Gemma on the Gemini API has no documented JSON mode, so parse leniently.
  protected call(prompt: string, maxTokens: number, timeoutMs: number): Promise<string | null> {
    return callGemini(this.fetch, geminiUrl(this.model, this.apiKey), prompt, maxTokens, { temperature: 0, timeoutMs })
  }
}

/** gemma-4-31b-it: independent blind solver from a different model family. */
export class GemmaBlindReviewer extends GemmaModel implements BlindReviewPort {
  constructor(options: GeminiModelOptions) { super(options, 'gemma-4-31b-it') }

  async review(drafts: readonly QuestionDraft[], request: AuthoringRequest): Promise<QuestionReview[]> {
    const text = await this.call(buildReviewPrompt(drafts, request) + JSON_ONLY, 4096, 60_000)
    return toReviews(parseModelJsonList(text, 'reviews'))
  }
}

/** gemma-4-26b-a4b-it (MoE): fast format/topic screening and core-issue tagging. */
export class GemmaDraftScreener extends GemmaModel implements DraftScreenPort {
  constructor(options: GeminiModelOptions) { super(options, 'gemma-4-26b-a4b-it') }

  async screen(drafts: readonly QuestionDraft[], request: AuthoringRequest): Promise<DraftScreening[]> {
    const text = await this.call(buildScreenPrompt(drafts, request), 2048, 30_000)
    return parseModelJsonList(text, 'screens').map((raw) => ({
      index: Number(raw.index), keep: raw.keep !== false, issue: asText(raw.issue).slice(0, 80),
    }))
  }
}
