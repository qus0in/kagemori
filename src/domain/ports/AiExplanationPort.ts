// src/domain/ports/AiExplanationPort.ts

export interface GenerateExplanationParams {
  conceptBody: string
  questionPrompt: string
  selectedOptionText: string
  correctOptionText: string
  isCorrect: boolean
  allOptions?: Array<{ id: string; text: string }>
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
