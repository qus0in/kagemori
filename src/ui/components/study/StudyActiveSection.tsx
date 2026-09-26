import { QuestionCard } from '../QuestionCard.tsx'
import { DICTIONARY } from '../../constants/dictionary.ts'
import { StudyProgressIndicator } from './StudyProgressIndicator.tsx'
import type { StudySessionState } from '../../hooks/useStudySessionTypes.ts'

export interface StudyActiveSectionProps {
  store: StudySessionState
}

export function StudyActiveSection({ store }: StudyActiveSectionProps) {
  const dict = DICTIONARY.study
  const { session, currentQuestion, selectedOptionId, hint, feedback, isHintLoading, isSubmitting, isLoadingQuestion } = store
  if (!session) return null

  const currIdx = currentQuestion?.currentQuestionIndex ?? session.currentQuestionIndex ?? 0

  return (
    <div className="space-y-4">
      <StudyProgressIndicator
        currentIndex={currIdx}
        totalQuestions={session.targetQuestionCount}
      />

      {store.error && !isLoadingQuestion && (!currentQuestion || feedback) && (
        <button type="button" className="btn btn-outline btn-primary btn-sm" onClick={store.nextQuestion}>문제 다시 불러오기</button>
      )}
      {isLoadingQuestion && currentQuestion && (
        <p role="status" className="text-sm text-base-content/70">다음 문제를 불러오는 중이에요…</p>
      )}

      {isLoadingQuestion && !currentQuestion && (
        <div className="card bg-base-100 border border-base-300 p-12 text-center shadow-xs">
          <span className="loading loading-spinner loading-md text-primary mx-auto mb-3"></span>
          <p className="text-sm text-base-content/70">{dict.session.loadingSession}</p>
        </div>
      )}

      {currentQuestion && (
        <QuestionCard
          question={currentQuestion}
          questionNumber={currIdx + 1}
          totalQuestions={session.targetQuestionCount}
          selectedOptionId={selectedOptionId}
          onSelectOption={store.selectOption}
          hint={hint}
          isHintLoading={isHintLoading}
          onRequestHint={store.requestHint}
          canRequestHint={session.purpose === 'IMPROVEMENT'}
          feedback={feedback}
          isSubmitting={isSubmitting}
          onSubmitAnswer={store.submitAnswer}
          onNextQuestion={store.nextQuestion}
        />
      )}
    </div>
  )
}
