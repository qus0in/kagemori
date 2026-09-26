// src/domain/models/QuestionTypes.ts

export type QuestionId = string
export type QuestionType = 'CONCEPT' | 'APPLICATION' | 'CALCULATION' | 'REGULATION'
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'
export type QuestionStatus = 'DRAFT' | 'REVIEWED' | 'PUBLISHED'

export interface QuestionOption {
  readonly id: string
  readonly text: string
}

export interface QuestionProps {
  readonly id: QuestionId
  readonly version: number
  readonly topicId: string
  readonly chapterId: string
  readonly type: QuestionType
  readonly difficulty: Difficulty
  readonly status: QuestionStatus
  readonly prompt: string
  readonly options: readonly QuestionOption[]
  readonly correctOptionId: string
  readonly explanation: string
  readonly conceptId: string
  readonly sourceId: string
}
