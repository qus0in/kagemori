// src/infra/api/HttpStudyRepositoryContract.ts
import type { SessionPurpose } from '../../domain/models/PracticeSession.ts'
import type {
  PublicQuestionDto,
  SubmitAnswerResponseDto,
  ConceptHintResponseDto,
} from '../../app/dto/StudyDto.ts'

export interface SubmitAnswerParams {
  questionId: string
  optionId: string
  hintUsed: boolean
  durationMs: number
}

export interface SessionCreationResult {
  sessionId: string
  purpose: SessionPurpose
  targetQuestionCount: number
  currentQuestionIndex: number
}

export interface HttpStudyRepositoryContract {
  createSession(purpose: SessionPurpose, targetCount?: number): Promise<SessionCreationResult>
  getNextQuestion(sessionId: string): Promise<PublicQuestionDto | null>
  submitAnswer(sessionId: string, request: SubmitAnswerParams): Promise<SubmitAnswerResponseDto>
  getHint(sessionId: string, questionId: string): Promise<ConceptHintResponseDto>
}
