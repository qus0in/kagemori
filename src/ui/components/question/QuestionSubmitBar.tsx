import { DICTIONARY } from '../../constants/dictionary.ts'

export interface QuestionSubmitBarProps {
  selectedOptionId: string | null
  isSubmitting: boolean
  onSubmitAnswer: () => void
}

export function QuestionSubmitBar({ selectedOptionId, isSubmitting, onSubmitAnswer }: QuestionSubmitBarProps) {
  const dict = DICTIONARY.study.card
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
      <span className="text-xs text-base-content/60">
        {!selectedOptionId && dict.selectOptionPrompt}
      </span>
      <button
        type="button"
        onClick={onSubmitAnswer}
        disabled={!selectedOptionId || isSubmitting}
        className="btn btn-primary w-full sm:w-auto px-8"
      >
        {isSubmitting ? (
          <>
            <span className="loading loading-spinner loading-xs"></span>
            <span>{dict.submitting}</span>
          </>
        ) : (
          <span>{dict.submitButton}</span>
        )}
      </button>
    </div>
  )
}
