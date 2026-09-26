// src/infra/ai/GeminiAiAdapter.ts
import type {
  AiExplanationPort,
  GenerateExplanationParams,
} from '../../domain/ports/AiExplanationPort.ts'
import { callGemini } from './GeminiApiClient.ts'
import { aiCacheKey, type AiResponseCache } from './KvAiResponseCache.ts'
import {
  buildHintPrompt,
  buildExplanationPrompt,
  fallbackHint,
  fallbackExplanation,
} from './GeminiPromptTemplates.ts'

const DEF_HINT_MODEL = 'gemini-3.5-flash-lite'
const DEF_EXPLANATION_MODEL = 'gemini-3.8-flash'

export interface GeminiAiAdapterOptions {
  apiKey?: string
  hintModel?: string
  explanationModel?: string
  fetchFn?: typeof fetch
  cache?: AiResponseCache
}

export class GeminiAiAdapter implements AiExplanationPort {
  private readonly apiKey?: string
  private readonly hintModel: string
  private readonly explanationModel: string
  private readonly fetch: typeof fetch
  private readonly cache?: AiResponseCache

  constructor(options: GeminiAiAdapterOptions = {}) {
    this.apiKey = options.apiKey
    this.hintModel = options.hintModel || DEF_HINT_MODEL
    this.explanationModel = options.explanationModel || DEF_EXPLANATION_MODEL
    this.fetch = options.fetchFn || globalThis.fetch
    this.cache = options.cache
  }

  private async executePrompt(
    model: string,
    prompt: string,
    tokens: number,
    fallback: string
  ): Promise<string> {
    if (!this.apiKey) return fallback
    try {
      const key = this.cache ? await aiCacheKey(model, tokens, prompt) : ''
      const cached = this.cache ? await this.cache.get(key) : null
      if (cached) return cached
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`
      const res = await callGemini(this.fetch, url, prompt, tokens)
      if (!res) return fallback
      if (this.cache) await this.cache.put(key, res)
      return res
    } catch {
      return fallback
    }
  }

  async generateHint(conceptBody: string, questionPrompt: string): Promise<string> {
    const prompt = buildHintPrompt(conceptBody, questionPrompt)
    return this.executePrompt(this.hintModel, prompt, 500, fallbackHint(conceptBody, questionPrompt))
  }

  async generateExplanation(params: GenerateExplanationParams): Promise<string>
  async generateExplanation(
    concept: string,
    prompt: string,
    opt: string,
    correct: boolean
  ): Promise<string>
  async generateExplanation(
    paramOrConcept: GenerateExplanationParams | string,
    prompt?: string,
    opt?: string,
    correct?: boolean
  ): Promise<string> {
    const params: GenerateExplanationParams =
      typeof paramOrConcept === 'object'
        ? paramOrConcept
        : {
            conceptBody: paramOrConcept,
            questionPrompt: prompt ?? '',
            selectedOptionText: opt ?? '',
            correctOptionText: correct ? (opt ?? '') : '',
            isCorrect: !!correct,
          }
    const text = buildExplanationPrompt(params)
    return this.executePrompt(
      this.explanationModel,
      text,
      2048,
      fallbackExplanation(params)
    )
  }
}
