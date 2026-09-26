// src/domain/ports/PracticeSessionRepository.ts

import type { PracticeSession } from '../models/PracticeSession.ts'

export interface PracticeSessionRepository {
  findById(sessionId: string): Promise<PracticeSession | null>
  save(session: PracticeSession): Promise<void>
}
