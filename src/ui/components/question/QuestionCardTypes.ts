import type { PublicQuestionDto, SubmitAnswerResponseDto, ConceptHintResponseDto } from '../../../app/dto/StudyDto.ts'

export interface QuestionCardProps {
  question: PublicQuestionDto
  questionNumber: number
  totalQuestions: number
  selectedOptionId: string | null
  onSelectOption: (optionId: string) => void
  hint: ConceptHintResponseDto | null
  isHintLoading: boolean
  onRequestHint: () => void
  canRequestHint: boolean
  feedback: SubmitAnswerResponseDto | null
  isSubmitting: boolean
  onSubmitAnswer: () => void
  onNextQuestion: () => void
}
