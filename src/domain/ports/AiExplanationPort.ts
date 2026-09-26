// src/domain/ports/AiExplanationPort.ts

export interface AiExplanationPort {
  generateHint(conceptBody: string, questionPrompt: string): Promise<string>
  generateExplanation(
    conceptBody: string,
    questionPrompt: string,
    selectedOptionText: string,
    isCorrect: boolean
  ): Promise<string>
}
