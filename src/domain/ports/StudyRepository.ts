// src/domain/ports/StudyRepository.ts
import type { QuestionRepository } from './QuestionRepository.ts'
import type { QuestionBankPort } from './QuestionBankPorts.ts'
import type { ConceptRepository } from './ConceptRepository.ts'
import type { PracticeSessionRepository } from './PracticeSessionRepository.ts'
import type { SourceRepository } from './SourceRepository.ts'
import type { PracticeSession, SessionPurpose } from '../models/PracticeSession.ts'

export interface StudyRepository {
  readonly questions: QuestionRepository & QuestionBankPort
  readonly concepts: ConceptRepository
  readonly sessions: PracticeSessionRepository
  readonly sources: SourceRepository
  createSession(purpose: SessionPurpose, targetCount?: number, questionIds?: readonly string[]): Promise<PracticeSession>
}
