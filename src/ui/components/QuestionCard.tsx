// src/ui/components/QuestionCard.tsx
import { QuestionCardHeader } from './question/QuestionCardHeader.tsx'
import { QuestionHintBox } from './question/QuestionHintBox.tsx'
import { QuestionOptionList } from './question/QuestionOptionList.tsx'
import { QuestionFeedbackView } from './question/QuestionFeedbackView.tsx'
import { QuestionSubmitBar } from './question/QuestionSubmitBar.tsx'
import type { QuestionCardProps } from './question/QuestionCardTypes.ts'

export type { QuestionCardProps }

export function QuestionCard(p: QuestionCardProps) {
  const isSubmitted = p.feedback !== null

  return (
    <div className="card bg-base-100 shadow-sm border border-base-300">
      <div className="card-body p-6 space-y-6">
        <QuestionCardHeader
          question={p.question}
          questionNumber={p.questionNumber}
          totalQuestions={p.totalQuestions}
        />
        <div className="text-base sm:text-lg font-medium leading-relaxed text-base-content whitespace-pre-line">
          {p.question.prompt}
        </div>
        {!isSubmitted && p.canRequestHint && (
          <QuestionHintBox
            hint={p.hint}
            isHintLoading={p.isHintLoading}
            onRequestHint={p.onRequestHint}
          />
        )}
        <QuestionOptionList
          options={p.question.options}
          selectedOptionId={p.selectedOptionId}
          feedback={p.feedback}
          onSelectOption={p.onSelectOption}
        />
        <div className="pt-2">
          {!isSubmitted ? (
            <QuestionSubmitBar
              selectedOptionId={p.selectedOptionId}
              isSubmitting={p.isSubmitting}
              onSubmitAnswer={p.onSubmitAnswer}
            />
          ) : (
            p.feedback && (
              <QuestionFeedbackView
                feedback={p.feedback}
                onNextQuestion={p.onNextQuestion}
              />
            )
          )}
        </div>
      </div>
    </div>
  )
}
