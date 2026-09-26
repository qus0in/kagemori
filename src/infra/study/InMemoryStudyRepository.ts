// src/infra/study/InMemoryStudyRepository.ts
import { PracticeSession, type SessionPurpose } from '../../domain/models/PracticeSession.ts'
import type { StudyRepository } from '../../domain/ports/StudyRepository.ts'
import { InMemoryQuestionRepository } from './InMemoryQuestionRepository.ts'
import { InMemoryConceptRepository } from './InMemoryConceptRepository.ts'
import { InMemorySessionRepository } from './InMemorySessionRepository.ts'
import { InMemorySourceRepository } from './InMemorySourceRepository.ts'

export {
  InMemoryQuestionRepository,
  InMemoryConceptRepository,
  InMemorySessionRepository,
  InMemorySourceRepository,
}

export class InMemoryStudyRepository implements StudyRepository {
  public readonly questions: InMemoryQuestionRepository
  public readonly concepts: InMemoryConceptRepository
  public readonly sessions: InMemorySessionRepository
  public readonly sources: InMemorySourceRepository

  constructor() {
    this.questions = new InMemoryQuestionRepository()
    this.concepts = new InMemoryConceptRepository()
    this.sessions = new InMemorySessionRepository()
    this.sources = new InMemorySourceRepository()
  }

  async createSession(purpose: SessionPurpose, targetCount?: number): Promise<PracticeSession> {
    const sessionId = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    const defaultCounts: Record<SessionPurpose, number> = {
      DIAGNOSTIC: 6,
      IMPROVEMENT: 6,
      MOCK_EXAM: 6,
    }
    const count = targetCount && targetCount > 0 ? targetCount : defaultCounts[purpose]

    const session = new PracticeSession({
      sessionId,
      learnerId: 'guest-learner',
      purpose,
      blueprintId: 'blueprint-round-47',
      targetQuestionCount: count,
    })

    await this.sessions.save(session)
    return session
  }
}
