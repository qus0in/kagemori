// src/domain/ports/AiExplanationPort.ts

export interface GenerateExplanationParams {
  conceptBody: string
  questionPrompt: string
  selectedOptionText: string
  correctOptionText: string
  isCorrect: boolean
  allOptions?: Array<{ id: string; text: string }>
  questionExplanation?: string
  /** Explanation the learner asked to replace; the new one must take a different angle. */
  previousExplanation?: string
  /** Explicit learner challenge/retry always requires the stronger model. */
  reviewRequested?: boolean
}

export interface AiExplanationPort {
  generateHint(conceptBody: string, questionPrompt: string): Promise<string>
  generateExplanation(params: GenerateExplanationParams): Promise<string>
  generateExplanation(
    conceptBody: string,
    questionPrompt: string,
    selectedOptionText: string,
    isCorrect: boolean
  ): Promise<string>
}
