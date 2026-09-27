// src/infra/api/HttpStudyRepositoryContract.ts
import type { SessionPurpose } from '../../domain/models/PracticeSession.ts'
import type {
  PublicQuestionDto,
  SubmitAnswerResponseDto,
  ConceptHintResponseDto,
  DiagramResponseDto,
  DiagramMode,
  PreparingQuestionDto,
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
  preparingQuestions?: number
}

export interface HttpStudyRepositoryContract {
  createSession(purpose: SessionPurpose, targetCount?: number): Promise<SessionCreationResult>
  /** `useExisting` skips waiting for background generation and serves the fallback question. */
  getNextQuestion(sessionId: string, useExisting?: boolean): Promise<PublicQuestionDto | PreparingQuestionDto | null>
  prepareSession(sessionId: string): Promise<{ status: string; added: number }>
  submitAnswer(sessionId: string, request: SubmitAnswerParams): Promise<SubmitAnswerResponseDto>
  getHint(sessionId: string, questionId: string): Promise<ConceptHintResponseDto>
  regenerateExplanation(sessionId: string, questionId: string, previousExplanation: string): Promise<{ explanation: string }>
  getDiagram(sessionId: string, questionId: string, mode?: DiagramMode): Promise<DiagramResponseDto>
}
