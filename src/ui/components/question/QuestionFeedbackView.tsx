import type { SubmitAnswerResponseDto } from '../../../app/dto/StudyDto.ts'
import { DICTIONARY } from '../../constants/dictionary.ts'
import { QuestionFeedbackSource } from './QuestionFeedbackSource.tsx'
import { MarkdownView } from '../common/MarkdownView.tsx'
import { QuestionPostAnswerTools, type QuestionPostAnswerToolsProps } from './QuestionPostAnswerTools.tsx'

export interface QuestionFeedbackViewProps extends QuestionPostAnswerToolsProps {
  feedback: SubmitAnswerResponseDto
  onNextQuestion: () => void
}

export function QuestionFeedbackView({ feedback, onNextQuestion, ...tools }: QuestionFeedbackViewProps) {
  const dict = DICTIONARY.study.card
  const isCorrect = feedback.isCorrect
  const cardBorder = isCorrect ? 'bg-success/10 border-success/30' : 'bg-error/10 border-error/30'
  const badgeCls = isCorrect ? 'badge-success' : 'badge-error'

  return (
    <div className="space-y-4 pt-2">
      <div className={`p-4 rounded-xl border ${cardBorder}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`badge font-bold text-white ${badgeCls}`}>
            {isCorrect ? dict.correctBadge : dict.incorrectBadge}
          </span>
          {feedback.conceptTitle && (
            <span className="text-xs font-semibold text-base-content/80">
              [{feedback.conceptTitle}]
            </span>
          )}
        </div>

        <MarkdownView content={feedback.explanation} className="mb-3" />

        <QuestionFeedbackSource
          sourceTitle={feedback.sourceTitle}
          sourceUrl={feedback.sourceUrl}
        />
      </div>

      <QuestionPostAnswerTools {...tools} />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNextQuestion}
          className="btn btn-primary w-full sm:w-auto px-8 gap-2"
        >
          <span>{dict.nextButton}</span>
        </button>
      </div>
    </div>
  )
}
