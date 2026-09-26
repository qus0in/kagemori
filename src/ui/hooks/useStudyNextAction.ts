import type { HttpStudyRepositoryContract } from '../../infra/api/HttpStudyRepository.ts'
import type { StudySessionState } from './useStudySessionTypes.ts'

type SetFn = (partial: Partial<StudySessionState> | ((s: StudySessionState) => Partial<StudySessionState>)) => void
type GetFn = () => StudySessionState

export async function executeNextQuestion(
  repo: HttpStudyRepositoryContract,
  set: SetFn,
  get: GetFn,
): Promise<void> {
  const { session, feedback, isLoadingQuestion } = get()
  if (!session || !feedback || isLoadingQuestion) return

  set({ isLoadingQuestion: true, selectedOptionId: null, hint: null, feedback: null, error: null })
  try {
    const nextQ = await repo.getNextQuestion(session.sessionId)
    if (!nextQ) {
      set({ currentQuestion: null, isCompleted: true, isLoadingQuestion: false })
      return
    }
    set({ currentQuestion: nextQ, questionStartTime: Date.now(), isLoadingQuestion: false })
  } catch (err) {
    const msg = err instanceof Error ? err.message : '다음 문제를 불러오지 못했습니다.'
    set({ error: msg, isLoadingQuestion: false })
  }
}
