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
  /** Slots filled by background AI generation; the client should call /prepare. */
  preparingQuestions?: number
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

/** /next while background generation fills the slot. */
export interface PreparingQuestionDto {
  preparing: true
  remainingMs: number
  retryAfterMs: number
}

export const isPreparingQuestion = (value: unknown): value is PreparingQuestionDto =>
  !!value && typeof value === 'object' && (value as { preparing?: unknown }).preparing === true

export type DiagramMode = 'auto' | 'image'

export interface DiagramResponseDto {
  kind: 'mermaid' | 'table' | 'image'
  model: string
  cached: boolean
  /** Router's one-line reason for the chosen representation. */
  reason?: string
  code?: string
  markdown?: string
  /** Session-scoped URL streaming the image from R2. */
  imageUrl?: string
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
