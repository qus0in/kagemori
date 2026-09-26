import type { SubmitAnswerResponseDto } from '../../../app/dto/StudyDto.ts'

export function getOptionStyles(optionId: string, selected: boolean, feedback: SubmitAnswerResponseDto | null) {
  if (!feedback) {
    if (selected) {
      return {
        box: 'border-2 border-primary bg-primary/10 text-primary font-medium shadow-xs',
        badge: 'text-primary font-bold',
      }
    }
    return {
      box: 'border border-base-300 bg-base-100 hover:border-primary/50 text-base-content transition-all',
      badge: 'text-base-content/60',
    }
  }
  if (optionId === feedback.correctOptionId) {
    return {
      box: 'border-2 border-success bg-success/15 text-success font-semibold shadow-xs',
      badge: 'text-success font-bold',
    }
  }
  if (selected && !feedback.isCorrect) {
    return {
      box: 'border-2 border-error bg-error/15 text-error font-semibold shadow-xs',
      badge: 'text-error font-bold',
    }
  }
  return {
    box: 'border border-base-200 bg-base-200/50 opacity-60 text-base-content/70',
    badge: 'text-base-content/60',
  }
}
