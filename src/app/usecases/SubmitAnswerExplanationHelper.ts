// src/app/usecases/SubmitAnswerExplanationHelper.ts
import type { Concept } from '../../domain/models/Concept.ts'
import type { Question } from '../../domain/models/Question.ts'
import type { AiExplanationPort } from '../../domain/ports/AiExplanationPort.ts'
import type { SourceRepository } from '../../domain/ports/SourceRepository.ts'
import type { SubmitAnswerResponseDto } from '../dto/StudyDto.ts'

export async function resolveAnswerExplanation(
  aiPort: AiExplanationPort | undefined,
  concept: Concept | null,
  question: Question,
  optionId: string,
  isCorrect: boolean
): Promise<string> {
  if (!aiPort || !concept) return question.explanation
  try {
    const selectedOption = question.options.find((o) => o.id === optionId)
    const correctOption = question.options.find((o) => o.id === question.correctOptionId)
    return await aiPort.generateExplanation({
      conceptBody: concept.body,
      questionPrompt: question.prompt,
      selectedOptionText: selectedOption?.text ?? '',
      correctOptionText: correctOption?.text ?? '',
      isCorrect,
      allOptions: question.options.map((o) => ({ id: o.id, text: o.text })),
      questionExplanation: question.explanation,
    })
  } catch {
    return question.explanation
  }
}

export async function resolveSourceInfo(
  sourceRepo: SourceRepository | undefined,
  sourceId?: string
): Promise<{ title: string; url: string }> {
  if (!sourceRepo || !sourceId) return { title: '', url: '' }
  const doc = await sourceRepo.findById(sourceId)
  return { title: doc?.title ?? '', url: doc?.url ?? '' }
}

export function formatSubmitResult(
  isCorrect: boolean,
  question: Question,
  explanation: string,
  concept: Concept | null,
  source: { title: string; url: string },
  isSessionCompleted: boolean
): SubmitAnswerResponseDto {
  return {
    isCorrect,
    correctOptionId: question.correctOptionId,
    explanation,
    conceptTitle: concept?.title ?? '',
    sourceTitle: source.title,
    sourceUrl: source.url,
    isSessionCompleted,
  }
}
