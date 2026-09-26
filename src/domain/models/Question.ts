// src/domain/models/Question.ts
import type {
  QuestionId,
  QuestionType,
  Difficulty,
  QuestionStatus,
  QuestionOption,
  QuestionProps,
} from './QuestionTypes.ts'
import { validateQuestionProps } from './QuestionValidation.ts'

export type {
  QuestionId,
  QuestionType,
  Difficulty,
  QuestionStatus,
  QuestionOption,
  QuestionProps,
}

export class Question implements QuestionProps {
  public readonly id: QuestionId
  public readonly version: number
  public readonly topicId: string
  public readonly chapterId: string
  public readonly type: QuestionType
  public readonly difficulty: Difficulty
  public readonly status: QuestionStatus
  public readonly prompt: string
  public readonly options: readonly QuestionOption[]
  public readonly correctOptionId: string
  public readonly explanation: string
  public readonly conceptId: string
  public readonly sourceId: string

  constructor(props: QuestionProps) {
    validateQuestionProps(props)

    this.id = props.id
    this.version = props.version
    this.topicId = props.topicId
    this.chapterId = props.chapterId
    this.type = props.type
    this.difficulty = props.difficulty
    this.status = props.status
    this.prompt = props.prompt
    this.options = Object.freeze([...props.options])
    this.correctOptionId = props.correctOptionId
    this.explanation = props.explanation
    this.conceptId = props.conceptId
    this.sourceId = props.sourceId
  }

  public evaluateAnswer(optionId: string): boolean {
    if (!optionId || !this.options.some((opt) => opt.id === optionId)) {
      return false
    }
    return this.correctOptionId === optionId
  }
}
