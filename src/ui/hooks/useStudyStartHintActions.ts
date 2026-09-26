import type { SessionPurpose } from '../../domain/models/PracticeSession.ts'
import type { HttpStudyRepositoryContract } from '../../infra/api/HttpStudyRepository.ts'
import type { StudySessionState } from './useStudySessionTypes.ts'

type SetFn = (partial: Partial<StudySessionState> | ((s: StudySessionState) => Partial<StudySessionState>)) => void
type GetFn = () => StudySessionState

export async function executeStartSession(
  repo: HttpStudyRepositoryContract,
  set: SetFn,
  get: GetFn,
  purpose: SessionPurpose,
  targetCount?: number,
): Promise<void> {
  set({ isLoadingQuestion: true, error: null })
  const startingState = get()
  let activeSession: StudySessionState['session'] = null
  try {
    const session = await repo.createSession(purpose, targetCount)
    if (get() !== startingState) return
    activeSession = session
    set({ session })
    const question = await repo.getNextQuestion(session.sessionId)
    if (get().session !== session) return
    if (!question) {
      set({ isCompleted: true, isLoadingQuestion: false })
      return
    }
    set({ currentQuestion: question, questionStartTime: Date.now(), isLoadingQuestion: false })
  } catch (err) {
    if (activeSession ? get().session !== activeSession : get() !== startingState) return
    const msg = err instanceof Error ? err.message : '세션을 생성하는 데 실패했습니다.'
    set({ error: msg, isLoadingQuestion: false })
  }
}

export async function executeRequestHint(
  repo: HttpStudyRepositoryContract,
  set: SetFn,
  get: GetFn,
): Promise<void> {
  const { session, currentQuestion, feedback, isHintLoading } = get()
  if (!session || !currentQuestion || feedback !== null || isHintLoading) return

  set({ isHintLoading: true, error: null })
  try {
    const hint = await repo.getHint(session.sessionId, currentQuestion.id)
    set({ hint, isHintLoading: false })
  } catch (err) {
    const msg = err instanceof Error ? err.message : '힌트를 불러오지 못했습니다.'
    set({ isHintLoading: false, error: msg })
  }
}
