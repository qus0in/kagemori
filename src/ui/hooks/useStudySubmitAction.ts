import type { HttpStudyRepositoryContract } from '../../infra/api/HttpStudyRepository.ts'
import type { StudySessionState } from './useStudySessionTypes.ts'

type SetFn = (partial: Partial<StudySessionState> | ((s: StudySessionState) => Partial<StudySessionState>)) => void
type GetFn = () => StudySessionState

export async function executeSubmitAnswer(
  repo: HttpStudyRepositoryContract,
  set: SetFn,
  get: GetFn,
): Promise<void> {
  const { session, currentQuestion, selectedOptionId, hint, isSubmitting, feedback, questionStartTime, score } = get()
  if (!session || !currentQuestion || !selectedOptionId || isSubmitting || feedback !== null) return

  set({ isSubmitting: true, error: null })
  const durationMs = questionStartTime > 0 ? Math.max(1, Date.now() - questionStartTime) : 1000

  try {
    const res = await repo.submitAnswer(session.sessionId, {
      questionId: currentQuestion.id,
      optionId: selectedOptionId,
      hintUsed: Boolean(hint),
      durationMs,
    })
    const isCompleted = Boolean(res.isSessionCompleted || res.sessionProgress?.isCompleted)
    const correctCount = res.sessionProgress?.correctCount ?? (res.isCorrect ? score.correctCount + 1 : score.correctCount)
    const totalCount = res.sessionProgress?.currentQuestionIndex ?? score.totalCount + 1

    set({ feedback: res, isSubmitting: false, isCompleted, score: { correctCount, totalCount } })
  } catch (err) {
    const msg = err instanceof Error ? err.message : '답안 제출에 실패했습니다.'
    set({ isSubmitting: false, error: msg })
  }
}
