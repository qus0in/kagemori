// src/app/dto/StudyDto.ts
import type { SessionPurpose } from '../../domain/models/PracticeSession.ts'

export interface CreateSessionRequestDto {
  purpose: SessionPurpose
  targetCount?: number
}

export interface CreateSessionResponseDto {
  sessionId: string
  purpose: SessionPurpose
  targetQuestionCount: number
  currentQuestionIndex: number
}

export interface QuestionOptionDto {
  id: string
  text: string
}

export interface PublicQuestionDto {
  id: string
  topicId: string
  type?: string
  difficulty?: string
  prompt: string
  options: QuestionOptionDto[]
  currentQuestionIndex?: number
  totalQuestions?: number
  /** Drafted and blind-reviewed by AI; not a human-verified question. */
  isAiGenerated?: boolean
}

export interface DiagramResponseDto {
  mimeType: string
  /** Base64 image bytes. */
  data: string
  model: string
  cached: boolean
}

export interface SubmitAnswerRequestDto {
  sessionId?: string
  questionId: string
  optionId: string
  hintUsed: boolean
  durationMs: number
}

export interface SubmitAnswerResponseDto {
  isCorrect: boolean
  correctOptionId: string
  explanation: string
  conceptTitle?: string
  sourceTitle?: string
  sourceUrl?: string
  isSessionCompleted?: boolean
  aiExplanation?: string
  conceptId?: string
  sessionProgress?: {
    currentQuestionIndex: number
    totalQuestions: number
    isCompleted: boolean
    correctCount: number
  }
}

export interface GetConceptHintRequestDto {
  sessionId?: string
  questionId: string
}

export type ConceptHintRequestDto = GetConceptHintRequestDto

export interface ConceptHintResponseDto {
  hintText?: string
  hint?: string
  conceptTitle?: string
  sourceTitle?: string
  questionId?: string
  sourceUrl?: string
}
