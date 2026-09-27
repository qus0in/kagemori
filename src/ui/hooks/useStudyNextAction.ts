import type { HttpStudyRepositoryContract } from '../../infra/api/HttpStudyRepository.ts'
import type { StudySessionState } from './useStudySessionTypes.ts'

type SetFn = (partial: Partial<StudySessionState> | ((s: StudySessionState) => Partial<StudySessionState>)) => void
type GetFn = () => StudySessionState

export async function executeNextQuestion(
  repo: HttpStudyRepositoryContract,
  set: SetFn,
  get: GetFn,
): Promise<void> {
  const { session, feedback, currentQuestion, isLoadingQuestion } = get()
  if (!session || (!feedback && currentQuestion) || isLoadingQuestion) return

  set({ isLoadingQuestion: true, error: null })
  try {
    const nextQ = await repo.getNextQuestion(session.sessionId)
    if (get().session !== session) return
    if (!nextQ) {
      set({ currentQuestion: null, isCompleted: true, isLoadingQuestion: false })
      return
    }
    const nextIndex = nextQ.currentQuestionIndex ?? session.currentQuestionIndex + (currentQuestion ? 1 : 0)
    set({
      currentQuestion: nextQ,
      selectedOptionId: null,
      hint: null,
      feedback: null,
      diagram: null,
      postAnswerError: null,
      session: { ...session, currentQuestionIndex: nextIndex },
      questionStartTime: Date.now(),
      isLoadingQuestion: false,
    })
  } catch (err) {
    if (get().session !== session) return
    const msg = err instanceof Error ? err.message : '다음 문제를 불러오지 못했습니다.'
    set({ error: msg, isLoadingQuestion: false })
  }
}
