import type { HttpStudyRepositoryContract } from '../../infra/api/HttpStudyRepository.ts'
import type { StudySessionState } from './useStudySessionTypes.ts'

type SetFn = (partial: Partial<StudySessionState> | ((s: StudySessionState) => Partial<StudySessionState>)) => void
type GetFn = () => StudySessionState

const stillShowing = (get: GetFn, questionId: string) => get().currentQuestion?.id === questionId && get().feedback !== null

export async function executeRegenerateExplanation(repo: HttpStudyRepositoryContract, set: SetFn, get: GetFn): Promise<void> {
  const { session, currentQuestion, feedback, isExplanationLoading } = get()
  if (!session || !currentQuestion || !feedback || isExplanationLoading) return
  const questionId = currentQuestion.id
  set({ isExplanationLoading: true, postAnswerError: null })
  try {
    const { explanation } = await repo.regenerateExplanation(session.sessionId, questionId, feedback.explanation)
    if (!stillShowing(get, questionId)) return
    set((s) => ({ isExplanationLoading: false, feedback: s.feedback && { ...s.feedback, explanation, aiExplanation: explanation } }))
  } catch {
    if (!stillShowing(get, questionId)) return
    set({ isExplanationLoading: false, postAnswerError: '해설을 다시 받지 못했어요. 잠시 후 다시 시도해 주세요.' })
  }
}

export async function executeRequestDiagram(repo: HttpStudyRepositoryContract, set: SetFn, get: GetFn): Promise<void> {
  const { session, currentQuestion, feedback, isDiagramLoading, diagram } = get()
  if (!session || !currentQuestion || !feedback || isDiagramLoading || diagram) return
  const questionId = currentQuestion.id
  set({ isDiagramLoading: true, postAnswerError: null })
  try {
    const result = await repo.getDiagram(session.sessionId, questionId)
    if (!stillShowing(get, questionId)) return
    set({ isDiagramLoading: false, diagram: result })
  } catch {
    if (!stillShowing(get, questionId)) return
    set({ isDiagramLoading: false, postAnswerError: '도식을 만들지 못했어요. 잠시 후 다시 시도해 주세요.' })
  }
}
