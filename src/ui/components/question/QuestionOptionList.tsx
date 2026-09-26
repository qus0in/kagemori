import type { QuestionOptionDto, SubmitAnswerResponseDto } from '../../../app/dto/StudyDto.ts'
import { DICTIONARY } from '../../constants/dictionary.ts'
import { getOptionStyles } from './questionStyles.ts'

export interface QuestionOptionListProps {
  options: QuestionOptionDto[]
  selectedOptionId: string | null
  feedback: SubmitAnswerResponseDto | null
  onSelectOption: (id: string) => void
}

export function QuestionOptionList({
  options,
  selectedOptionId,
  feedback,
  onSelectOption,
}: QuestionOptionListProps) {
  const dict = DICTIONARY.study.card
  const isSubmitted = feedback !== null

  return (
    <div className="space-y-3 pt-2">
      {options.map((option, idx) => {
        const isSelected = selectedOptionId === option.id
        const prefix = dict.optionPrefix[idx] ?? `(${idx + 1})`
        const styles = getOptionStyles(option.id, isSelected, feedback)

        return (
          <button
            key={option.id}
            type="button"
            disabled={isSubmitted}
            onClick={() => onSelectOption(option.id)}
            className={`w-full text-left p-3.5 sm:p-4 rounded-xl flex items-start gap-3 text-sm sm:text-base cursor-pointer disabled:cursor-default ${styles.box}`}
          >
            <span className={`text-base font-semibold shrink-0 select-none ${styles.badge}`}>
              {prefix}
            </span>
            <span className="flex-1 leading-snug">{option.text}</span>
            {isSubmitted && option.id === feedback.correctOptionId && (
              <span className="badge badge-success badge-sm text-white font-bold shrink-0">정답</span>
            )}
            {isSubmitted && isSelected && !feedback.isCorrect && (
              <span className="badge badge-error badge-sm text-white font-bold shrink-0">선택</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
