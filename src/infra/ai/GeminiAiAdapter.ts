// src/infra/ai/GeminiAiAdapter.ts
import type {
  AiExplanationPort,
  GenerateExplanationParams,
} from '../../domain/ports/AiExplanationPort.ts'
import type { AiResponseCache } from './KvAiResponseCache.ts'
import { PRIMARY_TEXT_MODEL, ReviewedTextClient } from './ReviewedTextClient.ts'
import {
  buildHintPrompt,
  buildExplanationPrompt,
  fallbackHint,
  fallbackExplanation,
} from './GeminiPromptTemplates.ts'

const DEF_HINT_MODEL = PRIMARY_TEXT_MODEL
const DEF_EXPLANATION_MODEL = PRIMARY_TEXT_MODEL

export interface GeminiAiAdapterOptions {
  apiKey?: string
  hintModel?: string
  explanationModel?: string
  fetchFn?: typeof fetch
  cache?: AiResponseCache
}

export class GeminiAiAdapter implements AiExplanationPort {
  private readonly hintModel: string
  private readonly explanationModel: string
  private readonly client: ReviewedTextClient

  constructor(options: GeminiAiAdapterOptions = {}) {
    this.hintModel = options.hintModel || DEF_HINT_MODEL
    this.explanationModel = options.explanationModel || DEF_EXPLANATION_MODEL
    this.client = new ReviewedTextClient(options)
  }

  async generateHint(conceptBody: string, questionPrompt: string): Promise<string> {
    const prompt = buildHintPrompt(conceptBody, questionPrompt)
    return await this.client.execute({ model: this.hintModel, prompt, tokens: 500 })
      ?? fallbackHint(conceptBody, questionPrompt)
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
    return await this.client.execute({
      model: this.explanationModel, prompt: text, tokens: 2048,
      escalate: params.reviewRequested === true || !!params.previousExplanation?.trim(),
    }) ?? fallbackExplanation(params)
  }
}
