// src/infra/study/InMemorySessionRepository.ts
import { PracticeSession, type SessionPurpose } from '../../domain/models/PracticeSession.ts'
import type { PracticeSessionRepository } from '../../domain/ports/PracticeSessionRepository.ts'

export class InMemorySessionRepository implements PracticeSessionRepository {
  private sessions: Map<string, PracticeSession> = new Map()

  async findById(id: string): Promise<PracticeSession | null> {
    const existing = this.sessions.get(id)
    if (existing) {
      return existing
    }

    if (this.isValidSessionId(id)) {
      const recovered = this.restoreSessionFromId(id)
      this.sessions.set(id, recovered)
      return recovered
    }

    return null
  }

  async save(session: PracticeSession): Promise<void> {
    this.sessions.set(session.sessionId, session)
  }

  private isValidSessionId(id: string): boolean {
    if (typeof id !== 'string') return false
    const parts = id.split('-')
    if (parts.length < 3 || parts[0] !== 'sess') return false
    const timestamp = Number(parts[1])
    return !Number.isNaN(timestamp) && timestamp > 1600000000000
  }

  private restoreSessionFromId(id: string): PracticeSession {
    const parts = id.toLowerCase().split('-')
    let purpose: SessionPurpose = 'IMPROVEMENT'
    let count = 6

    if (parts.includes('diagnostic')) {
      purpose = 'DIAGNOSTIC'
    } else if (parts.includes('mock_exam') || parts.includes('mockexam')) {
      purpose = 'MOCK_EXAM'
      count = 10
    }

    const numPart = parts.find(
      (p) => /^\d+$/.test(p) && Number(p) > 0 && Number(p) <= 100 && p !== parts[1]
    )
    if (numPart) {
      count = Number(numPart)
    }

    return new PracticeSession({
      sessionId: id,
      learnerId: 'guest-learner',
      purpose,
      blueprintId: 'blueprint-round-47',
      targetQuestionCount: count,
    })
  }
}
