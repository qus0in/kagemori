// src/app/usecases/SessionPlanUpdates.ts
import type { PracticeSession } from '../../domain/models/PracticeSession.ts'
import { SessionConflictError } from '../../domain/models/StorageErrors.ts'
import type { PracticeSessionRepository } from '../../domain/ports/PracticeSessionRepository.ts'

/**
 * Reloads, mutates and saves a session until no concurrent writer interferes.
 * `mutate` returns false when nothing needs saving.
 */
export async function updateSessionWithRetry(
  sessions: PracticeSessionRepository,
  sessionId: string,
  mutate: (session: PracticeSession) => boolean,
  tries = 4,
): Promise<PracticeSession | null> {
  for (let attempt = 1; ; attempt++) {
    const session = await sessions.findById(sessionId)
    if (!session || !mutate(session)) return session
    try {
      await sessions.save(session)
      return session
    } catch (error) {
      if (!(error instanceof SessionConflictError) || attempt >= tries) throw error
    }
  }
}
