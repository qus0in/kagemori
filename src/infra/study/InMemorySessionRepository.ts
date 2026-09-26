// src/infra/study/InMemorySessionRepository.ts
import type { PracticeSession } from '../../domain/models/PracticeSession.ts'
import type { PracticeSessionRepository } from '../../domain/ports/PracticeSessionRepository.ts'

export class InMemorySessionRepository implements PracticeSessionRepository {
  private sessions: Map<string, PracticeSession> = new Map()

  async findById(id: string): Promise<PracticeSession | null> {
    return this.sessions.get(id) || null
  }

  async save(session: PracticeSession): Promise<void> {
    this.sessions.set(session.sessionId, session)
  }
}
