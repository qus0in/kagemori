// src/infra/ai/GeminiAiAdapter.ts
import type { AiExplanationPort } from '../../domain/ports/AiExplanationPort.ts'
import { callGemini } from './GeminiApiClient.ts'
import {
  buildHintPrompt,
  buildExplanationPrompt,
  fallbackHint,
  fallbackExplanation,
} from './GeminiPromptTemplates.ts'

const DEF_MODEL = 'gemini-3.5-flash-lite'

export interface GeminiAiAdapterOptions {
  apiKey?: string
  hintModel?: string
  explanationModel?: string
  fetchFn?: typeof fetch
}

export class GeminiAiAdapter implements AiExplanationPort {
  private readonly apiKey?: string
  private readonly hintModel: string
  private readonly explanationModel: string
  private readonly fetch: typeof fetch

  constructor(options: GeminiAiAdapterOptions = {}) {
    this.apiKey = options.apiKey
    this.hintModel = options.hintModel || DEF_MODEL
    this.explanationModel = options.explanationModel || DEF_MODEL
    this.fetch = options.fetchFn || globalThis.fetch
  }

  private async executePrompt(model: string, prompt: string, tokens: number, fallback: string): Promise<string> {
    if (!this.apiKey) return fallback
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`
      const res = await callGemini(this.fetch, url, prompt, tokens)
      return res || fallback
    } catch {
      return fallback
    }
  }

  async generateHint(conceptBody: string, questionPrompt: string): Promise<string> {
    const prompt = buildHintPrompt(conceptBody, questionPrompt)
    return this.executePrompt(this.hintModel, prompt, 200, fallbackHint(conceptBody, questionPrompt))
  }

  async generateExplanation(concept: string, prompt: string, opt: string, correct: boolean): Promise<string> {
    const text = buildExplanationPrompt(concept, prompt, opt, correct)
    return this.executePrompt(this.explanationModel, text, 400, fallbackExplanation(concept, prompt, opt, correct))
  }
}
