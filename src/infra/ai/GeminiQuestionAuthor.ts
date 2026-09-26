// src/infra/ai/GeminiQuestionAuthor.ts
import type { QuestionDraft } from '../../domain/models/GeneratedQuestion.ts'
import type { AuthoringRequest, QuestionAuthoringPort, QuestionReview } from '../../domain/ports/QuestionBankPorts.ts'
import { callGemini } from './GeminiApiClient.ts'
import { buildDraftPrompt, buildReviewPrompt } from './GeminiQuestionPrompts.ts'

const DEF_AUTHOR_MODEL = 'gemini-3.8-flash'

export interface GeminiQuestionAuthorOptions {
  apiKey: string
  model?: string
  fetchFn?: typeof fetch
}

function parseJson(text: string | null, key: string): unknown[] {
  if (!text) throw new Error('Gemini returned no content')
  const body = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '')
  const parsed = JSON.parse(body) as Record<string, unknown>
  const list = parsed?.[key]
  if (!Array.isArray(list)) throw new Error(`Gemini response missing ${key}`)
  return list
}

const str = (value: unknown) => (typeof value === 'string' ? value : '')

/** Drafts and blind-reviews exam questions with gemini-3.8-flash in two separate calls. */
export class GeminiQuestionAuthor implements QuestionAuthoringPort {
  readonly generatorModel: string
  readonly reviewerModel: string
  private readonly apiKey: string
  private readonly fetch: typeof fetch

  constructor(options: GeminiQuestionAuthorOptions) {
    this.apiKey = options.apiKey
    this.generatorModel = options.model ?? DEF_AUTHOR_MODEL
    this.reviewerModel = options.model ?? DEF_AUTHOR_MODEL
    this.fetch = options.fetchFn ?? globalThis.fetch
  }

  private call(model: string, prompt: string, temperature: number, maxTokens: number, timeoutMs: number): Promise<string | null> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`
    return callGemini(this.fetch, url, prompt, maxTokens, { json: true, temperature, timeoutMs })
  }

  async draft(request: AuthoringRequest): Promise<QuestionDraft[]> {
    const text = await this.call(this.generatorModel, buildDraftPrompt(request), 0.7, 8192, 75_000)
    return parseJson(text, 'questions').map((item) => {
      const raw = (item ?? {}) as Record<string, unknown>
      return {
        topicId: str(raw.topicId), chapterId: str(raw.chapterId),
        type: str(raw.type) as QuestionDraft['type'], difficulty: str(raw.difficulty) as QuestionDraft['difficulty'],
        prompt: str(raw.prompt), options: Array.isArray(raw.options) ? raw.options.map(str) : [],
        correctIndex: Number(raw.correctIndex), explanation: str(raw.explanation), basis: str(raw.basis),
      }
    })
  }

  async review(drafts: readonly QuestionDraft[], request: AuthoringRequest): Promise<QuestionReview[]> {
    const text = await this.call(this.reviewerModel, buildReviewPrompt(drafts, request), 0, 4096, 60_000)
    return parseJson(text, 'reviews').map((item) => {
      const raw = (item ?? {}) as Record<string, unknown>
      return {
        index: Number(raw.index), solvedIndex: Number(raw.solvedIndex),
        approved: raw.approved === true, issues: str(raw.issues),
      }
    })
  }
}
