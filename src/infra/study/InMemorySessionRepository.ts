import type { PracticeSession } from '../../domain/models/PracticeSession.ts'
import { cloneSession } from '../../domain/models/SessionSnapshot.ts'
import { SessionConflictError } from '../../domain/models/StorageErrors.ts'
import type { PracticeSessionRepository } from '../../domain/ports/PracticeSessionRepository.ts'

export class InMemorySessionRepository implements PracticeSessionRepository {
  private readonly sessions = new Map<string, { session: PracticeSession; revision: number }>()
  private readonly versions = new WeakMap<PracticeSession, number>()

  async findById(id: string): Promise<PracticeSession | null> {
    const saved = this.sessions.get(id)
    if (!saved) return null
    const session = cloneSession(saved.session)
    this.versions.set(session, saved.revision)
    return session
  }

  async save(session: PracticeSession): Promise<void> {
    const saved = this.sessions.get(session.sessionId)
    if (saved && this.versions.get(session) !== saved.revision) throw new SessionConflictError()
    const revision = (saved?.revision ?? 0) + 1
    this.sessions.set(session.sessionId, { session: cloneSession(session), revision })
    this.versions.set(session, revision)
  }
}
