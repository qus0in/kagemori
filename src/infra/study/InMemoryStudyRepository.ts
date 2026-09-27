// src/infra/study/InMemoryStudyRepository.ts
import { PracticeSession, type SessionPurpose } from '../../domain/models/PracticeSession.ts'
import type { StudyRepository } from '../../domain/ports/StudyRepository.ts'
import { InMemoryQuestionRepository } from './InMemoryQuestionRepository.ts'
import { InMemoryConceptRepository } from './InMemoryConceptRepository.ts'
import { InMemorySessionRepository } from './InMemorySessionRepository.ts'
import { InMemorySourceRepository } from './InMemorySourceRepository.ts'
import type { PracticeSessionRepository } from '../../domain/ports/PracticeSessionRepository.ts'
import { DEFAULT_SESSION_QUESTION_COUNTS } from '../../domain/models/PracticeSessionTypes.ts'
import type { GenerationPlan } from '../../domain/models/SessionGeneration.ts'
import type { GeneratedQuestionStore } from '../../domain/ports/QuestionBankPorts.ts'
import { InMemoryGeneratedQuestionStore } from './InMemoryGeneratedQuestionStore.ts'

export {
  InMemoryQuestionRepository,
  InMemoryConceptRepository,
  InMemorySessionRepository,
  InMemorySourceRepository,
}

export class InMemoryStudyRepository implements StudyRepository {
  public readonly questions: InMemoryQuestionRepository
  public readonly concepts: InMemoryConceptRepository
  public readonly sessions: PracticeSessionRepository
  public readonly sources: InMemorySourceRepository

  constructor(sessions?: PracticeSessionRepository, generated: GeneratedQuestionStore = new InMemoryGeneratedQuestionStore()) {
    this.questions = new InMemoryQuestionRepository(undefined, generated)
    this.concepts = new InMemoryConceptRepository(undefined, generated)
    this.sessions = sessions ?? new InMemorySessionRepository()
    this.sources = new InMemorySourceRepository()
  }

  async createSession(
    purpose: SessionPurpose, targetCount?: number, questionIds?: readonly string[], generation?: GenerationPlan,
  ): Promise<PracticeSession> {
    const count = questionIds?.length || (targetCount && targetCount > 0 ? targetCount : DEFAULT_SESSION_QUESTION_COUNTS[purpose])
    const sessionId = `sess-${Date.now()}-${purpose.toLowerCase()}-${count}-${Math.random().toString(36).substring(2, 7)}`

    const session = new PracticeSession({
      sessionId,
      learnerId: 'guest-learner',
      purpose,
      blueprintId: 'blueprint-round-47',
      targetQuestionCount: count,
      ...(questionIds?.length ? { questionIds, ...(generation ? { generation } : {}) } : {}),
    })

    await this.sessions.save(session)
    return session
  }
}
