import type { ConceptHintResponseDto } from '../../../app/dto/StudyDto.ts'
import { DICTIONARY } from '../../constants/dictionary.ts'
import { MarkdownView } from '../common/MarkdownView.tsx'

export interface QuestionHintBoxProps {
  hint: ConceptHintResponseDto | null
  isHintLoading: boolean
  onRequestHint: () => void
}

export function QuestionHintBox({ hint, isHintLoading, onRequestHint }: QuestionHintBoxProps) {
  const dict = DICTIONARY.study.card

  return (
    <div className="pt-1">
      {hint ? (
        <div className="alert alert-info text-sm shadow-xs border border-info/30 bg-info/10 text-info-content">
          <div className="space-y-1 w-full">
            <div className="font-semibold flex items-center justify-between">
              <span>{dict.hintTitle}</span>
              {hint.conceptTitle && (
                <span className="text-xs badge badge-info badge-outline">{hint.conceptTitle}</span>
              )}
            </div>
            <MarkdownView content={hint.hintText || hint.hint} />
            {hint.sourceTitle && (
              <div className="text-xs text-base-content/60 pt-1">
                출처: {hint.sourceTitle}
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onRequestHint}
          disabled={isHintLoading}
          className="btn btn-outline btn-xs sm:btn-sm gap-1 text-primary hover:btn-primary"
        >
          {isHintLoading ? (
            <>
              <span className="loading loading-spinner loading-xs"></span>
              <span>{dict.hintLoading}</span>
            </>
          ) : (
            <span>{dict.hintButton}</span>
          )}
        </button>
      )}
    </div>
  )
}
