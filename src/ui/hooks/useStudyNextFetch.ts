import type { HttpStudyRepositoryContract } from '../../infra/api/HttpStudyRepository.ts'
import { isPreparingQuestion, type PublicQuestionDto } from '../../app/dto/StudyDto.ts'
import type { StudySessionState } from './useStudySessionTypes.ts'

type SetFn = (partial: Partial<StudySessionState>) => void
type GetFn = () => StudySessionState

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Fetches the next question, polling while background generation prepares the slot.
 * Resolves `undefined` when the session changed meanwhile.
 */
export async function fetchNextWaitingForGeneration(
  repo: HttpStudyRepositoryContract, set: SetFn, get: GetFn, sessionId: string, isStale: () => boolean,
): Promise<PublicQuestionDto | null | undefined> {
  let useExisting = false
  for (;;) {
    const res = await repo.getNextQuestion(sessionId, useExisting)
    if (isStale()) return undefined
    if (!isPreparingQuestion(res)) {
      set({ preparingNext: null, useExistingRequested: false })
      return res
    }
    set({ preparingNext: { remainingMs: res.remainingMs } })
    const until = Date.now() + res.retryAfterMs
    while (Date.now() < until && !get().useExistingRequested && !isStale()) await sleep(Math.min(200, res.retryAfterMs))
    if (isStale()) return undefined
    useExisting = get().useExistingRequested
  }
}
